// root namespace for your app
window.Widgets = {};

//define your function
(function($, ns) {
    ns.version = '1.0.0';

    //find all selectors and run callbackFn
    ns.initComponentBySelector = (selector, callbackFn) => {
        if ((selector == null || selector == undefined) || (callbackFn == null || callbackFn == undefined)) {
            console.error("initComponent: selector and callbackFn is required");
            return;
        }
        //init component on all found instances
        var elements = document.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
            callbackFn($(elements[i]));
        }
    }

    //observe DOM for new instances of a selector and run callbackFn
    ns.observeDOMForSelector = (selector, callbackFn) => {

        if ((selector == null || selector == undefined) || (callbackFn == null || callbackFn == undefined)) {
            console.error("observeDOMForSelector: selector and callbackFn is required");
            return;
        }

        //observe DOM for future instances of a selector
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        var body = document.querySelector("body");
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                var nodesArray = [].slice.call(mutation.addedNodes);
                if (nodesArray.length > 0) {
                    nodesArray.forEach(function(addedNode) {
                        if (addedNode.querySelectorAll) {
                            var elementsArray = [].slice.call(addedNode.querySelectorAll(selector));
                            elementsArray.forEach(function(element) {
                                console.log("new element", selector);
                                callbackFn($(element));
                            });
                        }
                    });
                }
            });
        });

        observer.observe(body, {
            subtree: true,
            childList: true,
            characterData: true
        });
    }

    ns.onDocumentReady = (selector, callbackFn) => {
        if ((selector == null || selector == undefined) || (callbackFn == null || callbackFn == undefined)) {
            console.error("onDocumentReady: selector and callbackFn is required");
            return;
        }

        console.group("onDocumentReady for " + selector);

        ns.initComponentBySelector(selector, callbackFn);
        ns.observeDOMForSelector(selector, callbackFn);

        console.groupEnd();

    }

    ns.watchDOMForComponent = (selector, callbackFn) => {
        if (document.readyState !== "loading") {
            ns.onDocumentReady(selector, callbackFn);
        } else {
            document.addEventListener("DOMContentLoaded", ns.onDocumentReady(selector, callbackFn));
        }
    }

    ns.init = function() {
        //initialize your class
    };

})(window.jQuery, window.Widgets);