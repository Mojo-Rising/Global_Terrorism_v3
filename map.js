var example = d3.select("body").append("div")
    .style("display", "none")
    .style("width", "2048px")
    .style('display', 'hidden');

var width = d3.getSize(example.style('width')) * 2,
    height = 1024 * 2,
    color = d3.scaleOrdinal(d3.schemeCategory10),
    world;

var projection = d3.geoEquirectangular().scale(height / Math.PI)
    .translate([width / 2, height / 2])
    .precision(.1);

var data = [];
var countries;
var deviceResolution = window.devicePixelRatio;
var paper;

d3.json("data/world50m.json")
    .then(function(world110) {
        console.log("world data loaded");

        svgWidth.style.height = svgWidth.innerHeight - offsetTop.innerHeight + "px";
        console.log(svgWidth.innerHeight - offsetTop.innerHeight + "px");
        
        world = world110;
        countries = topojson.feature(world, world.objects.countries).features;
        draw('canvas');



    }).catch(function(error) {
        throw error;
});

d3.csv("/data/globalterrorismdb_0718dist-csv.csv")
    .then(function(dataset) {
        console.log("dataset loaded");
        data = dataset;

        var countPerYear = {};

        // console.log(+data[data.length-1].iyear);

        // for(i = +data[0].iyear; i <= +data[data.length-1].iyear; i++) {
        //     countPerYear[i] = 0;
        //     console.log(i);
        // }

        // for(i = 0; i < data.length; i++) {
        //     var key = +data[i].iyear;
        //     //console.log(key);
        //     //countPerYear.key += data[i].nkills;
        //     countPerYear[key]++;
        // }

        // console.log(countPerYear);

        d3.json("/data/attacks_per_year.json")
            .then(function(attacksPeryear) {
                console.log(attacksPeryear);
            }).catch(function(error) {
                throw error;
        })


        cf = crossfilter(data);                
        drawCircles(data);
        globe.getTexture();
        filterByVar("country_txt");
        filterByVar("attacktype1_txt");

        globe.center( data[4] );
        
        
    }).catch(function(error) {
        throw error;
});

function draw(type, r) {
    console.log("draw function called");
    example.select('.paper').remove();
    //console.log("r: " + canvasResolution(r));
    paper = example
            .append(type)
            .classed('paper', true)
            .attr('id', 'texture-canvas')
            .attr('width', width).attr('height', height).canvasResolution(r).canvas(true);        

    var path = d3.geoPath().projection(projection),
        graticule = d3.geoGraticule();

    paper.append("path")
        .datum({type: "Sphere"})
        .style("fill", "#fff")
        .style('stroke', '#000')
        .style('stroke-width', '2px')
        .attr("d", path);

    // paper.append("path")
    //     .datum(graticule)
    //     .style("fill", "none")
    //     .style("stroke", '#777')
    //     .style("stroke-width", '.5px')
    //     .style("stroke-opacity", 0.5)
    //     .attr("d", path);

    

    paper.selectAll(".country")
        .data(countries)
        .enter()
        .insert("path", ".graticule")
        .attr("class", "country")
        .attr("d", path)
        .style("fill", function (d, i) {
            // return color(d.color = d3.max(neighbors[i], function (n) {
            //         return countries[n].color;
            //     }) + 1 | 0);
            return "#aaa";
        });

    paper.insert("path", ".graticule")
        .datum(topojson.mesh(world, world.objects.countries, function (a, b) {
            return a !== b;
        }))
        .style("fill", "none")
        .style("stroke", '#fff')
        .style("stroke-width", '.5px')
        .attr("d", path);

    console.log("draw function finished");

}

var customBase = document.createElement("custom");

var custom = d3.select(customBase);

// let drawCirclesPromise = new Promise((resolve, reject) => {
//     const ctx = document.getElementById('texture-canvas').getContext('2d');
//     ctx.save();

//     for (let i = 0; i < data.length; i++) {      
//         var coords = projection([data[i].longitude, data[i].latitude]);
//         if(i % 100 == 0) console.log("drawing 100th circle");
//         ctx.fillStyle = "#FF0000";
//         ctx.fillRect(coords[0]*1.5, coords[1]*1.5, 5, 5);
//     }


