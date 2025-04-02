class PdfHandlersController < ApplicationController
  before_action :authenticate_request
  before_action :set_pdf_handler, only: [:show, :save_notes, :update_notes, :show_notes, :toggle_favorite]

  # Create a new PDF handler record and save the file
  def create
    if params[:pdf_file].blank?
      return render json: { error: "No PDF file uploaded" }, status: :unprocessable_entity
    end

    pdf_url = generate_pdf_url(params[:pdf_file])
    pdf = current_user.pdf_handlers.new(pdf_params.merge(file_url: pdf_url))

    if pdf.save
      render json: { message: "PDF uploaded successfully", pdf: pdf }, status: :created
    else
      render json: { error: pdf.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # List all PDF handlers for the current user
  def index
    @pdfs = current_user.pdf_handlers
    
    # Include whether each PDF has notes and its favorite status
    pdfs_with_info = @pdfs.map do |pdf|
      pdf.as_json.merge(
        has_notes: pdf.notes.present?,
        is_favorite: pdf.is_favorite
      )
    end
    
    render json: { pdfs: pdfs_with_info }
  end

  # Show a PDF handler
  def show
    render json: { pdf: @pdf_handler.as_json.except('file_url').merge(file_url: @pdf_handler.file_url) }
  end

  # Save notes for a PDF handler
  def save_notes
    if params[:notes].blank?
      return render json: { error: "Notes cannot be empty" }, status: :unprocessable_entity
    end

    @pdf_handler.notes = params[:notes]
    if @pdf_handler.save
      render json: { message: "Notes saved successfully", pdf: @pdf_handler }, status: :ok
    else
      render json: { error: @pdf_handler.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # Update notes for an existing PDF handler
  def update_notes
    if params[:notes].blank?
      return render json: { error: "Notes cannot be empty" }, status: :unprocessable_entity
    end

    @pdf_handler.notes = params[:notes]
    if @pdf_handler.save
      render json: { message: "Notes updated successfully", pdf: @pdf_handler }, status: :ok
    else
      render json: { error: @pdf_handler.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # Show notes for a PDF handler
  def show_notes
    if @pdf_handler.notes.present?
      render json: { notes: @pdf_handler.notes }, status: :ok
    else
      render json: { error: "No notes found for this PDF" }, status: :not_found
    end
  end

  # Toggle favorite status for a PDF handler
  def toggle_favorite
    @pdf_handler.update(is_favorite: !@pdf_handler.is_favorite)
    render json: { 
      message: @pdf_handler.is_favorite ? "Added to favorites" : "Removed from favorites", 
      is_favorite: @pdf_handler.is_favorite 
    }, status: :ok
  end
  
  # Get all favorite PDFs
  def favorites
    @favorite_pdfs = current_user.pdf_handlers.where(is_favorite: true)
    
    # Include whether each PDF has notes
    pdfs_with_info = @favorite_pdfs.map do |pdf|
      pdf.as_json.merge(has_notes: pdf.notes.present?)
    end
    
    render json: { pdfs: pdfs_with_info }
  end
     
  # Get recently opened or modified PDFs
  def recent
    # Default to showing PDFs from the last 7 days, but allow custom time range
    days_ago = params[:days].present? ? params[:days].to_i : 7
    limit = params[:limit].present? ? params[:limit].to_i : 10
    
    @recent_pdfs = current_user.pdf_handlers
                              .where('updated_at >= ?', days_ago.days.ago)
                              .order(updated_at: :desc)
                              .limit(limit)
    
    # Include whether each PDF has notes and its favorite status
    pdfs_with_info = @recent_pdfs.map do |pdf|
      pdf.as_json.merge(
        has_notes: pdf.notes.present?,
        is_favorite: pdf.is_favorite,
        last_modified: pdf.updated_at
      )
    end
    
    render json: { pdfs: pdfs_with_info }
  end

  private

  def set_pdf_handler
    @pdf_handler = current_user.pdf_handlers.find_by(id: params[:id])
    unless @pdf_handler
      render json: { error: "PDF handler not found" }, status: :not_found
    end
  end

  def generate_pdf_url(file)
    filename = "#{SecureRandom.uuid}_#{file.original_filename}"
    file_path = Rails.root.join("public", "uploads", filename)

    # Ensure uploads directory exists
    FileUtils.mkdir_p(Rails.root.join("public", "uploads"))

    File.open(file_path, "wb") do |f|
      f.write(file.read)
    end

    "/uploads/#{filename}" 
  end

  def pdf_params
    params.permit(:pdfname, :pdf_size, :is_favorite)
  end
end