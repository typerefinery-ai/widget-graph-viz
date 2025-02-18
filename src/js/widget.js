//define namespace for your JS file
//window.Widgets = {};  //  already defined in _namespace.js
window.Widgets.Widget = {};

//define your function to use in your component
(function($, ns, componentsNs, eventsNs, d3, panelUtilsNs, panelFilterNs, panelTreeNs, panelPromoNs, panelScratchNs, document, window) {
    ns.version = '1.0.0';

    ns.selectorComponent = '[component="graphviz"]';
    ns.selectorTooltipContainer = 'body';


    ns.scratch = '/viz-data/unattached-force-graph';

    //keep track of all listeners and callbacks.
    ns.listeners = new Map();
        
    ns.raiseEventDataRequest = function(eventName, topics = [], eventAction, id, callbackFn) {      
        console.group(`raiseEventDataRequest on ${window.location}`); 
        const componentId = `${id}-${eventName}-${eventAction}`; 
        const payload = {
            action: eventAction,
            id: id,
            type: 'load'
        }
        const config = "";

        console.log("compileEventData", payload, eventName, eventAction, id, config);
        const eventCompileData = eventsNs.compileEventData(payload, eventName, "DATA_REQUEST", componentId, config);

        //add callback first
        //make sure callback is unique for each listener, event name and action combination.
        if (callbackFn) {
            console.log("CallbackFn passed.");
            if (ns.listeners.has(componentId)) {                
                console.log("listener already exists, removing.");
                const listener = ns.listeners.get(componentId);
                if (listener.callbackFn === callbackFn) {
                    console.log("callbackFn match.");
                }
            } else {
                console.log("listener does not exist, adding.");
                ns.listeners.set(componentId,{
                    componentId: componentId,
                    eventAction: eventAction,
                    topics: topics,
                    eventName: eventName,
                    id: id,
                    callbackFn: callbackFn
                })

                eventsNs.windowListener((eventData) => {
                    console.group(`windowListener on ${window.location}`);
                    console.log(eventData);
                    const dataEventName = eventData.type || eventData.topicName;
                    const { type, topicName, payload, action, componentId, config } = eventData;            
                    const configAction = (config && config["action"]) ? config.action : "";
                    const data = eventData.data;
                    const eventPayload = eventData.payload;
                    const eventPayloadAction = (eventPayload && eventPayload["action"]) ? eventPayload.action : "";
                    const eventMatch = dataEventName === eventName || topics.includes(dataEventName) || action === eventAction || configAction === eventAction;
                    console.log(["eventName", eventName]);
                    console.log(["eventAction", eventAction]);
                    console.log(["configAction", configAction]);
                    console.log(["eventPayloadAction", eventPayloadAction]);
                    console.log(["dataEventName", dataEventName]);
                    console.log(["data", data]);
                    console.log(["match", eventMatch]);
                    console.log(["type", type]);
                    console.log(["topicName", topicName]);
                    console.log(["payload", payload]);
                    console.log(["action", action]);
                    console.log(["componentId", componentId]);
                    console.log(["config", config]);
                    if (eventMatch) {
                        console.log(["eventName match, exec allback."]);
                        ns.listeners.get(componentId).callbackFn(eventData);
                        //callbackFn(data);
                    } else {
                        console.log(["eventName not match. ignore."]);
                    }
                    console.groupEnd();
                });
                console.log("windowListener added", componentId, ns.listeners);
            }
        }

        //then raise event
        console.log("raiseEvent", eventName, eventCompileData);
        eventsNs.raiseEvent(eventName, eventCompileData);
        console.log("raiseEvent done", eventName);

        console.groupEnd();
    }

    ns.requestData = function() {
        console.group(`requestData on ${window.location}`);

        // request tree data
        // console.log("request tree data");


        console.log("request data");
        //request panel data
        ns.raiseEventDataRequest("embed-viz-event-payload-data-unattached-force-graph", ["embed-viz-event-payload-data-unattached-force-graph"], "load_data", "scratch", (eventData) => {
            console.log("raiseEventDataRequest callback loadData scratch", eventData);
            if (eventData) {
                if (eventData.error) {
                    console.error(eventData.error);
                    return;
                }
                if (eventData.data) {
                    ns.loadData(eventData.data);
                } else {
                    console.error("No data found");
                }
            }
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

            // listen for specific event
            if (action === "DATA_REFRESH") {
                console.log(["action match, data has changed refreshing data."]);
                ns.requestData();
            } else {
                console.log(["action not match, ignore."]);
            }

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

        console.log("requestData");
        // send event to parent to get data
        ns.requestData();

        // on component mouse over hide tooltip
        $component.on('mouseover', function() {
            panelUtilsNs.hideTooltip();
        });
        
        // add event listener to liste to other events.
        ns.addEventListener($component, window.Widgets.Panel.Utils.options);

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
