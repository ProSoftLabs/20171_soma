class ListingController < ApplicationController
  def home
  end

  def load_tweets
    begin
      @user = Client.user(params[:user])
    rescue Twitter::Error::NotFound
      redirect_to_targets("This Twitter account doesn't exist.")
      return
    end    

    if @user.nil? || @user.protected? 
      redirect_to_targets("The tweets of this account are protected.")
      return
    end

    @timeline = Client.user_timeline(@user.id, {:count => 200})
    timeline_hours = Tweet.count_tweets_by_hours(@timeline)
    timeline_days = Tweet.count_tweets_by_days(@timeline)
    @timeline_mood = Tweet.analyse_tweets(@timeline)
    @timeline_media = Tweet.analyse_media(@timeline)
    @timeline_with_media = Tweet.get_timeline_with_media(@timeline)
    @terms_count = Tweet.get_termos(@timeline)
    @timeline_details = {
      :groupedByHour => timeline_hours,
      :groupedByDay => timeline_days
    }
  end

  private

    def redirect_to_targets(notice)
      respond_to do |format|
        format.html { redirect_to targets_url, notice: notice }
        format.json { head :no_content }
      end
    end
end
