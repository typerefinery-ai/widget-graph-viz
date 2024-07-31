// panel.tree.js
//define context menu functions
window.Widgets.Widget = Widgets.Widget || {};
window.Widgets.Panel.Tree = {}

;(function ($, ns, d3, panelUtilsNs, document, window) {

    ns.selectorComponent = '#tree_panel';

    ns.options = {};

    ns.menuItems = [
        {
          label: "Copy",
          icon: '<i class="fa-regular fa-copy"></i>',
          action: () => console.log("copy selected"),
        },
        {
          label: "Edit DAG",
          icon: '<i class="fa fa-code"></i>',
          action: () => console.log("format selected"),
        },
    ];

    ns.loadData = function(url) {
        console.groupCollapsed("Widgets.Panel.Tree.loadData");
        console.log('loading data from ' + url);
        
        if (!ns.options || !ns.options.tree_data) {
            console.log('options not set', ns.options);
            return
        }

        if (url === "") {
            console.warn('url is empty, using default');
            url = ns.options.tree_data[ns.options.tree_data_default];
        }

        //hide tooltip if it is visible
        panelUtilsNs.hideTooltip();  

        d3.json(url).then(function (data) {
            console.group("window.Widgets.Panel.Tree loaddata");
            console.log(data);

            ns.data = data;

            //clear svg content
            ns.tree_svg.selectAll("*").remove();

            //add root group
            ns.tree_svg_root = ns.tree_svg
                .append('g')
                .attr('id', 'tree_svg_root')
                .attr(
                'transform',
                'translate(' +
                    ns.options.margin.left +
                    ',' +
                    ns.options.margin.top +
                    ')',
                )
                .on('end', function () {
                    console.log('tree_svg END');
                });

            //add link lines 
            ns.gLink = ns.tree_svg_root
                .append('g')
                .attr('id', 'gLink')
                .attr('fill', 'none')
                .attr('stroke', panelUtilsNs.theme.edges)
                .attr('stroke-width', ns.options.tree_edge_thickness)
    
            //add nodes
            ns.gNode = ns.tree_svg_root
                .append('g')
                .attr('id', 'gNode')
                .attr('cursor', 'pointer')
                .attr('pointer-events', 'all')
                            

            ns.root = d3.hierarchy(ns.data)
    
            ns.root.x0 = 0
            ns.root.y0 = 0
            ns.root.descendants().forEach((d, i) => {
              d.id = i
              d._children = d.children
              if (d.depth && d.data.name.length !== 7) d.children = null
            })
        
            ns.drawTree();

            console.groupEnd();
        });

        console.groupEnd();
    }

    ns.updateTree = function(url) {
        console.log('window.Widgets.Panel.Tree updated');
        //call update function for tree panel
        console.log('loading data from ' + url);

        ns.loadData(url);
    }


    ns.drawTree = function(reset) {
        console.groupCollapsed("Widgets.Panel.Tree.drawTree");

        console.log('ns.data->', ns.data);
        console.log('ns.tree_svg->', ns.tree_svg);

        //svg.selectAll("*").remove();
        
        console.log('ns.options.width->', ns.options.width)
        console.log('ns.options.height->', ns.options.height)        
        console.log('ns.$container.width()->', ns.$container.width())
        console.log('ns.$container.height()->', ns.$container.height())

        ns.options.width = ns.$container.width()
        ns.options.height = ns.$container.height()

        //cound nodes
        // let index = -1
        // ns.root.eachBefore(function (n) {
        //   ++index
        // }) // counts original number of items

        let indexLast = -1
        const nodes = ns.root.descendants().reverse()
        const links = ns.root.links()
    
        // Compute the new tree layout.
        ns.tree(ns.root)
    
        // node position function
        let index = -1
        ns.root.eachBefore(function (n) {
          n.x = ++index * ns.options.lineSpacing
          n.y = n.depth * ns.options.indentSpacing
        })
    
        const height = Math.max(
          ns.options.minHeight,
          index * ns.options.lineSpacing + ns.options.margin.top + ns.options.margin.bottom
        )
    
        console.log('-options.margin.left->', -ns.options.margin.left)
        console.log('-options.margin.top->', -ns.options.margin.top)
        console.log('options.width->', ns.options.width)
        console.log('options.svg_height->', ns.options.height)
    
        const transition = ns.tree_svg
          .transition()
          .duration(ns.options.duration)
        //   .attr('viewBox', [
        //     -ns.options.margin.left,
        //     -ns.options.margin.top,
        //     ,
        //     ,
        //   ])
          .tween('resize', window.ResizeObserver ? null : () => () => ns.svg.dispatch('toggle'))
    
        ns.tree_svg
          .transition()
          .delay(indexLast < index ? 0 : ns.options.duration) // .delay(indexLast < index ? 0 : options.duration)
          .duration(0)
        //   .attr('viewBox', [
        //     -ns.options.margin.left,
        //     -ns.options.margin.top,
        //     ,
        //     ,
        //   ])
          .on('end', function (d) {

            console.log('tree_svg END', this.getBBox())
            console.log('tree_svg END', d3.select(ns.tree_svg))

            var vbox = this.getBBox();

            console.log('vbox.width->', vbox.width)
            console.log('vbox.height->', vbox.height)

            let scrollBarWidth = ns.$container.get(0).offsetWidth - ns.$container.get(0).clientWidth;

            console.log('scrollBarWidth->', scrollBarWidth)

            var paddingMultiplier = ns.$svg.find("image").length * 3;

            var newWidth = vbox.width + ns.options.margin.left + ns.options.margin.right + scrollBarWidth;
            var newHeight = vbox.height + ns.options.margin.top + ns.options.margin.bottom + scrollBarWidth + paddingMultiplier;

            console.log('ns.options.margin.top->', ns.options.margin.top)
            console.log('ns.options.margin.bottom->', ns.options.margin.bottom)

            console.log('vbox.width->', newWidth)
            console.log('vbox.height->', newHeight)
            console.log('ns.$svg.height()->', ns.$svg.height())
            
            ns.$svg.attr('width', newWidth)

            if (newHeight > ns.$svg.height()) {
                ns.$svg.attr('height', newHeight)
            }

            
          })
    
        // Update the nodes…
        const node = ns.gNode.selectAll('g').data(nodes, (d) => d.id)
    
        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node
          .enter()
          .append('g')
          .attr('id', 'node')
          .attr('class', 'node')
          .attr('transform', (d) => `translate(${d.y},${ns.root.x0})`)
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0)
          .on('click', (event, d) => {
    
            console.log('click d->', d)
            console.log('click d->', d.children)
    
            d.children = d.children ? null : d._children
            //ns.update()
            ns.drawTree(true)
    
            charge
              .attr('fill', (d) =>
                d._children ? (d.children ? ns.minus.textFill : ns.plus.textFill) : 'none'
              )
              .text((d) => (d._children ? (d.children ? ns.minus.text : ns.plus.text) : ''))
    
            box.attr('fill', (d) =>
              d._children ? (d.children ? ns.minus.shapeFill : ns.plus.shapeFill) : 'none'
            )
          })
    
        // check box
        let box = nodeEnter
          .append('rect')
          .attr('width', ns.options.boxSize)
          .attr('height', ns.options.boxSize)
          .attr('x', -ns.options.boxSize / 2)
          .attr('y', -ns.options.boxSize / 2)
          .attr('fill', (d) =>
            d._children ? (d.children ? ns.minus.shapeFill : ns.plus.shapeFill) : 'none'
          )
          .attr('stroke', (d) => (d._children ? panelUtilsNs.theme.checkColour : 'none'))
          .attr('stroke-width', 0.5)
    
        // check box symbol
        let charge = nodeEnter
          .append('text')
          .attr('x', 0)
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'central')
          .attr('fill', (d) => (d._children ? (d.children ? ns.minus.textFill : ns.plus.textFill) : 'none'))
          .text((d) => (d._children ? (d.children ? '−' : '+') : ''))
    
        // attach icon
        let image = nodeEnter
          .append('image')
          .attr('x', 10 + ns.options.boxSize / 2)
          .attr('y', -ns.options.icon_size / 2 - ns.options.boxSize / 2)
          .attr('xlink:href', function (d) {
            console.log('d->', d)
            // console.log('prefix->', ns.options.prefix, ', shape->', ns.options.shape)
            // console.log(ns.options.prefix + ns.options.shape + d.data.icon + '.svg')
            return ns.options.prefix + ns.options.shape + d.data.icon + '.svg'
          })
          .attr('width', function (d) {
            return ns.options.icon_size + 5
          })
          .attr('height', function (d) {
            return ns.options.icon_size + 5
          })
          .on('mouseover.tooltip', panelUtilsNs.mouseover)
          .on("mousemove", panelUtilsNs.mousemove)
          .on("mouseout.tooltip", panelUtilsNs.mouseleave)
          .on('contextmenu', panelUtilsNs.contextmenu);
    
        // label text
        let label = nodeEnter
          .append('text')
          .attr('x', ns.options.icon_size + 30 + ns.options.boxSize / 2)
          .attr('text-anchor', 'start')
          .style('font-size', ns.options.itemFont)
          .attr('dy', '0.32em')
          .text((d) => d.data.name)
    
        // Transition nodes to their new position.
        const nodeUpdate = node
          .merge(nodeEnter)
          .transition(transition)
          .attr('transform', (d) => `translate(${d.y},${d.x})`)
          .attr('fill-opacity', 1)
          .attr('stroke-opacity', 1)
    
        // Transition exiting nodes to the parent's new position.
        const nodeExit = node
          .exit()
          .transition(transition)
          .remove()
          .attr('transform', (d) => `translate(${d.y},${ns.root.x})`)
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0)
    
        // Update the links…
        const link = ns.gLink.selectAll('path').data(links, (d) => d.target.id)
    
        // Enter any new links at the parent's previous position.
        const linkEnter = link
          .enter()
          .append('path')
          .attr('stroke-opacity', 0)
          .attr('d', (d) =>
            panelUtilsNs.makeLink(
              [d.source.y, ns.root.x],
              [d.target.y + (d.target._children ? 0 : ns.options.boxSize / 2), ns.root.x],
              ns.options.radius
            )
          )
    
        // Transition links to their new position.
        link
          .merge(linkEnter)
          .transition(transition)
          .attr('stroke-opacity', 1)
          .attr('d', (d) =>
            panelUtilsNs.makeLink(
              [d.source.y, d.source.x],
              [d.target.y + (d.target._children ? 0 : ns.options.boxSize / 2), d.target.x],
              ns.options.radius
            )
          )
    
        // Transition exiting nodes to the parent's new position.
        link
          .exit()
          .transition(transition)
          .remove()
          .attr('stroke-opacity', 0)
          .attr('d', (d) =>
            panelUtilsNs.makeLink(
              [d.source.y, ns.root.x],
              [d.target.y + (d.target._children ? 0 : ns.options.boxSize / 2), ns.root.x],
              ns.options.radius
            )
          )
    
        // Stash the old positions for transition.
        ns.root.eachBefore((d) => {
          d.x0 = d.x
          d.y0 = d.y
        })
    
        indexLast = index // to know if viewbox is expanding or contracting
    


        console.groupEnd();
    }


    ns.init = function($component, options, $parent) {
            
        console.group("Widgets.Panel.Tree.init");

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

        /// init svg
        ns.tree_svg = d3
            .select($component.get(0))
            .append('svg')
            .attr('class', 'tree_svg')
            .attr('id', 'tree_svg')
            .attr('width', $component.width())
            .attr('height', $component.height())
            // .on('mouseover', (d) => {
            //     console.log('svg mouseover->', d);
            //     panelUtilsNs.contentMenuItem = null;
            // })
            // .on('mousemove', (d) => {
            //     console.log('svg mouseover->', d);
            //     panelUtilsNs.contentMenuItem = null;
            // });

        console.log('tree_svg->', ns.tree_svg);

        ns.$svg = $component.find('svg');

        //init icons
        ns.plus = {
          shapeFill: panelUtilsNs.theme.checkColour,
          shapeStroke: panelUtilsNs.theme.checkColour,
          textFill: panelUtilsNs.theme.checkText,
          text: '+',
        }
        ns.minus = {
          shapeFill: panelUtilsNs.theme.checkColour,
          shapeStroke: panelUtilsNs.theme.checkColour,
          textFill: panelUtilsNs.theme.checkText,
          text: '−',
        }

        //update node config
        ns.tree = d3.tree().nodeSize([ns.options.lineSpacing, ns.options.indentSpacing])
        
        //resonsive size before icons had height =  Math.max(minHeight, index * lineSpacing + marginTop + marginBottom )
    
        console.log('options.height->', ns.options.height)
        console.log('options.width->', ns.options.width)
        
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
                return panelUtilsNs.contentMenuItem ? panelUtilsNs.contentMenuItem.data.name : '';
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

    
        var default_data_url = ns.options.tree_data[ns.options.tree_data_default];

        ns.updateTree(default_data_url);

        console.groupEnd();
    }

})(window.jQuery, window.Widgets.Panel.Tree, window.d3, window.Widgets.Panel.Utils, document, window)