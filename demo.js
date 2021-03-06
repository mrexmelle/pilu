var provinces, regencies;

var mapIdx = 0;

d3.select('#maps')
  .on('change', handleMapsOnChange);

function handleMapsOnChange() {
  if (mapIdx === this.selectedIndex) { return; }

  mapIdx = this.selectedIndex;
  if (mapIdx === 1) {
    g.selectAll('.province')
      .remove();
    g.selectAll('#province-borders')
      .remove();
    g.selectAll('.city')
      .remove();

    if (regencies) {
      initRegencies(null, regencies);
    } else {
      d3.queue()
        .defer(d3.json, './json/indonesia-provinces-regencies-topo.json')
        .await(initRegencies);
    }
  } else {
    g.selectAll('.regency')
      .remove();
    g.selectAll('#regency-borders')
      .remove();
    g.selectAll('.city')
      .remove();


    if (provinces) {
      initProvinces(null, provinces);
    } else {
      d3.queue()
        .defer(d3.json, './json/indonesia-provinces-cities-topo.json')
        .await(initProvinces);
    }
  }
}

function initRegencies(err, regencies1) {
  if (err) { throw err; }

  regencies = regencies1;

  g.append('g')
    .attr('id', 'regencies')
    .selectAll('path')
    .data(topojson.feature(regencies, regencies.objects.regencies).features)
    .enter().append('path')
    .attr('class', 'regency')
    .attr('fill', function(d) {
      var key = d.properties.name;
      key = d.properties.nameAlt ? d.properties.nameAlt: key;
      if (!map.get(key)) {
        key = d.properties.name;
      }

      return color(d[column] = +map.get(key)[column]);
    })
    .attr('d', path)
    .on('click', handleOnClick)
  ;

  g.append('path')
    .datum(topojson.mesh(regencies, regencies.objects.regencies), function(a, b) {
      return a !== b;
    })
    .attr('id', 'regency-borders')
    .attr('d', path);

  if (showCities && provinces) {
    g.selectAll('circle')
      .data(topojson.feature(provinces, provinces.objects.cities).features)
      .enter()
      .append('circle')
      .attr('cx', function(d) {
        return projection(d.geometry.coordinates)[0];
      })
      .attr('cy', function(d) {
        return projection(d.geometry.coordinates)[1];
      })
      .attr('r', '2')
      .attr('stroke', '#111')
      .attr('stroke-width', '.2')
      .attr('fill', '#ccc')
      .attr('class', 'city')
      .attr('d', path)
      .on('mouseover', function(d) {
        if (!d.properties.name) console.log('d: ', d);
        return tooltip.style('visibility', 'visible')
          .text(d.properties.name);
      })
      .on('mousemove', function(d) {
        return tooltip.style('top', (d3.event.pageY - 10) + 'px')
          .style('left', (d3.event.pageX + 10) + 'px')
          .text(d.properties.name);
      })
      .on('mouseout', function(d) {
        return tooltip.style('visibility', 'hidden');
      })
    ;
  }
}

var showCities = true;

d3.select('#cities1')
  .on('change', handleCitiesOnChange);

function handleCitiesOnChange() {
  showCities = this.checked;

  if (showCities && provinces) {
    g.selectAll('circle')
      .data(topojson.feature(provinces, provinces.objects.cities).features)
      .enter()
      .append('circle')
      .attr('cx', function(d) {
        return projection(d.geometry.coordinates)[0];
      })
      .attr('cy', function(d) {
        return projection(d.geometry.coordinates)[1];
      })
      .attr('r', '2')
      .attr('stroke', '#111')
      .attr('stroke-width', '.2')
      .attr('fill', '#ccc')
      .attr('class', 'city')
      .attr('d', path)
      .on('mouseover', function(d) {
        if (!d.properties.name) console.log('d: ', d);
        return tooltip.style('visibility', 'visible')
          .text(d.properties.name);
      })
      .on('mousemove', function(d) {
        return tooltip.style('top', (d3.event.pageY - 10) + 'px')
          .style('left', (d3.event.pageX + 10) + 'px')
          .text(d.properties.name);
      })
      .on('mouseout', function(d) {
        return tooltip.style('visibility', 'hidden');
      });
  } else {
    g.selectAll('.city')
      .remove();
  }
}

var columnIdx = 0;

var columns = [
  'ipm',
  'pengeluaran_perkapita',
  'angka_harapan_hidup',
  'angka_melek_huruf',
  'lama_sekolah',
];

var interpolators = [
  'interpolateRdBu',
  'interpolateGnBu',
  'interpolateBlues',
  'interpolateRdYlBu',
  'interpolateSpectral',
];

var titles = [
  'Human Development Index',
  'Per-Capita Expenditure',
  'Life Expectancy',
  'Literacy Rate',
  'Duration of Education'
];

d3.select('#columns')
  .on('change', handleColumnsOnChange)
  .selectAll('option')
  .data(d3.range(0, 5))
  .enter().append('option')
  .attr('value', function(d) { return columns[d]; })
  .text(function(d) { return titles[d]; });

