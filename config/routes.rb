Rails.application.routes.draw do
  get '/', to: 'listing#load_tweets'
end
