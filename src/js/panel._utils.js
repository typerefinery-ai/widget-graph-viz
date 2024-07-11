// panel._uitils.js
// panel common utils
window.Widgets.Panel = {};
window.Widgets.Panel.Utils = {};

;(function ($, ns, d3, document, window) {


    //Graph class
    ns.Graph = class {
        constructor() {
        this.t = new Map();
        }
        addEdge(node1, node2) {
            const s = this.t.get(node1);
            if (s == null) {
                this.t.set(node1, new Set([node2]));
            } else {
                s.add(node2);
            }
        }
        getAdjacencies(node) {
            var z = this.t.get(node);
            if (z == null) {
                z = new Set();
            }
            return z;
        }
        *dir(node, path = Array(), visited = new Set()) {
            yield [...path, node];
            path.push(node);
            visited.add(node);
            for (const adj of this.getAdjacencies(node)) {
                if (!visited.has(adj)) {
                    yield* this.dir(adj, path, visited);
                }
            }
            path.pop();
        }
        *dirs(nodes) {
            for (const node of nodes) {
                yield* this.dir(node);
            }
        }
    }

    ns.options = {
        tree_data: {
            sighting: 'data/sightingIndex.json',
            task: 'data/taskIndex.json',
            impact: 'data/impactIndex.json',
            event: 'data/eventIndex.json',
            me: 'data/meIndex.json',
            company: 'data/companyIndex.json',
        },    
        tree_data_default: 'sighting',
        duration: 350,
        radius: 6, // radius of curve for links
        barHeight: 40,
        margin: {
            top: 30,
            left: 30,
            bottom: 50,
            right: 30,
        },
        width: "100%",
        height: "100%",
        svg_spacing: 500,
        svg_height: "100%",
        // Icons
        prefix:
        'https://raw.githubusercontent.com/os-threat/images/main/img/',
        shape: 'rect-',
        icon_size: 30,
        textPadding: 8,
        corner: 5,
        // the tree view
        minHeight: 20,
        width: "100%",
        height: "100%",
        lineSpacing: 50,
        indentSpacing: 50,
        tooltipContent: 'summary', //'summary' or 'json'
        itemFont: '18px',
        boxSize: 10,
        tree_edge_thickness: 0.75,
        graph_edge_thickness: 1,
        linkStrength: 200,
        nodeStrength: -100,
        centreStrength: 80,
        theme: 'light',
        light_theme: {
            fill: 'white',
            svgName: 'black',
            svgBorder: 'black',
            checkColour: 'gray',
            checkText: 'white',
            select: 'yellow',
            edges: 'black',
            tooltip: {
                fill: 'white', 
                stroke: '1px', 
                scolour: 'black', 
                corner: 5, 
                tcolour: 'black', 
                tsize: '11px', 
                padding: '5px',
                maxwidth: '900px',
                overflow: 'auto'
            },
        },
        dark_theme: {
            fill: 'gray',
            svgName: 'white',
            svgBorder: 'white',
            checkColour: 'white',
            checkText: 'gray',
            select: 'yellow',
            edges: 'white',
            tooltip: {
                fill: 'lightgray', 
                stroke: '1px', 
                scolour: 'white', 
                corner: 5, 
                tcolour: 'white', 
                tsize: '11px', 
                padding: '5px',
                maxwidth: '900px',
                overflow: 'auto'
            },
        },
    };

    ns.contentMenuActive = false;
    ns.contentMenuItem = false;


    // 1. Instantiate Visualisation Variables
    // 3. Setup RMB Menu Items
    // ns.menuItems = [
    //     {
    //     title: 'Copy Object',
    //     action: (d) => {
    //         // TODO: add any action you want to perform
    //         console.log('Copy Object', d);
    //     },
    //     },
    //     {
    //     title: 'Create Relationship',
    //     action: (d) => {
    //         // TODO: add any action you want to perform
    //         console.log('Create Relationship ->', d);
    //     },
    //     },
    // ];



    // JSON Syntax Highlighting - https://stackoverflow.com/questions/4810841/pretty-print-json-using-javascript
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

    
    // Function that assembles the HTML tooltip string
    ns.htmlTooltip = function (d) {
        // console.log('d->',d);tooltip paragraph style
        let pgraph_style = '<p style="font-size:' + toString(ns.theme.tooltip.tsize) + '">';
        pgraph_style += '<font color="' + ns.theme.tooltip.tcolour +'">';
        // initilaise description string with  paragraph style
        let desc_string = pgraph_style;
        // If Tooltip is JSON, then highlight, otherwise setup return string
        if (ns.options.tooltipContent == 'json') {
            return desc_string += ns.syntaxHighlight(d.data.original);        
        }
        // setup 
        // add heading
        desc_string += '<b>' + d.data.heading + '</b>' ;
        // add description
        desc_string += d.data.description;

        return desc_string;
    }  
    

    // Three function that change the tooltip when user hover / move / leave a cell
    ns.mouseover = function(event, d) {
        //console.log('mouseover contentMenuItem ', event, d);
        if (!ns.contentMenuActive) {
            ns.showTooltip(d)
            // console.log('mouseover ', ns.contentMenuActive);
            ns.contentMenuItem = d;

            d3.select(this)
                .style("stroke", window.Widgets.Widget.theme.select)
                .style("opacity", 1)
        }
    
    }
    ns.contextmenu = function(event, d) {
        ns.contentMenuItem = d;
        ns.contentMenuActive = true;
        ns.hideTooltip();
    }
    ns.mousemove = function(event, d) {
        //console.log('mousemove contentMenuItem ', event, d);
        if (!ns.contentMenuActive) {
            // console.log('mousemove ', ns.contentMenuActive);

            ns.contentMenuItem = d;

            window.Widgets.Widget.tooltip
                .html(ns.htmlTooltip(d))
                .style("left", (event.pageX+30) + "px")
                .style("top", (event.pageY) + "px")
        }
    }
    ns.mouseleave = function(event, d) {
        //console.log('mouseleave contentMenuItem ', event, d);
        if (ns.contentMenuItem == d) {
            // console.log('mouseleave remove contentMenuItem');
            ns.contentMenuItem = null;
        }
        window.Widgets.Widget.tooltip
            .style("opacity", 0)
        
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }

    ns.showTooltip = function(d) {
        if (!ns.contentMenuActive) {
            // console.log('showTooltip ', ns.contentMenuActive);
            
            window.Widgets.Widget.tooltip
                .transition()
                .duration(window.Widgets.Widget.options.duration)
                .style("opacity", 1)
        }
    }

    ns.hideTooltip = function() {
        if (window.Widgets.Widget.tooltip) {
            window.Widgets.Widget.tooltip
                .style("opacity", 0)
        }
    }

    ns.makeLink = function (start, end, radius) {
        const path = d3.path()
        const dh = (4 / 3) * Math.tan(Math.PI / 8) // tangent handle offset
    
        //flip curve
        let fx, fy
        if (end[0] - start[0] == 0) {
          fx = 0
        } else if (end[0] - start[0] > 0) {
          fx = 1
        } else {
          fx = -1
        }
        if (end[1] - start[1] == 0) {
          fy = 0
        } else if (end[1] - start[1] > 0) {
          fy = 1
        } else {
          fy = -1
        }
    
        //scale curve when dx or dy is less than the radius
        if (radius == 0) {
          fx = 0
          fy = 0
        } else {
          fx *= Math.min(Math.abs(start[0] - end[0]), radius) / radius
          fy *= Math.min(Math.abs(start[1] - end[1]), radius) / radius
        }
    
        path.moveTo(...start)
        path.lineTo(...[start[0], end[1] - fy * radius])
        path.bezierCurveTo(
          ...[start[0], end[1] + fy * radius * (dh - 1)],
          ...[start[0] + fx * radius * (1 - dh), end[1]],
          ...[start[0] + fx * radius, end[1]]
        )
        path.lineTo(...end)
        return path
    }

    //----------------------------------------
    // key id functions
    ns.getLinkId = function(d, i) {
        console.log(['getLinkId', d, i]);
        return d.id;
        // return d.source + '-' + d.target;
    };
    ns.getNodeId = function(d, i) {
        console.log(['getNodeId', d, i]);
        return d.id;
    };


    
    // B. Update Data, Simulations and Drive Show Graph
    ns.processGraphData = function(graphData) {
        console.group('Widgets.Panel.Utils.updateGraph');

        let nodes = graphData.nodes;
        let edges = graphData.edges;

        ns.split = {};
        ns.split.promo = {};
        ns.split.promo.nodes = [];
        ns.split.promo.edges = [];
        ns.split.scratch = {};
        ns.split.scratch.nodes = [];
        ns.split.scratch.edges = [];

        ns.split.data = graphData;

        ns.split.adjacency = new ns.Graph();
        ns.split.prom_node_IDs = [];

        // 1. Setup variables and define promotable types
        ns.split.prom_types = [
            'incident',
            'task',
            'impact',
            'event',
            'sighting',
        ];

        // 2. Fill adjacency list with edges
        edges.forEach(function(edge) {
            ns.split.adjacency.addEdge(edge['source'], edge['target']);
        });

        //3. Find first the promotable node ID's and collect all sub-graphs into promID's
        nodes.forEach(function(node) {
            if (ns.split.prom_types.includes(node.type)) {
                ns.split.prom_node_IDs.push(node.id);
            }
        });

        ns.split.prom_IDs = Array.from(
            ns.split.adjacency.dirs(ns.split.prom_node_IDs),
            (path) => path.at(-1),
        );
    
        // 4. Now split the Graphs and update the
        nodes.forEach(function(node) {
            if (ns.split.prom_IDs.includes(node.id)) {
                ns.split.promo.nodes.push(node);
            } else {
                ns.split.scratch.nodes.push(node);
            }
        });

        edges.forEach(function(edge) {
            if (
                ns.split.prom_IDs.includes(edge.source) &&
                ns.split.prom_IDs.includes(edge.target)
            ) {
                ns.split.promo.edges.push(edge);
            } else {
                ns.split.scratch.edges.push(edge);
            }
        });
        
        console.groupEnd();
    };




})(window.jQuery, window.Widgets.Panel.Utils, window.d3, document, window)