// panel.promo.js
//define context menu functions
window.Widgets.Panel.Promo = {}

;(function ($, ns, d3, panelUtilsNs, document, window) {

    ns.selectorComponent = '#promo_panel';

    ns.options = {};

    ns.menuItems = [
        {
          label: "Create SRO",
          icon: '<i class="fa-regular fa-handshake"></i>',
          action: () => console.log("create SRO"),
        },
        {
          label: "Remove",
          icon: '<i class="fa-solid fa-broom"></i>',
          action: () => console.log("create SRO"),
        },
    ];



    ns.simGraph = function() {
        console.group('Widgets.Panel.Promo.simGraph');

        if (!panelUtilsNs.split || !panelUtilsNs.split.promo || !panelUtilsNs.split.promo.edges) {
            console.error('No data to show');
            console.groupEnd();            
            return
        }
        // first the variables centreStrength
        // ns.pforceNode = d3.forceManyBody();

        // ns.pforceLink = d3
        //     .forceLink(panelUtilsNs.split.promo.edges)
        //     .id(panelUtilsNs.getLinkId)
        //     .distance(4 * ns.options.icon_size);

        // ns.pforceCentre = d3.forceCenter(
        //     ns.options.working_width / 2,
        //     ns.options.svg_height / 4,
        // );

        // if (ns.options.nodeStrength !== undefined) {
        //     ns.pforceNode.strength(ns.options.nodeStrength);
        // }

        // if (ns.options.linkStrength !== undefined) {
        //     ns.pforceLink.strength(ns.options.linkStrength);
        // }
        
        // if (ns.options.centreStrength !== undefined) {
        //     ns.pforceCentre.strength(ns.options.centreStrength);
        // }
        console.log("panelUtilsNs.split.promo.nodes->",panelUtilsNs.split.promo.nodes);


        
        ns.promotable_sim = d3
        .forceSimulation(panelUtilsNs.split.promo.nodes)
        .force("link", d3.forceLink() // This force provides links between nodes
                        .id(d => d.id) // This sets the node id accessor to the specified function. If not specified, will default to the index of a node.
                        // .distance(500 * ns.options.icon_size)
        );

        // 7. Now show split graphs
        console.groupEnd();

    };

    ns.showGraph = function() {
        console.group('Widgets.Panel.Promo.showGraph');

        if (!panelUtilsNs.split || !panelUtilsNs.split.promo || !panelUtilsNs.split.promo.edges) {
            console.error('No data to show');
            console.groupEnd();            
            return
        }

        ns.promoLink = ns.promo_svg_root
            .selectAll('.plinks')
            .data(panelUtilsNs.split.promo.edges)
            .join('line')
            .attr('class', 'plinks')
            .attr('source', (d) => d.source)
            .attr('target', (d) => d.target)
            .attr('stroke-width', 0.75)
            .attr('stroke', 'grey')
            .attr('marker-end', 'url(#parrowhead)'); //The marker-end attribute defines the arrowhead or polymarker that will be drawn at the final vertex of the given shape.

        ns.promoEdgepaths = ns.promo_svg_root
            .selectAll('.pedgepath') //make path go along with the link provide position for link labels
            .data(panelUtilsNs.split.promo.edges)
            .join('path')
            .attr('class', 'pedgepath')
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .attr('id', function(d, i) {
                return 'pedgepath' + i;
            })
            .style('pointer-events', 'none');

        ns.promoEdgelabels = ns.promo_svg_root
            .selectAll('.pedgelabel')
            .data(panelUtilsNs.split.promo.edges)
            .join('text')
            .style('pointer-events', 'none')
            .attr('class', 'pedgelabel')
            .attr('id', function(d, i) {
                return 'pedgelabel' + i;
            })
            .style('font-size', ns.options.edgeFontSize)
            .style('font-family', ns.options.edgeFontFamily)
            .attr('fill', panelUtilsNs.theme.edges);

        ns.promoEdgelabelsText = ns.promoEdgelabels
            .append('textPath') //To render text along the shape of a <path>, enclose the text in a <textPath> element that has an href attribute with a reference to the <path> element.
            .attr('xlink:href', function(d, i) {
                return '#pedgepath' + i;
            })
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none')
            .attr('startOffset', '50%')
            .text((d) => d.name);

        // Initialize the nodes with attached image, changed to join data
        // add hover over effect
        // for promo
        ns.promoNode = ns.promo_svg_root
            .append('g')
            .selectAll('pnodes')
            .data(panelUtilsNs.split.promo.nodes)
            .join('image')
            .attr('class', 'pnodes')
            .attr('xlink:href', function(d) {
                // console.log('shape->', ns.options.shape);
                return (
                    ns.options.prefix + ns.options.shape + d.icon + '.svg'
                );
            })
            .attr('width', ns.options.icon_size + 5)
            .attr('height', ns.options.icon_size + 5)
            .attr('cursor', 'pointer')
            .attr('pointer-events', 'all')
            .on('mouseover.tooltip', panelUtilsNs.mouseover)
            .on("mousemove", panelUtilsNs.mousemove)
            .on("mouseout.tooltip", panelUtilsNs.mouseleave)
            .on('contextmenu', panelUtilsNs.contextmenu)
            .call(
              d3
                .drag() //sets the event listener for the specified typenames and returns the drag behavior.
                .on('start', ns.dragstarted) //start - after a new pointer becomes active (on mousedown or touchstart).
                .on('drag', ns.dragged) //drag - after an active pointer moves (on mousemove or touchmove).
                .on('end', ns.dragended), //end - after an active pointer becomes inactive (on mouseup, touchend or touchcancel).
            );


        ns.promotable_sim
            .nodes(panelUtilsNs.split.promo.nodes)
            .on('tick', function() {
                // console.log(['promotable_sim ticked',this, ns.promo_svg
                // .selectAll('.plinks')]);
                ns.promo_svg_root
                    .selectAll('.plinks')
                    .attr('x1', (d) => d.source.x)
                    .attr('y1', (d) => d.source.y)
                    .attr('x2', (d) => d.target.x)
                    .attr('y2', (d) => d.target.y);
        
                ns.promo_svg_root
                    .selectAll('.pnodes')
                    .attr('x', (d) => d.x - ns.options.icon_size / 2)
                    .attr('y', (d) => d.y - ns.options.icon_size / 2);
        
                ns.promo_svg_root.selectAll('.pedgepath').attr(
                    'd',
                    function(d) {
                        //console.log('pedgepath->', d);
                        return (
                        'M ' +
                        d.source.x +
                        ' ' +
                        d.source.y +
                        ' L ' +
                        d.target.x +
                        ' ' +
                        d.target.y
                        );
                    },
                    // (d) =>
                    //   'M ' +
                    //   d.source.x +
                    //   ' ' +
                    //   d.source.y +
                    //   ' L ' +
                    //   d.target.x +
                    //   ' ' +
                    //   d.target.y,
                );
            }); //use simulation.on to listen for tick events as the simulation runs.

        // This function is run at each iteration of the force algorithm, updating the nodes position (the nodes data array is directly manipulated).
        // ns.promotable_sim; 

        // Setup either the Layout, or Default Force Graph
        if (ns.options.promoSim) {


            
            ns.promotable_sim 
                .force("link")
                .links(panelUtilsNs.split.promo.edges)
                .id(d => d.id)
                .distance(function() {return 4 * ns.options.icon_size;})
                .strength(0.05);

            ns.promotable_sim 
                .force('x', d3.forceX().x(function(d) {
                    return d.positionX;
                }).strength(function(d) {
                    // ignore forceX below the first two layers
                    if (d.positionX === 0) {
                        return 0;
                    } else {
                        return 1;
                    }
                }))
                .force('y', d3.forceY().y(function(d) {
                    return d.positionY;
                }).strength(1))
                // .force('collision', d3.forceCollide().radius(function(d) {
                //     console.log("d is ->", d)
                //     return d.radius;
                // }))
                .force("collide", d3.forceCollide(ns.options.icon_size))
                // .force("charge", d3.forceManyBody().strength(-200)) // This adds repulsion (if it's negative) between nodes. 
                .force("charge", d3.forceManyBody().strength(-500)) // This adds repulsion (if it's negative) between nodes. 
                // .force("center", d3.forceCenter(ns.options.width / 2, ns.options.height / 2)); // This force attracts nodes to the center of the svg area
        } else {
            ns.promotable_sim 
                .force("link")
                .links(panelUtilsNs.split.promo.edges)
                .id(d => d.id)
                .distance(function() {return 4 * ns.options.icon_size;});

            ns.promotable_sim
                .force("charge", d3.forceManyBody().strength(-500)) // This adds repulsion (if it's negative) between nodes. 
                .force("center", d3.forceCenter(ns.options.width / 2, ns.options.height / 2)); // This force attracts nodes to the center of the svg area
        }

          
        //create zoom handler  for each
        // ns.zoom_handler = d3.zoom().on('zoom', function(event, d) { 
        //     ns.promo_svg_root.attr('transform', event.transform);
        // });



        console.groupEnd();
        
    };

    //The simulation is temporarily “heated” during interaction by setting the target alpha to a non-zero value.
    ns.dragstarted = function(event, d) {
        if (!event.active) {
            ns.promotable_sim.alphaTarget(0.3).restart(); //sets the current target alpha to the specified number in the range [0,1].
        }
        d.fy = d.y; //fx - the node’s fixed x-position. Original is null.
        d.fx = d.x; //fy - the node’s fixed y-position. Original is null.
    }

    //When the drag gesture starts, the targeted node is fixed to the pointer
    ns.dragged = function(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    //the targeted node is released when the gesture ends
    ns.dragended = function(event, d) {
        if (!event.active) {
            ns.promotable_sim.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
    }



    ns.init = function($component, options) {
            
        console.group("Widgets.Panel.Promo.init");

        ns.$container = $component;

        //copy options into ns
        ns.options = Object.assign({}, options);

        ns.options.width = ns.$container.width();
        ns.options.height = ns.$container.height();

        if (!panelUtilsNs.theme) {
            if (ns.options.theme === 'light') {
                panelUtilsNs.theme = ns.options.light_theme
            } else {
                panelUtilsNs.theme = ns.options.dark_theme
            }
        }

        ns.promo_svg = d3
            .select($component.get(0))
            .append('svg')
            .attr('class', 'promo_svg')
            .attr('id', 'promo_svg')
            .attr('width', $component.width())
            .attr('height', $component.height())
            .attr('cursor', 'pointer')
            .attr('pointer-events', 'all')
            .style("background", panelUtilsNs.theme.promoFill);
            
            // .attr('pointer-events', 'none')

        // ns.promotable_rect = ns.promo_svg
        //     .append('rect')
        //     .attr('id', 'promotable_rect')
        //     .attr('width', $component.width())
        //     .attr('height', $component.height())
        //     .attr('x', 0)
        //     .attr('y', 0)
        //     .attr('stroke', panelUtilsNs.theme.svgBorder)
        //     .attr('fill', panelUtilsNs.theme.fill);
                    
        ns.promotable_label = ns.promo_svg
            .append('g')
            .attr('id', 'promotable_label')
            .attr('transform', 'translate(' + 10 + ',' + 20 + ')')
            .append('text')
            .text('Promotable')
            .style('fill', panelUtilsNs.theme.svgName);

        ns.promo_svg_zoom = ns.promo_svg
            .call(
                d3.zoom().on('zoom', function(event, d) {
                    ns.promo_svg_root.attr('transform', event.transform);
                }),
            )
            .attr('id', 'promo_svg_zoom');

        ns.promo_svg_root = ns.promo_svg
            .append('g');

        // Append the Arrowhead in Promo and Scratch SVG's
        ns.promo_svg_defs = ns.promo_svg_root
            .append('defs')
            .attr('id', 'promo_svg_defs')
            .append('marker')
            .attr('id', 'parrowhead')
            .attr('viewBox', '-0 -5 10 10') //the bound of the SVG viewport for the current SVG fragment. defines a coordinate system 10 wide and 10 high starting on (0,-5)
            .attr('refX', ns.options.icon_size*1.25) // x coordinate for the reference point of the marker. If circle is bigger, this need to be bigger.
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', ns.options.checkColour)
            .style('stroke', 'none');


        ns.$svg = $component.find('svg');
        //add context menu
        ns.$svg.simpleContextMenu({
            class: null,
            shouldShow: function () {
                // const shouldShow = (panelUtilsNs.contentMenuItem == null || panelUtilsNs.contentMenuItem == undefined) ? false : true;
                const shouldShow = !!panelUtilsNs.contentMenuItem;
                // console.log("context menu should show item shouldShow ", shouldShow, panelUtilsNs.contentMenuItem);
                return shouldShow;
            },
            heading: function () {
                return panelUtilsNs.contentMenuItem ? panelUtilsNs.contentMenuItem.name : '';
            },
            onShow: function () {
                            
                // console.log("context menu shown item: ", panelUtilsNs.contentMenuItem);
                panelUtilsNs.contentMenuActive = true;

                panelUtilsNs.hideTooltip();
    
            },
            onHide: function () {
                panelUtilsNs.contentMenuActive = false;
                // console.log("context menu hide", panelUtilsNs.contentMenuItem);
            },
            options: ns.menuItems,
        })

        console.groupEnd();
    }

})(window.jQuery, window.Widgets.Panel.Promo, window.d3, window.Widgets.Panel.Utils, document, window)