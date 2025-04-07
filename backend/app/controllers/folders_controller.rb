
class FoldersController < ApplicationController
    before_action :set_folder, only: [:update, :destroy]
  
    def index
      folders = current_user.folders.includes(:pdf_handlers)
      render json: folders.to_json(include: :pdf_handlers)
    end
  
    def create
      folder = current_user.folders.create(folder_params)
      render json: folder
    end
  
    def update
      @folder.update(folder_params)
      render json: @folder
    end
  
    def destroy
      @folder.destroy
      head :no_content
    end
  
    private
  
    def set_folder
      @folder = current_user.folders.find(params[:id])
    end
  
    def folder_params
      params.require(:folder).permit(:name)
    end
  end
  