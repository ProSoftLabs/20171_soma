class Tweet
  class << self # change all class methods to static

    def count_tweets_by_time(timeline)
      hours = {}
      (0..23).each {|x| hours[x] = 0}

      timeline.each do |tweet|
        hour = hour_regex(tweet.created_at.to_s).to_i
        hours[hour] += 1
      end

      hours
    end

    private

    def hour_regex(date)
      #2017-05-14 00:21:08 +0000
      date = date.split[1]
      date = date[0..1]

      date
    end
  end
end
