// panel.filter.js
//define context menu functions
window.Widgets.Panel.Filter = {};

;(function ($, ns, d3, panelUtilsNs, eventNs, document, window) {

    ns.selectorComponent = '#filter_panel';

    ns.options = {};

    ns.filterChange = function(url) {
        console.group("Widgets.Panel.Filter.filterChange");
        console.log('filter change');
        //call update function for tree panel
        window.Widgets.Panel.Tree.updateTree(url);
        console.groupEnd();
    }

    ns.init = function($component, options) {
            
        console.group("Widgets.Panel.Filter.init");

        //copy options into ns
        $.extend(ns.options, options);

        let $filter_options = $component.find('#filter_options input[type=radio]');

        
        $filter_options.on('change', function (d) {
            console.group("Widgets.Panel.Filter filter.change");
            var filterValue = this.value;
            var url = window.Widgets.Panel.Utils.options.tree_data[filterValue]
            console.log('source changed to ' + url);

            window.Widgets.Panel.Filter.filterChange(url);

            console.groupEnd();
        });

        let $theme_options = $component.find('#theme_options input[type=radio]');

        $theme_options.on('change', function (d) {
            console.group("Widgets.Panel.Filter theme.change");
            var filterValue = this.value;
            console.log('button changed to ' + filterValue);


            console.groupEnd();
        });
        
        if (ns.options.theme === 'light') {
            panelUtilsNs.theme = ns.options.light_theme
        } else {
            panelUtilsNs.theme = ns.options.dark_theme
        }

        //init event buttons
        const $event_buttons = $component.find('#toggle_options');
        $event_buttons.find('#base').on('click', function (d) {


            const id = $(this).attr('id');
            const payload = {
                action: 'click',
                id: id,
                type: 'button'
            }
            const topic = "form-identity-toggle-item"
            const eventName = "form-identity-toggle-item";
            const config = "section_base_required";
            const action = "BUTTON_CLICK";
            const data = eventNs.compileEventData(payload, eventName, action, id, config);

            eventNs.raiseEvent(eventName, data);
        });

        console.groupEnd();
    }

})(window.jQuery, window.Widgets.Panel.Filter, window.d3, window.Widgets.Panel.Utils, window.Widgets.Events, document, window)