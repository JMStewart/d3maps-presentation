var height = 800;
var width = 1200;

var svg = d3.select('body')
  .append('svg')
  .style({
    width: width + 'px',
    height: height + 'px'
  });

var slider = d3.select('body')
  .append('input')
  .attr('type', 'range');

var projection = d3.geo.albersUsa()
  .scale(1285)
  .translate([width / 2, height / 2]);

var path = d3.geo.path()
  .projection(projection);

d3.json('us2.json', function(err, states) {
  svg.selectAll('path.state')
    .data(topojson.feature(states, states.objects.states).features, d => d.properties.state)
    .enter()
    .append("path")
    .attr("class", "state")
    .attr("d", path)
    .style({
      fill: 'none',
      stroke: '#777777'
    });
  d3.csv('data.csv', function(err, data) {
    data.map(function(d) {
      d.point = projection([d.lon, d.lat]);
    });
    data = data.filter(function(d){
      return d.point;
    });
    var allDates = data.map(d => d.Date.match(/\d+\/\d+\/(\d+)/) ? d.Date.match(/\d+\/\d+\/(\d+)/)[1].slice(-2) : null);
    console.log(allDates);
    var dates = _.uniq(allDates);
    dates = dates.filter(d => d);
    var dateExtent = d3.extent(dates, d => +d <= 15 ? '20' + d : '19' + d);
    console.log(dateExtent);
    slider.attr({
      min: +dateExtent[0],
      max: +dateExtent[1],
      value: +dateExtent[1]
    })
    .on('change', function() {
      var filterData = data.filter(d => {
        var re = new RegExp('\\d+/\\d+/' + (''+this.value).slice(-2));
        return re.test(d.Date);
      });
      renderPoints(filterData);
    });
    renderPoints(data.filter(d => /\d+\/\d+\/15/.test(d.Date)));
  });
  function renderPoints(data) {
    var points = svg.selectAll('circle')
      .data(data);
    points.enter()
      .append('circle');
    points.attr({
        r: 5,
        cx: d => d.point[0],
        cy: d => d.point[1]
      })
      .style({
        fill: 'steelblue',
        opacity: 0.1
      });
    points.exit()
      .remove();
  }
});