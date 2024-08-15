window.Widgets.Simulation = {};

//TODO: remove as not required
(function ($, ns, d3, document, window) {
    ns.selectorComponent = '#object_form';

    ns.config = {
        prefix: "https://raw.githubusercontent.com/os-threat/images/main/img/",
        dataFile: "data/n_and_e.json",
        shape: "rect-", //norm-, rnd-,
        margin: {
            top: 30,
            right: 80,
            bottom: 30,
            left: 30
        },
        with: 1200,
        radius: 50,
        height: 1000
    }

    ns.syntaxHighlight = function(json) {
        if (typeof json != 'string') {
             json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    //create a simulation for an array of nodes, and compose the desired forces.
    ns.forceSimulation = function(width, height) {
        return d3.forceSimulation()
            .force("link", d3.forceLink() // This force provides links between nodes
                            .id(d => d.id) // This sets the node id accessor to the specified function. If not specified, will default to the index of a node.
            ) 
            .force("charge", d3.forceManyBody().strength(-500)) // This adds repulsion (if it's negative) between nodes. 
            .force("center", d3.forceCenter(width / 2, height / 2)); // This force attracts nodes to the center of the svg area
    }

    ns.loadFromData = function($component, data) {

        console.group(`simulation loadFromData on ${window.location}`);

        let container = $component.get(0)

        let svg = d3.select(container)
            .select("svg")

        // Initialize the links
        let link = svg.selectAll(".links")
            .data(data.edges)
            .join("line")
            .attr("class", "links")
            .attr("source", (d) => d.source)
            .attr("target", (d) => d.target)
            .attr("stroke-width", 0.75)
            .attr("stroke", "grey")
            .attr('marker-end','url(#arrowhead)'); //The marker-end attribute defines the arrowhead or polymarker that will be drawn at the final vertex of the given shape.

        let edgepaths = svg.selectAll(".edgepath") //make path go along with the link provide position for link labels
                .data(data.edges)
                .join('path')
                .attr('class', 'edgepath')
                .attr('fill-opacity', 0)
                .attr('stroke-opacity', 0)
                .attr('id', function (d, i) {return 'edgepath' + i})
                .style("pointer-events", "none");

        const edgelabels = svg.selectAll(".edgelabel")
            .data(data.edges)
            .join('text')
            .style("pointer-events", "none")
            .attr('class', 'edgelabel')
            .attr('id', function (d, i) {return 'edgelabel' + i})
            .attr('font-size', 18)
            .attr('fill', '#aaa');


        edgelabels.append('textPath') //To render text along the shape of a <path>, enclose the text in a <textPath> element that has an href attribute with a reference to the <path> element.
            .attr('xlink:href', function (d, i) {return '#edgepath' + i})
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text(d => d.label);

        // Initialize the nodes
        // add hover over effect
        const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("image")
            .data(data.nodes)
            .join("image")
            .attr("xlink:href",  function(d) { return (ns.config.prefix + ns.config.shape + d.icon + ".svg");})
            .attr("width",  function(d) { return ns.config.radius + 5;})
            .attr("height", function(d) { return ns.config.radius + 5;})
            .on("mouseover", function(d){d3.select(this)
                                        .transition()
                                        .duration(350)
                                        .attr("width",  70)
                                        .attr("height", 70)
                                    })
            .on("mouseout", function(d){d3.select(this)
                                        .transition()
                                        .duration(350)
                                        .attr("width",  function(d) { return ns.config.radius;})
                                        .attr("height", function(d) { return ns.config.radius;})
                                    })
            .on('mouseover.tooltip', function(d) {
                console.log("mouseover.tooltip ", d3.event);
                var x = d.clientX; // $(this).attr("x");
                var y = d.clientY; //$(this).attr("y");
                
                console.log("x ", x, " y ", y);
                ns.tooltip.transition()
                    .duration(300)
                    .style("opacity", .8);
                ns.tooltip.html("<pre>"+ns.syntaxHighlight(d3.select(this).datum()) +"</pre>")
                    .style("left", (x) + "px")
                    .style("top", (y + 10) + "px")
                    .style("opacity", .8);
                })
            .on("mouseout.tooltip", function() {
                console.log("mouseout.tooltip");
                ns.tooltip.transition()
                    .duration(100)
                    .style("opacity", 0);
                })
            .on("mousemove", function(e) {
                console.log("mousemove", e);
                // console.log("d3.event", ns.syntaxHighlight(d3.select(this).datum()));
                // ns.tooltip.html("<pre>"+ns.syntaxHighlight(d3.select(this).datum()) +"</pre>")
                var x = e.clientX; // $(this).attr("x");
                var y = e.clientY; //$(this).attr("y");

                console.log("x ", x, " y ", y);
                ns.tooltip.style("left", x + "px")
                    .style("top", (y + 10) + "px");
                })
            .call(d3.drag()  //sets the event listener for the specified typenames and returns the drag behavior.
                .on("start", function(d) {
                    if (!d3.event.active) {
                        ns.simulation.alphaTarget(0.3).restart();//sets the current target alpha to the specified number in the range [0,1].
                    }
                    d.fy = d.y; //fx - the node’s fixed x-position. Original is null.
                    d.fx = d.x; //fy - the node’s fixed y-position. Original is null.
                }) //start - after a new pointer becomes active (on mousedown or touchstart).
                .on("drag", function(d) {
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
                })      //drag - after an active pointer moves (on mousemove or touchmove).
                .on("end", function(d) {
                    if (!d3.event.active) {
                        ns.simulation.alphaTarget(0);
                    }
                    d.fx = null;
                    d.fy = null;
                    
                    //console.log("dataset after dragged is ...",dataset);
                })     //end - after an active pointer becomes inactive (on mouseup, touchend or touchcancel).
            );

        //Listen for tick events to render the nodes as they update in your Canvas or SVG.
        ns.simulation
            .nodes(data.nodes) //sets the simulation’s nodes to the specified array of objects, initializing their positions and velocities, and then re-initializes any bound forces;
            .on("tick", function() {
                link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

                node.attr("x", d => d.x - ns.config.radius/2)
                    .attr("y", d => d.y - ns.config.radius/2);

                edgepaths.attr('d', d => 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y);
            })
                
            //use simulation.on to listen for tick events as the simulation runs.
            // After this, Each node must be an object. The following properties are assigned by the simulation:
            // index - the node’s zero-based index into nodes
            // x - the node’s current x-position
            // y - the node’s current y-position
            // vx - the node’s current x-velocity
            // vy - the node’s current y-velocity

        ns.simulation.force("link")
            .links(data.edges)
            .distance(function() {return 4 * ns.config.radius;});

        
        console.groupEnd();
    }


    ns.init = function($component) {
        console.group(`simulation init on ${window.location}`);
        
        console.log($component);

        //init d3
        ns.simulation = ns.forceSimulation($component.width(), $component.height());

        let container = $component.get(0)

        //create svg
        let svg = d3.select(container)
            .append("svg")
            .attr("width", $component.width())
            .attr("height", $component.height())
            .append("g")
            .attr("transform", "translate(" + ns.config.margin.left + "," + ns.config.margin.top + ")");

        //create tooltip to use later
        ns.tooltip = window.Widgets.widjets.tooltip

        console.log("ns.tooltip", ns.tooltip);

        //create arrowhead
        let arrowhead = svg.append('defs').append('marker')
            .attr("id",'arrowhead')
            .attr('viewBox','-0 -5 10 10') //the bound of the SVG viewport for the current SVG fragment. defines a coordinate system 10 wide and 10 high starting on (0,-5)
            .attr('refX',ns.options.icon_size*1.25) // x coordinate for the reference point of the marker. If circle is bigger, this need to be bigger.
            .attr('refY',0)
            .attr('orient','auto')
            .attr('markerWidth',10)
            .attr('markerHeight',10)
            .attr('xoverflow','visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#999')
            .style('stroke','none');

        //create zoom handler 
        var zoom_handler = d3.zoom()
        .on("zoom", function(){
            svg.attr("transform", d3.event.transform);
        });

        zoom_handler(svg);

        //load data
        d3.json(ns.config.dataFile).then(function (data) {
            console.group(`simulation init data loaded on ${window.location}`);
            console.log(data);
            ns.loadFromData($component, data);
            console.groupEnd();
        });
        console.groupEnd();
    }

})(window.jQuery, window.Widgets.Simulation, window.d3, document, window);

(function($, ns, componentsNs, document, window) {
    
    //watch for the component to be added to DOM
    componentsNs.watchDOMForComponent(`${ns.selectorComponent}`, ns.init);

})(window.jQuery, window.Widgets.Simulation, window.Widgets, document, window);