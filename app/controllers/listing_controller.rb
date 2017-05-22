class ListingController < ApplicationController
  def home
  end

  def load_tweets
    @user_name = params[:user]
    @timeline = Client.user_timeline(@user_name, {:count => 100})
    @timeline_hours = Tweet.count_tweets_by_time(@timeline)
  end
end
