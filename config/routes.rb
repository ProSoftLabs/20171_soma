Rails.application.routes.draw do
  devise_for :users
  root to: 'listing#load_tweets'
end
