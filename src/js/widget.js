//define namespace for your JS file
//window.Widgets = {};  //  already defined in _namespace.js
window.Widgets.Widget = {};

//define your function to use in your component
(function($, ns, componentsNs, eventsNs, d3, panelUtilsNs, panelFilterNs, panelTreeNs, panelPromoNs, panelScratchNs, document, window) {
    ns.version = '1.0.0';

    ns.selectorComponent = '[component="graphviz"]';
    ns.selectorTooltipContainer = 'body';


    ns.scratch = 'data/scratch.json';
        
    ns.raiseEventDataRequest = function(eventName, topics = [], action, id, callbackFn) {      
        console.group(`raiseEventDataRequest on ${window.location}`); 
        const componentId = `${eventName}-${action}-${id}`; 
        const payload = {
            action: action,
            id: id,
            type: 'load'
        }
        const config = "";

        console.log("compileEventData", payload, eventName, action, id, config);
        const data = eventsNs.compileEventData(payload, eventName, "DATA_REQUEST", componentId, config);

        console.log("raiseEvent", eventName, data);

        eventsNs.raiseEvent(eventName, data);

        if (callbackFn) {
            eventsNs.windowListener((eventData) => {
                console.group(`windowListener on ${window.location}`);
                console.log(eventData);
                const dataEventName = eventData.type || eventData.topicName;
                const { type, topicName, payload, action, componentId, config } = eventData;
                const data = eventData.data
                console.log(["eventName", eventName]);
                console.log(["dataEventName", dataEventName]);
                console.log(["match", dataEventName === eventName]);
                console.log(["type", type]);
                console.log(["topicName", topicName]);
                console.log(["payload", payload]);
                console.log(["action", action]);
                console.log(["componentId", componentId]);
                console.log(["config", config]);
                if (dataEventName === eventName || topics.includes(dataEventName)) {
                    console.log(["eventName match, exec allback."]);
                    callbackFn(data);
                } else {
                    console.log(["eventName not match. ignore."]);
                }
                console.groupEnd();
            });
        }
        console.groupEnd();
    }

    ns.requestData = function() {
        console.group(`requestData on ${window.location}`);

        // request tree data
        console.log("request tree data");
        ns.raiseEventDataRequest("embed-viz-event-request-datatree", ["embed-viz-event-payload-data-tree"], "load_data", "sighting", (data) => {
            panelTreeNs.loadData(data);
        });

        console.log("request filter data");
        //request panel data
        ns.raiseEventDataRequest("embed-viz-event-request-data1", ["embed-viz-event-payload-data1"], "load_data", "scratch", (data) => {
            ns.loadData(data);
        });
        console.log("requestData done");

        console.groupEnd();
    }

    ns.loadData = function(data) {
        console.group(`Load Data on ${window.location}`);
        console.log(data);

        //TODO: clear existing data and visuals
        panelUtilsNs.processGraphData(data);

        panelPromoNs.simGraph()
        panelPromoNs.showGraph();

        panelScratchNs.simGraph();
        panelScratchNs.showGraph();

        console.groupEnd();
    } 

    
    ns.addEventListener = ($component, componentConfig) => {
        console.group(`addEventListener on ${window.location}`);
        const { events, id } = componentConfig;
        const defaultTopic = id;
  
        console.log(["config", events, id, defaultTopic]);

        console.log(["addEventListener windowListener"]);
        eventsNs.windowListener((data) => {
            console.group(`windowListener on ${window.location}`);
            console.log(data);
            const { type, payload, action, componentId, config } = data;
            console.log(["type", type]);
            console.log(["payload", payload]);
            console.log(["action", action]);
            console.log(["componentId", componentId]);
            console.log(["config", config]);
            // if (type === 'embed-viz-event-payload-data1') {
            //     console.log(["action match, loading data."]);
            //     ns.loadData(data);
            // }
            console.groupEnd();
        });

        console.log(["addEventListener windowListener done"]);
        console.groupEnd();
    }

    ns.init = function($component) {
            
        console.group(`widget.init on ${window.location}`);
        console.log(d3, componentsNs, eventsNs);


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


        // add event listener
        //ns.addEventListener($component, window.Widgets.Panel.Utils.options);

        console.log("requestData");
        // send event to parent to get data
        ns.requestData();

        // on component mouse over hide tooltip
        $component.on('mouseover', function() {
            panelUtilsNs.hideTooltip();
        });
        console.log("widget.init done");
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
