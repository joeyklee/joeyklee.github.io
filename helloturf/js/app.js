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

	var Stamen_TonerLite = L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.{ext}', {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		subdomains: 'abcd',
		minZoom: 0,
		maxZoom: 20,
		ext: 'png'
	}).addTo(map);


	 var bbox = [-123.208886,49.188673,-122.895089, 49.284169];
	  // var bbox = [-77.14702606201172,
   // 38.81005601494022,
   // -76.91994639892578, 39.05];

	 // var grid = turf.hexGrid(bbox, 0.002);

	// var pts;
	d3.json("data/crime2013.geojson", function(data){
		// console.log(data);
		pts = data;
		console.log(pts);

		var layerGroup = L.layerGroup().addTo(map);

		var cellWidth = 0.5;
		var units = 'kilometers';
		var grid = turf.hexGrid(bbox, cellWidth, units);

		var grid = turf.count(grid, pts, 'pt_count');

		grid.features.forEach(function(cell) {

		    var pt_count = cell.properties.pt_count;

		    var _nohex = cell._nohex = {};
		    _nohex.weight = 0;
		    _nohex.color = '#FF9966';
		    _nohex.fillOpacity = 0;

		    var _nocount = cell._nocount = {};
		    _nocount.weight = 0.05;
		    _nocount.color = '#8A5CE6';
		    _nocount.fillOpacity = 0;

		    var _withCount = cell._withCount = {};
		    _withCount.color = '#9933FF';
		    _withCount.weight = 0;
		    _withCount.fill = '#6B47B2';
		    _withCount.fillOpacity = 0;
		    if(pt_count >= 2) {
		      _withCount.fillOpacity = 0.1;
		      // _withCount.fill = '#FF9966';
		    } if(pt_count >= 10) {
		      _withCount.fillOpacity = 0.2;
		      _withCount.weight = 1;
		      // _withCount.fill = '#FFEBE0';
		    } if(pt_count >= 15) {
		      _withCount.weight = 2;
		      _withCount.fillOpacity = 0.35;
		      // _withCount.fill = '#9933FF';
		    } if(pt_count >= 25) {
		      _withCount.weight = 3;
		      _withCount.fillOpacity = 0.75;
		      // _withCount.fill = '#9933FF';
		    }

		    cell.properties = cell._nohex;
		  });

		  var hex = L.geoJson(grid)
		      .eachLayer(function(l) {
		          l.setStyle(l.feature.properties);
		      })
		      .addTo(layerGroup);

		  L.geoJson(pts, {
		    pointToLayer: function(feature, latlng) {
		      return L.circleMarker(latlng, {
		        radius: 1,
		        fillColor:'#FF9966',
		        fillOpacity:1,
		        stroke: false
		      });
		    }
		  }).addTo(layerGroup);

		  function setStage(stage) {
		      var fns = [];
		      hex.eachLayer(function(l) {
		          // fns.push(function() {
		              l.setStyle(l.feature[stage]);
		          // });
		      });
		      // stage === 'raw' ? fastChain(fns) : slowChain(fns);
		  }

		  function slowChain(fns) {
		      function run() {
		          var fn = fns.pop();
		          if (!fn) return;
		          fn();
		          setTimeout(function() {
		              run();
		          }, 0);
		      }
		      run();
		  }

		  function fastChain(fns) {
		      for (var i = 0; i < fns.length; i++) fns[i]();
		  }

		  function setButton(t) {
		      var stages = document.getElementById('steps').getElementsByTagName('a');
		      for (var i = 0; i < stages.length; i++) {
		          stages[i].className = stages[i].className.replace('fill-green', '');
		      }
		      t.className = t.className + ' fill-green';
		  }

		  document.getElementById('raw').onclick = function() { setButton(this); setStage('_nohex'); };
		  document.getElementById('hex').onclick = function() { setButton(this); setStage('_nocount'); };
		  document.getElementById('count').onclick = function() { setButton(this); setStage('_withCount'); };

	});



});