var tooltip = d3.select('body')
  .append('div')
  .style('position', 'absolute')
  .style('font-family', "'Open Sans', sans-serif")
  .style('font-size', '14px')
  .style('color', '#333')
  .style('z-index', '10')
  .style('visibility', 'hidden');

var duration = 1000;

function handleColumnsOnChange() {

  columnIdx = this.selectedIndex;
  extent = extents[columnIdx];

  color.domain(extent);
  x.domain(extent);

  var interpolator = interpolators[columnIdx];
  color.interpolator(d3[interpolator]);

  average = averages[columnIdx];

  column = columns[columnIdx];

  g.selectAll('.province')
    .transition().duration(duration)
    .attr('fill', function(d) {
      var key = d.properties.name;
      key = d.properties.nameAlt ? d.properties.nameAlt: key;
      if (!map.get(key)) {
        key = d.properties.name;
      }
      return color(d[column] = +map.get(key)[column]);
    })
  ;

  g.selectAll('.regency')
    .transition().duration(duration)
    .attr('fill', function(d) {
      var key = d.properties.name;
      key = d.properties.nameAlt ? d.properties.nameAlt: key;
      if (!map.get(key)) {
        key = d.properties.name;
      }
      return color(d[column] = +map.get(key)[column]);
    })
  ;

  g.selectAll(".bar")
    .data(d3.range(extentLegend[0], extentLegend[1]), function(d) { return d; })
    .transition().duration(duration)
    .style("fill", function(d) { return color(x.invert(d)); })

  g.transition().duration(duration)
    .call(d3.axisBottom(x)
    .ticks(9)
    .tickSize(13)
  )
    .select('.domain')
    // .transition().duration(duration)
    .remove();

  title = titles[columnIdx];
  /*
  g.select('.caption')
    .text(`${title}: Indonesia`);
  */
  var location, details;
  if (centered) {
    location = getName(centered);
    details = `${title}: ${getData(centered)}`;
  } else {
    location = 'INDONESIA';
    details = `${title} (Average): ${average}`;
  }

  d3.select('#info-location')
    .text(location);
  d3.select('#info-details')
    .text(details);

}

var column = columns[columnIdx];
var title = titles[columnIdx];

var width = 960,
  height = 500;

var centered;

var map = d3.map();

var average = 0;

var projection = d3.geoEquirectangular()
  .scale(1050)
  .rotate([-120, 0])
  .translate([width / 2, height / 2]);

var path = d3.geoPath()
  .projection(projection);

var svg = d3.select('#map')
  .attr('width', width)
  .attr('height', height)
  .call(responsivefy);
;
function responsivefy(svg) {
  // get container + svg aspect ratio
  var container = d3.select(svg.node().parentNode),
    width = parseInt(svg.style("width")),
    height = parseInt(svg.style("height")),
    aspect = width / height;

  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg.attr("viewBox", "0 0 " + width + " " + height)
    .attr("perserveAspectRatio", "xMinYMid")
    .call(resize);

  // to register multiple listeners for same event type, 
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  d3.select(window).on("resize." + container.attr("id"), resize);

  // get width of container and resize svg to fit it
  function resize() {
    var targetWidth = parseInt(container.style("width"));
    svg.attr("width", targetWidth);
    svg.attr("height", Math.round(targetWidth / aspect));
  }
}

svg.append('rect')
  .attr('class', 'background')
  .attr('width', width)
  .attr('height', height)
  .on('click', handleOnClick)
;

var g = svg.append('g');

var extentLegend = [600, 860];
var extents = new Array(5);
var extent;

var averages = Array.apply(null, Array(5)).map(function() { return 0 });
var average;

var interpolator = interpolators[columnIdx];
var color = d3.scaleSequential(d3[interpolator]);
var x = d3.scaleLinear()
  .rangeRound(extentLegend);

d3.queue()
  .defer(d3.csv, './csv/ipm.csv')
  .defer(d3.json, './json/indonesia-provinces-cities-topo.json')
  .await(init);

function init(err, hdi, provinces1) {
  if (err) { throw err; }

  hdi.forEach(function(d) {
    map.set(d.nama_kabkota, d);
  });

  // Calculate average IPM
  map.each(function(d) {
    for (var i=0; i<5; i++) {
      var column1 = columns[i];
      averages[i] += +d[column1];
    }
  });

  for (var i=0; i<5; i++) {
    averages[i] = (averages[i] / map.size()).toPrecision(4);
  }

  for (var i=0; i<5; i++) {
    var column1 = columns[i];
    extents[i] = d3.extent(hdi, function(d) {
      return +d[column1];
    });
  }

  extent = extents[columnIdx];

  color.domain(extent);
  x.domain(extent);

  g.selectAll(".bar")
    .data(d3.range(extentLegend[0], extentLegend[1]), function(d) { return d; })
    .enter().append("rect")
    .attr('class', 'bar')
    .attr("x", function(d) { return d; })
    .attr("height", 8)
    .attr("width", 1)
    .style("fill", function(d) { return color(x.invert(d)); })

  g.call(d3.axisBottom(x)
    .ticks(9)
    .tickSize(13)
  )
    .select('.domain')
    .remove();
  /*
  g.append('text')
    .attr('class', 'caption')
    .attr('x', x.range()[0])
    .attr('y', 60)
    .attr('fill', '#000')
    .attr('text-anchor', 'start')
    .attr('font-weignt', 'bold')
    .text(`${title}: Indonesia`);
  */

  average = averages[columnIdx];

  var details = `${title} (Average): ${average}`;
  d3.select('#info-details')
    .text(details);

  initProvinces(err, provinces1);
}

