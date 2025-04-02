class AddIsFavoriteColumnToPdfHandlers < ActiveRecord::Migration[7.2]
  def change
    add_column :pdf_handlers, :is_favorite, :boolean, default: false
  end
end