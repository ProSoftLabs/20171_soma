class Timeline extends React.Component {
  constructor() {
    super();

    this.state = {
      totalTweetsMentions: null,
      totalTweetsSentiment: null,
      totalTweetsMedia: null
    };
  }

  componentDidMount() {
    this.setFollowersCountHistory();

    this.getFollowersCountHistory((data) => {
      this.renderColumnChart(
        'container-followers-history',
        'Total Followers by Day',
        _.reverse(_.map(data, (item) => item.date)),
        [
          {
            name: 'Followers',
            data: _.reverse(_.map(data, (item) => item.count))
          }
        ]
      );
    })

    $('#tag-cloud-container').jQCloud(this.getUserMentions());

    this.renderColumnChart(
      'chart-container-1',
      'Total Tweets by Hour',
      _.keys(this.props.timelineDetails.groupedByHour),
      [
        {
          name: 'Tweets',
          data: _.values(this.props.timelineDetails.groupedByHour)
        }
      ]
    );

    this.renderColumnChart(
      'chart-container-2',
      'Total Tweets by Day',
      _.keys(this.props.timelineDetails.groupedByDay),
      [
        {
          name: 'Tweets',
          data: _.values(this.props.timelineDetails.groupedByDay)
        }
      ]
    );

    this.renderScatterPlot();
    this.renderPieChart();
    this.renderPieChartMedia();
  }

  setFollowersCountHistory() {
    const { user } = this.props;

    const ref = database.ref('twitters/' + user.id + '/followers_history');
    
    this.getFollowersCountHistory((data) => {
      const historyItem = _.find(data, { date: moment().format("YYYY-MM-DD") });
      if(!historyItem) {
        const newEntry = ref.push();
        newEntry.set({
          date: moment().format("YYYY-MM-DD"),
          count: user.followers_count
        });
      }
    });
  }

  getFollowersCountHistory(callback) {
    const context = this;
    const leadsRef = database.ref('twitters/' + this.props.user.id + '/followers_history');
    let followersData = [];

    leadsRef.on('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        const data = childSnapshot.val();
        followersData.push(data);
      });

      callback(followersData);
    });

    return followersData;
  }

  renderColumnChart(container, title, categories, series) {
    Highcharts.chart(container, {
      chart: {
        type: 'column'
      },
      title: {
        text: title
      },
      xAxis: {
        categories: categories
      },
      yAxis: {
        title: {
          text: 'Total'
        }
      },
      legend: {
        enabled: false
      },
      series
    });
  }

  renderScatterPlot() { //Twitter::Tweet
    const series = [
      {
        name: 'Photo',
        data: [],
        color: "#7cb5ec"
      },
      {
        name: 'Video',
        data: [],
        color: "#e74c3c"
      },
      {
        name: 'GIF',
        data: [],
        color: "#2ecc71"
      },
      {
        name: 'No media',
        data: [],
        color: "#9b59b6"
      }
    ];

    const data = _.map(this.props.timelineWithMedia, (tweetWithMedia) => {
      const obj = {
        x:  tweetWithMedia.tweet_gem.retweet_count,
        y:  tweetWithMedia.tweet_gem.favorite_count,
        id: tweetWithMedia.tweet_gem.id_str,
      };

      if(tweetWithMedia.has_photo){
        series[0].data.push(obj);
      }
      else if (tweetWithMedia.has_gif){
        series[2].data.push(obj);
      }
      else if (tweetWithMedia.has_video){
        series[1].data.push(obj);
      } else {
        series[3].data.push(obj);
      }
    });
    const context = this;

    Highcharts.chart('chart-container-scatter', {
      chart: {
        type: 'scatter',
        zoomType: 'xy'
      },
      title: {
        text: 'Total Retweet versus Total Favorite of Tweets'
      },
      subtitle: {
        text: `Total of items: ${ data.length }`
      },
      xAxis: {
        title: {
          enabled: true,
          text: 'Total Retweet'
        },
        startOnTick: true,
        endOnTick: true,
        showLastLabel: true
      },
      yAxis: {
        title: {
          text: 'Total Favorite'
        }
      },
      plotOptions: {
        series: {
          cursor: 'pointer',
          point: {
            events: {
              click: function() {
                context.setScatterTweet(this.options.id);
              }
            }
          }
        },
        scatter: {
          marker: {
            radius: 5,
            states: {
              hover: {
                enabled: true,
                lineColor: 'rgb(100,100,100)'
              }
            }
          },
          states: {
            hover: {
              marker: {
                enabled: false
              }
            }
          },
          tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: 'Total Retweet: {point.x}, Total Favorite: {point.y}'
          }
        }
      },
      series
    });
  }

  renderPieChart() {
    const { timelineMood } = this.props;
    const { positive, negative, neutral } = timelineMood;
    const totalPositive = positive.length;
    const totalNegative = negative.length;
    const totalNeutral = neutral.length;
    const total = totalPositive + totalNegative + totalNeutral;

    const context = this;

    Highcharts.chart('chart-container-pie', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Tweets sentiment analysis'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            },
            series: {
            point: {
              events: {
                click: function() {
                  context.renderTweets(context.sentimentTweetsWrapper, this.tweetsIds);
                  context.setState({
                    totalTweetsSentiment: this.tweetsIds.length
                  })
                }
              }
            }}
        },
        series: [{
            name: 'Percentage',
            colorByPoint: true,
            colors: ['#2ecc71', '#e74c3c', '#95a5a6'],
            data: [{
                name: 'Positive',
                y: (totalPositive / total) * 100,
                tweetsIds: positive
            }, {
                name: 'Negative',
                y: (totalNegative / total) * 100,
                tweetsIds: negative
            }, {
                name: 'Neutral',
                y: (totalNeutral / total) * 100,
                tweetsIds: neutral
            }]
        }]
    });
  }

  renderPieChartMedia() {
    const { timelineMedia } = this.props;
    const { has_photo, has_video, has_gif, has_no_media } = timelineMedia;
    const totalPhoto = has_photo.length;
    const totalVideo = has_video.length;
    const totalGif = has_gif.length;
    const totalNoMedia = has_no_media.length;
    const total = totalPhoto + totalVideo + totalGif + totalNoMedia;

    const context = this;

    Highcharts.chart('chart-container-pie-media', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Tweets media analysis'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            },
            series: {
            point: {
              events: {
                click: function() {
                  context.renderTweets(context.mediaTweetsWrapper, this.tweetsIds);
                  context.setState({
                    totalTweetsMedia: this.tweetsIds.length
                  })
                }
              }
            }}
        },
        series: [{
            name: 'Percentage',
            colorByPoint: true,
            colors: ['#7CB5EC', '#E74C3C', '#2ECC71','#9B59B6'],
            data: [{
                name: 'Photo',
                y: (totalPhoto / total) * 100,
                tweetsIds: has_photo
            }, {
                name: 'Video',
                y: (totalVideo / total) * 100,
                tweetsIds: has_video
            }, {
                name: 'Gif',
                y: (totalGif / total) * 100,
                tweetsIds: has_gif
            }, {
                name: 'No media',
                y: (totalNoMedia / total) * 100,
                tweetsIds: has_no_media
            }]
        }]
    });
  }

  setScatterTweet(id) {
    window.twttr.ready().then(({ widgets }) => {
      this.scatterTweetWrapper.innerHTML = ''
      widgets
        .createTweetEmbed(id, this.scatterTweetWrapper, { omit_script: true })
    })
  }

  getUserMentions() {
    let list = [];

    _.each(this.props.timeline, (tweet) => {
      const userMentions = tweet.entities.user_mentions;
      const tweetId = tweet.id_str;

      if(!_.isEmpty(userMentions)) {
        _.each(userMentions, (mention) => {
          const { screen_name } = mention;
          const item = _.find(list, { text: screen_name });

          if(item) {
            item.weight += 1;
            item.ids.push(tweetId);
          } else {
            list.push({ text: screen_name, weight: 1, ids: [tweetId], handlers: {
              click: (evt) => {
                const twitterScreenName = evt.target.textContent;
                const data = _.find(list, { text: twitterScreenName });
                this.renderTweets(this.userMentionsTweetsWrapper, data.ids);
              }
            } });
          }
        });
      }
    });

    return list;
  }

  renderTweets(container, data) {
    window.twttr.ready().then(({ widgets }) => {
      container.innerHTML = '';

      this.setState({
        totalTweetsMentions: data.length
      });

      _.each(data, (id) => {
        const div = document.createElement('div');
        container.appendChild(div);
        widgets
          .createTweet(id, div, { cards: 'hidden' });
      });

    });
  }

  render() {
    const { user } = this.props;
    const profileImageUrl = user.profile_image_url.replace('normal', '400x400');

    return (
      <div className="container">
        <div className="card card-inverse twitter-profile mt-5 mb-5">
          <div className="card-block">
            <div className="twitter-profile-image" style={ { backgroundImage: `url(${ profileImageUrl })` } } />
            <h3 className="card-title">{ user.screen_name }</h3>
            <p className="card-text">{ user.description }</p>
            <a href={ `https://twitter.com/${ user.screen_name }` } target="_blank" className="btn btn-primary">Go to Twitter</a>
          </div>
        </div>
        <div className="row card text-center mt-4 mb-4">
          <div className="card-header">Tweets Sentiment</div>
          <div className="card-block">
            <div className="row">
              <div className="col-8">
                <div id="chart-container-pie" style={ { height: '400px' } }></div>
              </div>
              <div className="col-4">
                { this.state.totalTweetsSentiment && <p>Total of tweets: { this.state.totalTweetsSentiment }</p> }
                <div
                  className="user-mentions-tweets-wrapper"
                  ref={ (c) => { this.sentimentTweetsWrapper = c } }
                >

                  <p className="card-text">Click on chart piece to show tweets.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row card text-center mt-4 mb-4">
          <div className="card-header">Tweets Media</div>
          <div className="card-block">
            <div className="row">
              <div className="col-12">
                <div id="chart-container-pie-media" style={ { height: '400px' } }></div>
              </div>
            </div>
          </div>
        </div>

        <div className="row card text-center mt-4 mb-4">
          <div className="card-header">Tweets Reactions</div>
          <div className="card-block">
            <div className="row">
              <div className="col-8">
                <div id="chart-container-scatter" style={ { height: '400px' } }></div>
              </div>
              <div className="col-4">
                <div
                  ref={ (c) => { this.scatterTweetWrapper = c } }
                >
                  <p className="card-text">Click on item to show tweet details.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row card text-center mt-4 mb-4">
          <div className="card-header">Tweets Count</div>
          <div className="card-block">
            <div className="row">
              <div className="col-7">
                <div id="chart-container-1" style={ { height: '400px' } }></div>
              </div>
              <div className="col-5">
                <div id="chart-container-2" style={ { height: '400px' } }></div>
              </div>
            </div>
          </div>
        </div>
        <div className="row card text-center mt-4 mb-4">
          <div className="card-header">Followers History</div>
          <div className="card-block">
            <div className="row">
              <div className="col-12">
                <div id="container-followers-history" style={ { height: '400px' } }></div>
              </div>
            </div>
          </div>
        </div>
        <div className="row card text-center mt-4 mb-4">
          <div className="card-header">User Mentions</div>
          <div className="card-block">
            <div className="row">
              <div className="col-8">
                <div id="tag-cloud-container" style={ { height: '400px' } }></div>
              </div>
              <div className="col-4">
                { this.state.totalTweetsMentions && <p>Total of tweets: { this.state.totalTweetsMentions }</p> }
                <div
                  className="user-mentions-tweets-wrapper"
                  ref={ (c) => { this.userMentionsTweetsWrapper = c } }
                >
                  <p className="card-text">Click on item to show mentions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
