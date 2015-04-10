
$( document ).ready(function() {

    // ------------ UI controls -------------//
    $("#close").click();


   // ---------- Initialize Map Object ---------- //
    var southWest = L.latLng(48.909138, -123.736408),
        northEast = L.latLng(49.705864, -122.019172),
        bounds = L.latLngBounds(southWest, northEast);

    var map = L.map('map', {
        center: [49.2803, -123.12],
        zoom: 13,
        minZoom:10,
        maxZoom:20,
        maxBounds: bounds,
        attributionControl:false,
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
	}).addTo(map);

	(function () {
        map.scrollWheelZoom.disable();
        map.touchZoom.disable();
     
        var enableMapInteraction = function () {
            map.scrollWheelZoom.enable();
            map.touchZoom.enable();
        }
     
        $('#map').on('click touch', enableMapInteraction);
    })();

	// ---------- Layer Toggler ---------- //
	// var baseMaps = { "toner": Stamen_TonerBackground};
	// var overlayMaps = { "labels":Stamen_TonerLabels };
	// L.control.layers(baseMaps, overlayMaps ,{position:"topleft"}).addTo(map);


	// ---------- Marker Layer ---------- //
    
	d3.json("data/1000.json", function(data) {
		// "http://localhost:8080/api/points/co2/gte/600"
        // "http://localhost:8080/api/points/co2/450/600"
        // "http://localhost:8080/api/points/co2/gte/300"
        // "http://localhost:8080/api/points/co2/450/500"
        // "http://localhost:8080/api/points/near/-123.124257/49.278906/4000"
         // "http://localhost:8080/api/points/time/2014-09-09"
		// console.log(data)
		// -------------- Set Scales -------------- //
        // get max and min
        var dataMax = d3.max(data, function(d){
            return d.properties.Co2_ppm});
        var dataMin = d3.min(data, function(d){
            return d.properties.Co2_ppm});
        // Set the Color - Not necessary for this case
        var color = d3.scale.linear()
                      .domain([dataMin, dataMax])
                      .range(["red","purple"])
        // Set the Scale - Log Scale for emphasis
        var opac = d3.scale.log()
                      .domain([dataMin,dataMax])
                      .range([0.25, 0.75])
        // Set the Scale - SQRT for circle area
        var scale = d3.scale.sqrt()
                      .domain([dataMin,dataMax])
                      .range([1, 15])
        var pointStyle = function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: scale(feature.properties.Co2_ppm),
                fillColor: color(feature.properties.Co2_ppm),
                color: "#000",
                weight: 1,
                opacity: 0,
                fillOpacity: opac(feature.properties.Co2_ppm)
            });
        }
        // Set the PopUp Content
        var pointPopUp = function onEachFeature(feature, layer) {
            // does this feature have a property named popupContent?
            var popupContent = "<p><center>Co2 (ppm):"+ "<br/>" 
                                + feature.properties.Co2_ppm+ "</center></p>";
            layer.bindPopup(popupContent);
        }

        var dataPoints = L.geoJson(data, {
            onEachFeature:pointPopUp,
            pointToLayer: pointStyle
        }).addTo(map);        

        // --------------------- nvd3 chart --------- //
        var vid1 = [],
            vid2 = [],
            vid3 = [],
            vid4 = [];
            // console.log(data[0]);
            var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
            for (var i=0; i< data.length; i+=10){
                if (data[i].properties.index >= 0 && data[i].properties.index <= 600){
                    vid1.push({
                        x:parseDate(data[i].properties.dateTime_gmt), 
                        y:data[i].properties.Co2_ppm, 
                        geometry:data[i].geometry,
                        properties: data[i].properties 
                    });
                } else if (data[i].properties.index > 600 && data[i].properties.index <= 1200){
                    vid2.push({
                        x:parseDate(data[i].properties.dateTime_gmt), 
                        y:data[i].properties.Co2_ppm, 
                        geometry:data[i].geometry,
                        properties: data[i].properties
                    });
                }else if (data[i].properties.index > 1200 && data[i].properties.index <= 1800){
                    vid3.push({
                        x:parseDate(data[i].properties.dateTime_gmt), 
                        y:data[i].properties.Co2_ppm, 
                        geometry:data[i].geometry,
                        properties: data[i].properties 
                    });
                } else if (data[i].properties.index > 1800 && data[i].properties.index <= 2500){
                    vid4.push({
                        x:parseDate(data[i].properties.dateTime_gmt), 
                        y:data[i].properties.Co2_ppm,
                        geometry:data[i].geometry,
                        properties: data[i].properties 
                    });
                }  
            }
        // console.log("vid1", vid2);

        var newData = [ {values:vid1, key:"vid1", color:"#F48D6C"}, 
                        {values:vid2, key:"vid2", color:"#F2E07B"}, 
                        {values:vid3, key:"vid3", color:"#8ABE9B"},
                        {values:vid4, key:"vid4", color:"#4A6D8B"} ];

          var chart;
          nv.addGraph(function(){
                chart = nv.models.lineChart()
                    .options({
                        margin:{ left:60, bottom:40},
                        x: function(d,i){return i}, // d.x
                        showXAxis: true,
                        showYAxis: true,
                        transitionDuration:100
                    });
                chart.xAxis
                    .axisLabel("Time (min)")
                    .tickFormat(d3.format(',.1f'));
                chart.yAxis
                    .axisLabel('Co2 (ppm)')
                    .tickFormat(d3.format(',.2f'));

                // chart.y2Axis
                //     .tickFormat(d3.format(',.2f'));
                d3.select('#chart svg')
                  .append("text")
                  .attr("x", 200)             
                  .attr("y", 20)
                  .attr("text-anchor", "middle")  
                  .text("Data Summary");

                // Load Geojson Points using Native Leaflet
                var dataPoints = L.geoJson(data, {
                    onEachFeature:pointPopUp,
                    pointToLayer: pointStyle
                }).addTo(map);

                nv.utils.windowResize(chart.update);
                d3.select('#chart svg')
                    .datum(newData)
                    .call(chart);

                nv.utils.windowResize(chart.update); 
                // var geopoint = L.geoJson(null).addTo(map);
                var geopoint = L.geoJson(null, {
                    pointToLayer: function(feature, latlng){
                        return L.circleMarker(latlng,{
                            radius: 15,
                            color: "#00CC99",  //"#00CC99"
                            weight:2,
                            opacity:1,
                            fillOpacity:0
                        })
                    }
                }).addTo(map);
                var i = 0;
                chart.lines.dispatch.on('elementMouseover.tooltip', function(e) { 
                    console.log(e.point.geometry);
                    if (i%2 == 0){
                        geopoint.addData(e.point.geometry);
                        i++;
                    } else if (i%2 == 1){
                        geopoint.clearLayers();
                        i++;
                        if (i%2 == 0){
                            geopoint.addData(e.point.geometry);
                            i++;
                        }
                    }
                });
            // return chart;
          });
        
	}); // d3 end

    
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

    

}); // jquery end



// **************** accordion bottom **************** //
$('#collapseOne').on('show.bs.collapse', function () {    
    $('.panel-heading').animate({
        backgroundColor: "#000"
    }, 500);   
})

$('#collapseOne').on('hide.bs.collapse', function () {    
    $('.panel-heading').animate({
        backgroundColor: "#000"
    }, 500);   
})

// *************** Dialog Boxes ******************* //
$('#aboutmodal').on('shown.bs.modal', function () {
  $('#myInput').focus()
})

$('#helpmodal').on('shown.bs.modal', function () {
  $('#myInput').focus()
})



        


