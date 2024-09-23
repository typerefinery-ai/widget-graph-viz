// panel.filter.js
//define context menu functions
window.Widgets.Panel.Filter = {};

;(function ($, ns, d3, panelUtilsNs, eventNs, document, window) {

    ns.selectorComponent = '#filter_panel';

    ns.options = {};

    ns.filterChange = function(type) {
        console.group(`Widgets.Panel.Filter.filterChange on ${window.location}`);
        console.log('filter change');
        //call update function for tree panel
        window.Widgets.Panel.Tree.updateTree(type);
        console.groupEnd();
    }

    ns.init = function($component, options) {
            
        console.group(`Widgets.Panel.Filter.init on ${window.location}`);

        //copy options into ns
        $.extend(ns.options, options);

        let $filter_options = $component.find('#filter_options input[type=radio]');

        
        $filter_options.on('change', function (d) {
            console.group(`Widgets.Panel.Filter filter.change on ${window.location}`);
            let filterValue = this.value;
            let type = window.Widgets.Panel.Utils.options.tree_data[filterValue]
            console.log('source changed to ' + type);

            window.Widgets.Panel.Filter.filterChange(type);

            console.groupEnd();
        });

        let $theme_options = $component.find('#theme_options input[type=radio]');

        $theme_options.on('change', function (d) {
            console.group(`Widgets.Panel.Filter theme.change on ${window.location}`);
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

        console.log($event_buttons);
        console.log($event_buttons.find('#base'));
        $event_buttons.find('#base').on('click', function (d) {

            const componentId = $(this).attr('id');
            const id = componentId;
            const payload = {
                action: 'click',
                id: id,
                type: 'button'
            }
            const topic = "form-identity-toggle-item"
            const eventName = "form-identity-toggle-item";
            const config = "section_base_required";
            const action = "BUTTON_CLICK";
            const data = eventNs.compileEventData(payload, eventName, action, componentId, config);

            eventNs.raiseEvent(eventName, data);
        });
        console.log($event_buttons.find('#getdata'));
        $event_buttons.find("#getdata").on('click', function (d) {
            const componentId = $(this).attr('id');
            const id = "scratch";
            const payload = {
                action: 'click',
                id: id,
                type: 'button'
            }
            const eventName = "embed-viz-event-payload-data-unattached-force-graph";
            const config = "scratch";
            const action = "DATA_REQUEST";
            const data = eventNs.compileEventData(payload, eventName, action, componentId, config);

            eventNs.raiseEvent(eventName, data);
        });
        $(document).find("#reload").on('click', function (d) {
            console.log('reload');
            window.location.reload();
        });

        ns.filterChange(ns.options.tree_data_default);

        console.groupEnd();
    }

})(window.jQuery, window.Widgets.Panel.Filter, window.d3, window.Widgets.Panel.Utils, window.Widgets.Events, document, window)