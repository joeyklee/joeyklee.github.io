//global variables
var keyArray = ["percent_unemployed", "percent_SNAP", "percent_poverty_level", "percent_lessthanhighschool_grad", "median_income_lessthanhighschool_grad"];
var expressed = keyArray[0]; 
var colorize;
var quantile;
var mapWidth = 560, mapHeight = 560;
var legendWidth = 560, legendHeight = 100;
var chartWidth = 600, chartHeight = 500;

//begin script when window loads
window.onload  = initialize();

//the first function called once the html is loaded
function initialize(){
    setMap();
}

//create choropleth map parameters
function setMap(){
    //create a new svg element with the above dimensions
    var map = d3.select("body")
        .append("svg")
        .attr("width", mapWidth)
        .attr("height", mapHeight)
        .attr("class", "map");
    
    //Create a Albers equal area conic projection, centered on California
    var projection = d3.geo.albers()
        .scale(3000)
        .parallels([34, 18])
        .center([-23, 37.4])
        .translate([mapWidth / 2, mapHeight / 2]);
    
    //create svg path generator using the projection
    var path = d3.geo.path()
        .projection(projection);
    
    //create a graticule generator
    var graticule = d3.geo.graticule()
        .step([5, 5]); //puts graticule lines every 10 degrees
    
    //creates graticule background
    var gratBackground = map.append("path")
        .datum(graticule.outline) //bind graticule background
        .attr("class", "gratBackground") //assign class for styling
        .attr("d", path); //project graticule
    
    //create graticule lines
    var gratLines = map.selectAll(".gratLines") //select graticule elements
        .data(graticule.lines) //bind graticule lines to each element
        .enter() //creates an element for each datum
        .append("path") //append each element to the svg as a path element
        .attr("class", "gratLines") //assign a class for styling
        .attr("d", path); //project graticule lines
    
    //uses queue.js to parallelize asynchronous data loading
    queue()
        .defer(d3.csv, "d3%20lab/data/data.csv") //load attributes from csv
        .defer(d3.json, "d3%20lab/data/output.json") //load geometry from topojson
        .defer(d3.json, "d3%20lab/data/ca.json")
        .await(callback); //trigger callback function once data is loaded
    
    //retrieve and process json file and data
    function callback(error, csvData, output, ca){
        colorize = colorScale(csvData); //retrieve color scale generator
    
        //variables for csv to json data transfer
        var jsonCounty = ca.objects.counties.geometries;
        
        //loop through csv to assign each csv values to json county
        for (var i = 0; i < csvData.length; i++) {
            var csvCounty = csvData[i] //current county
            var csvGEOID = csvCounty.GEOID; //GEOID code
            
            //loop through json counties to find right county
            for (var j = 0; j < jsonCounty.length; j++) {
                //where GEOID codes match, attach csv to json object
                if (jsonCounty[j].properties.GEOID == csvGEOID) {
                    //assign all five key/value pairs
                    for (var key in keyArray){
                        var attr = keyArray[key];
                        var val = parseFloat(csvCounty[attr]);
                        jsonCounty[j].properties[attr] = val;
                    }; 
                    jsonCounty[j].properties.GEOID = csvCounty.GEOID; //set prop
                    break; 
                };
            };  
        };
 
        //add usa geometry
        var states = map.append("path") //create SVG path element
            .datum(topojson.feature(output, output.objects.usa))
            .attr("class", "states") //class name for styling
            .attr("d", path); //project data as geometry in svg
        
        //add counties to map as enumeration units colored by data
        var counties = map.selectAll(".counties")
            .data(topojson.feature(ca, ca.objects.counties).features)
            .enter() //create data
            .append("g") //give province its own g element
            .attr("class", "counties") //class name for styling
            .append("path") 
            .attr("class", function (d) { return "a"+d.properties.GEOID })
            .attr("d", path) //project data as geometry in svg
            .style("fill", function(d) {
                //color enumeration units
                return choropleth(d, colorize);
            })
            .on("mouseover", highlight)
            .on("mouseout", dehighlight)
            .on("mousemove", moveLabel)
            .append("desc")
                .text(function(d){
                    return choropleth(d, colorize);
                });

        createDropdown(csvData);
        setChart(csvData, colorize);
    }; //end callback()
};//end setMap()

