(function () {

    // if (d3.resolution() > 1) {
    //     d3.select('#paper').append('label').html(
    //         "<input id='canvas-low' name='type' type='radio'><span>canvas low resolution</span>"
    //     );
    //     d3.select('#canvas-low').on('click', function () {
    //         draw('canvas', 1);
    //     });
    // }
    var example = d3.select("#example"),
            width = d3.getSize(example.style('width')),
            height = 1024,
            color = d3.scaleOrdinal(d3.schemeCategory10),
            world;

    d3.json("https://giottojs.org/geo/world-110m.json", function(error, w) {
        if (error) throw error;
        world = w;
        draw('canvas');
    });

    function draw(type, r) {
        example.select('.paper').remove();
        var paper = example
                .append(type)
                .attr("id", "globe-canvas")
                .classed('paper', true)
                .attr('width', width).attr('height', height).canvasResolution(r).canvas(true);

        var projection = d3.geoEquirectangular().scale(height / 3.14159265359)
            .translate([width / 2, height / 2])
            .precision(.1);

        var path = d3.geoPath().projection(projection),
            graticule = d3.geoGraticule();

        paper.append("path")
            .datum({type: "Sphere"})
            .style("fill", "#fff")
            .style('stroke', '#000')
            .style('stroke-width', '2px')
            .attr("d", path);

        paper.append("path")
            .datum(graticule)
            .style("fill", "none")
            .style("stroke", '#777')
            .style("stroke-width", '.5px')
            .style("stroke-opacity", 0.5)
            .attr("d", path);

        var countries = topojson.feature(world, world.objects.countries).features,
            neighbors = topojson.neighbors(world.objects.countries.geometries);

        paper.selectAll(".country")
            .data(countries)
            .enter()
            .insert("path", ".graticule")
            .attr("class", "country")
            .attr("d", path)
            .style("fill", function (d, i) {
                return color(d.color = d3.max(neighbors[i], function (n) {
                        return countries[n].color;
                    }) + 1 | 0);
            });

        paper.insert("path", ".graticule")
            .datum(topojson.mesh(world, world.objects.countries, function (a, b) {
                return a !== b;
            }))
            .style("fill", "none")
            .style("stroke", '#fff')
            .style("stroke-width", '.5px')
            .attr("d", path);
    }

    $(document).ready(function() {    
                                
        $("#bt_upload").click(function() {
          console.log("called function");
          var canvas = document.getElementById("globe-canvas");
          var dataURL = canvas.toDataURL();
          console.log(dataURL);
          $.ajax({
             type: "POST",
             url: "canvas_ajax_upload_post.php", 
             data: { img: dataURL }      
          }).done(function(msg){ 
             alert(msg); 
          });
        });
                                    
      });

}());