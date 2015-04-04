$(document).ready(function(){
    // ---------- tool tips ------------ //
    $('.tooltipstered').tooltipster({delay: 0, position:'left'});
    $('#legend-button').tooltipster({
        content: $('<span><img src="img/legends-all-white.png" /></span>')
    , position:'left'});
    $("#thing").click();

    $('#layertoggler .ic').on({
        "click":function(e){
          e.stopPropagation();
        }
    });


	// ---------- Initialize Map Object ---------- //
	var southWest = L.latLng(48.909138, -123.736408),
	    northEast = L.latLng(49.705864, -122.019172),
	    bounds = L.latLngBounds(southWest, northEast);

	var map = L.map('map', {
	    center: [49.2503, -123.062],
	    zoom: 11,
        minZoom:10,
	    maxZoom:20,
	    maxBounds: bounds,
	    attributionControl:false,
	    zoomControl: false
	});
	// var info = L.mapbox.infoControl({position:'bottomleft'});
	// info.addTo(map);

	var CEE_base_grey = L.tileLayer('https://tileserver-jklee.rhcloud.com/CEE_V001_base/{z}/{x}/{y}.png', {
	        maxZoom: 15,
	        minZoom: 10,
            zIndex:1,
	       attribution: 'Map tiles by <a href="http://cirs.ubc.ca/">CIRs</a>, Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	    }).addTo(map); 
    var CEE_Labels = L.tileLayer('https://tileserver-geog.rhcloud.com/metro_labels_overlap/{z}/{x}/{y}.png', {
        // attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        subdomains: 'abcd',
        minZoom: 10,
        maxZoom: 15,
        zIndex:1000
    }).addTo(map);
    // Roads layer
    var CEE_roads = L.tileLayer('https://tileserver-jklee.rhcloud.com/CEE_V001_grey_roads/{z}/{x}/{y}.png', {
            maxZoom: 15,
            minZoom: 10,
            zIndex:5,
           // attribution: 'Map tiles by <a href="http://cirs.ubc.ca/">CIRs</a>, Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
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
                document.getElementById('hover').innerHTML = "Biomass Harvest Potential (tonnes hectares <sup>-1</sup> year<sup>-1</sup>): " + e.data.Biomass + "";
                // document.getElementById('hover').innerHTML = "" + e.data.Biomass +"";
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
                document.getElementById('hover').innerHTML = "Solar Radiation Potential (kWh): " + e.data.S_Rad_kWh;
            } else {
                document.getElementById('hover').innerHTML = 'Hover on features';
            }
        });
    // agriculture
    var agTiles = L.tileLayer('https://tileserver-geog.rhcloud.com/agriculture_col2/{z}/{x}/{y}.png',{zIndex:3});
    var agGrid = new L.UtfGrid('https://tileserver-geog.rhcloud.com/agriculture_col2/{z}/{x}/{y}.grid.json', {
            useJsonP: false
        });
    agGrid.on('mouseover', function (e) {
            if (e.data) {
                document.getElementById('hover').innerHTML = "Land Use Category: " + e.data.cat + "";
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
                document.getElementById('hover').innerHTML = "Average wind speed at 80m height (ms<sup>-1</sup>): " + e.data.EU_12031_C + "";
            } else {
                document.getElementById('hover').innerHTML = 'Hover on features';
            }
        });
    // ----------- Create Layer groups for the layer toggler ----------- //
    //  --- define layer groups --- //
    var solarclouds = L.layerGroup([solarTiles, solarGrid]); //cloudTiles
    var biomass = L.layerGroup([biomassTiles, biomassGrid]);
    var ag = L.layerGroup([agTiles, agGrid]);
    var windgroup = L.layerGroup([windTiles, windGrid]);
    var industrial = L.featureGroup([]).bringToFront();
    var hydro = L.featureGroup([]).bringToFront();

    // ---------------- industrial hydro ------------------ //
    // --- Industrial Layer --- //
    d3.json("data/industrial.geojson", function(data) {
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
        function onEachFeature(feature, layer) {
            // does this feature have a property named popupContent?
            var popupContent = "<p><center>Industry:"+ "<br/>" 
                                + feature.properties.CATEGORY+ "</center></p>";
            layer.bindPopup(popupContent);
            // console.log(layer);
        }

        // Load Geojson Points using Native Leaflet
        var industralPoints = L.geoJson(data, {
            onEachFeature: onEachFeature,
            pointToLayer: industrialStyle
        }).addTo(industrial);
    }); // D3 End

    // --- Hydro Layer --- // 
    d3.json("data/bchydro_data.geojson", function(data){
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
        }).addTo(hydro);
    }); // d3 end


    // -------- Layer adder --------- //
    // layer adder
    $('#solar-button').click(function() {
        if(map.hasLayer(solarclouds)){
            map.removeLayer(solarclouds);
            $('#solar-button').css('background-color', '');
            // $('#button-income span').css('color', '');
        }
        else{
            solarclouds.addTo(map);
            $('#solar-button').css('background-color', '#FF9933');
            // $('#button-income span').css('color', '#fff');
        }
    });

    // layer adder
    $('#biomass-button').click(function() {
        if(map.hasLayer(biomass)){
            map.removeLayer(biomass);
            $('#biomass-button').css('background-color', '');
            // $('#button-income span').css('color', '');
        }
        else{
            biomass.addTo(map);
            $('#biomass-button').css('background-color', '#4DB870');
            // $('#button-income span').css('color', '#fff');
        }
    });

    // layer adder
    $('#ag-button').click(function() {
        if(map.hasLayer(ag)){
            map.removeLayer(ag);
            $('#ag-button').css('background-color', '');
            // $('#button-income span').css('color', '');
        }
        else{
            ag.addTo(map);
            $('#ag-button').css('background-color', '#D1D119');
            // $('#button-income span').css('color', '#fff');
        }
    });

    // layer adder
    $('#wind-button').click(function() {
        if(map.hasLayer(windgroup)){
            map.removeLayer(windgroup);
            $('#wind-button').css('background-color', '');
        }
        else{
            windgroup.addTo(map);
            $('#wind-button').css('background-color', '#5C8A8A');
            // $('#button-income span').css('color', '#fff');
        }
    });

    // layer adder
    $('#pop-button').click(function() {
        if(map.hasLayer(population)){
            map.removeLayer(population);
            $('#pop-button').css('background-color', '');
            // $('#button-income span').css('color', '');
        }
        else{
            population.addTo(map);
            $('#pop-button').css('background-color', '#8AE6B8');
            // $('#button-income span').css('color', '#fff');
        }
    });

    $('#industry-button').click(function() {
        if(map.hasLayer(industrial)){
            map.removeLayer(industrial);
            $('#industry-button').css('background-color', '');
            // $('#button-income span').css('color', '');
        }
        else{
            industrial.addTo(map);
            $('#industry-button').css('background-color', '#8AE6B8');
            // $('#button-income span').css('color', '#fff');
        }
    });

    $('#hydro-button').click(function() {
        if(map.hasLayer(hydro)){
            map.removeLayer(hydro);
            $('#hydro-button').css('background-color', '');
            // $('#button-income span').css('color', '');
        }
        else{
            hydro.addTo(map);
            $('#hydro-button').css('background-color', '#8AE6B8');
            // $('#button-income span').css('color', '#fff');
        }
    });

});

// -----UI interacitons ----- //
$("#close").click(function(e) {
        e.preventDefault();
        $("#bottomtab").toggleClass("toggled");
        // $("#infotoggle").toggleClass("toggled");
    });

// $(function() {
//     $( "#bottomtab" ).tabs();
// });
$('#collapseOne').on('show.bs.collapse', function () {    
    $('.panel-heading').animate({
        backgroundColor: "#fff"
    }, 500);   
})

$('#collapseOne').on('hide.bs.collapse', function () {    
    $('.panel-heading').animate({
        backgroundColor: "#fff"
    }, 500);   
})
