window.Widgets.Events = {};

//define your function
(function($, ns) {

    ns.raiseEvent = function(eventName, data) {
        console.group("raiseEvent");
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