$(document).ready(function(){
    // ----------------------- create map object ------------ //
    var CEE_base_grey = L.tileLayer('https://tileserver-jklee.rhcloud.com/CEE_V001_base/{z}/{x}/{y}.png', {
            maxZoom: 15,
            minZoom: 10,
           attribution: 'Map tiles by CIRs, Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
        }); 
    // add toner labels
    var Stamen_TonerLabels = L.tileLayer('http://{s}.tile.stamen.com/toner-labels/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        subdomains: 'abcd',
        minZoom: 10,
        maxZoom: 15
    });
    var googleImagery = new L.Google('SATELLITE');
    // Roads layer
    var CEE_roads = L.tileLayer('https://tileserver-jklee.rhcloud.com/CEE_V001_grey_roads/{z}/{x}/{y}.png', {
            maxZoom: 15,
            minZoom: 10,
           attribution: 'Map tiles by CIRs, Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
        }); 

    // create map instance and setup 
    var bounds = [[48.6624, -123.9258], [49.7533, -122.02]];
    var map = L.map('map', {
        center: [49.2503, -123.062],
        zoom: 11,
        maxZoom:15,
        minZoom:10,
        maxBounds:bounds,
        layers: [CEE_base_grey, CEE_roads, Stamen_TonerLabels]});
    
    // --- openshift tiles --- //
    // cloud tiles
    var cloudTiles = L.tileLayer('https://tileserver-jklee.rhcloud.com/clouds/{z}/{x}/{y}.png');
    // var cloudGrid = L.mapbox.gridLayer('https://tileserver-jklee.rhcloud.com/cloudDays/{z}/{x}/{y}.grid.json'),
    //     myGridControl = L.mapbox.gridControl(cloudGrid,{position:'bottomright'}).addTo(map);

    // population
    var population  = L.tileLayer('https://tileserver-jklee.rhcloud.com/population/{z}/{x}/{y}.png');
        
    // biomass
    var biomassTiles = L.tileLayer('https://tileserver-jklee.rhcloud.com/biomass/{z}/{x}/{y}.png');
    // var biomassGrid = L.mapbox.gridLayer('joeyklee.j18p72a4'),
    //     myGridControl = L.mapbox.gridControl(biomassGrid,{position:'bottomright'}).addTo(map);

    // solar
    var solarTiles = L.tileLayer('https://tileserver-jklee.rhcloud.com/solar/{z}/{x}/{y}.png');
    // var solarGrid = L.mapbox.gridLayer('joeyklee.j2cggnmb'),
    //     myGridControl = L.mapbox.gridControl(solarGrid,{position:'bottomright'}).addTo(map);

    // agriculture
    var agTiles = L.tileLayer('https://tileserver-jklee.rhcloud.com/agriculture/{z}/{x}/{y}.png');
    // var solarGrid = L.mapbox.gridLayer('joeyklee.j2cggnmb'),
    //     myGridControl = L.mapbox.gridControl(solarGrid,{position:'bottomright'}).addTo(map);

    //wind
    var windTiles = L.tileLayer('https://tileserver-jklee.rhcloud.com/wind/{z}/{x}/{y}.png');

    // -------------------- Create Layer groups for the layer toggler -------------------- //
    //  --- define layer groups --- //
    // solar
    var feature1 = L.layerGroup([solarTiles]);
    // population
    var feature2 = L.layerGroup([population]);
    // industrial
    var feature4 = L.layerGroup([]); 
    // biomass              
    var feature5 = L.layerGroup([biomassTiles]);
    // hydro
    var feature6 = L.layerGroup([]);
    // clouds
    var feature7 = L.layerGroup([cloudTiles]);
    // wind
    var feature3 = L.layerGroup([windTiles]);
    // agriculture
    var feature8 = L.layerGroup([agTiles]);

    // --- Layer toggler objects --- //
    // basemaps
    var baseMaps = {
        "CEE Map": CEE_base_grey,
        "Google Imagery": googleImagery
    };
    // overlays
    var overlayMaps = {
        "Solar Potential": feature1,
        "Population": feature2,
        "Industrial": feature4,
        "Biomass": feature5,
        "Hydro": feature6,
        "Agriculture": feature8,
        "Cloud Days": feature7,
        "Wind": feature3,
        "Roads": CEE_roads,
        "Labels" : Stamen_TonerLabels
    };
    L.control.layers(baseMaps, overlayMaps, {position:'topleft'}).addTo(map); //bottomright
    
    // --------------------- Jquery add legend dynamically --------------------- //
    // solar checkbox
    $( "input:checkbox:eq(2)" ).change(function(){
        if (this.checked){
            solarLegend();
            map.setView([49.2503, -123.062], 11);
        } else {
             $(".solarLegend").remove();
        }
    });
    // Population checkbox
    $( "input:checkbox:eq(3)" ).change(function(){
        if (this.checked){
            map.setView([49.2503, -123.062], 11);
        }
    });

    //industrial checkbox
    $( "input:checkbox:eq(4)" ).change(function(){
        if (this.checked){
            industrialLegend();
            map.setView([49.214825, -122.989561], 11);
        } else {
             $(".industrialLegend").remove();
        }
    });
    //biomass checkbox
    $( "input:checkbox:eq(5)" ).change(function(){
        if (this.checked){
            biomassLegend();
            map.setView([49.387656, -122.968961],11);
        } else {
             $(".biomassLegend").remove();
        }
    });
    // hydro checkbox
    $( "input:checkbox:eq(6)" ).change(function(){
        if (this.checked){
            hydroLegend();
            map.setView([49.387656, -122.968961], 11);
        } else {
             $(".hydroLegend").remove();
        }
    });
    // agriculture checkbox
    $( "input:checkbox:eq(7)" ).change(function(){
        if (this.checked){
            agLegend();
            map.setView([49.156277, -122.895648], 11);
        } else {
             $(".agLegend").remove();
        }
    });
    // // Cloud Days checkbox
    // $( "input:checkbox:eq(8)" ).change(function(){
    //     if (this.checked){
    //         map.setView([49.2503, -123.062], 11);
    //     }
    // });
    // wind checkbox
    $( "input:checkbox:eq(9)" ).change(function(){
        if (this.checked){
            windLegend();
            map.setView([49.2503, -123.062], 11);
        } else {
             $(".windLegend").remove();
        }
    });

    // -------------------- Data Rendered as SVG by geojson -------------------- //
    // --- Wind Layer --- //
    d3.json("data/wind_optimized.geojson", function(data) {
        // console.log(data);
        // -------------- Set Scales -------------- //
        // get max and min
        var dataMax = d3.max(data.features, function(d){
            return d.properties.EU_12031_C});
        var dataMin = d3.min(data.features, function(d){
            return d.properties.EU_12031_C});

        var color = d3.scale.quantize()
                              .domain([dataMin,dataMax])
                              .range(colorbrewer.Blues[7]);

        // --- optional :start  -- //
        function highlightFeature(e) {
            var layer = e.target;
            layer.setStyle({
                weight: 0,
                color: '#ffffff',
                opacity: 0,
                fillOpacity: 0.0
            });

            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
        }

        var geojson;
        function resetHighlight(e) {
            geojson.resetStyle(e.target);
            e.target.closePopup();
        }
        function windPopUp(e) {
            // does this feature have a property named popupContent?
            var popupContent = "<p><center>Average wind speed at 80m (m/s):"+ "<br/>" 
                                + e.target.feature.properties.EU_12031_C+ "</center></p>";
            e.target.bindPopup(popupContent);
        }

        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: windPopUp
            });
        }
        // --- optional: end --- //

        // Style Wind
         var windStyle = function(feature){
            return {
                fillOpacity:0.20,
                weight:0,
                opacity:0,
                color: color(feature.properties.EU_12031_C)
            }
        };
        

        // geojson = L.geoJson(data, {
        //     style: windStyle,
        //     onEachFeature: onEachFeature //windPopUp
        // }).addTo(feature3);

    }); // d3 end

    // --- Industrial Layer --- //
    d3.json("data/industrial.geojson", function(data) {
        // console.log(data);
        // -------------- Set Scales -------------- //
        // get max and min
        var dataMax = d3.max(data.features, function(d){
            return d.properties.PotentE});
        var dataMin = d3.min(data.features, function(d){
            return d.properties.PotentE});
        // Set the Color - Not necessary for this case
        var color = d3.scale.linear()
                      .domain([dataMin, dataMax])
                      .range(["#6631E8","#6631E8"])
        // Set the Scale - Log Scale for emphasis
        var scale = d3.scale.log()
                      .domain([dataMin,dataMax])
                      .range([1, 15])
        // Style the Industrial Points Using helpful D3 tools 
        var industrialStyle = function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: scale(feature.properties.PotentE),
                fillColor: color(feature.properties.PotentE),
                color: "#000",
                weight: 1,
                opacity: 0,
                fillOpacity: 0.6
            });
        } 
        // Set the PopUp Content
        var industrialPopUp = function onEachFeature(feature, layer) {
            // does this feature have a property named popupContent?
            var popupContent = "<p><center>Industry:"+ "<br/>" 
                                + feature.properties.CATEGORY+ "</center></p>";
            layer.bindPopup(popupContent);
        }
        // Load Geojson Points using Native Leaflet
        var industralPoints = L.geoJson(data, {
            onEachFeature: industrialPopUp,
            pointToLayer: industrialStyle
        }).addTo(feature4);
    }); // D3 End

    // --- Hydro Layer --- // 
    d3.json("data/bchydro_data.geojson", function(data){
        // console.log(data);
        // console.log("hydro");
        // -------------- Set Scales -------------- //
        // get max and min
        var dataMax = d3.max(data.features, function(d){
            return d.properties.AVG_ANN_EN});
        var dataMin = d3.min(data.features, function(d){
            return d.properties.AVG_ANN_EN});
        // Set the Color - Not necessary for this case
        var color = d3.scale.linear()
                      .domain([dataMin, dataMax])
                      .range(["#56ABFF","#56ABFF"])
        // Set the Scale - Log Scale for emphasis
        var scale = d3.scale.log()
                      .domain([dataMin,dataMax])
                      .range([1, 15])
        // Style the Industrial Points Using helpful D3 tools 
        var hydroStyle = function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: scale(feature.properties.AVG_ANN_EN),
                fillColor: color(feature.properties.AVG_ANN_EN),
                color: "#000",
                weight: 1,
                opacity: 0,
                fillOpacity: 0.6
            });
        }
        // Set the PopUp Content
        var hydroPopUp = function onEachFeature(feature, layer) {
            // does this feature have a property named popupContent?
            var popupContent = "<p><center>Potential Hydro Energy:"+ "<br/>" 
                                + feature.properties.AVG_ANN_EN + "</center></p>";
            layer.bindPopup(popupContent);
        }
        // Load Geojson Points using Native Leaflet
        var hydroPoints = L.geoJson(data, {
            onEachFeature: hydroPopUp,
            pointToLayer: hydroStyle
        }).addTo(feature6);
    }); // d3 end
    

    // -------------------- Legend Layers -------------------- //
    // --- solar legend --- //
    function solarLegend(){
        var legend = L.control({position:"bottomleft"});
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'solarLegend'); 
            return div
        };
        legend.addTo(map);  

        var data = [4, 8, 15, 16, 23, 42];
        var color = [ '#FEB24C','#FD8D3C','#FC4E2A','#E31A1C','#BD0026','#800026'];
        var labels = ["Low Solar Potential", "","", "","", "High Solar Potential"];
        // --- Horizontal Legend bar --- //
        var w = 350;
        var h = 20;

        var svg = d3.select(".solarLegend.leaflet-control").append("svg")
            .attr("width", w)
            .attr("height", h);

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("y", function(d,i){
                //return h*(3/4);
                return h-10;
            })
            .attr("x", function(d,i){
                return (i * (w/data.length));
            })
            .style("fill", function(d, i){
                return( color[i]);
            })
            .style("opacity", 0.6)
            .attr("width", function(d,i){
                return w/data.length;
            })
            .attr("height", 10);

        svg.selectAll("text")
            .data(labels)
            .enter()
            .append("text")
            //.attr("class", "solarLegend")
            .text(function(d){
                return d;
            })
            .attr("y", function(d){
                //return h*(3/4);
                return h-10
            })
            .attr("x", function(d, i){
                if(i != (data.length -1)){
                    return i *(w/data.length);
                }
                else{
                   return i *(w/data.length) - 30;
                } 
            })
            .attr("text-anchor", "center")
            // .attr("transform", function(d){
            //     return "rotate(10)";
            // })
            .style("font-size", 10);
    };

    // --- Biomass legend --- //
    function biomassLegend(){
       var legend = L.control({position:"bottomleft"});
       legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'biomassLegend'); 
            return div
        };
        legend.addTo(map);  

        var data = [1, 2, 3, 4];
        var color = ["#BFD8BF", "#7FB17F", "#408B40", "#006400"];
        var labels = ["Low Biomass Potential", "","","High Biomass Potential"];
        
        // --- Horizontal Legend bar --- //
        var w = 350;
        var h = 20;

        var svg = d3.select(".biomassLegend.leaflet-control").append("svg")
            .attr("width", w)
            .attr("height", h);

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("y", function(d,i){
                //return h*(3/4);
                return h-10;
            })
            .attr("x", function(d,i){
                return (i * (w/data.length));
            })
            .style("fill", function(d, i){
                return( color[i]);
            })
            .style("opacity", 0.6)
            .attr("width", function(d,i){
                return w/data.length;
            })
            .attr("height", 10);

        svg.selectAll("text")
            .data(labels)
            .enter()
            .append("text")
            .text(function(d){
                return d;
            })
            .attr("y", function(d){
                //return h*(3/4);
                return h-10
            })
            .attr("x", function(d, i){
                if(i != (data.length -1)){
                    return i *(w/data.length);
                }
                else{
                   return i *(w/data.length) - 18;
                } 
            })
            .attr("text-anchor", "center")
            .style("font-size", 10);
    };

    // --- Biomass legend --- //
    function agLegend(){
       var legend = L.control({position:"bottomleft"});
       legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'agLegend'); 
            return div
        };
        legend.addTo(map);  

        var data = [1, 2, 3];
        var color = ["#758017", "#D9AE84", "#F5D453"];
        var labels = ["Crops & Other", "Mixed Crops & Livestock","Livestock Only"];
        // --- Horizontal Legend bar --- //
        var w = 350;
        var h = 20;
        var svg = d3.select(".agLegend.leaflet-control").append("svg")
            .attr("width", w)
            .attr("height", h);

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("y", function(d,i){
                //return h*(3/4);
                return h-10;
            })
            .attr("x", function(d,i){
                return (i * (w/data.length));
            })
            .style("fill", function(d, i){
                return( color[i]);
            })
            .style("opacity", 0.6)
            .attr("width", function(d,i){
                return w/data.length;
            })
            .attr("height", 10);

        svg.selectAll("text")
            .data(labels)
            .enter()
            .append("text")
            .text(function(d){
                return d;
            })
            .attr("y", function(d){
                //return h*(3/4);
                return h-10
            })
            .attr("x", function(d, i){
                if(i != (data.length -1)){
                    return i *(w/data.length);
                }
                else{
                   return i *(w/data.length) +20;
                } 
            })
            .attr("text-anchor", "center")
            .style("font-size", 10);
    };

    // --- Biomass legend --- //
    function windLegend(){
       var legend = L.control({position:"bottomleft"});
       legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'windLegend'); 
            return div
        };
        legend.addTo(map);  

        var data = [1, 2, 3, 4, 5];
        var color = ["#342E59", "#395D73", "#63A693", "#7EBF9A", "#D4F2B6"];
        var labels = ["Lower Wind Speed","","","","Higher Wind Speed"];
        // --- Horizontal Legend bar --- //
        var w = 350;
        var h = 20;
        var svg = d3.select(".windLegend.leaflet-control").append("svg")
            .attr("width", w)
            .attr("height", h);

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("y", function(d,i){
                //return h*(3/4);
                return h-10;
            })
            .attr("x", function(d,i){
                return (i * (w/data.length));
            })
            .style("fill", function(d, i){
                return( color[i]);
            })
            .style("opacity", 0.6)
            .attr("width", function(d,i){
                return w/data.length;
            })
            .attr("height", 10);
        svg.selectAll("text")
            .data(labels)
            .enter()
            .append("text")
            .text(function(d){
                return d;
            })
            .attr("y", function(d){
                //return h*(3/4);
                return h-10
            })
            .attr("x", function(d, i){
                if(i != (data.length -1)){
                    return i *(w/data.length);
                }
                else{
                   return i *(w/data.length) -18;
                } 
            })
            .attr("text-anchor", "center")
            .style("font-size", 10);
    };

    // --- industrial legend --- //
    function industrialLegend(){
        // use leaflet to create a div object
        var legend = L.control({position:"bottomleft"});
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'industrialLegend'); 
            return div
        };
        legend.addTo(map);  

        // Create place holders for svg rectangles
        var data = [2, 3, 4, 5, 6, 7, 8];
        var labels = ["Low Heat Energy", "","", "", "", "", "High Heat Energy"];
        
        // --- Horizontal Legend bar --- //
        var w = 200;
        var h = 40;

        // Put in SVGs for the legend div
        var svg = d3.select(".industrialLegend.leaflet-control").append("svg")
            .attr("width", w)
            .attr("height", h);
        // Legend circles 
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cy", function(d,i){
                //return h*(3/4);
                //return  (h-20) - i;
                return (h-4) -i*2;
            })
            .attr("cx", function(d,i){
                //return (i * (w/data.length)) +10;
                return i* ((d*2) + 8) + 15;
            })
            .attr("r", function(d){
                return d*2;
            })
            .style("fill", function(d, i){
                //return(color[i]);
                return( "#6631E8");
            })
            .style("opacity", 0.6);

        // Legend text
        svg.selectAll("text")
            .data(labels)
            .enter()
            .append("text")
            .text(function(d){
                return d;
            })
            .attr("y", function(d){
                //return h*(3/4);
                return h-33;
                //return h/2;
            })
            .attr("x", function(d, i){
                if(i != (data.length -1)){
                    return i *(w/data.length);
                }
                else{
                   return i *(w/data.length) - 50;
                } 
            })
            .attr("text-anchor", "center")
            // .attr("transform", function(d){
            //     return "rotate(10)";
            // })
            .style("font-size", 10);

    };

    // --- Hydro legend --- //
    function hydroLegend(){
        // use leaflet to create a div object
        var legend = L.control({position:"bottomleft"});
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'hydroLegend'); 
            return div
        };
        legend.addTo(map);  

        // Create place holders for svg rectangles
        var data = [2, 3, 4, 5, 6, 7, 8];
        var labels = ["Low Hydro Energy", "","", "", "", "", "High Hydro Energy"];
        
        // --- Horizontal Legend bar --- //
        var w = 200;
        var h = 40;

        // Put in SVGs for the legend div
        var svg = d3.select(".hydroLegend.leaflet-control").append("svg")
            .attr("width", w)
            .attr("height", h);
        // Legend circles 
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cy", function(d,i){
                //return h*(3/4);
                //return  (h-20) - i;
                return (h-4) -i*2;
            })
            .attr("cx", function(d,i){
                //return (i * (w/data.length)) +10;
                return i* ((d*2) + 8) + 15;
            })
            .attr("r", function(d){
                return d*2;
            })
            .style("fill", function(d, i){
                //return(color[i]);
                return( "#56ABFF");
            })
            .style("opacity", 0.6);

        // Legend text
        svg.selectAll("text")
            .data(labels)
            .enter()
            .append("text")
            .text(function(d){
                return d;
            })
            .attr("y", function(d){
                //return h*(3/4);
                return h-33;
                //return h/2;
            })
            .attr("x", function(d, i){
                if(i != (data.length -1)){
                    return i *(w/data.length);
                }
                else{
                   return i *(w/data.length) - 60;
                } 
            })
            .attr("text-anchor", "center")
            // .attr("transform", function(d){
            //     return "rotate(10)";
            // })
            .style("font-size", 10);

    };

    // --- add ip locator --- //
    L.control.locate({position:"topleft"}).addTo(map);

}); // jQuery End
