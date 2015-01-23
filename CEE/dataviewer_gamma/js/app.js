$(document).ready(function(){

	// ---------- Initialize Map Object ---------- //
	var map = L.map('map', {
	    center: [49.2503, -123.062],
	    zoom: 11,
	    maxZoom:20,
	    attributionControl:false,
	    zoomControl: false
	});
	var info = L.mapbox.infoControl({position:'bottomleft'});
	info.addTo(map);

	var CEE_base_grey = L.tileLayer('https://tileserver-jklee.rhcloud.com/CEE_V001_base/{z}/{x}/{y}.png', {
	        maxZoom: 15,
	        minZoom: 10,
            zIndex:1,
	       attribution: 'Map tiles by CIRs, Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	    }).addTo(map); 
	// add toner labels
	// var Stamen_TonerLabels = L.tileLayer('http://{s}.tile.stamen.com/toner-labels/{z}/{x}/{y}.png', {
	//     attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
	//     subdomains: 'abcd',
	//     minZoom: 10,
	//     maxZoom: 15,
	//     zIndex:6
	// }).addTo(map);
    var Stamen_TonerLabels = L.tileLayer('https://tileserver-geog.rhcloud.com/metro_labels_overlap/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        subdomains: 'abcd',
        minZoom: 10,
        maxZoom: 15,
        zIndex:20
    }).addTo(map);
    // Roads layer
    var CEE_roads = L.tileLayer('https://tileserver-jklee.rhcloud.com/CEE_V001_grey_roads/{z}/{x}/{y}.png', {
            maxZoom: 15,
            minZoom: 10,
            zIndex:5,
           attribution: 'Map tiles by CIRs, Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
    }).addTo(map);

   

	// --- openshift tiles --- //
    // cloud tiles - tileserver-jklee
    var cloudTiles = L.tileLayer('https://tileserver-geog.rhcloud.com/clouds/{z}/{x}/{y}.png',{zIndex:7});
    // population
    var population  = L.tileLayer('https://tileserver-geog.rhcloud.com/population/{z}/{x}/{y}.png',{zIndex:4});
    // biomass
    var biomassTiles = L.tileLayer('https://tileserver-geog.rhcloud.com/biomass/{z}/{x}/{y}.png',{zIndex:3});
    var biomassGrid = new L.UtfGrid('https://tileserver-geog.rhcloud.com/biomass/{z}/{x}/{y}.grid.json', {
            useJsonP: false
        });
    biomassGrid.on('mouseover', function (e) {
            if (e.data) {
                document.getElementById('hover').innerHTML = "<center>Biomass Harvest Potential (tonnes hectares <sup>-1</sup> year<sup>-1</sup>): <br> " + e.data.Biomass + "</center>";
                // document.getElementById('hover').innerHTML = "<center>" + e.data.Biomass +"</center>";
            } else {
                document.getElementById('hover').innerHTML = 'Hover on features';
            }
        });
    // solar
    var solarTiles = L.tileLayer('https://tileserver-geog.rhcloud.com/solar/{z}/{x}/{y}.png',{zIndex:3});
    var solarGrid = new L.UtfGrid('https://tileserver-geog.rhcloud.com/solar/{z}/{x}/{y}.grid.json', {
            useJsonP: false
        });
    solarGrid.on('mouseover', function (e) {
            if (e.data) {
                document.getElementById('hover').innerHTML = "<center>Solar Radiation Potential (kWh): <br> " + e.data.S_Rad_kWh + "</center";
            } else {
                document.getElementById('hover').innerHTML = 'Hover on features';
            }
        });
    // agriculture
    var agTiles = L.tileLayer('https://tileserver-geog.rhcloud.com/agriculture/{z}/{x}/{y}.png',{zIndex:3});
    var agGrid = new L.UtfGrid('https://tileserver-geog.rhcloud.com/agriculture/{z}/{x}/{y}.grid.json', {
            useJsonP: false
        });
    agGrid.on('mouseover', function (e) {
            if (e.data) {
                document.getElementById('hover').innerHTML = "<center> Land Use Category: <br> " + e.data.cat + "</center>";
            } else {
                document.getElementById('hover').innerHTML = 'Hover on features';
            }
        });
    //wind
    var windTiles = L.tileLayer('https://tileserver-geog.rhcloud.com/wind/{z}/{x}/{y}.png',{zIndex:3});
    var windGrid = new L.UtfGrid('https://tileserver-geog.rhcloud.com/wind/{z}/{x}/{y}.grid.json', {
            useJsonP: false
        });
    windGrid.on('mouseover', function (e) {
            if (e.data) {
                document.getElementById('hover').innerHTML = "<center>Average wind speed at 80m height (ms<sup>-1</sup>): <br> " + e.data.EU_12031_C + "</center>";
            } else {
                document.getElementById('hover').innerHTML = 'Hover on features';
            }
        });
	// ----------- Create Layer groups for the layer toggler ----------- //

    //  --- define layer groups --- //
    var solarclouds = L.layerGroup([solarTiles, solarGrid, cloudTiles]);
    var biomassag = L.layerGroup([biomassTiles, biomassGrid, agTiles, agGrid]);
    var windgroup = L.layerGroup([windTiles, windGrid]);

    var industrialhydro = L.featureGroup([]).bringToFront();

    var toggler = {
        "Solar Potential & Cloud Days": solarclouds,
        "Biomass Potential & Agriculture": biomassag,
        "Wind Energy": windgroup,
        "Industrial Heat & Hydropower":industrialhydro,
        "Population Density": population
    };
    L.control.layers(toggler,null, {position:'bottomleft'}).addTo(map); //bottomright

    
    
    // console.log($("input:radio:eq(1)"));
    $("input:radio[name=leaflet-base-layers]").click(function() {
        var value = $(this).parent().children('span').text();
        console.log(value);

        // Solar & clouds
        if($.trim(value) === 'Solar Potential & Cloud Days'){
           $('.legend').append('<img class="solarlegend" src="img/SOLAR.png" />');
           $('.legend').append('<p class="solarlegend"> Modeled solar energy from low (0.2 kWh) to high (1.2 kWh)</p>');
           $('.legend').append('<img class="solarlegend" src="img/clouds_legend.png" />');
           $('.legend').append('<p class="solarlegend"> Modeled cloud days from low (192 days) to high (304 days)</p>');
           // map.setView([49.2503, -123.062], 11);
        } else {
            $('.solarlegend').remove();
        }
        //  biomass & agriculture
        if($.trim(value) === 'Biomass Potential & Agriculture'){
           $('.legend').append('<img class="biomassag" src="img/BIOMASS.png" />');
           $('.legend').append('<p class="biomassag"> Modeled harvestable biomass energy from low (29.6 tonnes hectares <sup>-1</sup> year<sup>-1</sup>). to high (342.3 tonnes hectares <sup>-1</sup> year<sup>-1</sup>)</p>');
           $('.legend').append('<img class="biomassag" src="img/AG.png" />');
           $('.legend').append('<p class="biomassag"> Agricultural land use types associated with various harvestable energy (e.g. methane production)</p>');
           // map.setView([49.281732, -122.831565], 11);
        } else {
            $('.biomassag').remove();
        }
        //  wind energy
        if($.trim(value) === 'Wind Energy'){
           $('.legend').append('<img class="wind" src="img/WIND.png" />');
           $('.legend').append('<p class="wind">Observed average wind speeds at 80m height from low (1.8 ms<sup>-1</sup>) to high (7.8ms<sup>-1</sup>)</p>');
           // map.setView([49.2503, -123.062], 11);
        } else {
            $('.wind').remove();
        }
        // Industrial & Hydro
        if($.trim(value) === 'Industrial Heat & Hydropower'){
           $('.legend').append('<img class="industrialhydro" src="img/INDUSTRIAL.png" />');
           $('.legend').append('<p class="industrialhydro">Potential Industrial heat recovery from low (8.0 units) to high (39554.7 units), labeled by industry.</p>');
           $('.legend').append('<img class="industrialhydro" src="img/HYDRO.png" />');
           $('.legend').append('<p class="industrialhydro">Potential run-of-river power from low (0.5 units) to high (79.1 units).</p>');
           // map.setView([49.343507, -122.997733], 11);
        } else {
            $('.industrialhydro').remove();
        }
        //  Population Density
        if($.trim(value) === 'Population Density'){
           $('.legend').append('<img class="pop" src="img/POP.png" />');
           $('.legend').append('<p class="pop">Population density of Metro Vancouver (Each dot = 1 person).</p>');
           // map.setView([49.212254, -122.951041], 11);
        } else {
            $('.pop').remove();
        }
    });

    // ---------------- industrial hydro ------------------ //
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
                      .range(["#6631E8","#6631E8"]);
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
        }).addTo(industrialhydro);
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
        }).addTo(industrialhydro);
    }); // d3 end



    // ---------------- Donut chart ----------------- //
    d3.json('data/ceei_2010_metrovan_formatted.geojson', function(data){
        // console.log(data);

        var svgstyle = function style(feature) {
            return {
                fillColor: "#fff",
                weight: 1,
                opacity: 0.75,
                color: '#fff', //#fff
                // dashArray: '3',
                fillOpacity: 0
            };
        }

        function highlightFeature(e) {
            var layer = e.target;

            layer.setStyle({
                weight: 2,
                opacity: 0.85,
                color: '#2C3E50', //#fff
                dashArray: '',
                fillOpacity: 0
            });
            //  uncomment if you want this layer to render on top
            // if (!L.Browser.ie && !L.Browser.opera) {
            //     layer.bringToFront();
            // }

            // info.update(layer.feature.properties);
        }

        function resetHighlight(e) {
            geojson.resetStyle(e.target);
            // info.update();
        }

        function makegraph(e){   
            var temp = e.target.feature.properties;
            // delete temp.metroname;
            document.getElementById('piecity').innerHTML = temp.metroname

            var keys = [];
            for(var k in temp) if(k !== "metroname") keys.push(k);

            var dat = [];
            for (var i in temp) if(i !== "metroname") dat.push(temp[i]);

            var listOfObjects = [];
            for(var i = 0; i < keys.length; i++){
                var singleObj = {}
                singleObj['label'] = keys[i];
                singleObj['value'] = dat[i];
                listOfObjects.push(singleObj);
            }
            // Donut chart example
            var energypie = nv.addGraph(function() {
              var chart = nv.models.pieChart()
                  .x(function(d) { return d.label })
                  .y(function(d) { return d.value })
                  .margin({top: -10, right: -10, bottom:-10, left: -10})
                  // .margin({top: 0, right: 0, bottom:0, left: 0})
                  .showLegend(false)
                  .showLabels(true)     //Display pie labels
                  .labelThreshold(.05)  //Configure the minimum slice size for labels to show up
                  .labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
                  .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
                  .donutRatio(0.35)     //Configure how big you want the donut hole size to be.
                  ;

                d3.select("#pietemp")
                    .datum(listOfObjects)
                    .transition().duration(350)
                    .style({ 'width': '100%', 'height': '100%' })
                    .style("padding", "0")
                    .call(chart);


              return chart;
            }); // nvd3 end

            // var layer = e.target;

            

        }


        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: makegraph
            });

        }


        geojson = L.geoJson(data, {
            style: svgstyle,
            onEachFeature: onEachFeature
        }).addTo(map);

    }); // d3 end

    // --- add ip locator --- //
    // L.control.locate({position:"bottomright"}).addTo(map);
}); // docready end