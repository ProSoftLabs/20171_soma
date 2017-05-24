class ListingController < ApplicationController
  def home
  end

  def load_tweets
    @user_name = params[:user]
    @timeline = Client.user_timeline(@user_name, {:count => 100})
    timeline_hours = Tweet.count_tweets_by_hours(@timeline)
    timeline_days = Tweet.count_tweets_by_days(@timeline)
    @timeline_details = { :groupedByHour => timeline_hours, :groupedByDay =>
      timeline_days }
  end
end