function initProvinces(err, provinces1) {
  if (err) { throw err; }

  provinces = provinces1;

  g.append('g')
    .attr('id', 'provinces')
    .selectAll('path')
    .data(topojson.feature(provinces, provinces.objects.provinces).features)
    .enter().append('path')
    .attr('class', 'province')
    .attr('fill', function(d) {
      var key = d.properties.name;
      key = d.properties.nameAlt ? d.properties.nameAlt: key;
      if (!map.get(key)) {
        key = d.properties.name;
        // console.log(`${d.properties.province} - ${key}: `, d.properties.nameAlt);
      }

      return color(d[column] = +map.get(key)[column]);
    })
    .attr('d', path)
    .on('click', handleOnClick);
  /*
  g.append('g')
    .attr('id', 'regencies')
    .selectAll('path')
    .data(topojson.feature(regencies, regencies.objects.regencies).features)
    .enter().append('path')
    .attr('class', 'regency')
    .attr('fill', function(d) {
      var key = d.properties.name;
      key = d.properties.nameAlt ? d.properties.nameAlt: key;
      if (!map.get(key)) {
        key = d.properties.name;
        // console.log(`${d.properties.province} - ${key}: `, d.properties.nameAlt);
      }

      return color(d[column] = +map.get(key)[column]);
    })
    .attr('d', path)
    // .text(function(d) { return d[column] + '%'; })
    .on('click', handleOnClick)
  ;

  g.append('path')
    .datum(topojson.mesh(regencies, regencies.objects.regencies), function(a, b) {
      return a !== b;
    })
    .attr('id', 'regency-borders')
    .attr('d', path);
  */
  g.append('path')
    .datum(topojson.mesh(provinces, provinces.objects.provinces), function(a, b) {
      return a !== b;
    })
    .attr('id', 'province-borders')
    .attr('d', path);

  if (showCities) {
    g.selectAll('circle')
      .data(topojson.feature(provinces, provinces.objects.cities).features)
      .enter()
      .append('circle')
      .attr('cx', function(d) {
        return projection(d.geometry.coordinates)[0];
      })
      .attr('cy', function(d) {
        return projection(d.geometry.coordinates)[1];
      })
      .attr('r', '2')
      .attr('stroke', '#111')
      .attr('stroke-width', '.2')
      .attr('fill', '#ccc')
      .attr('class', 'city')
      .attr('d', path)
      .on('mouseover', function(d) {
        // d3.select('#place').text(d.properties.name);
        // d3.select(this).attr('class', 'city hover');
        if (!d.properties.name) console.log('d: ', d);
        return tooltip.style('visibility', 'visible')
          .text(d.properties.name);
      })
      .on('mousemove', function(d) {
        return tooltip.style('top', (d3.event.pageY - 10) + 'px')
          .style('left', (d3.event.pageX + 10) + 'px')
          .text(d.properties.name);
      })
      .on('mouseout', function(d) {
        // d3.select('#place').text('');
        // d3.select(this).attr('class', 'city');
        return tooltip.style('visibility', 'hidden');
      });
  }
};

function getName(region) {
  var properties = region.properties;
  var province = properties.province ? properties.province.toUpperCase() : null;
  var regency = properties.name.toUpperCase();
  var name = province ? `${province}: ${regency}` : regency;
  return name;
}

function getData(region) {
  var key = region.properties.name;
  if (map.get(key)) { return (+map.get(key)[column]).toPrecision(4); }
  key = region.properties.nameAlt;
  if (map.get(key)) { return (+map.get(key)[column]).toPrecision(4); }

  return 'no data';
}

function handleOnClick(d) {
  var x, y, k;

  var location, details;
  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
    location = getName(d);
    details = `${title}: ${getData(d)}`;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
    location = 'INDONESIA';
    details = `${title} (Average): ${average}`;
  }

  d3.select('#info-location')
    .text(location);
  d3.select('#info-details')
    .text(details);

  g.selectAll('path')
    .classed('active', centered && function(d) {
      return d === centered;
    });

  g.transition()
    .duration(750)
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')' +
      'scale(' + k + ')translate(' + -x + ',' + -y + ')')
    .attr('stroke-width', 1.5 / k + 'px');
}
