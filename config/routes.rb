Rails.application.routes.draw do
  devise_for :users
  get "/load_tweets", to: "listing#load_tweets"
  root to: 'listing#home'
end
