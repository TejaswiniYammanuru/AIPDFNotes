Rails.application.routes.draw do
  post '/signup', to: 'auth#signup'
  post '/login', to: 'auth#login'
  
  resources :pdf_handlers, only: [:create, :show, :index] do  
    member do
      post :save_notes
      patch :update_notes
      get :show_notes
      post :toggle_favorite  
    end
    
    collection do
      get :favorites 
      get :recent
    end
  end
end