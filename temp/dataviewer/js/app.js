$(document).ready(function() {

	// ------------ UI controls -------------//
	$("#close").click();


	(function makemap() {
		// ---------- Initialize Map Object ---------- //
		var southWest = L.latLng(48.909138, -123.736408),
			northEast = L.latLng(49.705864, -122.019172),
			bounds = L.latLngBounds(southWest, northEast);

		var map = L.map('map', {
			center: [49.2803, -123.12],
			zoom: 12,
			minZoom: 10,
			maxZoom: 20,
			maxBounds: bounds,
			attributionControl: false,
			zoomControl: false
		});

		// ---------- Use Map Providers ---------- //
		var Stamen_TonerBackground = L.tileLayer('http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png', {
			attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			subdomains: 'abcd',
			minZoom: 9,
			maxZoom: 20
		}).addTo(map);
		var Stamen_TonerLabels = L.tileLayer('http://{s}.tile.stamen.com/toner-labels/{z}/{x}/{y}.png', {
			attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			subdomains: 'abcd',
			minZoom: 9,
			maxZoom: 20
		});

		(function() {
			map.scrollWheelZoom.disable();
			map.touchZoom.disable();

			var enableMapInteraction = function() {
				map.scrollWheelZoom.enable();
				map.touchZoom.enable();
			}

			$('#map').on('click touch', enableMapInteraction);
		})(); // on map click, enable interaction

		// ---------- Layer Toggler ---------- //
		// var baseMaps = { "toner": Stamen_TonerBackground};
		// var overlayMaps = { "labels":Stamen_TonerLabels };
		// L.control.layers(baseMaps, overlayMaps ,{position:"topleft"}).addTo(map);

		var bbox = [-123.329949, 49.155965, // minx, minY
			-123.023705, 49.339294
		]; // maxX, maxY



		d3.json("data/co2data.geojson", function(data) {
			// console.log(data.features.length);
			// remove any weird points
			data.features = data.features.filter(function(d){
				return d.properties.co2 !== 0;
			});
			// console.log(data.features.length);

			pts = data;

			// var layerGroup = L.layerGroup().addTo(map);


			var cellWidth = 2.5;
			var units = 'kilometers';
			// var grid = turf.hexGrid(bbox, cellWidth, units);
			// var grid = turf.squareGrid(bbox, cellWidth, units);
			var grid = turf.triangleGrid(bbox, cellWidth, units);

			var color = d3.scale.linear()
				.domain([400, 550])
				.range(["orange", "red"]);


			var aggregations = [{
				aggregation: 'average',
				inField: 'co2',
				outField: 'co2_avg'
			}, {
				aggregation: 'median',
				inField: 'co2',
				outField: 'co2_median'
			}, {
				aggregation: 'min',
				inField: 'co2',
				outField: 'co2_min'
			}, {
				aggregation: 'max',
				inField: 'co2',
				outField: 'co2_max'
			}, {
				aggregation: 'deviation',
				inField: 'co2',
				outField: 'co2_deviation'
			}, {
				aggregation: 'variance',
				inField: 'co2',
				outField: 'co2_variance'
			}, {
				aggregation: 'count',
				inField: '',
				outField: 'point_count'
			}];

			var aggregated = turf.aggregate(grid, pts, aggregations);

			function gridstats(igrid, ivar) {
				var output = L.layerGroup();
				var copyobj = JSON.parse(JSON.stringify(igrid));

				copyobj.features.forEach(function(cell) {
					var variable = cell.properties[ivar];
					// console.log(thing);
					var _withCount = cell._withCount = {};
					_withCount.weight = 0;
					_withCount.fillOpacity = 0;

					if (variable) {
						var co2_cval = color(variable);
						_withCount.color = co2_cval;
						_withCount.fillOpacity = 0.75;
					}
					cell.properties = cell._withCount;
				});

				L.geoJson(copyobj).eachLayer(function(l) {
					l.setStyle(l.feature.properties);
				}).addTo(output);

				return output;
			}

			var variance = gridstats(aggregated, "co2_variance");
			var avg = gridstats(aggregated, "co2_avg");
			var min = gridstats(aggregated, "co2_min");
			var max = gridstats(aggregated, "co2_max");

			var rawPoints = L.featureGroup().bringToFront();
			// -------------- Set Scales -------------- //
			(function render(){
				console.log(data);
				// console.log(data.features.length);
		       // get max and min
		       // var dataMax = d3.max(data.features, function(d){
		       //     return d.properties.co2});
		       // console.log(dataMax);
		       // var dataMin = d3.min(data.features, function(d){
		       //     return d.properties.co2});
				var dataMax = 550;
				var dataMin = 400;

		       // Set the Color - Not necessary for this case
		       var color = d3.scale.linear()
		                     .domain([dataMin, dataMax])
		                     .range(["orange","red"]);
		       // Set the Scale - Log Scale for emphasis
		       var opac = d3.scale.log()
		                     .domain([dataMin,dataMax])
		                     .range([0.25, 0.75]);
		       // Set the Scale - SQRT for circle area
		       var scale = d3.scale.sqrt()
		                     .domain([dataMin,dataMax])
		                     .range([1, 8]);
		       var pointStyle = function (feature, latlng) {
		           return L.circleMarker(latlng, {
		               radius: scale(feature.properties.co2),
		               fillColor: color(feature.properties.co2),
		               color: "#000",
		               weight: 1,
		               opacity: 0,
		               fillOpacity: opac(feature.properties.co2)
		           });
		       }
		       // Set the PopUp Content
		       var pointPopUp = function onEachFeature(feature, layer) {
		           // does this feature have a property named popupContent?
		           var popupContent = "<p><center>Co2 (ppm):"+ "<br/>" 
		                               + feature.properties.co2+ "</center></p>";
		           layer.bindPopup(popupContent);
		       };

		       var dataPoints = L.geoJson(data, {
		           onEachFeature:pointPopUp,
		           pointToLayer: pointStyle
		       }).addTo(rawPoints);

		    })();


		    // console.log(rawPoints(data));

			var overlayMaps = {
				"avg": avg,
				"min": min,
				"max": max,
				"variance": variance
			}
			
			// set display none
			L.control.layers(overlayMaps, null).addTo(map);

			// https://stackoverflow.com/questions/14103489/leaflet-layer-control-events
			$("#avg").click(function() {
				$("[name='leaflet-base-layers']").parent()[0].click();
				$('.controlbutton, .filter').css('background-color', '');
				if (map.hasLayer(avg)) {

					$('#avg').css('background-color', '#CCFFCC');
				}
			});
			$("#min").click(function() {
				$("[name='leaflet-base-layers']").parent()[1].click();
				$('.controlbutton, .filter').css('background-color', '');
				if (map.hasLayer(min)) {
					$('#min').css('background-color', '#CCFFCC');
				}
			});
			$("#max").click(function() {
				$("[name='leaflet-base-layers']").parent()[2].click();
				$('.controlbutton, .filter').css('background-color', '');
				if (map.hasLayer(max)) {
					$('#max').css('background-color', '#CCFFCC');
				}
			});
			$("#var").click(function() {
				$("[name='leaflet-base-layers']").parent()[3].click();
				$('.controlbutton, .filter').css('background-color', '');
				if (map.hasLayer(variance)) {
					$('#var').css('background-color', '#CCFFCC');
				}
			});

			$("#raw").click(function() {
				// $("[name='leaflet-overlays-layers']").parent()[0].click();
				$('.controlbutton, .filter').css('background-color', '');
				if (map.hasLayer(rawPoints)) {
		           map.removeLayer(rawPoints);
		           // this.className = '';
			       } else {
			           rawPoints.addTo(map);
			           // this.className = 'active';
			           $('#raw').css('background-color', '#CCFFCC');
			       }
			});

			// console.log($("[name='leaflet-base-layers']"));
		}); // end turf
	})();

	// ---------- d3 maps -------------- //
	(function maked3map() {
		var width = 960,
			height = 650;
		var svg = d3.select("#map2").append("svg")
			.attr("width", width)
			.attr("height", height);
		var projection = d3.geo.mercator()
			.scale(150000)
			.center([-123.120995, 49.264577])
			.translate([width / 2, height / 2]);

		d3.json("data/studyarea.json", function(error, data) {
			// console.log(data);
			if (error) return console.error(error);

			var studyarea = topojson.feature(data,
				data.objects.studyarea);

			var path = d3.geo.path()
				.projection(projection);

			svg.append("path")
				.datum(studyarea)
				.attr("d", path)
				.attr("fill", "none")
				.attr("stroke", "black");
		});

		var scale = d3.scale.sqrt()
			.domain([400, 600])
			.range([1, 10]);
		var color = d3.scale.sqrt()
			.domain([400, 600])
			.range(['red', 'purple']);


		function render(data) {
			// console.log(data);
			// add circles to svg
			svg.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
				.attr("cx", function(d) {
					return projection([d.X, d.Y])[0];
				})
				.attr("cy", function(d) {
					return projection([d.X, d.Y])[1];
				})
				.attr("r", function(d) {
					return scale(d.co2);
				})
				.attr("fill", function(d) {
					return color(d.co2);
				})
				.attr("opacity", 0.25);
		}
		d3.csv("data/co2data.csv", terms, render);

		function terms(d) {
			d.X = +d.X;
			d.Y = +d.Y;
			d.co2 = +d.co2;
			return d;
		}
	}); // end maked3map()



}); // jquery end



