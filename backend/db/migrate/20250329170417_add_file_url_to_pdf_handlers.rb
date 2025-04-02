class AddFileUrlToPdfHandlers < ActiveRecord::Migration[7.2]
  def change
    add_column :pdf_handlers, :file_url, :string
  end
end
