class ApplicationController < ActionController::API
  before_action :authenticate_request

  private

  def authenticate_request
    token = request.headers['Authorization']&.split(' ')&.last
    
    if token.blank?
      return render json: { error: 'Token missing' }, status: :unauthorized
    end

    begin
      decoded = JsonWebToken.decode(token)
      @current_user = User.find(decoded[:user_id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'User not found' }, status: :unauthorized
    rescue JWT::DecodeError
      render json: { error: 'Invalid token' }, status: :unauthorized
    rescue StandardError => e
      render json: { error: e.message }, status: :internal_server_error
    end
  end

  def current_user
    @current_user
  end
end