// **************** accordion bottom **************** //
$('#collapseOne').on('show.bs.collapse', function() {
	$('.panel-heading').animate({
		backgroundColor: "#000"
	}, 500);
})

$('#collapseOne').on('hide.bs.collapse', function() {
	$('.panel-heading').animate({
		backgroundColor: "#000"
	}, 500);
})

// *************** Dialog Boxes ******************* //
$('#aboutmodal').on('shown.bs.modal', function() {
	$('#myInput').focus()
})

$('#helpmodal').on('shown.bs.modal', function() {
	$('#myInput').focus()
})


// ************** time selector ***************** //
$(function() {

	$('#reportrange span').html(moment().subtract(29, 'days').format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));

	$('#reportrange').daterangepicker({
		format: 'MM/DD/YYYY',
		startDate: moment().subtract(29, 'days'),
		endDate: moment(),
		minDate: '01/01/2012',
		maxDate: '12/31/2015',
		dateLimit: {
			days: 60
		},
		showDropdowns: true,
		showWeekNumbers: true,
		timePicker: true,
		timePickerIncrement: 1,
		timePicker12Hour: true,
		ranges: {
			'Today': [moment(), moment()],
			'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
			'Last 7 Days': [moment().subtract(6, 'days'), moment()]
				// 'Last 30 Days': [moment().subtract(29, 'days'), moment()],
				// 'This Month': [moment().startOf('month'), moment().endOf('month')],
				// 'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
		},
		opens: 'left',
		drops: 'down',
		buttonClasses: ['btn', 'btn-sm'],
		applyClass: 'btn-primary',
		cancelClass: 'btn-default',
		separator: ' to ',
		locale: {
			applyLabel: 'Submit',
			cancelLabel: 'Cancel',
			fromLabel: 'From',
			toLabel: 'To',
			customRangeLabel: 'Custom',
			daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
			monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			firstDay: 1
		}
	}, function(start, end, label) {
		console.log(start.toISOString(), end.toISOString(), label);
		$('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
	});

	// console.log($("#reportrange span").daterangepicker("getDate");
		console.log($("#reportrange span").val());
	// console.log($("#reportrange").daterangepicker("getDate"));

});


