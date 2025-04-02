class AddNotesToPdfHandlers < ActiveRecord::Migration[7.2]
  def change
    add_column :pdf_handlers, :notes, :text
  end
end
