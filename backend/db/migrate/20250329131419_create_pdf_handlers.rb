class CreatePdfHandlers < ActiveRecord::Migration[7.2]
  def change
    create_table :pdf_handlers do |t|
      t.string :pdfname
      t.integer :pdf_size
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