// ___________________________ make map 2 ______________________ //
(function maked3map2() {
	var width = 960,
		height = 500;
	var svg = d3.select("#map3").append("svg")
		.attr("width", width)
		.attr("height", height)
		.style('background-color', "#fff");
	var projection = d3.geo.mercator()
		.scale(180000)
		.center([-123.120995, 49.264577])
		.translate([width / 2, height / 2]);

	// enter study area
	d3.json("data/studyarea.json", function(error, data) {
		// console.log(data);
		if (error) return console.error(error);

		var studyarea = topojson.feature(data,
			data.objects.studyarea);

		var path = d3.geo.path()
			.projection(projection);

		svg.append("path")
			.datum(studyarea)
			.attr("d", path)
			.attr("fill", "none") //"#CCCCCC"
			.attr("stroke", "#CCCCCC"); //"white"
	});

	// enter data grid
	d3.json("data/gridded_250m.geojson", function(error, data) {
			// console.log(data.features);
			if (error) return console.error(error);

			var scale = d3.scale.log()
				.domain([400, 450])
				.range([1, 10]);
			var color = d3.scale.linear()
				.domain([400, 550, 700])
				.range(['yellow', 'orange', 'red']);

			var path = d3.geo.path()
				.projection(projection);

			svg.selectAll("path")
				.data(data.features)
				.enter()
				.append("g")
				.attr("class", "datagrid")
				.append("path")
				.attr("class", function(d) {
					return "a" + d.properties.ID
				})
				.attr("d", path)
				.attr("fill", function(d) {
					if (typeof d.properties.MAXCo2_ppm == "object") {
						console.log('its an object dummy!');
						return "none";
					} else {
						return color(+d.properties.MAXCo2_ppm);
					}
				})
				.attr("stroke", "black")
				.attr("stroke-opacity", 0.1)
				.on("mouseover", highlight)
				.on("mouseout", dehighlight)
				.append("desc")
				.text(function(d) {
					if (typeof d.properties.MAXCo2_ppm == "object") {
						console.log('its an object dummy!');
						return "none";
					} else {
						return color(+d.properties.MAXCo2_ppm);
					}
				});
		}) // end grid

	// bar chart
	d3.csv("data/gridded_250m.csv", terms, function(error, data) {
		chartWidth = 200;
		chartHeight = height;
		yColumn = "ID";
		xColumn = "MAXCo2_ppm";

		//  filter data
		data = data.filter(function(d) {
			if (d[xColumn] != "") {
				return d;
			}
		})

		console.log(data.length);
		//  Sort data 
		data.sort(function(a, b) {
			return b[xColumn] - a[xColumn];
		});

		// Use color ramp from the grid - remove the redundancy! 
		var color = d3.scale.linear()
			.domain([400, 550, 700])
			.range(['yellow', 'orange', 'red']);
		// Scale the x and y
		var xScale = d3.scale.linear().range([0, chartWidth]);
		var yScale = d3.scale.ordinal().rangeBands([0, chartHeight], 0.1);
		// Set the scale domain - ordinal X for bar chart
		xScale.domain([0, d3.max(data, function(d) {
			return d[xColumn];
		})]);
		yScale.domain(data.map(function(d) {
			return d[yColumn];
		}));

		//create a second svg element to hold the bar chart
		var chart = d3.select("#map4").append("svg")
			.attr("width", chartWidth)
			.attr("height", chartHeight)
			.attr("class", "chart")
			.style('background-color', "#fff");

		//set bars for each county
		var bars = chart.selectAll(".bar")
			.data(data)

		bars.enter()
			.append("rect")
			.attr("class", function(d) {
				return "bar " + "a" + d.ID;
			})
			.attr("height", yScale.rangeBand());


		bars
			.attr("x", 0)
			.attr("y", function(d) {
				return yScale(d[yColumn]);
			})
			.attr("width", function(d) {
				return xScale(d[xColumn]);
			})
			.attr("fill", function(d) {
				if (d[xColumn] == "") {
					console.log('its undefined dummy!');
					return "none";
				} else {
					return color(+d[xColumn]);
				}
			})
			.on("mouseover", highlight)
			.on("mouseout", dehighlight);
		// .on("mousemove", moveLabel);

	});


	function terms(d) {
		d.MAXCo2_ppm = +d.MAXCo2_ppm;
		d.ID = d.ID;
		return d;
	}

}); // end maked3map2()

