class ListingController < ApplicationController
  def home
  end

  def load_tweets
    @user = Client.user(params[:user])

    @timeline = Client.user_timeline(@user.id, {:count => 200})
    timeline_hours = Tweet.count_tweets_by_hours(@timeline)
    timeline_days = Tweet.count_tweets_by_days(@timeline)

    @timeline_details = {
      :groupedByHour => timeline_hours,
      :groupedByDay => timeline_days
    }
  end
end
