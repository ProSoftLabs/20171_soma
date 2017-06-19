class Tweet
  class << self # change all class methods to static

    def count_tweets_by_hours(timeline)
      hours = {}
      (0..23).each {|x| hours[x] = 0}

      timeline.each do |tweet|
        hour = tweet.created_at.strftime("%H").to_i
        hours[hour] += 1
      end

      hours
    end

    def count_tweets_by_days(timeline)
      days = { "Monday" => 0, "Tuesday" => 0, "Wednesday" => 0, "Thursday" => 0,
        "Friday" => 0, "Saturday" => 0, "Sunday" => 0 }
      timeline.each do |tweet|
        day = tweet.created_at.strftime("%A").to_s
        days[day] += 1
      end

      days
    end

    def analyse_tweets(timeline)
      sentiments = { :positive => [], :negative => [], :neutral => [] }
      analyzer = Sentimental.new
      analyzer.load_defaults

      timeline.each do |tweet|
        sentiments[analyzer.sentiment(tweet.text)].push(tweet.id.to_s)
      end

      sentiments
    end

    def hasPhoto(tweet)
      tweet.media.each do |mediaItem|
        if mediaItem.is_a?(Twitter::Media::Photo)
          return "yes"
        end
      end
      return "no"
    end

    def hasVideo(tweet)
      tweet.media.each do |mediaItem|
        if mediaItem.is_a?(Twitter::Media::Video)
          return "yes"
        end
      end
      return "no"
    end

    def hasGif(tweet)
      tweet.media.each do |mediaItem|
        if mediaItem.is_a?(Twitter::Media::AnimatedGif)
          return "yes"
        end
      end
      return "no"
    end
  end

end