function createDropdown(csvData){
    //add a select element for the dropdown menu
    var dropdown = d3.select("body")
        .append("div")
        .attr("class", "dropdown") //for positioning menu with css
        .html("<h3>Select Variable: </h3>  ")
        .append("select")
        .on("change", function(){ 
            changeAttribute(this.value, csvData)});
    
    //create each option element within the dropdown
    dropdown.selectAll("options")
        .data(keyArray)
        .enter()
        .append("option")
        .attr("value", function(d){ return d})
        .text(function(d){
            return label(d);
        });
}; //end createDropdown()

function setChart(csvData, colorize){
    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart")
        .style("margin-left", "630px");;
    
    //create a text element for the chart title
    var subtitle = chart.append("text")
        .attr("x", 20)
        .attr("y", 40)
        .attr("class", "subtitle");
    
    //set bars for each county
    var bars = chart.selectAll(".bar")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a, b){ return a[expressed] - b[expressed]})
        .attr("class", function(d) {
            return "bar " + "a"+d.GEOID;
        })
        .attr("width", chartWidth / csvData.length - 1)
        .on("mouseover", highlight)
        .on("mouseout", dehighlight)
        .on("mousemove", moveLabel);
    
    //adjust bars according to current attribute
    updateChart(bars, csvData);
    createLegend(bars, csvData);
}; //end setChart()

function createLegend(bars, csvData){
    colorize = colorScale(csvData);
    var legendArray = [4, 6, 6.3, 7.8, 8.7];
    var coordinateArray = [25, 125, 225, 325, 425];
    var xArray = [125, 225, 325, 425];

    
    var legendBox = d3.select("body")
        .append("svg")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("class", "legendBox")
        .style("margin-top", 540);
    
    var legendTitle = legendBox.append("text")
        .attr("x", 20)
        .attr("y", 25)
        .attr("class","subtitle")
        .text(label(expressed));
    
    var legendItems = legendBox.selectAll(".items")
        .data(coordinateArray)
        .enter()
        .append("rect")
        .attr("class", "items")
        .attr("y", 35)
        .attr("width", 100)
        .attr("height", 30);
    
    legendItems.attr("x", function(d, i){
        return d;
    });
    
    legendItems.attr("fill", function(d, i){
        return colorize(legendArray[i]);
    })
    
    //do this
    var legendLabels = legendBox.selectAll(".legendLabels")
        .data(xArray)
        .enter()
        .append("text")
        .attr("class", "legendLabels")
        .attr("y", 80)
        .attr("x", function(d, i){
            for (var k = 0; k <= 4; k++){
                xCoords = coordinateArray[i+1];   
                return xCoords;
            }
        })
        .text(function(d, i){
            for (var j = 0; j <= 4; j++){
                legendNums = quantile[i];   
                return legendNums;
            }
        });
 
}; //end createLegend()

function colorScale(csvData){
    //create quantile classes with color scale
    var color = d3.scale.quantile() //designate generator
        .range([
            "#FEF0D9",
            "#FDCC8A",
            "#FC8D59",
            "#E34A33",
            "#B30000"    
        ]);

    //build array of all currently expressed values for input domain
    var domainArray = [];
    for (var i in csvData) {
        domainArray.push(Number(csvData[i][expressed]));
    };
    //pass array of expressed values as domain
    color.domain(domainArray);
    
   
    quantile = color.quantiles();
    //console.log(quantiles);
    return color;
}; //end colorScale()

function choropleth(d, colorize, error){
    //get data values
    var value = d.properties ? d.properties[expressed] : d[expressed];
    
    //if value exists, assign it a color, otherwise assign gray
    if (value){
        //Uncaught TypeError: undefined is not a function 
        return colorize(value);
    } else{
      return "#ccc";  
    };
}; //end choropleth()

