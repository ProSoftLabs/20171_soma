Rails.application.routes.draw do
  resources :targets
  devise_for :users
  get "/load_tweets", to: "listing#load_tweets"
  root to: 'targets#index'
end
