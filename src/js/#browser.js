window.Widgets.Browser = {};

(function($, ns) {
    ns.vh = function(percent) {
        let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        return (percent * h) / 100;
    }

    ns.vw = function(percent) {
        let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        return (percent * w) / 100;
    }

    ns.vmin = function(percent) {
        return Math.min(ns.vh(percent), ns.vw(percent));  
    }

    ns.vmax = function(percent) {
        return Math.max(ns.vh(percent), ns.vw(percent));  
    }

    //get height of the element
    ns.oh = function($el) {
        console.log($el.outerHeight(true));
        return $el.outerHeight(true);
    }

    //get width of the element
    ns.ow = function($el) {
        console.log($el.outerWidth(true));
        return $el.outerWidth(true);
    }

})(window.jQuery, window.Widgets.Browser);