function highlight(data) {
	var props = data.properties ? data.properties : data;
	d3.selectAll("." + "a" + props.ID)
		.style("fill", "#000");

	// var labelAttribute = "<h1>"+props[expressed]+
	//     "</h1><br><b>"+label(expressed)+"</b>"; //label content
	// var labelName = props.name ? props.name : props.NAME; //html string for name to go in child div

	// //create info label div
	// var infolabel = d3.select("body")
	//     .append("div") 
	//     .attr("class", "infolabel") //for styling the label
	//     .attr("id", "a"+props.GEOID+"label")//for label div
	//     .html(labelAttribute) //add text
	//     .append("div") //add child div for feature name
	//     .attr("class", "labelname") //for styling name
	//     .html(labelName); //add feature name to label
}; //end highlight()

function dehighlight(data) {
	var props = data.properties ? data.properties : data;
	var county = d3.selectAll("." + "a" + props.ID); //select current county
	var fillcolor = county.select("desc").text(); //reads original color
	county.style("fill", fillcolor);
	// d3.select("#"+"a"+props.GEOID+"label").remove(); //removes highlight
}; //end dehighlight()



// // ---------- Marker Layer ---------- //

// d3.json("data/1000.json", function(data) {
//  // "http://localhost:8080/api/points/co2/gte/600"
//        // "http://localhost:8080/api/points/co2/450/600"
//        // "http://localhost:8080/api/points/co2/gte/300"
//        // "http://localhost:8080/api/points/co2/450/500"
//        // "http://localhost:8080/api/points/near/-123.124257/49.278906/4000"
//         // "http://localhost:8080/api/points/time/2014-09-09"
//  // console.log(data)
//  // -------------- Set Scales -------------- //
//        // get max and min
//        var dataMax = d3.max(data, function(d){
//            return d.properties.Co2_ppm});
//        var dataMin = d3.min(data, function(d){
//            return d.properties.Co2_ppm});
//        // Set the Color - Not necessary for this case
//        var color = d3.scale.linear()
//                      .domain([dataMin, dataMax])
//                      .range(["red","purple"])
//        // Set the Scale - Log Scale for emphasis
//        var opac = d3.scale.log()
//                      .domain([dataMin,dataMax])
//                      .range([0.25, 0.75])
//        // Set the Scale - SQRT for circle area
//        var scale = d3.scale.sqrt()
//                      .domain([dataMin,dataMax])
//                      .range([1, 15])
//        var pointStyle = function (feature, latlng) {
//            return L.circleMarker(latlng, {
//                radius: scale(feature.properties.Co2_ppm),
//                fillColor: color(feature.properties.Co2_ppm),
//                color: "#000",
//                weight: 1,
//                opacity: 0,
//                fillOpacity: opac(feature.properties.Co2_ppm)
//            });
//        }
//        // Set the PopUp Content
//        var pointPopUp = function onEachFeature(feature, layer) {
//            // does this feature have a property named popupContent?
//            var popupContent = "<p><center>Co2 (ppm):"+ "<br/>" 
//                                + feature.properties.Co2_ppm+ "</center></p>";
//            layer.bindPopup(popupContent);
//        }

