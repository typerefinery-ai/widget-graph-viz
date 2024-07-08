// panel.scratch.js
//define context menu functions
window.Widgets.Panel.Scratch = {}

;(function ($, ns, d3, panelUtilsNs, document, window) {

    ns.selectorComponent = '#scratch_panel';

    ns.options = {};

    ns.init = function($component, options) {
            
        console.group("Widgets.Panel.Scratch.init");

        //copy options into ns
        $.extend(ns, options);


        console.groupEnd();
    }

})(window.jQuery, window.Widgets.Panel.Scratch, window.d3, window.Widgets.Panel.Utils, document, window)