function changeAttribute(attribute, csvData){
    //change the expressed attribute
    expressed = attribute;
    colorize = colorScale(csvData);
    
    //recolor the map
    d3.selectAll(".counties") //select every county
        .select("path")
        .style("fill", function(d){
            return choropleth(d, colorize);
        })
        .select("desc")
            .text(function(d) {
                return choropleth(d, colorScale(csvData));
            });
    
    //re-sort the bar chart
    var bars = d3.selectAll(".bar")
        .sort(function(a, b){
            return a[expressed] - b[expressed];
        })
        .transition() //add animation
        .delay(function(d, i){
            return i * 10
        });
    
    //update bars according to current attribute
    updateChart(bars, csvData);
}; //end changeAttribute()

function updateChart(bars, csvData){
    var numbars = csvData.length;
    var max = findMax();
    var titleY = (Number(d3.select(".subtitle").attr("y"))+10);

    //style bars according to currently expressed attribute
   bars.attr("height", function(d, i){
       return (((chartHeight-titleY)/max)*Number(d[expressed])); 
   })
   .attr("y", function(d, i){
       return chartHeight - (((chartHeight-titleY)/max)*Number(d[expressed]));
   })
   .attr("x", function(d, i){
       return i * (chartWidth / numbars);
   })
   .style("fill", function(d){
      return choropleth(d, colorize); 
   });

   //update chart title
   d3.selectAll(".subtitle")
    .text(label(expressed));
    
    //update legend labels
    d3.selectAll(".legendLabels")
     .text(function(d,i){
            return Math.round(quantile[i] * 100) / 100;
    });
        
    //find the maximum value for the expressed atribute
    function findMax() {
        var tempMax = -Infinity;
        var newNum;
        for (var i = 0; i < csvData.length; i++) {
            newNum = Number(csvData[i][expressed])
            if (newNum > tempMax) {
                tempMax = newNum;
            }
        };
        return tempMax;
    };//end findMax
}; //end updateCharts()

function highlight(data){
    var props = data.properties ? data.properties : data;
    d3.selectAll("."+"a"+props.GEOID)
        .style("fill", "#000");
    
    var labelAttribute = "<h1>"+props[expressed]+
        "</h1><br><b>"+label(expressed)+"</b>"; //label content
    var labelName = props.name ? props.name : props.NAME; //html string for name to go in child div

    //create info label div
    var infolabel = d3.select("body")
        .append("div") 
        .attr("class", "infolabel") //for styling the label
        .attr("id", "a"+props.GEOID+"label")//for label div
        .html(labelAttribute) //add text
        .append("div") //add child div for feature name
        .attr("class", "labelname") //for styling name
        .html(labelName); //add feature name to label
}; //end highlight()

function dehighlight(data){
    var props = data.properties ? data.properties : data;
    var county = d3.selectAll("."+"a"+props.GEOID); //select current county
    var fillcolor = county.select("desc").text(); //reads original color
    county.style("fill", fillcolor);
    
    d3.select("#"+"a"+props.GEOID+"label").remove(); //removes highlight
}; //end dehighlight()


function moveLabel(){
    //horizontal label coordinate based mouse position stored in d3.event
     var x = d3.event.clientX < window.innerWidth - 245 ? d3.event.clientX+10 : d3.event.clientX-210;
    var y = d3.event.clientY < window.innerHeight - 100 ? d3.event.clientY-75 : d3.event.clientY-175;
    
    d3.select(".infolabel")
        .style("margin-left", x+"px")
        .style("margin-top", y+"px");
}; //end moveLabel()

//this function makes the attribute names meaningful
function label(attribute_name) {
    var labelText;
    switch(attribute_name) {
        case "percent_unemployed":
            labelText = "% Unemployed";
            break;
        case "percent_SNAP":
            labelText = "% on SNAP benefits";
            break;
        case "percent_poverty_level":
            labelText = "% below poverty level";
            break;
        case "percent_lessthanhighschool_grad":
            labelText = "% with less than high school degree";
            break;
        case "median_income_lessthanhighschool_grad":
            labelText = "Less than high school degree median income ($)";
            break;
    };  
    return labelText;
}; //end label
