class Timeline extends React.Component {
  constructor() {
    super();

    this.state = {
      totalTweetsMentions: null,
      totalTermsCount: null,
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
    $('#tag-cloud-container-terms').jQCloud(this.getTerms());

    this.renderScatterPlot();
    this.renderScatterPlotSentiment();
    this.renderPieChart();
    this.renderPieChartMedia();

    const tweetsGroupedByHour = _.groupBy(this.props.timelineWithMedia, 'hour');

    const positiveSerie = { name: 'Positive', data: [], color: '#2ecc71' };
    const negativeSerie = { name: 'Negative', data: [], color: '#e74c3c' };
    const neutralSerie = { name: 'Neutral', data: [], color: '#95a5a6' };

    _.each(_.range(0, 24), (hour) => {
      if(tweetsGroupedByHour[hour]) {
        const groupedBySentiment = _.groupBy(tweetsGroupedByHour[hour], 'sentiment');
        positiveSerie.data.push(groupedBySentiment['positive'] ? groupedBySentiment['positive'].length : 0);
        negativeSerie.data.push(groupedBySentiment['negative'] ? groupedBySentiment['negative'].length : 0);
        neutralSerie.data.push(groupedBySentiment['neutral'] ? groupedBySentiment['neutral'].length : 0);
      } else {
        positiveSerie.data.push(0);
        negativeSerie.data.push(0);
        neutralSerie.data.push(0); 
      }
    });

Highcharts.chart('chart-container-1', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Total Tweets by Hour'
    },
    xAxis: {
        categories: _.range(0, 24)
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Total tweets'
        },
        stackLabels: {
            enabled: true,
            style: {
                fontWeight: 'bold',
                color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
            }
        }
    },
    legend: {
        align: 'right',
        x: -30,
        verticalAlign: 'top',
        y: 25,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
        borderColor: '#CCC',
        borderWidth: 1,
        shadow: false
    },
    tooltip: {
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
    },
    plotOptions: {
        column: {
            stacking: 'normal',
            dataLabels: {
                enabled: false,
                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
            }
        }
    },
    series: [positiveSerie, negativeSerie, neutralSerie]
});

    const tweetsGroupedByDay = _.groupBy(this.props.timelineWithMedia, 'day');

    const positiveSerie2 = { name: 'Positive', data: [], color: '#2ecc71' };
    const negativeSerie2 = { name: 'Negative', data: [], color: '#e74c3c' };
    const neutralSerie2 = { name: 'Neutral', data: [], color: '#95a5a6' };
    const days = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ];

    _.each(days, (day) => {
      if(tweetsGroupedByDay[day]) {
        const groupedBySentiment = _.groupBy(tweetsGroupedByDay[day], 'sentiment');
        positiveSerie2.data.push(groupedBySentiment['positive'] ? groupedBySentiment['positive'].length : 0);
        negativeSerie2.data.push(groupedBySentiment['negative'] ? groupedBySentiment['negative'].length : 0);
        neutralSerie2.data.push(groupedBySentiment['neutral'] ? groupedBySentiment['neutral'].length : 0);
      } else {
        positiveSerie2.data.push(0);
        negativeSerie2.data.push(0);
        neutralSerie2.data.push(0); 
      }
    });

