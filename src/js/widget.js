//define namespace for your JS file
//window.Widgets = {};  //  already defined in _namespace.js
window.Widgets.Widget = {};

//define your function to use in your component
(function($, ns, componentsNs, eventsNs, d3, panelUtilsNs, panelFilterNs, panelTreeNs, panelPromoNs, panelScratchNs, document, window) {
    ns.version = '1.0.0';

    ns.selectorComponent = '[component="graphviz"]';
    ns.selectorTooltipContainer = 'body';


    ns.scratch = 'data/scratch.json';
        
    ns.init = function($component) {
            
        console.group("widget.init");
        console.log([d3, componentsNs, eventsNs]);


        if (!panelUtilsNs.theme) {
            if (panelUtilsNs.options.theme === 'light') {
                panelUtilsNs.theme = panelUtilsNs.options.light_theme
            } else {
                panelUtilsNs.theme = panelUtilsNs.options.dark_theme
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
            .style("background-color", panelUtilsNs.theme.tooltip.fill)
            .style("border", "solid")
            .style("border-width",  panelUtilsNs.theme.tooltip.stroke)
            .style("border-color",  panelUtilsNs.theme.tooltip.scolour)
            .style("border-radius",  panelUtilsNs.theme.tooltip.corner)
            .style("max-width", panelUtilsNs.theme.tooltip.maxwidth)
            .style("overflow-x", panelUtilsNs.theme.tooltip.overeflow)
            .style("padding",  panelUtilsNs.theme.tooltip.padding)
            .style('opacity', 0);



        const $promo_panel = $component.find(panelPromoNs.selectorComponent);

        panelPromoNs.init($promo_panel, window.Widgets.Panel.Utils.options);

        const $scratch_panel = $component.find(panelScratchNs.selectorComponent);

        panelScratchNs.init($scratch_panel, window.Widgets.Panel.Utils.options);


        d3.json(ns.scratch).then(function (data) {
            console.group("Load Sample Data");
            console.log(data);

            panelUtilsNs.processGraphData(data);

            panelPromoNs.simGraph()
            panelPromoNs.showGraph();

            panelScratchNs.simGraph();
            panelScratchNs.showGraph();

            console.groupEnd();
        });

        // on component mouse over hide tooltip
        $component.on('mouseover', function() {
            panelUtilsNs.hideTooltip();
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
