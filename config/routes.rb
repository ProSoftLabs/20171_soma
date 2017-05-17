Rails.application.routes.draw do
  devise_for :users
  post "/load_tweets", to: "listing#load_tweets"
  root to: 'listing#home'
end
