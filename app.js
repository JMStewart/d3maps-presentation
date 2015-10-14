var height = 800;
var width = 1200;

var svg = d3.select('body')
  .append('svg')
  .style({
    width: width + 'px',
    height: height + 'px'
  });

var projection = d3.geo.albersUsa()
  .scale(1285)
  .translate([width / 2, height / 2]);

var path = d3.geo.path()
  .projection(projection);

d3.json('us2.json', function(err, states) {
  svg.selectAll('path.state')
    .data(topojson.feature(states, states.objects.states).features)
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
    svg.selectAll('circle.ufo')
      .data(data)
      .enter()
      .append('circle')
      .attr({
        r: 5,
        cx: d => d.point[0],
        cy: d => d.point[1]
      })
      .style({
        fill: 'steelblue',
        opacity: 0.1
      })
  });
});