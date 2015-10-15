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
var fipsPops = [
  ['01',4779736],
  ['02',710231],
  ['04',6392017],
  ['05',2915918],
  ['06',37253956],
  ['08',5029196],
  ['09',3574097],
  ['10',897934],
  ['11',601723],
  ['12',18801310],
  ['13',9687653],
  ['15',1360301],
  ['16',1567582],
  ['17',12830632],
  ['18',6483802],
  ['19',3046355],
  ['20',2853118],
  ['21',4339367],
  ['22',4533372],
  ['23',1328361],
  ['24',5773552],
  ['25',6547629],
  ['26',9883640],
  ['27',5303925],
  ['28',2967297],
  ['29',5988927],
  ['30',989415],
  ['31',1826341],
  ['32',2700551],
  ['33',1316470],
  ['34',8791894],
  ['35',2059179],
  ['36',19378102],
  ['37',9535483],
  ['38',672591],
  ['39',11536504],
  ['40',3751351],
  ['41',3831074],
  ['42',12702379],
  ['44',1052567],
  ['45',4625364],
  ['46',814180],
  ['47',6346105],
  ['48',25145561],
  ['49',2763885],
  ['50',625741],
  ['51',8001024],
  ['53',6724540],
  ['54',1852994],
  ['55',5686986],
  ['56',563626]
];
var height = 800;
var width = 1200;

var colorScale = d3.scale.linear()
  .range(['white', 'steelblue']);
var colorScaleNormalized = d3.scale.linear()
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

function draw(data, scale, isNormalized) {
  if (svg) {
    svg.remove();
  }

  svg = d3.select('body')
  .append('svg')
  .style({
    width: width + 'px',
    height: height + 'px'
  });

  svg.selectAll('path.state')
    .data(topojson.feature(states, states.objects.states).features, function (d) {
      return d.properties.state;
    })
    .enter()
    .append("path")
    .attr("class", "state")
    .attr("d", path)
    .style({
      fill: fill,
      stroke: '#777777'
    })
    .on('mouseover', function(){
      d3.select(this)
        .style('fill', 'red')
    })
    .on('mouseout', function(){
      d3.select(this)
        .style({
      fill: fill
    })
    });

  function fill(d) {
    if (data[d.id]){
      if (isNormalized) {
        return scale(data[d.id]);
      } else {
        return scale(data[d.id].length);
      }
    } else {
      return '#ffffff';
    }
  }
};

Promise.all([getStates, getData])
  .then(function(datasets) {
    var normalized = false;
    states = datasets[0];
    var data = datasets[1];
    var groupedData = d3.nest()
      .key(d => d.State)
      .entries(data);
    var mappedData = {};
    groupedData.map(d => mappedData[stateFips[d.key]] = d.values);
    colorScale.domain([0, d3.max(groupedData, d => d.values.length)]);

    var normalizedData = {};
    fipsPops.map(d => normalizedData[d[0]] = mappedData[d[0]].length / d[1]);
    normalizedMax = 0;
    normalizedMax = d3.max(fipsPops, d => mappedData[d[0]].length / d[1]);
    colorScaleNormalized.domain([0, normalizedMax]);

    draw(mappedData, colorScale, normalized);

    d3.select('button').on('click', function() {
      normalized = !normalized;
      var dataset = normalized ? normalizedData : mappedData;
      var scale = normalized ? colorScaleNormalized : colorScale;
      draw(dataset, scale, normalized);
    });
  });