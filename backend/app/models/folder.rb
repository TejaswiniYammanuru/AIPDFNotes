class Folder < ApplicationRecord
  belongs_to :user
  has_many :pdf_handlers, dependent: :nullify
end