//        var dataPoints = L.geoJson(data, {
//            onEachFeature:pointPopUp,
//            pointToLayer: pointStyle
//        }).addTo(map);        

//        // --------------------- nvd3 chart --------- //
//        var vid1 = [],
//            vid2 = [],
//            vid3 = [],
//            vid4 = [];
//            // console.log(data[0]);
//            var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
//            for (var i=0; i< data.length; i+=10){
//                if (data[i].properties.index >= 0 && data[i].properties.index <= 600){
//                    vid1.push({
//                        x:parseDate(data[i].properties.dateTime_gmt), 
//                        y:data[i].properties.Co2_ppm, 
//                        geometry:data[i].geometry,
//                        properties: data[i].properties 
//                    });
//                } else if (data[i].properties.index > 600 && data[i].properties.index <= 1200){
//                    vid2.push({
//                        x:parseDate(data[i].properties.dateTime_gmt), 
//                        y:data[i].properties.Co2_ppm, 
//                        geometry:data[i].geometry,
//                        properties: data[i].properties
//                    });
//                }else if (data[i].properties.index > 1200 && data[i].properties.index <= 1800){
//                    vid3.push({
//                        x:parseDate(data[i].properties.dateTime_gmt), 
//                        y:data[i].properties.Co2_ppm, 
//                        geometry:data[i].geometry,
//                        properties: data[i].properties 
//                    });
//                } else if (data[i].properties.index > 1800 && data[i].properties.index <= 2500){
//                    vid4.push({
//                        x:parseDate(data[i].properties.dateTime_gmt), 
//                        y:data[i].properties.Co2_ppm,
//                        geometry:data[i].geometry,
//                        properties: data[i].properties 
//                    });
//                }  
//            }
//        // console.log("vid1", vid2);

