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
        getEdge(node1) {
            return this.t.get(node1);
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
        icon_size: 35,
        textPadding: 8,
        corner: 5,
        // the tree view
        minHeight: 20,
        lineSpacing: 50,
        indentSpacing: 40,
        tooltipContent: 'json', //'summary' or 'json'
        itemFont: '18px',
        edgeFontSize: '14px',
        edgeFontFamily: 'Wire One',
        layout: {
            left: 20,
            top: 20,
            distanceX: 200,
            distanceY: 150
        },
        boxSize: 10,
        tree_edge_thickness: 0.75,
        graph_edge_thickness: 1,
        linkStrength: 200,
        nodeStrength: -100,
        centreStrength: 80,
        promoSim: true,
        scratchSim: true,
        theme: 'light',
        light_theme: {
            treeFill: 'white',
            scratchFill: 'blanchedalmond',
            promoFill: 'ivory',
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
            treeFill: '#555555',
            scratchFill: 'gray',
            promoFill: 'dimgray',
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


    // setup the left click capability
    ns.selectArray = [];
    ns.leftclick = function(event, d) {
        console.group("Widgets.Panel.Utils.leftclick");
        console.log("event->", event);
        console.log("d->", d);

        // Setup  the local theme
        if (!ns.theme) {
            if (ns.options.theme === 'light') {
                ns.theme = ns.options.light_theme
            } else {
                ns.theme = ns.options.dark_theme
            }
        }

        let len = ns.selectArray.length;
        const selected = d3.select(this); // can't use arrow scoping
        console.log(`selected->`, selected);
        
        if (d3.select(this).classed('clicked')) {
            //  Toggle-off the clicked state 
            //
            console.log("Branch 1 - time to toggle select");
            console.log("ns.selectArray->", ns.selectArray);
            // 1. Pop the element from the array                
            for(var i = ns.selectArray.length - 1; i >= 0; i--){
                if(ns.selectArray[i].id === selected.id){
                    ns.selectArray.splice(i, 1);
                }
            }
            // 2. deselect the node
            selected.classed("selected", false);
            selected.style("stroke", "none");
            selected.style("stroke-width", 0);

        } 
        else if (event.ctrlKey) {
            // we will do a multi-select
            console.log("Branch 2 - multi select");
            if (len < 2) {
                // Then Just add selected onto the end of the array, and style it
                //
                console.log("Branch 2.1 - multi select, just add one");
                console.log("ns.selectArray->", ns.selectArray);
                // 1. add the data element to the array
                ns.selectArray.push(d);
                // 2. highlight the node
                selected.classed("selected", true);
                selected.style("stroke", ns.theme.select);
                selected.style("stroke-width", 5);
            } else if (len === 2) {
                // First deselect the first in the list, then add the new one
                //
                console.log("Branch 2.2 - multi select, take one off");    
                console.log("ns.selectArray->", ns.selectArray);
                // 1. We need to get and remove the first object in the select array
                let deselect = ns.selectArray.shift();
                // 2. Get the DOM object that has to be deselected based on the id
                const deselected = d3.select("#" + deselect.id);
                console.log("multi deselect->", deselect);
                console.log("multi deselected->", deselected);
                // 3. Use the deselected object ref to remove the styling 
                deselected.classed("selected", false);
                deselected.style("stroke", "none");
                deselected.style("stroke-width", 0);
                // 4. Add the new data element to the select array
                ns.selectArray.push(d);
                // 5. Highlight the selected node
                selected.classed("selected", true);
                selected.style("stroke", ns.theme.select);
                selected.style("stroke-width", 5);
            } else {
                console.log("ERORR: multi-select array is broken, too many items", );
                ns.selectArray.length = 0;
            }
            
        } else {
            // we will do a single select            
            console.log("Branch 3 - single select");
            if (len === 0) {
                // Then Just add selected onto the end of the array, and style it
                //
                console.log("Branch 3.1 - Just add the new one");
                console.log("ns.selectArray->", ns.selectArray);
                // 1. add the data element to the array
                ns.selectArray.push(d);
                // 2. highlight the node
                selected.classed("selected", true);
                selected.style("stroke", ns.theme.select);
                selected.style("stroke-width", 5);
            } else {
                // Deselect all in the list, then add the new one
                //
                console.log("Branch 3.2 - Deselect everything in the list, empty it, and then just add the new one");
                console.log("ns.selectArray->", ns.selectArray);
                // 1. Deselect each object in the array
                ns.selectArray.forEach((item, index) => {
                    // 2. Get the DOM object that has to be deselected based on the id
                    const deselected = d3.select("#" + item.id);
                    console.log("single deselect->", item);
                    console.log("single deselected->", deselected);
                    // 3. Use the deselected object ref to remove the styling 
                    deselected.classed("selected", false);
                    deselected.style("stroke", "none");
                    deselected.style("stroke-width", 0);

                });
                // 2. Make the List Empty
                ns.selectArray.length = 0;
                // 3. add the new data element to the array
                ns.selectArray.push(d);
                // 5. Highlight the newly selected node
                selected.classed("selected", true);
                selected.style("stroke", ns.theme.select);
                selected.style("stroke-width", 5);
            }
        }
        console.groupEnd();
    }



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
        let heading = "";
        let description = "";
        let jason = {};
        // console.log('d->',d);
        if ('original' in d) {
            heading = d.heading;
            description = d.description;
            jason = d.original;
        } else if ('data' in d) {
            heading = d.data.heading;
            description = d.data.description;
            jason = d.data.original;
        }
        //tooltip paragraph style
        let pgraph_style = '<p style="font-size:' + toString(ns.theme.tooltip.tsize) + '">';
        pgraph_style += '<font color="' + ns.theme.tooltip.tcolour +'">';
        // initilaise description string with  paragraph style
        let desc_string = pgraph_style;
        // If Tooltip is JSON, then highlight, otherwise setup return string
        if (ns.options.tooltipContent == 'json') {
            return desc_string += '<pre>' + ns.syntaxHighlight(jason) + '</pre>';        
        }
        // setup 
        // add heading
        desc_string += '<b>' + heading + '</b>' ;
        // add description
        desc_string += description;

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
                .style("stroke", ns.theme.select)
                .style("opacity", 0.8)
        }
    
    }
    ns.contextmenu = function(event, d) {
        console.log('context menu->', event, d);
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
        ns.hideTooltip();
        if (ns.contentMenuItem == d) {
            // console.log('mouseleave remove contentMenuItem');
            ns.contentMenuItem = null;
        }
        window.Widgets.Widget.tooltip
            .style("opacity", 0)
        
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 1)
    }

    ns.showTooltip = function(d) {
        if (!ns.contentMenuActive) {
            // console.log('showTooltip ', ns.contentMenuActive);
            
            window.Widgets.Widget.tooltip
                .transition()
                .duration(ns.options.duration)
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

    //------------------------------------------
    // process a layout
    //
    ns.processLayout = function (annotate_list, node) {
        console.log('annotate_list->',annotate_list);
        console.log("my node is->", node),
        annotate_list.forEach(function(annotate) {
            if (annotate.promo_IDs.includes(node.id)) {
                //What level is the object?
                //Is it the head object?
                if (node.id === annotate.id) {
                    // Its the top level object
                    node.positionX = annotate.centreX ;
                    node.positionY = annotate.topY;
                    // return node;
                } else {
                    // Is it in level 2 ?
                    if (annotate.connections.includes(node.id)) {
                        // its a 2nd layer thing
                        annotate.layouts.forEach(function(layout) {
                            if (layout.connections.includes(node.id)) {
                                node.positionX = layout.positionX;
                                node.positionY = layout.positionY;
                                // return node;
                            }
                        });
                    } else {
                        // ist a 3rd level or 3.5 level
                        if (node.type === 'relationship') {
                            // console.log("its a relation")
                            node.positionX = 0;
                            node.positionY = ns.options.layout.top + 2.5*ns.options.layout.distanceY;
                            return node;
                        } else {
                            // console.log("its not a relationship")
                            node.positionX = 0;
                            node.positionY = ns.options.layout.top + 2*ns.options.layout.distanceY;
                            // return node;
                        }
                    }
                }

            }
        });

    }


    
    // B. Update Data, Simulations and Drive Show Graph
    ns.processGraphData = function(graphData) {
        console.groupCollapsed('Widgets.Panel.Utils.updateGraph');
        // console.log('graphData->', graphData);

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

        ns.split.promo_nodes_IDs = [];
        ns.split.promo_IDs = [];
        ns.split.promo_annotate_list = [];

        // Setup  the local theme
        if (!ns.theme) {
            if (ns.options.theme === 'light') {
                ns.theme = ns.options.light_theme
            } else {
                ns.theme = ns.options.dark_theme
            }
        }

        // If Incident Management, then check for these promotoables
        ns.split.prom_types = [
            'incident',
            'task',
            'impact',
            'event',
            'sighting',
        ];
        // setup layout types for each object
        
        ns.split.level1_layouts = {
            'incident': [
                {"label": "Event List", "field": "event_refs", "datatype": "list"},
                {"label": "Impact List", "field": "impact_refs", "datatype": "list"},
                {"label": "Task List", "field": "task_refs", "datatype": "list"},
                {"label": "Sequence Start", "field": "sequence_start_refs", "datatype": "list"},
                {"label": "Sequences", "field": "sequence_refs", "datatype": "list"},
                {"label": "Other Objects", "field": "other_object_refs", "datatype": "list"},
            ],
        }
        
        ns.split.level2_layouts = {
            'sighting': [
                {"label": "What Sighted", "field": "sighting_of_ref", "datatype": "value"},
                {"label": "Data Observed", "field": "observed_data_refs", "datatype": "list"},
                {"label": "Where Sighted", "field": "where_sighted_refs", "datatype": "list"},
                {"label": "Recorded By", "field": "created_by_ref", "datatype": "value"},
            ],
            'task': [
                {"label": "What Changed", "field": "changed_objects", "datatype": "list"},
                {"label": "Owned By", "field": "owner", "datatype": "value"},
                {"label": "Recorded By", "field": "created_by_ref", "datatype": "value"},
            ],
            'event': [
                {"label": "What Changed", "field": "changed_objects", "datatype": "list"},
                {"label": "Sightings Made", "field": "sighting_refs", "datatype": "list"},
                {"label": "Recorded By", "field": "created_by_ref", "datatype": "value"},
            ],
            'impact': [
                {"label": "What Impacted", "field": "impacted_refs", "datatype": "list"},
                {"label": "Superseded By", "field": "superseded_by_ref", "datatype": "value"},
                {"label": "Recorded By", "field": "created_by_ref", "datatype": "value"},
            ],
        }
        // Else if Setting up Options, Not Incident Management, then check these for promotables (not implemented yet)
        ns.split.option_types = [
            'identity',
        ]

        // 2. Fill adjacency list with edges
        edges.forEach(function(edge) {
            ns.split.adjacency.addEdge(edge['source'], edge['target']);
        });

        //3. Find first the promotable node ID's and collect all sub-graphs into promID's
        let dummywidth = 400; // how to work out promo panel width and height????? TO DO
        let centreX = dummywidth/2 // ns.options.width/2; this is NaN
        // 4. Setup layout
        let j = -1;
        var nodeRef = {};
        nodes.forEach(function(node) {
            nodeRef[node.id] = node;
            let annotate = {};
            annotate.connections = [];
            annotate.promo_IDs = [];
            annotate.layouts = [];
            if (ns.split.prom_types.includes(node.type)) {
                j = j+1;
                annotate.id = node.id;
                annotate.centreX = centreX + j * dummywidth;
                annotate.topY = ns.options.layout.top;
                if (node.type !== 'incident') {
                    // If it is a level 1 object
                    let layout_list = ns.split.level2_layouts[node.type];
                    let node_orig = node.original;
                    // Then, if a layout is active, calculate its Position X, Position Y and add it to the returned layout instance
                    layout_list.forEach(function(layout) {
                        console.log('layout field->', layout.field);
                        if (layout.field in node_orig) {
                            layout.positionY = ns.options.layout.top + ns.options.layout.distanceY;
                            layout.connections = []
                            if (layout.datatype === 'list') {
                                console.log(node_orig[layout.field]);
                                layout.connections.push(...node_orig[layout.field]);
                                annotate.connections.push(...node_orig[layout.field]);
                            } else {
                                layout.connections.push(node_orig[layout.field]);
                                annotate.connections.push(node_orig[layout.field]);
                            }
                            annotate.layouts.push(layout);
                        }
                    });
                    // Setup left hand edge of level 1, centred around incident
                    //check if the number is even or odd
                    if(annotate.layouts.length % 2 == 0) {
                        annotate.leftX = annotate.centreX - (ns.options.layout.distanceX*(( annotate.layouts.length/2 ) - 0.5));
                    } else {                        
                        annotate.leftX = annotate.centreX - (ns.options.layout.distanceX*(Math.floor( annotate.layouts.length/2 )))
                    }
                    let i=0;
                    annotate.layouts.forEach(function(layout) {
                        layout.positionX = annotate.leftX + (i * ns.options.layout.distanceX);
                        i = i+1;
                    });
                } else if (node.type === 'incident') {
                    // If it is the level 0 object
                    let layout_list = ns.split.level1_layouts['incident']
                    let node_ext = node.original.extension["extension-definition—​ef765651-680c-498d-9894-99799f2fa126"];
                    layout_list.forEach(function(layout) {
                        if (layout.field in node_ext) {
                            layout.positionY = ns.options.layout.top + ns.options.layout.distanceY;
                            layout.connections = []
                            if (layout.datatype === 'list') {
                                layout.connections.push(...node_ext[layout.field]);
                                annotate.connections.push(...node_ext[layout.field]);
                            } else {
                                layout.connections.push(node_ext[layout.field]);
                                annotate.connections.push(node_ext[layout.field]);
                            }
                            annotate.layouts.push(layout);
                        }
                    });
                    // Setup left hand edge of level 1, centred around incident
                    //check if the number is even  or odd
                    if(annotate.layouts.length % 2 == 0) {
                        annotate.leftX = annotate.centreX - (ns.options.layout.distanceX*(( annotate.layouts.length/2 ) - 0.5));
                    } else {                        
                        annotate.leftX = annotate.centreX - (ns.options.layout.distanceX*(Math.floor( annotate.layouts.length/2 )))
                    }
                    let i=0;
                    annotate.layouts.forEach(function(layout) {
                        layout.positionX = annotate.leftX + (i * ns.options.layout.distanceX);
                        i = i+1;
                    });
                }

                annotate.promo_IDs = Array.from(
                    ns.split.adjacency.dirs([node.id]),
                    (path) => path.at(-1),
                );
                ns.split.promo_annotate_list.push(annotate);
                ns.split.promo_nodes_IDs.push(node.id);
                // ns.split.promo_nodes_IDs.concat(annotate.prom_IDs);
            }
        });

        ns.split.promo_IDs = Array.from(
            ns.split.adjacency.dirs(ns.split.promo_nodes_IDs),
            (path) => path.at(-1),
        );
    
        // 4. Now split the Graphs and update the
        nodes.forEach(function(node) {
            if (ns.split.promo_IDs.includes(node.id)) {
                // node = ns.processLayout(ns.split.promo_annotate_list, node);
                ns.processLayout(ns.split.promo_annotate_list, node);
                console.log("returned node->", node);
                ns.split.promo.nodes.push(node);
            } else {
                ns.split.scratch.nodes.push(node);
            }
        });

        edges.forEach(function(edge) {
            if (
                ns.split.promo_IDs.includes(edge.source) &&
                ns.split.promo_IDs.includes(edge.target)
            ) {
                ns.split.promo.edges.push(edge);
            } else {
                ns.split.scratch.edges.push(edge);
                //TODO: find out why edges for sratch do not get mapped to object                
                const edge_source = edge.source;
                const edge_target = edge.target;
    
                //if string try to find in nodeRef
                if (typeof edge_source === 'string') {
                    edge.source = nodeRef[edge_source];
                }
                if (typeof edge_target === 'string') {
                    edge.target = nodeRef[edge_target];
                }
            }
        });
        
        console.groupEnd();
    };




})(window.jQuery, window.Widgets.Panel.Utils, window.d3, document, window)