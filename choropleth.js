var stateFips = {
  AL: '01',
  AK: '02',
  AZ: '04',
  AR: '05',
  CA: '06',
  CO: '08',
  CT: '09',
  DE: '10',
  DC: '11',
  FL: '12',
  GA: '13',
  HI: '15',
  ID: '16',
  IL: '17',
  IN: '18',
  IA: '19',
  KS: '20',
  KY: '21',
  LA: '22',
  ME: '23',
  MD: '24',
  MA: '25',
  MI: '26',
  MN: '27',
  MS: '28',
  MO: '29',
  MT: '30',
  NE: '31',
  NV: '32',
  NH: '33',
  NJ: '34',
  NM: '35',
  NY: '36',
  NC: '37',
  ND: '38',
  OH: '39',
  OK: '40',
  OR: '41',
  PA: '42',
  PR: '72',
  RI: '44',
  SC: '45',
  SD: '46',
  TN: '47',
  TX: '48',
  UT: '49',
  VT: '50',
  VA: '51',
  VI: '78',
  WA: '53',
  WV: '54',
  WI: '55',
  WY: '56'
};

var height = 800;
var width = 1200;

var colorScale = d3.scale.linear()
  .range(['white', 'steelblue']);

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

var getStates = new Promise(function(resolve, reject) {
  d3.json('us2.json', function(err, states) {
    if (err) {
      reject(err);
    } else {
      resolve(states);
    }
  });
});
var getData = new Promise(function(resolve, reject) {
  d3.csv('data.csv', function(err, data) {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });
});

Promise.all([getStates, getData])
  .then(function(results) {
  var states = results[0];
  var data = results[1];
  var groupedData = d3.nest()
    .key(d => d.State)
    .entries(data);
  colorScale.domain([0, d3.max(groupedData, d => d.values.length)]);
  var mappedData = {};
  groupedData.map(d => mappedData[stateFips[d.key]] = d.values);
  console.log(colorScale.domain());
  svg.selectAll('path.state')
    .data(topojson.feature(states, states.objects.states).features, function (d) {
      return d.properties.state;
    })
    .enter()
    .append("path")
    .attr("class", "state")
    .attr("d", path)
    .style({
      fill: d => {
        if (mappedData[d.id]){
          return colorScale(mappedData[d.id].length);
        } else {
          return '#ffffff';
        }
      },
      stroke: '#e3e3e3'
    });
});