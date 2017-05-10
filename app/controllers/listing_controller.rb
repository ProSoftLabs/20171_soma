class ListingController < ApplicationController
  def load_tweets
    @friends = Client.friends("Izaeleffemberg", {:count => 200} )
    @timeline = Client.user_timeline("Izaeleffemberg")
  end
end
