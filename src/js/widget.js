//define namespace for your JS file
//window.Widgets = {};  //  already defined in _namespace.js
window.Widgets.Widget = {};

//define your function to use in your component
(function($, ns, componentsNs, eventsNs, d3, contextMenuNs, indentTreeNs, graphNs, document, window) {
    ns.version = '1.0.0';

    ns.selectorComponent = '[component="graphviz"]';


    // 1. Instantiate Visualisation Variables
    // 3. Setup RMB Menu Items
    ns.menuItems = [
        {
        title: 'Copy Object',
        action: (d) => {
            // TODO: add any action you want to perform
            console.log('Copy Object', d);
        },
        },
        {
        title: 'Create Relationship',
        action: (d) => {
            // TODO: add any action you want to perform
            console.log('Create Relationship ->', d);
        },
        },
    ];

    ns.options = {
        duration: 350,
        radius: 6, // radius of curve for links
        barHeight: 40,
        margin: {
            top: 30,
            left: 30,
            bottom: 50,
            right: 30,
        },
        tree_panel_width: "100%", // tree view svg
        tree_panel_height: "100%", // tree view svg
        promo_panel_width: "100%", // promo view, top right svg
        promo_panel_height: "100%", // promo view top right svg
        scratch_panel_width: "100%", // scratch view, bottom left svg
        scratch_panel_height: "100%", // scratch view, bottom left svg
        svg_spacing: 500,
        // Icons
        prefix:
        'https://raw.githubusercontent.com/os-threat/images/main/img/',
        shape: 'rect-',
        icon_size: 30,
        textPadding: 8,
        corner: 5,
        // the tree view
        minHeight: 20,
        width: "100%",
        height: "100%",
        lineSpacing: 50,
        indentSpacing: 50,
        itemFont: '18px',
        boxSize: 10,
        tree_edge_thickness: 0.75,
        graph_edge_thickness: 1,
        linkStrength: 200,
        nodeStrength: -100,
        centreStrength: 80,
        theme: 'light',
        light_theme: {
            treeFill: 'white',
            scratchFill: 'ivory',
            promoFill: 'blanchedalmond',
            svgName: 'black',
            svgBorder: 'black',
            checkColour: 'gray',
            checkText: 'white',
            select: 'yellow',
            edges: 'black',
            tooltip: {
                fill: 'white', 
                stroke: '1px', 
                scolour: 'black', 
                corner: 5, 
                tcolour: 'black', 
                tsize: '11px', 
                padding: '5px'
                },
        },
        dark_theme: {
            treeFill: 'gray',
            scratchFill: 'dimgray',
            promoFill: 'gray',
            svgName: 'white',
            svgBorder: 'white',
            checkColour: 'white',
            checkText: 'gray',
            select: 'yellow',
            edges: 'white',
            tooltip: {
                fill: 'lightgray', 
                stroke: '1px', 
                scolour: 'white', 
                corner: 5, 
                tcolour: 'white', 
                tsize: '11px', 
                padding: '10px'
                },
        },
    };

        
    // 4. Setup initial tree view

    // 5. Setup treeview change dataslice radio buttons

    // // 6. Load the Working Pane with scratch data
    // const scratch = 'data/scratch.json';
    // d3.json(scratch).then(function (data) {
    //   console.log('scratch->', data);
    //   console.log('I am rendering the working page');
    //   //Step 1 - setup the SVG's
    //   window.workP.initSVG(data, ns.options);
    //   //Step 2 - split graph into PROMO and SCRATCH
    //   window.workP.updateGraph(data, ns.options);
    //   //Step 3 - d3 simulate graph
    //   window.workP.simGraph(data, ns.options);
    //   //Step 4 - d3 draw
    //   window.workP.showGraphs(options);
    // });

    ns.scratch = 'data/scratch.json';

    ns.init = function($component) {
            
        console.group("widget.init");
        console.log([graphNs, indentTreeNs, contextMenuNs, d3, componentsNs, eventsNs]);

        $(document).ready(function(){
            console.log(console.log([$, d3, window.d3])); 
        })

        const $promo_panel = $component.find('#promo_panel');
        const $scratch_panel = $component.find('#scratch_panel');
        const $tree_panel = $component.find('#tree_panel');

        ns.options.tree_panel_width = $tree_panel.width();
        ns.options.tree_panel_height = $tree_panel.height();
        ns.options.scratch_panel_width = $scratch_panel.width();
        ns.options.scratch_panel_height = $scratch_panel.height();
        ns.options.promo_panel_width = $tree_panel.width();
        ns.options.promo_panel_height = $tree_panel.height();


        console.log("ns.options.tree_panel_width->", ns.options.tree_panel_width);
        console.log("ns.options.tree_panel_height->", ns.options.tree_panel_height);
        console.log("ns.options.scratch_panel_width->", ns.options.scratch_panel_width);
        console.log("ns.options.scratch_panel_height->", ns.options.scratch_panel_height);
        console.log("ns.options.promo_panel_width->", ns.options.promo_panel_width);
        console.log("ns.options.promo_panel_height->", ns.options.promo_panel_height);

        
        // 2. Setup 2 SVG and Border combos
        let tree_svg = d3
            .select('#tree_panel')
            .append('svg')
            .attr('class', 'tree_svg')
            .attr('width', ns.options.tree_panel_width)
            .attr('height', ns.options.tree_panel_height)
            .append('g')
            .attr(
            'transform',
            'translate(' +
                ns.options.margin.left +
                ',' +
                ns.options.margin.top +
                ')',
            );

        console.log('tree_svg->', tree_svg);
        
        //get data
        d3.json('data/sightingIndex.json').then(function (data) {
            console.group("indentTreeNs.indentTree");
            console.log(data);
            console.log('I am rendering first time');
            indentTreeNs.indentTree(data, tree_svg, window.Widgets.Widget.options);
            console.groupEnd();
        });


        // d3.json(ns.scratch).then(function (data) {
        //     console.log('scratch->', data);
        //     console.log('I am rendering the working page');
        //     //Step 1 - setup the SVG's
            
        //     let componentConfig = graphNs.initSVG($component,
        //         data,
        //         window.Widgets.Widget.options,
        //     );

        //     console.log(componentConfig.steps);
        //     console.log(componentConfig);

        //     //Step 2 - split graph into PROMO and SCRATCH
        //     let step2Options = graphNs.updateGraph(
        //             data,
        //             componentConfig,
        //     );

        //     console.log(componentConfig.steps);
        //     console.log(componentConfig);

        //     //Step 3 - D3 simulate graph
        //     let step3Options = graphNs.simGraph(
        //             data,
        //             componentConfig,
        //     );

        //     console.log(componentConfig.steps);

        //     //Step 4 - D3 draw
        //     let step4Options =
        //     graphNs.showGraphs(componentConfig);

        //     console.log(componentConfig.steps);

        //     console.log(componentConfig);
        // });
        
        let $buttons = $component.find('input[type=radio]');

        let tree_map = {
            sighting: 'data/sightingIndex.json',
            task: 'data/taskIndex.json',
            impact: 'data/impactIndex.json',
            event: 'data/eventIndex.json',
            me: 'data/meIndex.json',
            company: 'data/companyIndex.json',
        };
    
        $buttons.on('change', function (d) {
            console.group("button.change");
            console.log('button changed to ' + this.value);
            //d3.select('.tree_svg').selectAll('g').remove();
            d3.json(tree_map[this.value]).then(function (data) {
                console.group("d3.json.then");
                console.log(data);
                console.log('I am ready to re-render the tree');

                indentTreeNs.indentTree(data, tree_svg, window.Widgets.Widget.options);
                console.groupEnd();
            });
            console.groupEnd();
        });

        console.groupEnd();
    };

    //old ref
    // ns.init = function($component) {
    //     console.group("Widget.init");
    //     //initialize your class
    //     $(document).ready(function () {
    //         console.log("parent message listener");
    //         window.addEventListener("message", function (event) {
    //         console.log("Message received from the parent: " + event.data);
    //         });
    //         console.log($("button"));
    //         //find closeses input box with id messageText
    //         let $input = $component.closest("input#messageText");

    //         $component.on("click", function () {
    //         let $button = $(this);
    //         let type = $button.attr("data-type");
    //         //leave as customEvent, event name that will be listed to by parent
    //         let eventName = "customEvent";
    //         //action name
    //         let action = "OPEN_ITEM";
    //         //param to send to action
    //         let config = "test_item";
    
    //         //event payload
    //         let payload = {
    //             type: type,
    //             config: config,
    //             messgae: $input.val(),
    //         };
    
    //         let data = {
    //             type: eventName,
    //             payload: payload,
    //             action: action,
    //             componentId: "widget",
    //             config: config,
    //         };
    //         console.log("button click", data);
    //         eventsNs.raiseEvent(eventName, data);
    //         });
    //     });

    //     console.groupEnd();
    // };

})(
    /*$*/   window.jQuery,
    /*ns*/  window.Widgets.Widget,
    /*componentsNs*/ window.Widgets, 
    /*eventsNs*/ window.Widgets.Events,
    /*d3*/ window.d3, 
    /*contextMenuNs*/ window.Widgets.ContextMenu, 
    /*indentTreeNs*/ window.Widgets.IndentTree, 
    /*graphNs*/ window.Widgets.Graph,
    /*document*/ document,
    /*window*/ window);


//define your behaviour how will this component will be added to DOM.
(function($, ns, componentsNs, document, window) {
    
    //watch for the component to be added to DOM
    componentsNs.watchDOMForComponent(`${ns.selectorComponent}`, ns.init);

})(window.jQuery, window.Widgets.Widget, window.Widgets, document, window);
