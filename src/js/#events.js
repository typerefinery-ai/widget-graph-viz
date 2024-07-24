window.Widgets.Events = {};

//define your function
(function($, ns) {

    ns.compileEventData = (payload, eventName, action, componentId, config) => {
        return { 
            type: eventName, 
            payload: payload, 
            action: action, 
            componentId: componentId, 
            config: config
        };
    };

    ns.windowListener = function() {
        console.group("windowListener on " + window.location);
        window.addEventListener("message", function(event) {
            console.groupCollapsed('widget windowListener on ' + window.location);
            var eventData = event.data;
            var sourceWindow = event.source;
            var sourceOrigin = event.origin;
            
            console.log('eventData', eventData, 'sourceWindow', sourceWindow, 'sourceOrigin', sourceOrigin);

            var sourceData = eventData;
            if (typeof sourceData === 'string') {
                sourceData = JSON.parse( sourceData );
            }

            if (!sourceData) {
                console.log('no sourceData');
                console.groupEnd();
                return;
            }
            
            console.groupEnd();
        });
        console
    }
    
    ns.raiseEvent = function(eventName, data) {
        console.group("raiseEvent on " + window.location);
        let event = new CustomEvent(eventName, {
          detail: data,
        });
        console.log("event", event);
        console.log("window.parent", window.parent);

        if (window.parent) {
          window.parent.postMessage(JSON.stringify(data), "*");
          console.log("postMessage");
        } else {
          window.dispatchEvent(event);
          console.log("this doc is not in iFrame");
        }
        console.groupEnd();
      }

})(window.jQuery, window.Widgets.Events);