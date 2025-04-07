class PdfHandler < ApplicationRecord
  belongs_to :user
  has_one_attached :pdf_file
  belongs_to :folder, optional: true
end