//        var newData = [ {values:vid1, key:"vid1", color:"#F48D6C"}, 
//                        {values:vid2, key:"vid2", color:"#F2E07B"}, 
//                        {values:vid3, key:"vid3", color:"#8ABE9B"},
//                        {values:vid4, key:"vid4", color:"#4A6D8B"} ];

//          var chart;
//          nv.addGraph(function(){
//                chart = nv.models.lineChart()
//                    .options({
//                        margin:{ left:60, bottom:40},
//                        x: function(d,i){return i}, // d.x
//                        showXAxis: true,
//                        showYAxis: true,
//                        transitionDuration:100
//                    });
//                chart.xAxis
//                    .axisLabel("Time (min)")
//                    .tickFormat(d3.format(',.1f'));
//                chart.yAxis
//                    .axisLabel('Co2 (ppm)')
//                    .tickFormat(d3.format(',.2f'));

//                // chart.y2Axis
//                //     .tickFormat(d3.format(',.2f'));
//                d3.select('#chart svg')
//                  .append("text")
//                  .attr("x", 200)             
//                  .attr("y", 20)
//                  .attr("text-anchor", "middle")  
//                  .text("Data Summary");

//                // Load Geojson Points using Native Leaflet
//                var dataPoints = L.geoJson(data, {
//                    onEachFeature:pointPopUp,
//                    pointToLayer: pointStyle
//                }).addTo(map);

//                nv.utils.windowResize(chart.update);
//                d3.select('#chart svg')
//                    .datum(newData)
//                    .call(chart);

//                nv.utils.windowResize(chart.update); 
//                // var geopoint = L.geoJson(null).addTo(map);
//                var geopoint = L.geoJson(null, {
//                    pointToLayer: function(feature, latlng){
//                        return L.circleMarker(latlng,{
//                            radius: 15,
//                            color: "#00CC99",  //"#00CC99"
//                            weight:2,
//                            opacity:1,
//                            fillOpacity:0
//                        })
//                    }
//                }).addTo(map);
//                var i = 0;
//                chart.lines.dispatch.on('elementMouseover.tooltip', function(e) { 
//                    console.log(e.point.geometry);
//                    if (i%2 == 0){
//                        geopoint.addData(e.point.geometry);
//                        i++;
//                    } else if (i%2 == 1){
//                        geopoint.clearLayers();
//                        i++;
//                        if (i%2 == 0){
//                            geopoint.addData(e.point.geometry);
//                            i++;
//                        }
//                    }
//                });
//            // return chart;
//          });

