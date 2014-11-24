$( document ).ready(function() {
     // -------- diclaimer click on/off ---------- //
    $('.enter').on('click', function() {
        $('.disclaimer').toggleClass('clicked');
    });
    // ---------- Initialize Map Object ---------- //
    var map = L.map('map', {
        center: [49.2503, -123.062],
        zoom: 11,
        maxZoom:20
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
    // ---------- Layer Toggler ---------- //
    var baseMaps = { "toner": Stamen_TonerBackground};
    var overlayMaps = { "labels":Stamen_TonerLabels };
    L.control.layers(baseMaps, overlayMaps ,{position:"topleft"}).addTo(map);

    // --- Side bar --- //
    // add info button
    var info = L.control({position:'topleft'});
    info.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info');
        div.innerHTML +=
        '<img src="img/info2.png" alt="legend" width="25" height="30">';
        return div;
     // $("#info").append("<img src='img/info.png></img>'");
    };
    info.addTo(map); 

    var sidebar = L.control.sidebar('sidebar', {
        closeButton: true,
        position: 'left'
    });
    map.addControl(sidebar);

    $(".info").on('click', function () {
        sidebar.toggle();
    })

    L.DomEvent.on(sidebar.getCloseButton(), 'click', function () {
        console.log('Close button clicked.');
    });

    // ----------- go/stop --------- //
    // Go Button
    var gobutton = L.control({position:'topleft'});
    gobutton.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'go');
        div.innerHTML +=
        '<img src="img/icon_5670.png" alt="go" width="20" height="20">';
        return div;
    };
    gobutton.addTo(map); 
    // Stop button
    var stopbutton = L.control({position:'topleft'});
    stopbutton.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'stop');
        div.innerHTML +=
        '<img src="img/icon_56016.png" alt="stop" width="20" height="20">';
        return div;
    };
    stopbutton.addTo(map); 


    // --- animate line --- // 
    d3.json("data/traverse_20140912.geojson", function(data){
        // console.log(data);
        var geojson = L.geoJson(data),
            coords = [],
            values = [],
            time = [];
        // pull out coordinates 
        function geo2array(geojson){
            for (var i = 0; i<data.features.length; i+=15){
                coords.push(data.features[i].geometry.coordinates);
                values.push( (data.features[i].properties.Co2_ppm).toFixed(2));
                time.push(new Date(data.features[i].properties.dateTime_gmt).toISOString());
            }
        };
        geo2array(geojson);
        // create linestring
        var line = { type: 'LineString', 
            coordinates: coords,
            co2:values,
            datetime:time},
            start = [ 0,0],
            momentum = [0,0];
        //  create empty polyline
        var polyline = L.polyline([], {
            color: 'red',
            opacity: 0.75,
            weight:3
        }).addTo(map);
        // initialize counter
        var pointsAdded = 0;

        // calculate min and max values of co2
        var dataMax = d3.max(line.co2, function(d){
            return d;
        });
        var dataMin = d3.min(line.co2, function(d){
            return d;
        });


        // --- Make the graph -- add points later --- //
        // var parse = d3.time.format("%b %Y").parse;
        var m = [0, 0, 35, 35]; // margins
        var chartWidth = $('#linechartwindow').width()
        var chartHeight = $('#linechartwindow').height()
        var x = d3.scale.linear().domain([0,line.co2.length]).range([0, chartWidth-m[3]]);
        // var x = d3.time.scale().domain([d3.min(line.datetime),d3.max(line.datetime)]).range([0, chartWidth-m[3]]);
        var y = d3.scale.linear().domain([0,dataMax]).range([chartHeight,0]);
        // Add an SVG element with the desired dimensions and margin.
        var graph = d3.select("#linechartwindow").append("svg:svg")
              .attr("width", chartWidth + m[1] + m[3])
              .attr("height", chartHeight + m[0] + m[2])
            .append("svg:g")
              .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

        var xAxis = d3.svg.axis()
                   .scale(x);
                   // .tickvalues();
        var xAxisGroup = graph.append("g")
                    .attr("transform", "translate(" + 0 + "," + chartHeight + ")")
                    .call(xAxis);
        var yAxis = d3.svg.axis()
                   .scale(y)
                   .ticks(4)
                   .orient("left");
        var yAxisGroup = graph.append("g")
                    .attr("transform", "translate(" + 0 + "." + chartWidth+ ")")
                    .call(yAxis); 
        // create a line function that can convert data[] into x and y points
        var makeline = d3.svg.line()
            // assign the X function to plot our line as we wish
            .x(function(d,i) { 
                return x(i);
            })
            .y(function(d) { 
                return y(d[1]); 
            })

        //  On click start and stop animation
        var pause = false;
        $( ".go" ).click(function() {
            pause = false;
            add();
        });
        $( ".stop" ).click(function() {
            pause = true;
        });

        // Make an array to store refactored co2 data
        var temp = []
        // The animation function
        function add() {
            // `addLatLng` takes a new latLng coordinate and puts it at the end of the line. 
            polyline.addLatLng(L.latLng(
                    line.coordinates[pointsAdded][1],
                    line.coordinates[pointsAdded][0]));
            // Print the co2 values to the screen
            // $('#timer p1').text("CO2: "+ line.co2[pointsAdded].toString() + " PPM");
            $('#timer p2').text(line.datetime[pointsAdded]);

            // Pan the map along with where the line is being added.
            if (pointsAdded % 5 ==0) map.setView([line.coordinates[pointsAdded][1],line.coordinates[pointsAdded][0]], 12);
            // Continue to draw and pan the map by calling `add()`until `pointsAdded` reaches 360.
            // if (++pointsAdded < line.coordinates.length) window.setTimeout(add, 10);

            // Push the data to the temp array
            temp.push([line.datetime[pointsAdded], line.co2[pointsAdded]])
            // First: add an inital line --> then build onto that line to avoid redrawing the entire thing
            if (temp.length == 2) graph.append("svg:path").attr("d", makeline(temp)).attr("class", "line");
            if (temp.length >2)  graph.select(".line").attr("d", makeline(temp));
            // Loop through calling the add() function to animate the line
            if(pointsAdded < line.coordinates.length){
                pointsAdded++;
                if (pause == false){
                    window.setTimeout(add, 25);
                }
            }
        } // add function end

    }); // d3 end
    
});