Highcharts.chart('chart-container-2', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Total Tweets by Day'
    },
    xAxis: {
        categories: days
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Total tweets'
        },
        stackLabels: {
            enabled: true,
            style: {
                fontWeight: 'bold',
                color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
            }
        }
    },
    legend: {
        align: 'right',
        x: -30,
        verticalAlign: 'top',
        y: 25,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
        borderColor: '#CCC',
        borderWidth: 1,
        shadow: false
    },
    tooltip: {
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
    },
    plotOptions: {
        column: {
            stacking: 'normal',
            dataLabels: {
                enabled: false,
                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
            }
        }
    },
    series: [positiveSerie2, negativeSerie2, neutralSerie2]
});

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

      callback(_.reverse(_.sortBy(followersData, 'date')));
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
        name: 'URL',
        data: [],
        color: "#e67e22"
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
      }else if (tweetWithMedia.has_url){
        series[3].data.push(obj);
      }
       else {
        series[4].data.push(obj);
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

  renderScatterPlotSentiment() { //Twitter::Tweet
    const series = [
      {
        name: 'Positive',
        data: [],
        color: "#2ecc71"
      },
      {
        name: 'Negative',
        data: [],
        color: "#e74c3c"
      },
      {
        name: 'Neutral',
        data: [],
        color: "#95a5a6"
      }
    ];

    const data = _.map(this.props.timelineWithMedia, (tweetWithMedia) => {
      const obj = {
        x:  tweetWithMedia.tweet_gem.retweet_count,
        y:  tweetWithMedia.tweet_gem.favorite_count,
        id: tweetWithMedia.tweet_gem.id_str,
      };
      if(tweetWithMedia.sentiment == "positive"){
        series[0].data.push(obj);
      }
      else if (tweetWithMedia.sentiment == "negative"){
        series[1].data.push(obj);
      }else {
        series[2].data.push(obj);
      }
    });
    const context = this;

    Highcharts.chart('chart-container-scatter-sentiment', {
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
                context.setScatterTweetSentiment(this.options.id);
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
    const { has_photo, has_video, has_gif, has_url, has_no_media } = timelineMedia;
    const totalPhoto = has_photo.length;
    const totalVideo = has_video.length;
    const totalGif = has_gif.length;
    const totalUrl = has_url.length;
    const totalNoMedia = has_no_media.length;
    const total = totalPhoto + totalVideo + totalGif + totalUrl + totalNoMedia;

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
            colors: ['#7CB5EC', '#E74C3C', '#2ECC71', '#e67e22','#9B59B6'],
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
                name: 'Url',
                y: (totalUrl / total) * 100,
                tweetsIds: has_url
            },
            {
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

  setScatterTweetSentiment(id) {
    window.twttr.ready().then(({ widgets }) => {
      this.scatterTweetWrapperSentiment.innerHTML = ''
      widgets
        .createTweetEmbed(id, this.scatterTweetWrapperSentiment, { omit_script: true })
    })
  }

  getTerms(){
    let list = [];
    _.each(this.props.termsCount, (termCount) => {
      const term = termCount[0];
      const count = termCount[1];
      list.push({ text: term, weight: count, ids: null, handlers: null});
      console.log("Termo: "+ term + " peso: "+ count);
    });
    return list;
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
    const scrollTop = (id) => {
      $('html, body').animate({
        scrollTop: $(id).offset().top
      }, 300);
    }

    return (
      <div className="row">
        
        <div className="col-xs-12 col-md-2 mt-5" data-spy="affix" data-offset-top="80" data-offset-bottom="200">
          <ul className="list-group navigation">
            <li
              onClick={ scrollTop.bind(this, '#tab-sentiment') }
              className="list-group-item">Sentiment</li>
            <li
              onClick={ scrollTop.bind(this, '#tab-media') }
              className="list-group-item">Media</li>
            <li
              onClick={ scrollTop.bind(this, '#tab-reactions-sentiment') }
              className="list-group-item">Reactions x Sentiment</li>
            <li
              onClick={ scrollTop.bind(this, '#tab-reactions-media') }
              className="list-group-item">Reacions x Media</li>
            <li
              onClick={ scrollTop.bind(this, '#tab-count') }
              className="list-group-item">Tweet count x Sentiment</li>
            <li
              onClick={ scrollTop.bind(this, '#tab-history') }
              className="list-group-item">Followers History</li>
            <li
              onClick={ scrollTop.bind(this, '#tab-mentions') }
              className="list-group-item">Mentions</li>
            <li
              onClick={ scrollTop.bind(this, '#tab-terms') }
              className="list-group-item">Terms</li>
          </ul>
        </div>

        <div className="col-xs-12 col-md-10 mt-5">

          <div className="container-fluid">
            <div className="target-item media">
                <div className="media-left">
                    <a href={ `https://twitter.com/${ user.screen_name }` } target="_blank">
                      <img className="img-responsive media-object" src={profileImageUrl} alt="twitter profile image" />
                    </a>
                </div>
                <div className="media-body">
                  <h4 className="media-heading">{ user.screen_name }</h4>
                  <p>{ user.description }</p>
                </div>
                <div className="media-right media-middle">
                    <a href={ `https://twitter.com/${ user.screen_name }` } target="_blank" className="btn btn-primary">Go to Twitter <span className="glyphicon glyphicon-new-window"></span></a>
                </div>
            </div>
          </div>


          



          <div id="tab-sentiment" className="container-fluid">
            <div className="card text-center mt-4 mb-4">
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
          
          <div id="tab-media" className="container-fluid card">
            <div className="card-header">Tweets Media</div>
            <div className="card-block">
              <div className="row">
                <div className="col-12">
                  <div id="chart-container-pie-media" style={ { height: '400px' } }></div>
                </div>
              </div>
            </div>
          </div>

          <div id="tab-reactions-sentiment" className="container-fluid card text-center mt-4 mb-4">
            <div className="card-header">Tweets Reactions x Sentiment</div>
            <div className="card-block">
              <div className="row">
                <div className="col-8">
                  <div id="chart-container-scatter-sentiment" style={ { height: '400px' } }></div>
                </div>
                <div className="col-4">
                  <div
                    ref={ (c) => { this.scatterTweetWrapperSentiment = c } }
                  >
                    <p className="card-text">Click on item to show tweet details.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="tab-reactions-media" className="container-fluid card text-center mt-4 mb-4">
            <div className="card-header">Tweets Reactions x Media</div>
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
          
          <div id="tab-count" className="container-fluid card text-center mt-4 mb-4">
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
          <div id="tab-history" className="container-fluid card text-center mt-4 mb-4">
            <div className="card-header">Followers History</div>
            <div className="card-block">
              <div className="row">
                <div className="col-12">
                  <div id="container-followers-history" style={ { height: '400px' } }></div>
                </div>
              </div>
            </div>
          </div>
          <div id="tab-mentions" className="container-fluid card text-center mt-4 mb-4">
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
          <div id="tab-terms" className="container-fluid card text-center mt-4 mb-4">
            <div className="card-header">User Terms</div>
            <div className="card-block">
              <div className="row">
                <div className="col-12">
                  <div id="tag-cloud-container-terms" style={ { height: '400px' } }></div>
                </div>
              </div>
            </div>
          </div>
          </div> 

        </div>
               
      </div>
    );
  }
}
