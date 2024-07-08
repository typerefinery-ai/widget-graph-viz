// panel.promo.js
//define context menu functions
window.Widgets.Panel.Promo = {}

;(function ($, ns, d3, panelUtilsNs, document, window) {

    ns.selectorComponent = '#promo_panel';

    ns.options = {};

    ns.init = function($component, options) {
            
        console.group("Widgets.Panel.Promo.init");

        //copy options into ns
        $.extend(ns, options);

        console.groupEnd();
    }

})(window.jQuery, window.Widgets.Panel.Promo, window.d3, window.Widgets.Panel.Utils, document, window)