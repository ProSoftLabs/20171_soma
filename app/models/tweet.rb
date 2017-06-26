class Tweet

  def initialize(tweet_gem)
    analyzer = Sentimental.new
    analyzer.load_defaults

    @tweet_gem = tweet_gem
    @has_photo = self.has_photo()
    @has_video = self.has_video()
    @has_gif = self.has_gif()
    @hour = tweet_gem.created_at.strftime("%H").to_i
    @day = tweet_gem.created_at.strftime("%A").to_s
    @sentiment = analyzer.sentiment(tweet_gem.text)
  end

  def has_photo()
      @tweet_gem.media.each do |media_item|
        if media_item.is_a?(Twitter::Media::Photo)
          return true
        end
      end
      return false
  end

  def has_video()
    @tweet_gem.media.each do |media_item|
      if media_item.is_a?(Twitter::Media::Video)
        return true
      end
    end
    return false
  end

  def has_gif()
    @tweet_gem.media.each do |media_item|
      if media_item.is_a?(Twitter::Media::AnimatedGif)
        return true
      end
    end
    return false
  end

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

    def analyse_media(timeline)
      medias = { :has_photo => [], :has_video => [], :has_gif => [], :has_no_media => [] }
      
      timeline.each do |tweet|
        if tweet.media.length == 0
          medias[:has_no_media].push(tweet.id)
        end
        tweet.media.each do |media_item|
          if media_item.is_a?(Twitter::Media::Photo)
            medias[:has_photo].push(tweet.id) unless medias[:has_photo].include?(tweet.id)
            puts(tweet.text)
          elsif media_item.is_a?(Twitter::Media::AnimatedGif)
            medias[:has_gif].push(tweet.id) unless medias[:has_gif].include?(tweet.id)
          elsif media_item.is_a?(Twitter::Media::Video)
            medias[:has_video].push(tweet.id) unless medias[:has_video].include?(tweet.id)
          else
            medias[:has_no_media].push(tweet.id) unless medias[:has_no_media].include?(tweet.id)
          end
        end
      end

      medias
    end

    

    def get_timeline_with_media(timeline)
      new_timeline = []
      timeline.each do |tweet|
        new_timeline.push(Tweet.new(tweet))
      end
      return new_timeline
    end

  end
end
