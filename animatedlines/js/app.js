$( document ).ready(function() {

    // ---------- Initialize Map Object ---------- //
    var map = L.map('map', {
        center: [49.261837, -123.259779],
        zoom: 14,
        maxZoom:20,
        attributionControl:false,
        zoomControl:false
    });
    // new L.Control.Zoom({ position: 'topleft' }).addTo(map);
    var info = L.mapbox.infoControl();
    info.addTo(map);
    // map.addControl(L.mapbox.shareControl({position:'topright'}));

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


    function animatelines(path2file, colorcode){
        // --- animate line --- // 
        d3.json(path2file, function(data){
            console.log(data);
            var geojson = L.geoJson(data),
                coords = [],
                values = [],
                time = [];
            // pull out coordinates 
            function geo2array(geojson){
                for (var i = 0; i<data.features.length; i+=10){
                    coords.push(data.features[i].geometry.coordinates);
                    values.push( (data.features[i].properties.co2).toFixed(2));
                    time.push( data.features[i].time);
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
                color: colorcode,
                opacity: 0.9,
                weight:6
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
            var pause = true;
            $( "#play" ).click(function() {
                pause = false;
                add();
            });
            $( "#stop" ).click(function() {
                pause = false;
            });
            

            // add a point to the line:
            var geojson = { type: 'LineString', coordinates: [] };
            L.geoJson(geojson).addTo(map);

            var marker = L.marker(line.coordinates[pointsAdded], {
              icon: L.mapbox.marker.icon({
                'marker-color': colorcode
              })
            }).addTo(map);

            // Make an array to store refactored co2 data
            var temp = []
            // The animation function
            function add() {
                // `addLatLng` takes a new latLng coordinate and puts it at the end of the line. 
                polyline.addLatLng(L.latLng(
                        line.coordinates[pointsAdded][1],
                        line.coordinates[pointsAdded][0]));

                marker.setLatLng(L.latLng(
                        line.coordinates[pointsAdded][1],
                        line.coordinates[pointsAdded][0]));

                // d3.select("#timer").text("Time: "+ line.datetime[pointsAdded]);
                // d3.select("#co2text").text("CO2: "+ line.co2[pointsAdded].toString());

                // Pan the map along with where the line is being added.
                // if (pointsAdded % 1 ==0) map.setView([line.coordinates[pointsAdded][1],line.coordinates[pointsAdded][0]], 12);
                // Continue to draw and pan the map by calling `add()`until `pointsAdded` reaches 360.
                // if (++pointsAdded < line.coordinates.length) window.setTimeout(add, 10);

                // Push the data to the temp array
                temp.push([line.datetime[pointsAdded], line.co2[pointsAdded]])
                // First: add an inital line --> then build onto that line to avoid redrawing the entire thing
                
                // Loop through calling the add() function to animate the line
                if(pointsAdded < line.coordinates.length){
                    pointsAdded++;
                    if (pause == false){
                        window.setTimeout(add, 75);
                    }

                }
            } // add function end
            add();

        }); // d3 end
    } // animatelines() end
    animatelines('data/d1641.geojson', '#FF9933');
    animatelines('data/d108.geojson', '#CC66FF');
    animatelines('data/d150.geojson', '#2EB8E6');
    animatelines('data/d151.geojson', '#E3D317');
    animatelines('data/d205.geojson', '#DE004B');
    
    
});


// // --- animate line --- // 
//         d3.json("data/d108.geojson", function(data){
//             console.log(data);
//             var geojson = L.geoJson(data),
//                 coords = [],
//                 values = [],
//                 time = [];
//             // pull out coordinates 
//             function geo2array(geojson){
//                 for (var i = 0; i<data.features.length; i+=10){
//                     coords.push(data.features[i].geometry.coordinates);
//                     values.push( (data.features[i].properties.co2).toFixed(2));
//                     time.push( data.features[i].time);
//                 }
//             };
//             geo2array(geojson);
//             // create linestring
//             var line = { type: 'LineString', 
//                 coordinates: coords,
//                 co2:values,
//                 datetime:time},
//                 start = [ 0,0],
//                 momentum = [0,0];
//             //  create empty polyline
//             var polyline = L.polyline([], {
//                 color: '#FF4719',
//                 opacity: 0.75,
//                 weight:3
//             }).addTo(map);
//             // initialize counter
//             var pointsAdded = 0;

//             // calculate min and max values of co2
//             var dataMax = d3.max(line.co2, function(d){
//                 return d;
//             });
//             var dataMin = d3.min(line.co2, function(d){
//                 return d;
//             });

//             //  On click start and stop animation
//             var pause = false;
//             // $( "#go" ).click(function() {
//             //     pause = false;
//             //     add();
//             // });
//             // $( "#stop" ).click(function() {
//             //     pause = false;
//             // });

//             // add a point to the line:
//             var geojson = { type: 'LineString', coordinates: [] };
//             L.geoJson(geojson).addTo(map);

//             var marker = L.marker(line.coordinates[pointsAdded], {
//               icon: L.mapbox.marker.icon({
//                 'marker-color': '#f86767'
//               })
//             }).addTo(map);

//             // Make an array to store refactored co2 data
//             var temp = []
//             // The animation function
//             function add() {
//                 // `addLatLng` takes a new latLng coordinate and puts it at the end of the line. 
//                 polyline.addLatLng(L.latLng(
//                         line.coordinates[pointsAdded][1],
//                         line.coordinates[pointsAdded][0]));

//                 marker.setLatLng(L.latLng(
//                         line.coordinates[pointsAdded][1],
//                         line.coordinates[pointsAdded][0]));

//                 d3.select("#timer").text("Time: "+ line.datetime[pointsAdded]);
//                 d3.select("#co2text").text("CO2: "+ line.co2[pointsAdded].toString());

//                 // Pan the map along with where the line is being added.
//                 if (pointsAdded % 5 ==0) map.setView([line.coordinates[pointsAdded][1],line.coordinates[pointsAdded][0]], 12);
//                 // Continue to draw and pan the map by calling `add()`until `pointsAdded` reaches 360.
//                 // if (++pointsAdded < line.coordinates.length) window.setTimeout(add, 10);

//                 // Push the data to the temp array
//                 temp.push([line.datetime[pointsAdded], line.co2[pointsAdded]])
//                 // First: add an inital line --> then build onto that line to avoid redrawing the entire thing
                
//                 // Loop through calling the add() function to animate the line
//                 if(pointsAdded < line.coordinates.length){
//                     pointsAdded++;
//                     if (pause == false){
//                         window.setTimeout(add, 50);
//                     }

//                 }
//             } // add function end
//             add();

//         }); // d3 end