// }); // d3 end


// ------------------------------------------------------ //
//   var width  = 600;
//   var height = 500;

// var mapSVG = d3.select("#d3map").append("svg")
//     .attr("width", width).attr("height", height)

// d3.json("data/gridded_100m_stats_py.geojson", function(json) {
//     // create a first guess for the projection
//     console.log(json);
//     var center = d3.geo.centroid(json)
//     var scale  = 150;
//     var offset = [width/2, height/2];
//     var projection = d3.geo.mercator().scale(scale).center(center)
//         .translate(offset);

//     // create the path
//     var path = d3.geo.path().projection(projection);

//     // using the path determine the bounds of the current map and use 
//     // these to determine better values for the scale and translation
//     var bounds  = path.bounds(json);
//     var hscale  = scale*width  / (bounds[1][0] - bounds[0][0]);
//     var vscale  = scale*height / (bounds[1][1] - bounds[0][1]);
//     var scale   = (hscale < vscale) ? hscale : vscale;
//     var offset  = [width - (bounds[0][0] + bounds[1][0])/2,
//                       height - (bounds[0][1] + bounds[1][1])/2];

//     // new projection
//     projection = d3.geo.mercator().center(center)
//       .scale(scale).translate(offset);
//     path = path.projection(projection);

//     //  Color scales
//     var dataMax = d3.max(json.features, function(d){
//         return d.properties.mean_co2});
//     var dataMin = d3.min(json.features, function(d){
//         return d.properties.mean_co2});

//     console.log(dataMax, dataMin);
//     // Set the Color 
//     var color = d3.scale.log()
//                   .domain([dataMin, dataMax])
//                   .range(["#FFEBD6","#FF9933"])

//     mapSVG.selectAll("path")
//       .data(json.features)
//       .enter()
//       .append("path")
//       .attr("d", path)
//       .style("fill", function(d){
//           return color(d.properties.mean_co2);
//       })
//       .append("hovertitle")
//           .text(function(d) { 
//               return  d.properties.mean_co2; 
//           })
//       $.each(json.features, function(i, feature) {
//           mapSVG.append("path")
//               .datum(feature.geometry)
//               .attr("class", "border")
//               .attr("id", feature.properties.ID)
//               .attr('data-name', name)
//               .attr("d", path)
//               .on("mouseover", function(d) {
//                   d3.select(this).classed("active", true )
//                 })
//               .on("mouseout",  function(d) {
//                 d3.select(this).classed("active", false)
//               })
//         });
//   }); 


// *********************************************************

// (function test2(){
//   // points

//     function render(data){
//       console.log(data);
//         var width = 960,
//           height = 1160;

//         var svg1 = d3.select("#map2").append("svg")
//             .attr("width", width)
//             .attr("height", height);
//       // console.log(projection(aa),projection(bb));
//         var projection = d3.geo.mercator()
//             .scale(1000)
//             .center([-123.0, 49.3])
//             .translate([width / 2, height / 2]);

//         // var scale = d3.scale.linear()
//         //   .domain([1, 20])
//         //   .range([390, 500]);

//         // add circles to svg
//         svg1.selectAll("circle")
//         .data(data)
//         .enter()
//         .append("circle")
//         .attr("cx", function (d) { return projection(d.lon); })
//         .attr("cy", function (d) { return projection(d.lat); })
//         .attr("r", 5)
//         .attr("fill", "red")

//     }
//     d3.csv("data/co2data.csv", terms, render);


