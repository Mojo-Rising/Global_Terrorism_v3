////////////////////////////////////////////////////////
//
//     Brushing and Storytelling
//     need to be called once after data is loaded
//     with call createBrushContainer(data, dataitem)
//
////////////////////////////////////////////////////////
console.log("Loaded helper.js ...")
tmp_BrushEvents = [{ year: 1970, 
                    amount: 651
                  },{ year: 1971, 
                    amount: 451
                  },{ year: 1972, 
                    amount: 551
                  },{ year: 1973, 
                    amount: 231
                  },{ year: 1974, 
                    amount: 361
                  },{ year: 1975, 
                    amount: 501
                  },{ year: 1976, 
                    amount: 481
                  },{ year: 1977, 
                    amount: 601
                  },{ year: 1978, 
                    amount: 451
                  },{ year: 1979, 
                    amount: 551
                  },{ year: 1980, 
                    amount: 231
                  },{ year: 1981, 
                    amount: 361
                  },{ year: 1982, 
                    amount: 501
                  },{ year: 1983, 
                    amount: 481
                  },{ year: 1984, 
                    amount: 601
                  },{ year: 1985, 
                    amount: 651
                  },{ year: 1986, 
                    amount: 451
                  },{ year: 1987, 
                    amount: 551
                  },{ year: 1988, 
                    amount: 231
                  },{ year: 1989, 
                    amount: 361
                  },{ year: 1990, 
                    amount: 501
                  },{ year: 1991, 
                    amount: 481
                  },{ year: 1992, 
                    amount: 601
                  },{ year: 1993, 
                    amount: 451
                  },{ year: 1994, 
                    amount: 551
                  },{ year: 1995, 
                    amount: 231
                  },{ year: 1996, 
                    amount: 361
                  },{ year: 1997, 
                    amount: 501
                  },{ year: 1998, 
                    amount: 481
                  },{ year: 1999, 
                    amount: 601
                  },
                   { year: 2000, 
                    amount: 651
                  },{ year: 2001, 
                    amount: 451
                  },{ year: 2002, 
                    amount: 551
                  },{ year: 2003, 
                    amount: 231
                  },{ year: 2004, 
                    amount: 361
                  },{ year: 2005, 
                    amount: 501
                  },{ year: 2006, 
                    amount: 481
                  },{ year: 2007, 
                    amount: 601
                  },{ year: 2008, 
                    amount: 451
                  },{ year: 2009, 
                    amount: 551
                  },{ year: 2010, 
                    amount: 231
                  }];



// Config Variables



var BrushContainer = {
    width:      '500px',
    height:     '100px',
    background: 'white'
}

var margin = {
    top: 80, 
    right: 20, 
    bottom: 110, 
    left: 40
}

var brushSize = {
    height: 80,
    width: 400
}

var debug= true;

var brushticks  = 5


// general Variables

var x
var y
var xaxis
var yaxis
var brush
var zoom
var context

var brushsvg 
var brushbars
var BrushEvents = tmp_BrushEvents//[]; 


var   svg,
      defs,
      gBrush,
      brushX,
      main_xScale,
      mini_xScale,
      main_yScale,
      mini_yScale,
      main_yZoom,
      main_xAxis,
      main_yAxis,
      mini_width,
      textScale;


// functions

function createBrushContainer(data, element) {
    
    if(debug){
        data = BrushEvents;
        console.log("---> "+tmp_BrushEvents);
    }
    
    ////////////////////////////////////////////////////////////////////////
    // create data array, fill empty years if necessary
    
       var min      = d3.min(data, d => d[element])
       var max      = d3.max(data, d => d[element])
       var length   = max-min+1;
     
    for (i=0; i<length; i++){
       item = []
       item.year    = +min+i;
       item.amount  = 0;
       BrushEvents.push(item);
    }

    for (i=0; i<data.length; i++){
       for(j=0;j<length;j++){
           if(data[i][element] == BrushEvents[j].year){
               BrushEvents[j].amount++;
           }
       }
    }

    _CreateBrushContainer(BrushEvents);
    
}      