// })

function databind(data) {
    console.log(data);
    console.log("databind function called");
    
    custom.selectAll("custom.circle").remove();

    var join = custom.selectAll("custom.circle").data(data);

    var enterSelection = join.enter().append("custom")
        .attr("class", "circle")
        .attr("lat", function(d) {
            return d.latitude;
        })
        .attr("long", function(d){
            return d.longitude;
        })
        .attr("r", 5);

    join.merge(enterSelection)
        .attr("fillStyle", "blue");

    var exitSelection = join.exit()
        .transition()
        .attr("r", 0)
        .remove();

    console.log("databind finished");
}

function drawCircles(data) {
    console.log(data);
    console.log("drawCircles funtion called");
    const ctx = document.getElementById('texture-canvas').getContext('2d');
    ctx.save();

    for (let i = 0; i < data.length; i++) {

        var colour = "#FFF";
        if(data[i].nkill > 0) {
            colour = "#ED1C24";
        } else if (data[i].nwound > 0){
            colour = "#f7931E";
        }

        var coords = projection([data[i].longitude, data[i].latitude]);

        var radius = 5;

        ctx.beginPath();
        //ctx.arc((coords[0]*deviceResolution) - (radius / 2), (coords[1]*deviceResolution) - (radius / 2), radius, 0, 2 * Math.PI, false);
        ctx.arc((coords[0]*deviceResolution), (coords[1]*deviceResolution), radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = colour;
        ctx.fill();
        //ctx.lineWidth = 5;
        //ctx.strokeStyle = '#003300';
        //ctx.stroke();
        
        
        //ctx.fillStyle = colour;
        //ctx.fillRect(coords[0]*deviceResolution, coords[1]*deviceResolution, 5, 5);
    }


    console.log("drawCircles function finished");
}

function filterByVar(varName) {
    console.log("filterByVar function called");

    var testArray = [];

    var byVar = cf.dimension(function(d) {
      return d[varName];
    });
    var groupByVar = byVar.group();
    groupByVar.top(Infinity).forEach(function(d, i) {
      //console.log(d.key + ": " + d.value);
    });

    console.log(groupByVar.top(Infinity));
    createDropdownFromFilter(byVar, groupByVar.top(Infinity), varName, testArray);
    console.log("filterByVar function finished");
  }

  function createDropdownFromFilter(dimension, group, name, arr) {
    console.log("createDropDown function called");
    var dropdown = d3.select("#filters-box").append("div")
      .attr("class", "dropdown")
      .attr("id", name + "-container");

    dropdown.append("button")
        .html(name)
        .attr("class", "dropbtn");

    var buttonContainer = dropdown.append("div")
      .attr("class", "dropdown-content");
      
    group.forEach(function(d, i) {
      buttonContainer.append("a")
        .attr("href", "#")
        .attr("id", d.key.replace(/["'()\s/]/g,""))
        .on("click", function() {
          getFilterResult(dimension, d.key, arr);
        })
        .html(d.key + ": " + d.value);
    });
    console.log("createDropDown function finished");

  }

  function getFilterResult(dimension, key, arr) {
    console.log("getFilterResult function called");
    console.log(key);

    var element = d3.select("#" + key.replace(/["'()\s/]/g,""));
    if(!element.classed("active")) {
        element.classed("active", true);
        console.log("found unactive element");
    } else {
        element.classed("active", false);
    }

    // if(arr.length < 1) {
    //     dimension.filterAll();
    //     return;
    // } else 



    if(arr.includes(key)) {
        index = arr.indexOf(key);
        arr.splice(index, 1);
        if(arr.length < 1) {
            dimension.filterAll();
        } else {
            filtering();
        }
    } else {
        arr.push(key);
        filtering();
    }

    function filtering() {

        console.log(arr);

        dimension.filter(function(d) {
        return arr.indexOf(d) > -1;
        });
    }

    //databind(dimension.top(Infinity));
    draw("canvas");
    setTimeout(function() { drawCircles(dimension.top(Infinity)); }, 10);
    console.log("getFilterResult function finished");
    setTimeout(function(){ globe.getTexture(); }, 20);
    
    
  }