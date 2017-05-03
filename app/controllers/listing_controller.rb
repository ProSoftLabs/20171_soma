class ListingController < ApplicationController
  def load_tweets
    @tweets = Client.friends("Izaeleffemberg", {:count => 200} )
  end
end
