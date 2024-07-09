// panel.promo.js
//define context menu functions
window.Widgets.Panel.Promo = {}

;(function ($, ns, d3, panelUtilsNs, document, window) {

    ns.selectorComponent = '#promo_panel';

    ns.options = {};


    ns.simGraph = function() {
        console.group('Widgets.Panel.Promo.simGraph');

        if (!panelUtilsNs.split || !panelUtilsNs.split.promo || !panelUtilsNs.split.promo.edges) {
            console.error('No data to show');
            console.groupEnd();            
            return
        }
        // first the variables centreStrength
        ns.pforceNode = d3.forceManyBody();

        ns.pforceLink = d3
            .forceLink(panelUtilsNs.split.promo.edges)
            .id(panelUtilsNs.getLinkId)
            .distance(4 * ns.options.icon_size);

        ns.pforceCentre = d3.forceCenter(
            ns.options.working_width / 2,
            ns.options.svg_height / 4,
        );

        if (ns.options.nodeStrength !== undefined) {
            ns.pforceNode.strength(ns.options.nodeStrength);
        }

        if (ns.options.linkStrength !== undefined) {
            ns.pforceLink.strength(ns.options.linkStrength);
        }
        
        if (ns.options.centreStrength !== undefined) {
            ns.pforceCentre.strength(ns.options.centreStrength);
        }
        console.log("panelUtilsNs.split.promo.nodes->",panelUtilsNs.split.promo.nodes);

        ns.promotable_sim = d3
            .forceSimulation()
            // .nodes(panelUtilsNs.split.promo.nodes)
            //   .on('end', function() {
            //     console.log(["promotable_sim",this]);
            //         this.force('link',   options.pforceLink)
            //         .force('charge',   options.pforceNode)  
            //         .force('center',   options.pforceCentre);
            //   });
            .force('link', ns.pforceLink)
            .force('charge', ns.pforceNode)
            .force('center', ns.pforceCentre);


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

        ns.promoLink = ns.promo_svg
            .selectAll('.plinks')
            .data(panelUtilsNs.split.promo.edges)
            .join('line')
            .attr('class', 'plinks')
            .attr('source', (d) => d.source)
            .attr('target', (d) => d.target)
            .attr('stroke-width', 0.75)
            .attr('stroke', 'grey')
            .attr('marker-end', 'url(#parrowhead)'); //The marker-end attribute defines the arrowhead or polymarker that will be drawn at the final vertex of the given shape.

        ns.promoEdgepaths = ns.promo_svg
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

        ns.promoEdgelabels = ns.promo_svg
            .selectAll('.pedgelabel')
            .data(panelUtilsNs.split.promo.edges)
            .join('text')
            .style('pointer-events', 'none')
            .attr('class', 'pedgelabel')
            .attr('id', function(d, i) {
                return 'pedgelabel' + i;
            })
            .attr('font-size', 18)
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
        ns.promoNode = ns.promo_svg
            .append('g')
            .selectAll('pnodes')
            .data(panelUtilsNs.split.promo.nodes)
            .join('image')
            .attr('class', 'pnodes')
            .attr('xlink:href', function(d) {
                return (
                    ns.options.prefix + ns.options.shape + d.icon + '.svg'
                );
            })
            .attr('width', ns.options.icon_size + 5)
            .attr('height', ns.options.icon_size + 5);
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
            //       return options.radius;
            //     })
            //     .attr('height', function(d) {
            //       return options.radius;
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
            //     .on('start', pDragstarted) //start - after a new pointer becomes active (on mousedown or touchstart).
            //     .on('drag', pDragged) //drag - after an active pointer moves (on mousemove or touchmove).
            //     .on('end', pDragended), //end - after an active pointer becomes inactive (on mouseup, touchend or touchcancel).
            // );


        ns.promotable_sim.on('tick', function() {
            console.log(['promotable_sim ticked',this, ns.promo_svg
            .selectAll('.plinks')]);
            ns.promo_svg
                .selectAll('.plinks')
                .attr('x1', (d) => d.source.x)
                .attr('y1', (d) => d.source.y)
                .attr('x2', (d) => d.target.x)
                .attr('y2', (d) => d.target.y);
    
            ns.promo_svg
                .selectAll('.pnodes')
                .attr('x', (d) => d.x - ns.options.radius / 2)
                .attr('y', (d) => d.y - ns.options.radius / 2);
    
            ns.promo_svg.selectAll('.pedgepath').attr(
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
        
        //create zoom handler  for each
        ns.zoom_handler = d3.zoom().on('zoom', function(event, d) { 
            ns.promo_svg.attr('transform', d3.event.transform);
        });



        console.groupEnd();
        
    };

    //The simulation is temporarily “heated” during interaction by setting the target alpha to a non-zero value.
    ns.dragstarted = function(d) {
        if (!d3.event.active) {
            ns.promotable_sim.alphaTarget(0.3).restart(); //sets the current target alpha to the specified number in the range [0,1].
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

        ns.promotable_rect = ns.promo_svg
            .append('rect')
            .attr('id', 'promotable_rect')
            .attr('width', $component.width())
            .attr('height', $component.height())
            .attr('x', 0)
            .attr('y', 0)
            .attr('stroke', panelUtilsNs.theme.svgBorder)
            .attr('fill', panelUtilsNs.theme.fill);
                    
        ns.promotable_label = ns.promo_svg
            .append('g')
            .attr('id', 'promotable_label')
            .attr('transform', 'translate(' + 10 + ',' + 20 + ')')
            .append('text')
            .text('Promotable')
            .style('fill', panelUtilsNs.theme.svgName);

        ns.promo_svg_root = ns.promo_svg
            .call(
                d3.zoom().on('zoom', function(event, d) {
                    ns.promo_svg.attr('transform', event.transform);
                }),
            )
            .append('g')
            .attr('id', 'promo_svg_root');


        // Append the Arrowhead in Promo and Scratch SVG's
        ns.promo_svg_defs = ns.promo_svg
            .append('defs')
            .attr('id', 'promo_svg_defs')
            .append('marker')
            .attr('id', 'parrowhead')
            .attr('viewBox', '-0 -5 10 10') //the bound of the SVG viewport for the current SVG fragment. defines a coordinate system 10 wide and 10 high starting on (0,-5)
            .attr('refX', 50) // x coordinate for the reference point of the marker. If circle is bigger, this need to be bigger.
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', ns.options.checkColour)
            .style('stroke', 'none');

        console.groupEnd();
    }

})(window.jQuery, window.Widgets.Panel.Promo, window.d3, window.Widgets.Panel.Utils, document, window)