function _CreateBrushContainer(data){
    
    ////////////////////////////////////////////////////////////////////////
    // ini zoomer
    var zoomer = d3.zoom()
                   .on("zoom", null);
    
    ////////////////////////////////////////////////////////////////////////
    // Create stage objects
    
    d3.select("body").append("div")
                    .attr("id", "brushcontainer")
                    .style("width", BrushContainer.width)
                    .style("height", BrushContainer.height)
                    .style("position", "absolute")
                    .style("margin-left", "-250px")
                    .style("bottom", "0px")
                    .style("background", BrushContainer.background)
                    .style("left", "50%")
                    .append("svg").attr("id", "brushsvg")
                    .style("width", BrushContainer.width)
                    .call(zoomer)
                    .on("wheel.zoom", scroll)
                    .on("mousedown.zoom", null)
                    .on("touchstart.zoom", null)
                    .on("touchmove.zoom", null)
                    .on("touchend.zoom", null);
    
    
    CreateBrush(data);
    
}

function CreateBrush(data){
    
   ////////////////////////////////////////////////////////////////////////
   // Range, Domain & Scale
    
    h_range =       d3.extent(data, d => d.year);
    v_range = [0,   d3.max(data, d => d.amount)]
    topcalc = brushSize.height-margin.top;
    
    y = d3.scaleLinear().range([0, brushSize.height-10])
                        .domain(v_range);
    x = d3.scaleLinear().range([0, brushSize.width])
                        .domain(h_range);

    elementsize   =   brushSize.width/BrushEvents.length;

    xaxis   = d3.axisBottom(x)
                .ticks(brushticks)
                .tickFormat(d3.format("d")); 
    yaxis   = d3.axisLeft(y);
    
    brush = d3.brushX()
              .extent([[0, 0], [brushSize.width, brushSize.height]])
              .on("brush end", brushed);
    
    brushsvg = d3.select("#brushsvg")
    
       context = brushsvg.append("g")
                    .attr("class", "context");
    
    context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate("+margin.left+"," + margin.top + ")")
            .call(xaxis);
      ////////////////////////////////////////////////////////////////////////
    // Brush Mini Bars -> Data Binding
    
    // Data Join
    var brushbars = context.selectAll(".brushbars")
                        .data(data);
    
    // Enter
    brushbars.enter()
            .append("rect")
            .attr("class", "brushbars")
            .attr("x",function(d,i){ return margin.left+(i*elementsize);   })
            .attr("y",function(d){   return  brushSize.height- y(d.amount);})
            .attr("width", elementsize-1)
            .attr("height",function(d,i){ return y(d.amount);})
    
    // Update
    brushbars
            .attr("x",function(d,i){ return margin.left+(i*elementsize);   })
            .attr("y",function(d){   return  brushSize.height- y(d.amount);})
            .attr("width", elementsize-4)
            .attr("height",function(d,i){ return y(d.amount);})
    
    // Exit
    brushbars.exit()
            .remove();
    
    
    
    
    
 
    
    var decker = d3.select("#brushcontainer");
    
    
                    decker.append("div")
                        .attr("id", "leftarea")
                        .style("background-color", BrushContainer.background )
                        .style("opacity", "0.8" )
                        .style("position", "absolute")
                        .style("width", "0px")
                        .style("height", brushSize.height+"px")
                        .style("left", margin.left+"px" )
                        .style("top", "0px" );
    
                        decker.append("div")
                        .attr("id", "rightarea")
                        .style("background-color", BrushContainer.background )
                        .style("opacity", "0.8" )
                        .style("position", "absolute")
                        .style("width", "0px")
                        .style("height", brushSize.height+"px")
                        .style("left", brushSize.width+margin.left+"px" )
                        .style("top", "0px" );
    
   
   ////////////////////////////////////////////////////////////////////////
   // Create Brush
    

    //What should the first extent of the brush become - a bit arbitrary this
    var brushExtent = Math.max( 1, Math.min( 20, Math.round(data.length*0.2)));

    brush = d3.brushX()
        .extent([[0, 0], [brushSize.width, brushSize.height-10]])
        .on("brush end", brushed);

    console.log("brushSize.width "+brushSize.width+" brushSize.height "+brushSize.height)
    
    console.log("create brush");
    
    //Set up the visual part of the brush
    gBrush = d3.select("#brushsvg").append("g")
      .attr("class", "brush")
      .call(brush);
    
    gBrush.selectAll(".resize")
      .append("line")
      .attr("x2", mini_width);

    gBrush.selectAll(".resize")
      .append("path")
      .attr("id", "test")
    //  .attr("d", d3.symbolTriangle.size(20))
      .attr("transform", function(d,i) { 
        return i ? "translate(" + (mini_width/2) + "," + 4 + ") rotate(180)" : "translate(" + (mini_width/2) + "," + -4 + ") rotate(0)"; 
      });

    gBrush.selectAll("rect")
      .attr("width", mini_width);

    //On a click recenter the brush window
    gBrush.select(".background")
      .on("mousedown.brush", brushcenter)
      .on("touchstart.brush", brushcenter);
    
    
      context.append("g")
      .attr("class", "brush")
      .attr("transform", "translate(" + margin.left + ",10)")
      .call(brush)
      .call(brush.move, x.range());
  
    // Start the brush
    // gBrush.call(brush.event);
}

