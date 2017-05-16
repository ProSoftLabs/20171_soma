class Timeline extends React.Component {
  componentDidMount() {
    const data = this.parseTimeline();
    console.log('DATA', data);
    const chartData = this.parseChartData(data);
    console.log('chartData', chartData);

    Highcharts.chart('chart-container', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Last Tweets Analysis'
        },
        xAxis: {
            categories: chartData.categories
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Total'
            }
        },
        legend: {
            reversed: true
        },
        plotOptions: {
            series: {
                stacking: 'normal'
            }
        },
        series: chartData.series
    });
  }

  parseTimeline() {
    const { timeline } = this.props;
    const grouped = _.groupBy(timeline, (tweet) => {
      return moment(tweet.created_at).format("DD/MM/YYYY");
    });
    console.log('grouped', grouped);

    const parsedData = _.map(grouped, (tweets, day) => {
      const totalFavorites = _.sumBy(tweets, 'favorite_count');
      const totalRetweets = _.sumBy(tweets, 'retweet_count');
      
      return {
        day,
        originalDate: tweets.length > 0 && tweets[0].created_at,
        totalFavorites,
        totalRetweets
      };
    });
    console.log('parsedData', parsedData);

    return _.sortBy(parsedData, (dayData) => {
      return moment(dayData.originalDate).toISOString();
    });
  }

  parseChartData(data) {
    return {
      categories: _.map(data, (entry) => entry.day),
      series: [{
        name: 'Retweets Total',
        data: _.map(data, (entry) => entry.totalRetweets)
      }, {
        name: 'Favorites Total',
        data: _.map(data, (entry) => entry.totalFavorites)
      }]
    };
  }

  render() {
    console.log(this.props.timeline);
    this.parseTimeline();
    return (
      <div>
        <div id="chart-container" style={ { height: '600px' } }></div>
      </div>
    );
  }
}
