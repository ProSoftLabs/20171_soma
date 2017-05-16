class ListingController < ApplicationController
  def load_tweets
    @friends = Client.friends("Izaeleffemberg", {:count => 200} )
    @timeline = Client.user_timeline("realdonaldtrump", {:count => 100})
  end
end