//Based on http://bl.ocks.org/mbostock/6498000
  //What to do when the user clicks on another location along the brushable bar chart
  function brushcenter() {
    var target = d3.event.target,
        extent = brush.extent(),
        size = extent[1] - extent[0],
        range = mini_yScale.range(),
        y0 = d3.min(range) + size / 2,
        y1 = d3.max(range) + mini_yScale.rangeBand() - size / 2,
        center = Math.max( y0, Math.min( y1, d3.mouse(target)[1] ) );

    d3.event.stopPropagation();

    gBrush
        .call(brush.extent([center - size / 2, center + size / 2]))
        .call(brush.event);

  }//brushcenter

function brushed() {
    console.log("Brushed...");
    
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  var s = d3.event.selection || x2.range();
    
    console.log("-w-> "+d3.select(".handle--e").attr("x"));
    leftPos = d3.select(".handle--e").attr("x");
    leftWidth = d3.select(".handle--w").attr("x");
    
    console.log("--leftWidth-> "+leftWidth);
    d3.select("#leftarea").style("width", leftWidth+"px");
    d3.select("#rightarea").style("left", +leftPos+margin.left+3+"px")
                           .style("width", +brushSize.width-leftPos+"px");
 // x.domain(s.map(x2.invert, x2));
  //focus.select(".area").attr("d", area);
//  focus.select(".axis--x").call(xAxis);
  //svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
  //    .scale(width / (s[1] - s[0]))
 //     .translate(-s[0], 0));
    absolutePositionMin = +d3.select(".handle--e").attr("x")+3;
    absolutePositionMax = +d3.select(".handle--w").attr("x")+3;
    console.log("absolutePositionMin "+Math.round(x.invert(absolutePositionMin)));
    console.log("absolutePositionMax "+Math.round(x.invert(absolutePositionMax)));
    console.log(x.invert())
}



/* DEBUG  */

document.addEventListener('keyup', (e) => {
  if (e.code === "KeyQ")         activateDetailInfo();
  else if (e.code === "KeyB")    activateBrush();


});
var _activateDetailInfo = false;
var _activateBrush      = false;

function activateDetailInfo(){
    console.log("activateDetailInfo()")
    if(!_activateDetailInfo){
        $("#sidepanel").animate({marginLeft: '0em'});
        _activateDetailInfo = true;
    } else {
        $("#sidepanel").animate({marginLeft: '-32em'});
        _activateDetailInfo = false;
    }
}

function activateBrush(){
    if(!_activateBrush){
        $("#brushcontainer").animate({marginBottom: '0px'});
        _activateBrush = true;
    } else {
        $("#brushcontainer").animate({marginBottom: '-200px'});
        _activateBrush = false;
    }
}



function  processing_screen(){
            $("#waitingScreen").delay(500).fadeTo("slow", 0.0,function(){
                $('#waitingScreen').css('display', 'none')
            });
            //    $(".nano").nanoScroller();
        }