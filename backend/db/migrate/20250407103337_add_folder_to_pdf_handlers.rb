class AddFolderToPdfHandlers < ActiveRecord::Migration[7.2]
  def change
    add_reference :pdf_handlers, :folder, null: false, foreign_key: true
  end
end
