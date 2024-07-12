// panel.scratch.js
//define context menu functions
window.Widgets.Panel.Scratch = {}

;(function ($, ns, d3, panelUtilsNs, document, window) {

    ns.selectorComponent = '#scratch_panel';

    ns.options = {};

    ns.menuItems = [
        {
          label: "Create SRO",
          icon: '<i class="fa-thin fa-handshake-simple"></i>',
          action: () => console.log("create SRO"),
        },
    ];


    
    ns.simGraph = function() {
        console.group('Widgets.Panel.Scratch.simGraph');

        if (!panelUtilsNs.split || !panelUtilsNs.split.promo || !panelUtilsNs.split.promo.edges) {
            console.error('No data to show');
            console.groupEnd();            
            return
        }

        // first the variables centreStrength
        ns.sforceNode = d3.forceManyBody();

        ns.sforceLink = d3
            .forceLink(panelUtilsNs.split.scratch.edges)
            .id(panelUtilsNs.getLinkId)
            .distance(4 * ns.options.icon_size);

        ns.sforceCentre = d3.forceCenter(
            ns.options.working_width / 2,
            ns.options.svg_height / 4,
        );
        

        if (ns.options.nodeStrength !== undefined) {
            ns.sforceNode.strength(ns.options.nodeStrength);
        }

        if (ns.options.linkStrength !== undefined) {
            ns.sforceLink.strength(ns.options.linkStrength);
        }

        if (ns.options.centreStrength !== undefined) {
            ns.sforceCentre.strength(ns.options.centreStrength);
        }

        ns.scratch_sim = d3
            .forceSimulation()
            //   .on('end', function() {
            //     console.log(this);
            //     console.log(["scratch_sim",this]);
            //     this.force('link', options.sforceLink)
            //         .force('charge', options.sforceNode)
            //         .force('center', options.sforceCentre);
            //   });
            // .force('link', ns.sforceLink)
            // .force('charge', ns.sforceNode)
            // .force('center', ns.sforceCentre);
            .force("link", d3.forceLink() // This force provides links between nodes
                            .id(d => d.id) // This sets the node id accessor to the specified function. If not specified, will default to the index of a node.
                            .strength(20)
            ) 
            .force("charge", d3.forceManyBody().strength(-20)) // This adds repulsion (if it's negative) between nodes. 
            .force("center", d3.forceCenter(ns.options.width / 2, ns.options.height / 2)); // This force attracts nodes to the center of the svg area

        console.groupEnd();

    };

    ns.showGraph = function() {
        console.group('Widgets.Panel.Scratch.showGraph');

        if (!panelUtilsNs.split || !panelUtilsNs.split.promo || !panelUtilsNs.split.promo.edges) {
            console.error('No data to show');
            console.groupEnd();            
            return
        }

        ns.scratchLink = ns.scratch_svg
            .selectAll('.slinks')
            .data(panelUtilsNs.split.scratch.edges)
            .join('line')
            .attr('class', 'slinks')
            .attr('source', (d) => d.source)
            .attr('target', (d) => d.target)
            .attr('stroke-width', 0.75)
            .attr('stroke', 'grey')
            .attr('marker-end', 'url(#sarrowhead)'); //The marker-end attribute defines the arrowhead or polymarker that will be drawn at the final vertex of the given shape.

        ns.scratchEdgepaths = ns.scratch_svg
            .selectAll('.sedgepath') //make path go along with the link provide position for link labels
            .data(panelUtilsNs.split.scratch.edges)
            .join('path')
            .attr('class', 'sedgepath')
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .attr('id', function(d, i) {
                return 'sedgepath' + i;
            })
            .style('pointer-events', 'none');

        ns.scratchEdgelabels = ns.scratch_svg
            .selectAll('.sedgelabel')
            .data(panelUtilsNs.split.scratch.edges)
            .join('text')
            .style('pointer-events', 'none')
            .attr('class', 'sedgelabel')
            .attr('id', function(d, i) {
                return 'sedgelabel' + i;
            })
            .attr('font-size', 18)
            .attr('fill', panelUtilsNs.theme.edges);

        ns.scratchEdgelabelsText = ns.scratchEdgelabels
            .append('textPath') //To render text along the shape of a <path>, enclose the text in a <textPath> element that has an href attribute with a reference to the <path> element.
            .attr('xlink:href', function(d, i) {
                return '#sedgepath' + i;
            })
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none')
            .attr('startOffset', '50%')
            .text((d) => d.name);

        // for scratch
        ns.scratchNode = ns.scratch_svg
            .append('g')
            .selectAll('snodes')
            .data(panelUtilsNs.split.scratch.nodes)
            .join('image')
            .attr('class', 'snodes')
            .attr('xlink:href', function(d) {
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
            .on('contextmenu', panelUtilsNs.contextmenu);
            // .on('mouseover', function(d) {
            //   d3.select(this)
            //     .transition()
            //     .duration(options.duration)
            //     .attr('width', 70)
            //     .attr('height', 70);
            // })
            // .on('mouseout', function(d) {
            //   d3.select(this)
            //     .transition()
            //     .duration(options.duration)
            //     .attr('width', function(d) {
            //       return options.icon_size;
            //     })
            //     .attr('height', function(d) {
            //       return options.icon_size;
            //     });
            // })
            // .on('mouseover.tooltip', function(d) {
            //   ns.tooltip
            //     .transition()
            //     .duration(options.duration)
            //     .style('opacity', 0.8);
            //   ns.tooltip
            //     .html(
            //       '<h1>' +
            //         d.heading +
            //         '</h1>' +
            //         '<p> ' +
            //         d.description +
            //         '</p>',
            //     )
            //     .style('left', d3.event.pageX + 'px')
            //     .style('top', d3.event.pageY + 10 + 'px');
            // })
            // .on('mouseout.tooltip', function() {
            //   ns.tooltip
            //     .transition()
            //     .duration(100)
            //     .style('opacity', 0);
            // })
            // .on('mousemove', function() {
            //   ns.tooltip
            //     .style('left', d3.event.pageX + 'px')
            //     .style('top', d3.event.pageY + 10 + 'px');
            // })
            // .call(
            //   d3
            //     .drag() //sets the event listener for the specified typenames and returns the drag behavior.
            //     .on('start', sDragstarted) //start - after a new pointer becomes active (on mousedown or touchstart).
            //     .on('drag', sDragged) //drag - after an active pointer moves (on mousemove or touchmove).
            //     .on('end', sDragended), //end - after an active pointer becomes inactive (on mouseup, touchend or touchcancel).
            // );


        ns.scratch_sim
            .nodes(panelUtilsNs.split.scratch.nodes)
            .on('tick', function() {
                ns.scratch_svg
                    .selectAll('.slinks')
                    .attr('x1', (d) => d.source.x)
                    .attr('y1', (d) => d.source.y)
                    .attr('x2', (d) => d.target.x)
                    .attr('y2', (d) => d.target.y);
        
                ns.scratch_svg
                    .selectAll('.snodes')
                    .attr('x', (d) => d.x - ns.options.icon_size / 2)
                    .attr('y', (d) => d.y - ns.options.icon_size / 2);
        
                ns.scratch_svg.selectAll('.sedgepath').attr(
                    'd',
                    function(d) {
                        // console.log('sedgepath->', d);
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
        // ns.scratch_sim.force("link")
        //     .links(panelUtilsNs.split.scratch.edges)
        //     .distance(function() {return 6 * ns.options.icon_size;});


        //create zoom handler  for each
        ns.zoom_handler = d3.zoom().on('zoom', function(event, d) { 
            ns.scratch_svg.attr('transform', d3.event.transform);
        });


        console.groupEnd();
        
    };


    ns.dragstarted = function(d) {
        if (!d3.event.active) {
            ns.scratch_sim.alphaTarget(0.3).restart(); //sets the current target alpha to the specified number in the range [0,1].
        }
        d.fy = d.y; //fx - the node’s fixed x-position. Original is null.
        d.fx = d.x; //fy - the node’s fixed y-position. Original is null.
    }

    //When the drag gesture starts, the targeted node is fixed to the pointer
    ns.dragged = function(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    //the targeted node is released when the gesture ends
    ns.dragended = function(d) {
        if (!d3.event.active) {
            ns.scratch_sim.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
    }


    ns.init = function($component, options) {
            
        console.group("Widgets.Panel.Scratch.init");

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

        ns.scratch_svg = d3
            .select($component.get(0))
            .append('svg')
            .attr('class', 'scratch_svg')
            .attr('id', 'scratch_svg')
            .attr('width', $component.width())
            .attr('height', $component.height())

        ns.scratch_rect = ns.scratch_svg
            .append('rect')
            .attr('id', 'scratch_rect')
            .attr('width', $component.width())
            .attr('height', $component.height())
            .attr('x', 0)
            .attr('y', 0)
            .attr('stroke', panelUtilsNs.theme.svgBorder)
            .attr('fill', panelUtilsNs.theme.fill);

        ns.scratch_label = ns.scratch_svg
            .append('g')
            .attr('id', 'scratch_label')
            .attr('transform', 'translate(' + 10 + ',' + 20 + ')')
            .append('text')
            .text('Scratch Pad')
            .style('fill', panelUtilsNs.theme.svgName);

        ns.scratch_svg_root = ns.scratch_svg
            .call(
                d3.zoom().on('zoom', function(event, d) {
                    ns.scratch_svg.attr('transform', event.transform);
                }),
            )
            .append('g')
            .attr('id', 'scratch_svg_root');


        ns.scratch_svg_defs = ns.scratch_svg
            .append('defs')
            .attr('id', 'scratch_svg_defs')
            .append('marker')            
            .attr('id', 'sarrowhead')
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

})(window.jQuery, window.Widgets.Panel.Scratch, window.d3, window.Widgets.Panel.Utils, document, window)