//     function terms(d){
//       d.X = +d.X;
//       d.Y = +d.Y;
//       d.rownum = +d.rownum;
//       d.date = d.date;
//       d.time = d.time;
//       d.gpsfix = +d.gpsfix;
//       d.gpsquality = +d.gpsquality;
//       d.lat = +d.lat;
//       d.lon = +d.lon;
//       d.speed = +d.speed;
//       d.altitude = +d.altitude;
//       d.satfix = +d.satfix;
//       d.co2 = +d.co2;
//       d.tcell = +d.tcell;
//       d.pcell = +d.pcell;
//       d.vin = +d.vin;
//       d.tempin = +d.tempin;
//       d.tempout = +d.tempout;
//       d.datetime = d.datetime;
//       d.sensorid = +d.sensorid;
//       return d;
//     }


// });


// (function test(){
//   var width = 960,
//     height = 1160;
//   var svg = d3.select("#map2").append("svg")
//       .attr("width", width)
//       .attr("height", height);

//   d3.json("data/studyarea.json", function(error, data) {
//     console.log(data);
//     if (error) return console.error(error);

//     // svg.append("path")
//     //     .datum(topojson.feature(data, data.objects.studyarea))
//     //     .attr("d", d3.geo.path().projection(d3.geo.mercator()));

//     var studyarea = topojson.feature(data, data.objects.studyarea);
//     var projection = d3.geo.mercator()
//         .scale(50000)
//         .center([-123.1, 49.2])
//         .translate([width / 2, height / 2]);

//     var path = d3.geo.path()
//         .projection(projection);

//     svg.append("path")
//         .datum(studyarea)
//         .attr("d", path)
//         .attr("fill", "none")
//         .attr("stroke", "black");
//   });

// });



// *************************** Horizontal bar chart ************************ //

// d3.csv("data/gridded_250m.csv", terms, function(error, data){
//     xColumn = "ID";
//     yColumn = "MAXCo2_ppm";

//     //  filter data
//     data = data.filter(function(d){
//       if (d[yColumn] != ""){
//         return d;
//       }
//     })
//     //  Sort data 
//     data.sort(function(a, b) { return b[yColumn] - a[yColumn]; });

//     // Use color ramp from the grid - remove the redundancy! 
//     var color = d3.scale.linear()
//         .domain([400, 550, 700])
//         .range(['yellow', 'orange', 'red']);
//     // Scale the x and y
//     var xScale = d3.scale.ordinal().rangeBands([0, width], 0.1);
//     var yScale = d3.scale.linear().range([height, 0]);
//     // Set the scale domain - ordinal X for bar chart
//     xScale.domain( data.map( function (d){ return d[xColumn]; }));
//     yScale.domain([0, d3.max(data, function (d){ return d[yColumn]; })]);

//     //create a second svg element to hold the bar chart
//     var chart = d3.select("#map4").append("svg")
//         .attr("width", width)
//         .attr("height", height)
//         .attr("class", "chart")
//         .style('background-color', "#000");

//     //set bars for each county
//     var bars = chart.selectAll(".bar")
//         .data(data)

//     bars.enter()
//         .append("rect")
//         .attr("class", function(d) {
//             return "bar " + "a"+d.ID;
//         })
//         .attr("width", xScale.rangeBand());


//     bars
//         .attr("x", function (d){ 
//           if (d[yColumn] !== ""){
//             return xScale(d[xColumn]); }
//         })
//         .attr("y", function (d){ 
//           if (d[yColumn] !== ""){
//             return yScale(d[yColumn]);}
//         })
//         .attr("height", function (d){ 
//           if (d[yColumn] !== ""){
//             return height - yScale(d[yColumn]);}
//         })
//         .attr("fill", function(d){
//            if ( d[yColumn] == ""){
//              console.log('its undefined dummy!');
//              return "none";
//            }else{
//              return color(+d[yColumn]); 
//            }
//         })
//         .on("mouseover", highlight)
//         .on("mouseout", dehighlight);
//         // .on("mousemove", moveLabel);