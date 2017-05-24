class Timeline extends React.Component {
  componentDidMount() {
    this.renderChart(
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

    this.renderChart(
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
  }

  renderChart(container, title, categories, series) {
    Highcharts.chart(container, {
      chart: {
        type: 'column'
      },
      title: {
        text: `${ title } - ${ this.props.userName }`
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

  render() {
    return (
      <div className="row">
        <div className="col-7">
          <div id="chart-container-1" style={ { height: '400px' } }></div>
        </div>
        <div className="col-5">
          <div id="chart-container-2" style={ { height: '400px' } }></div>
        </div>
      </div>
    );
  }
}
