$( document ).ready(function() {
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

    // --- animate line --- // 
    d3.json("data/traverse_20140912.geojson", function(data){
        // console.log(data);
        var geojson = L.geoJson(data),
            coords = [],
            values = [],
            time = [];
        // pull out coordinates 
        function geo2array(geojson){
            for (var i = 0; i<data.features.length; i+=5){
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


        //  On click start and stop animation
        var pause = false;
        // add();
        $( "#go" ).click(function() {
            pause = false;
            add();
        });
        $( "#stop" ).click(function() {
            pause = true;
        });


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
            if(pointsAdded < line.coordinates.length){
                pointsAdded++;
                if (pause == false){
                    window.setTimeout(add, 10);
                }
            }
        } // add function end

        makeChart();
        function makeChart(){
            var m = [0, 0, 0, 0]; // margins
            var chartWidth = $('#linechartwindow').width()
            var chartHeight = $('#linechartwindow').height()
            var x = d3.scale.linear().domain([0,line.co2.length]).range([0, chartWidth]);
            var y = d3.scale.linear().domain([0,dataMax]).range([chartHeight,chartHeight-100]);

            // create a line function that can convert data[] into x and y points
            var makeline = d3.svg.line()
                // assign the X function to plot our line as we wish
                .x(function(d,i) { 
                    // verbose logging to show what's actually being done
                    // console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
                    // return the X coordinate where we want to plot this datapoint
                    return x(i); 
                })
                .y(function(d) { 
                    // verbose logging to show what's actually being done
                    // console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
                    // return the Y coordinate where we want to plot this datapoint
                    return y(d); 
                })
            // Add an SVG element with the desired dimensions and margin.
            var graph = d3.select("#linechartwindow").append("svg:svg")
                  .attr("width", chartWidth + m[1] + m[3])
                  .attr("height", chartHeight + m[0] + m[2])
                .append("svg:g")
                  .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
            // Add the line by appending an svg:path element with the data line we created above
            // do this AFTER the axes above so that the line is above the tick-lines
            graph.append("svg:path").attr("d", makeline(line.co2));

        } // end make chart
    }); // d3 end


    
});


            // //  Create an animated line
            // var w = 700;
            // var h = 100;

            // var svg = d3.select("#line")
            //     .append("svg")
            //     .attr("width", w)
            //     .attr("height",h)
            //     .attr("id","linegraph");
            // var x = d3.scale.linear()
            //     .domain([0,line.co2.length()])
            // var y = d3.scale.linear()
            //     .domain([0,10])
            //     .range([dataMin, dataMax])
            // var line = d3.svg.line()
            //     .interpolate("cardinal")
            //     .x(function(d,i){
            //         return x(i); })
            //     .y(function(d){
            //         return y(d);})
            // var path = svg.append("path")
            //     .attr("d", line(line.co2))
            //     .attr("stroke", "steelblue")
            //     .attr("stroke-width", "2")
            //     .attr("fill", "none");
            // var totalLength = path.node().getTotalLength();
            // path
            //   .attr("stroke-dasharray", totalLength + " " + totalLength)
            //   .attr("stroke-dashoffset", totalLength)
            //   .transition()
            //     .duration(2000)
            //     .ease("linear")
            //     .attr("stroke-dashoffset", 0);




