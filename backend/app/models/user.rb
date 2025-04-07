class User < ApplicationRecord
    has_secure_password
    has_many :pdf_handlers, class_name: 'PdfHandler', dependent: :destroy
    validates :email, presence: true, uniqueness: true
    validates :password, presence: true, length: { minimum: 6 }
    has_many :folders, dependent: :destroy
  end
  
  
  