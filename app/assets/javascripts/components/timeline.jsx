class Timeline extends React.Component {
  componentDidMount() {
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

  renderScatterPlot() {
    const data = _.map(this.props.timeline, (tweet) => {
      return {
        x: tweet.retweet_count,
        y: tweet.favorite_count,
        id: tweet.id_str
      };
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
      series: [{
        name: 'Tweet',
        color: 'rgba(119, 152, 191, .5)',
        data: data
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
      </div>
    );
  }
}
