require 'stopwords'

class Tweet

  def initialize(tweet_gem)
    analyzer = Sentimental.new
    analyzer.load_defaults

    @tweet_gem = tweet_gem
    @has_photo = self.has_photo()
    @has_video = self.has_video()
    @has_gif = self.has_gif()
    @has_url = self.has_url()
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

  def has_url()
    return @tweet_gem.urls.length > 0
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
      medias = { :has_photo => [], :has_video => [], :has_gif => [], :has_url => [], :has_no_media => [] }
      tem_url = false
      timeline.each do |tweet|
        if tweet.media[0].is_a?(Twitter::Media::Photo)
          medias[:has_photo].push(tweet.id)
        elsif tweet.media[0].is_a?(Twitter::Media::AnimatedGif)
          medias[:has_gif].push(tweet.id)
        elsif tweet.media[0].is_a?(Twitter::Media::Video)
          medias[:has_video].push(tweet.id)
        elsif tweet.urls.length > 0
          medias[:has_url].push(tweet.id)
        else
          medias[:has_no_media].push(tweet.id)
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

    def get_termos(timeline)
      #lista de palavras a serem coletadas dos tweets
      words = []
      languages = ["en","es","pt"]
      #um filtro para cada linguagem
      filter_en = Stopwords::Snowball::Filter.new "en"
      filter_es = Stopwords::Snowball::Filter.new "es"
      filter_pt = Stopwords::Snowball::Filter.new "pt"
      
      #para cada tweet
      timeline.each do |tweet|
        #pego o texto do tweet
        text_tweet = tweet.text
        tweet_lang = tweet.lang

        words_tweet = text_tweet.gsub(/\s+/m, ' ').gsub(/[^a-z0-9\s]/i, '').downcase.strip.split(" ")

        if tweet_lang == "pt"
          words_tweet = filter_pt.filter words_tweet
        elsif tweet_lang == "es"
          words_tweet = filter_es.filter words_tweet
        else
          words_tweet = filter_en.filter words_tweet
        end
        
        #coletando as user_mentions
        user_mentions_tweet = []
        tweet.user_mentions.each do |user_mention|
          user_mentions_tweet.push(user_mention.screen_name.downcase)
        end


        #e para cada palavra
        words_tweet.each do |word_tweet|
          #Se tiver mais de 2 letras, adiciono no meu vetor de palavras
          if word_tweet.length > 1 and !word_tweet.include?("@") and !word_tweet.include?("http") and !word_tweet.include?("&") and !user_mentions_tweet.include?(word_tweet)
            words.push(word_tweet)
            puts(tweet_lang)
          end
        end
      end

      words_count = Hash.new(0).tap { |h| words.each { |word| h[word] += 4 } }
      words_count = words_count.sort {|a1,a2| a2[1]<=>a1[1]}
      return words_count
    end

  end
end
