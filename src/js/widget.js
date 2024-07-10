//define namespace for your JS file
//window.Widgets = {};  //  already defined in _namespace.js
window.Widgets.Widget = {};

//define your function to use in your component
(function($, ns, componentsNs, eventsNs, d3, panelUtilsNs, panelFilterNs, panelTreeNs, panelPromoNs, panelScratchNs, document, window) {
    ns.version = '1.0.0';

    ns.selectorComponent = '[component="graphviz"]';
    ns.selectorTooltipContainer = 'body';


    ns.options = {
        duration: 350,
        radius: 6, // radius of curve for links
        barHeight: 40,
        margin: {
            top: 30,
            left: 30,
            bottom: 50,
            right: 30,
        },
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
        edgeFontSize: '11px',
        edgeFontFamily: 'Wire One',
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

    ns.scratch = 'data/scratch.json';
        
    ns.init = function($component) {
            
        console.group("widget.init");
        console.log([d3, componentsNs, eventsNs]);



        if (!ns.theme) {
            if (ns.options.theme === 'light') {
                ns.theme = ns.options.light_theme
            } else {
                ns.theme = ns.options.dark_theme
            }
        }


        // init tree

        const $tree_panel = $component.find(panelTreeNs.selectorComponent);

        panelTreeNs.init($tree_panel, window.Widgets.Panel.Utils.options, $component.closest(ns.selectorTooltipContainer));


        //init filter

        const $filter_panel = $component.find(panelFilterNs.selectorComponent);

        panelFilterNs.init($filter_panel, window.Widgets.Panel.Utils.options);

        ns.tooltip = d3.select("body")
            .append("div")
            .attr('class', 'tooltip')
            .attr('id', 'tooltip')
            .style('display', 'block')
            .style("position", "absolute")
            .style("z-index", "10")
            .style("background-color", ns.theme.tooltip.fill)
            .style("border", "solid")
            .style("border-width",  ns.theme.tooltip.stroke)
            .style("border-color",  ns.theme.tooltip.scolour)
            .style("border-radius",  ns.theme.tooltip.corner)
            .style("max-width", ns.theme.tooltip.maxwidth)
            .style("overflow-x", ns.theme.tooltip.overeflow)
            .style("padding",  ns.theme.tooltip.padding)
            .style('opacity', 0);



        const $promo_panel = $component.find(panelPromoNs.selectorComponent);

        panelPromoNs.init($promo_panel, window.Widgets.Panel.Utils.options);

        const $scratch_panel = $component.find(panelScratchNs.selectorComponent);

        panelScratchNs.init($scratch_panel, window.Widgets.Panel.Utils.options);


        d3.json(ns.scratch).then(function (data) {
            console.group("Load Scratch Data");
            console.log(data);

            panelUtilsNs.processGraphData(data);
            // panelUtilsNs.simGraph(ns.options);

            panelPromoNs.simGraph()
            panelPromoNs.showGraph();

            panelScratchNs.simGraph();
            panelScratchNs.showGraph();

            console.groupEnd();
        });


        console.groupEnd();
    };




})(
    /*$*/   window.jQuery,
    /*ns*/  window.Widgets.Widget,
    /*componentsNs*/ window.Widgets, 
    /*eventsNs*/ window.Widgets.Events,
    /*d3*/ window.d3, 
    /*panelUtilsNs*/ window.Widgets.Panel.Utils,
    /*panelFilterNs*/ window.Widgets.Panel.Filter,
    /*panelTreeNs*/ window.Widgets.Panel.Tree,
    /*panelPromoNs*/ window.Widgets.Panel.Promo,
    /*panelScratchNs*/ window.Widgets.Panel.Scratch,
    /*document*/ document,
    /*window*/ window);


//define your behaviour how will this component will be added to DOM.
(function($, ns, componentsNs, document, window) {
    
    //watch for the component to be added to DOM
    componentsNs.watchDOMForComponent(`${ns.selectorComponent}`, ns.init);

})(window.jQuery, window.Widgets.Widget, window.Widgets, document, window);
