//define namespace for your JS file
//window.Widgets = {};  //  already defined in _namespace.js
window.Widgets.Widget = {};

//define your function to use in your component
(function($, ns, componentsNs, eventsNs, document, window) {
    ns.version = '1.0.0';

    ns.selectorComponent = 'button[data-type="customevent"]';

    ns.init = function($component) {
        console.group("Widget.init");
        //initialize your class
        $(document).ready(function () {
            console.log("parent message listener");
            window.addEventListener("message", function (event) {
              console.log("Message received from the parent: " + event.data);
            });
            console.log($("button"));
            //find closeses input box with id messageText
            let $input = $component.closest("input#messageText");

            $component.on("click", function () {
              let $button = $(this);
              let type = $button.attr("data-type");
              //leave as customEvent, event name that will be listed to by parent
              let eventName = "customEvent";
              //action name
              let action = "OPEN_ITEM";
              //param to send to action
              let config = "test_item";
    
              //event payload
              let payload = {
                type: type,
                config: config,
                messgae: $input.val(),
              };
    
              let data = {
                type: eventName,
                payload: payload,
                action: action,
                componentId: "widget",
                config: config,
              };
              console.log("button click", data);
              eventsNs.raiseEvent(eventName, data);
            });
          });

          console.groupEnd();
    };

})(window.jQuery, window.Widgets.Widget, window.Widgets, window.Widgets.Events, document, window);


//define your behaviour how will this component will be added to DOM.
(function($, ns, componentsNs, document, window) {
    
    //watch for the component to be added to DOM
    componentsNs.watchDOMForComponent(`${ns.selectorComponent}`, ns.init);

})(window.jQuery, window.Widgets.Widget, window.Widgets, document, window);
