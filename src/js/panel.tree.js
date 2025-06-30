// panel.tree.js
//define context menu functions
window.Widgets.Widget = Widgets.Widget || {};
window.Widgets.Panel.Tree = {}

;(function ($, ns, d3, panelUtilsNs, document, window) {

    ns.selectorComponent = '#tree_panel';

    ns.options = {};

    ns.menuItems = [
        {
          label: "Copy",
          icon: '<i class="fa-regular fa-copy"></i>',
          action: () => console.log("copy selected"),
        },
        {
          label: "Edit DAG",
          icon: '<i class="fa fa-code"></i>',
          action: () => console.log("edit dag selected"),
        },
    ];

    ns.getDataFromUrl = function(url) {
        console.groupCollapsed(`Widgets.Panel.Tree.loadData on ${window.location}`);
        console.log('loading data from ' + url);
        
        if (!ns.options || !ns.options.tree_data) {
            console.log('options not set', ns.options);
            return
        }

        if (url === "") {
            console.warn('url is empty, using default');
            url = ns.options.tree_data[ns.options.tree_data_default];
        }

        d3.json(url).then(function (data) {
            console.group(`window.Widgets.Panel.Tree loaddata on ${window.location}`);
            console.log(data);

            ns.data = data;

            //clear svg content
            ns.tree_svg.selectAll("*").remove();

            //add root group
            ns.tree_svg_root = ns.tree_svg
                .append('g')
                .attr('id', 'tree_svg_root')
                .attr(
                'transform',
                'translate(' +
                    ns.options.margin.left +
                    ',' +
                    ns.options.margin.top +
                    ')',
                )
                .on('end', function () {
                    console.log('tree_svg END');
                });

            //add link lines 
            ns.gLink = ns.tree_svg_root
                .append('g')
                .attr('id', 'gLink')
                .attr('fill', 'none')
                .attr('stroke', panelUtilsNs.theme.edges)
                .attr('stroke-width', ns.options.tree_edge_thickness)
    
            //add nodes
            ns.gNode = ns.tree_svg_root
                .append('g')
                .attr('id', 'gNode')
                .attr('cursor', 'pointer')
                .attr('pointer-events', 'all')
                            

            ns.root = d3.hierarchy(ns.data)
    
            ns.root.x0 = 0
            ns.root.y0 = 0
            ns.root.descendants().forEach((d, i) => {
              d.id = i
              d._children = d.children
              if (d.depth && d.data.name.length !== 7) d.children = null
            })
        
            ns.drawTree();

            console.groupEnd();
        });

        console.groupEnd();
    }

    ns.loadData = function(data) {
        console.groupCollapsed(`Widgets.Panel.Tree.loadData on ${window.location}`);

        console.log('data->', data);
        console.log('data type->', typeof data);
        console.log('data keys->', data ? Object.keys(data) : "null/undefined");

        //TODO: clear existing data and visuals

        ns.data = data;

        console.log('ns.data set->', ns.data);

        //clear svg content
        console.log('Clearing SVG content...');
        ns.tree_svg.selectAll("*").remove();

        console.log('Creating root group...');
        //add root group
        ns.tree_svg_root = ns.tree_svg
            .append('g')
            .attr('id', 'tree_svg_root')
            .attr(
            'transform',
            'translate(' +
                ns.options.margin.left +
                ',' +
                ns.options.margin.top +
                ')',
            )
            .on('end', function () {
                console.log('tree_svg END');
            });

        console.log('Creating link lines...');
        //add link lines 
        ns.gLink = ns.tree_svg_root
            .append('g')
            .attr('id', 'gLink')
            .attr('fill', 'none')
            .attr('stroke', panelUtilsNs.theme.edges)
            .attr('stroke-width', ns.options.tree_edge_thickness)

        console.log('Creating nodes...');
        //add nodes
        ns.gNode = ns.tree_svg_root
            .append('g')
            .attr('id', 'gNode')
            .attr('cursor', 'pointer')
            .attr('pointer-events', 'all')
                        

        console.log('Creating hierarchy from data...');
        ns.root = d3.hierarchy(ns.data)

        console.log('ns.root created->', ns.root);

        ns.root.x0 = 0
        ns.root.y0 = 0
        ns.root.descendants().forEach((d, i) => {
          d.id = i
          d._children = d.children
          if (d.depth && d.data.name.length !== 7) d.children = null
        })
    
        console.log('Calling drawTree...');
        ns.drawTree();

        console.groupEnd();
    }

    ns.updateTree = function(type) {
        console.group(`Widgets.Panel.Tree.updateTree on ${window.location}`);
        console.log(`updateTree called with type: ${type}`);
        
        // Validate input parameter
        if (!type || typeof type !== "string") {
            console.error("updateTree: type parameter must be a non-empty string");
            console.groupEnd();
            return;
        }
        
        // Validate against known types
        const validTypes = Object.values(panelUtilsNs.options.tree_data);
        if (!validTypes.includes(type)) {
            console.error(`updateTree: invalid type '${type}'. Valid types: ${validTypes.join(", ")}`);
            console.groupEnd();
            return;
        }
        
        console.log(`Updating tree with type: ${type}`);
        console.log(`Valid types:`, validTypes);
        console.log(`Current URL:`, window.location.href);
        
        // Hide tooltip before loading new data
        panelUtilsNs.hideTooltip();
        
        // Show loading state
        //ns.showLoadingState();
        
        // Check if we're in local mode
        const isLocal = ns.isLocalMode();
        console.log(`Local mode check result: ${isLocal}`);
        
        if (isLocal) {
            console.log("Local mode detected, loading data directly from API");
            ns.loadTreeDataFromAPI(type);
        } else {
            console.log("Widget mode, requesting data from parent application");
            ns.loadTreeDataFromParent(type);
        }
    };


    /**
     * Load tree data from parent application (widget mode)
     * @param {string} type - The tree data type (sighting, task, impact, event, me, company)
     */
    ns.loadTreeDataFromParent = function(type) {
        console.group(`Widgets.Panel.Tree.loadTreeDataFromParent on ${window.location}`);
        
        const eventName = `embed-viz-event-payload-data-tree-${type}`;
        const topics = [`embed-viz-event-payload-data-tree-${type}`];
        
        console.log(`Requesting tree data from parent for type: ${type}`);
        console.log(`Event: ${eventName}`);
        
        // Show loading notification
        panelUtilsNs.showNotification('loading', `Loading ${type} data from parent...`);
        
        // Raise event to load data from parent
        window.Widgets.Widget.raiseEventDataRequest(eventName, topics, "load_data", type, (eventData) => {
            console.log(`Tree data response received for type: ${type}`, eventData);
            
            // Hide loading state
            ns.hideLoadingState();
            
            if (!eventData) {
                console.error("No event data received from parent");
                ns.showErrorMessage("Failed to load tree data from parent application");
                console.groupEnd();
                return;
            }
            
            if (eventData.error) {
                console.error("Tree data error from parent:", eventData.error);
                ns.showErrorMessage(`Failed to load tree data: ${eventData.error}`);
                console.groupEnd();
                return;
            }
            
            if (!eventData.data) {
                console.error("No tree data found in parent response");
                ns.showErrorMessage("No tree data available from parent application");
                console.groupEnd();
                return;
            }
            
            try {
                ns.loadData(eventData.data);
                console.log(`Tree data loaded successfully for type: ${type}`);
                
                // Show success notification
                panelUtilsNs.showNotification('success', `${type} data loaded successfully`);
            } catch (error) {
                console.error("Error loading tree data:", error);
                ns.showErrorMessage("Error processing tree data");
            }
            
            console.groupEnd();
        });
    };


    ns.drawTree = function(reset) {
        console.groupCollapsed(`Widgets.Panel.Tree.drawTree on ${window.location}`);

        console.log('ns.data->', ns.data);
        console.log('ns.tree_svg->', ns.tree_svg);

        //svg.selectAll("*").remove();
        
        console.log('ns.options.width->', ns.options.width)
        console.log('ns.options.height->', ns.options.height)        
        console.log('ns.$container.width()->', ns.$container.width())
        console.log('ns.$container.height()->', ns.$container.height())

        ns.options.width = ns.$container.width()
        ns.options.height = ns.$container.height()

        //cound nodes
        // let index = -1
        // ns.root.eachBefore(function (n) {
        //   ++index
        // }) // counts original number of items

        let indexLast = -1
        const nodes = ns.root.descendants().reverse()
        const links = ns.root.links()
    
        // Compute the new tree layout.
        ns.tree(ns.root)
    
        // node position function
        let index = -1
        ns.root.eachBefore(function (n) {
          n.x = ++index * ns.options.lineSpacing
          n.y = n.depth * ns.options.indentSpacing
        })
    
        const height = Math.max(
          ns.options.minHeight,
          index * ns.options.lineSpacing + ns.options.margin.top + ns.options.margin.bottom
        )
    
        console.log('-options.margin.left->', -ns.options.margin.left)
        console.log('-options.margin.top->', -ns.options.margin.top)
        console.log('options.width->', ns.options.width)
        console.log('options.svg_height->', ns.options.height)
    
        const transition = ns.tree_svg
          .transition()
          .duration(ns.options.duration)
        //   .attr('viewBox', [
        //     -ns.options.margin.left,
        //     -ns.options.margin.top,
        //     ,
        //     ,
        //   ])
          .tween('resize', window.ResizeObserver ? null : () => () => ns.tree_svg.dispatch('toggle'))
    
        ns.tree_svg
          .transition()
          .delay(indexLast < index ? 0 : ns.options.duration) // .delay(indexLast < index ? 0 : options.duration)
          .duration(0)
        //   .attr('viewBox', [
        //     -ns.options.margin.left,
        //     -ns.options.margin.top,
        //     ,
        //     ,
        //   ])
          .on('end', function (d) {

            console.log('tree_svg END', this.getBBox())
            console.log('tree_svg END', d3.select(ns.tree_svg))

            var vbox = this.getBBox();

            console.log('vbox.width->', vbox.width)
            console.log('vbox.height->', vbox.height)

            let scrollBarWidth = ns.$container.get(0).offsetWidth - ns.$container.get(0).clientWidth;

            console.log('scrollBarWidth->', scrollBarWidth)

            var paddingMultiplier = ns.$svg.find("image").length * 3;

            var newWidth = vbox.width + ns.options.margin.left + ns.options.margin.right + scrollBarWidth;
            var newHeight = vbox.height + ns.options.margin.top + ns.options.margin.bottom + scrollBarWidth + paddingMultiplier;

            console.log('ns.options.margin.top->', ns.options.margin.top)
            console.log('ns.options.margin.bottom->', ns.options.margin.bottom)

            console.log('vbox.width->', newWidth)
            console.log('vbox.height->', newHeight)
            console.log('ns.$svg.height()->', ns.$svg.height())
            
            ns.$svg.attr('width', newWidth)

            if (newHeight > ns.$svg.height()) {
                ns.$svg.attr('height', newHeight)
            }

            
          })
    
        // Update the nodes…
        const node = ns.gNode.selectAll('g').data(nodes, (d) => d.id)
    
        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node
          .enter()
          .append('g')
          .attr('id', 'node')
          .attr('class', 'node')
          .attr('transform', (d) => `translate(${d.y},${ns.root.x0})`)
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0)
          .on('click', (event, d) => {
    
            console.log('click d->', d)
            console.log('click d->', d.children)

            //raise event to load form for this content
            try {
                const formId = d.data.type
                const formData = d.data.original;
                if (formId) {
                    console.log('open form for type', formId, formData)
                    panelUtilsNs.openForm(formId, formData);
                }
            } catch (e) {
                console.error('could not get for type from Node', e);
            }
    
            d.children = d.children ? null : d._children
            //ns.update()
            ns.drawTree(true)
    
            // Update the charge and box elements for this specific node
            const nodeElement = d3.select(event.currentTarget);
            const chargeElement = nodeElement.select('text');
            const boxElement = nodeElement.select('rect');
            
            chargeElement
              .attr('fill', (d) =>
                d._children ? (d.children ? ns.minus.textFill : ns.plus.textFill) : 'none'
              )
              .text((d) => (d._children ? (d.children ? ns.minus.text : ns.plus.text) : ''))
    
            boxElement.attr('fill', (d) =>
              d._children ? (d.children ? ns.minus.shapeFill : ns.plus.shapeFill) : 'none'
            )
          })
    
        // check box
        let box = nodeEnter
          .append('rect')
          .attr('width', ns.options.boxSize)
          .attr('height', ns.options.boxSize)
          .attr('x', -ns.options.boxSize / 2)
          .attr('y', -ns.options.boxSize / 2)
          .attr('fill', (d) =>
            d._children ? (d.children ? ns.minus.shapeFill : ns.plus.shapeFill) : 'none'
          )
          .attr('stroke', (d) => (d._children ? panelUtilsNs.theme.checkColour : 'none'))
          .attr('stroke-width', 0.5)
    
        // check box symbol
        let charge = nodeEnter
          .append('text')
          .attr('x', 0)
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'central')
          .attr('fill', (d) => (d._children ? (d.children ? ns.minus.textFill : ns.plus.textFill) : 'none'))
          .text((d) => (d._children ? (d.children ? '−' : '+') : ''))
    
        // attach icon
        let image = nodeEnter
          .append('image')
          .attr('x', 10 + ns.options.boxSize / 2)
          .attr('y', -ns.options.icon_size / 2 - ns.options.boxSize / 2)
          .attr('xlink:href', function (d) {
            console.log('d->', d)
            // console.log('prefix->', ns.options.prefix, ', shape->', ns.options.shape)
            // console.log(ns.options.prefix + ns.options.shape + d.data.icon + '.svg')
            return ns.options.prefix + ns.options.shape + d.data.icon + '.svg'
          })
          .attr('width', function (d) {
            return ns.options.icon_size + 5
          })
          .attr('height', function (d) {
            return ns.options.icon_size + 5
          })
          .on('mouseover.tooltip', panelUtilsNs.mouseover)
          .on("mousemove", panelUtilsNs.mousemove)
          .on("mouseout.tooltip", panelUtilsNs.mouseleave)
          .on('contextmenu', panelUtilsNs.contextmenu);
    
        // label text
        let label = nodeEnter
          .append('text')
          .attr('x', ns.options.icon_size + 30 + ns.options.boxSize / 2)
          .attr('text-anchor', 'start')
          .style('font-size', ns.options.itemFont)
          .attr('dy', '0.32em')
          .text((d) => d.data.name)
    
        // Transition nodes to their new position.
        const nodeUpdate = node
          .merge(nodeEnter)
          .transition(transition)
          .attr('transform', (d) => `translate(${d.y},${d.x})`)
          .attr('fill-opacity', 1)
          .attr('stroke-opacity', 1)
    
        // Transition exiting nodes to the parent's new position.
        const nodeExit = node
          .exit()
          .transition(transition)
          .remove()
          .attr('transform', (d) => `translate(${d.y},${ns.root.x})`)
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0)
    
        // Update the links…
        const link = ns.gLink.selectAll('path').data(links, (d) => d.target.id)
    
        // Enter any new links at the parent's previous position.
        const linkEnter = link
          .enter()
          .append('path')
          .attr('stroke-opacity', 0)
          .attr('d', (d) =>
            panelUtilsNs.makeLink(
              [d.source.y, ns.root.x],
              [d.target.y + (d.target._children ? 0 : ns.options.boxSize / 2), ns.root.x],
              ns.options.radius
            )
          )
    
        // Transition links to their new position.
        link
          .merge(linkEnter)
          .transition(transition)
          .attr('stroke-opacity', 1)
          .attr('d', (d) =>
            panelUtilsNs.makeLink(
              [d.source.y, d.source.x],
              [d.target.y + (d.target._children ? 0 : ns.options.boxSize / 2), d.target.x],
              ns.options.radius
            )
          )
    
        // Transition exiting nodes to the parent's new position.
        link
          .exit()
          .transition(transition)
          .remove()
          .attr('stroke-opacity', 0)
          .attr('d', (d) =>
            panelUtilsNs.makeLink(
              [d.source.y, ns.root.x],
              [d.target.y + (d.target._children ? 0 : ns.options.boxSize / 2), ns.root.x],
              ns.options.radius
            )
          )
    
        // Stash the old positions for transition.
        ns.root.eachBefore((d) => {
          d.x0 = d.x
          d.y0 = d.y
        })
    
        indexLast = index // to know if viewbox is expanding or contracting
    


        console.groupEnd();
    }


    ns.init = function($component, options, $parent) {
            
        console.group(`Widgets.Panel.Tree.init on ${window.location}`);

        ns.$container = $component;

        //copy options into ns
        ns.options = Object.assign({}, options);

        if (!panelUtilsNs.theme) {
            if (ns.options.theme === 'light') {
                panelUtilsNs.theme = ns.options.light_theme
            } else {
                panelUtilsNs.theme = ns.options.dark_theme
            }
        }

        /// init svg
        ns.tree_svg = d3
            .select($component.get(0))
            .append('svg')
            .attr('class', 'tree_svg')
            .attr('id', 'tree_svg')
            .attr('width', $component.width())
            .attr('height', $component.height())
            // .on('mouseover', (d) => {
            //     console.log('svg mouseover->', d);
            //     panelUtilsNs.contentMenuItem = null;
            // })
            // .on('mousemove', (d) => {
            //     console.log('svg mouseover->', d);
            //     panelUtilsNs.contentMenuItem = null;
            // });

        console.log('tree_svg->', ns.tree_svg);

        ns.$svg = $component.find('svg');

        //init icons
        ns.plus = {
          shapeFill: panelUtilsNs.theme.checkColour,
          shapeStroke: panelUtilsNs.theme.checkColour,
          textFill: panelUtilsNs.theme.checkText,
          text: '+',
        }
        ns.minus = {
          shapeFill: panelUtilsNs.theme.checkColour,
          shapeStroke: panelUtilsNs.theme.checkColour,
          textFill: panelUtilsNs.theme.checkText,
          text: '−',
        }

        //update node config
        ns.tree = d3.tree().nodeSize([ns.options.lineSpacing, ns.options.indentSpacing])
        
        //resonsive size before icons had height =  Math.max(minHeight, index * lineSpacing + marginTop + marginBottom )
    
        console.log('options.height->', ns.options.height)
        console.log('options.width->', ns.options.width)
        
        //add context menu
        ns.$svg.simpleContextMenu({
            class: null,
            shouldShow: function () {
                // const shouldShow = (panelUtilsNs.contentMenuItem == null || panelUtilsNs.contentMenuItem == undefined) ? false : true;
                const shouldShow = !!panelUtilsNs.contentMenuItem;
                // console.log("context menu should show item shouldShow ", shouldShow, panelUtilsNs.contentMenuItem);
                return shouldShow;
            },
            heading: function () {
                return panelUtilsNs.contentMenuItem ? panelUtilsNs.contentMenuItem.data.name : '';
            },
            onShow: function () {
                            
                // console.log("context menu shown item: ", panelUtilsNs.contentMenuItem);
                panelUtilsNs.contentMenuActive = true;

                panelUtilsNs.hideTooltip();
    
            },
            onHide: function () {
                panelUtilsNs.contentMenuActive = false;
                // console.log("context menu hide", panelUtilsNs.contentMenuItem);
            },
            options: ns.menuItems,
        })

    
        //var default_data_url = ns.options.tree_data[ns.options.tree_data_default];

        //ns.updateTree(default_data_url);

        console.groupEnd();
    }

    
    /**
     * Load tree data directly from API in local mode with retry mechanism
     * @param {string} type - The tree data type (sighting, task, impact, event, me, company)
     * @param {number} retryCount - Current retry attempt (internal use)
     */
    ns.loadTreeDataFromAPI = function(type, retryCount = 0) {
        console.group(`Widgets.Panel.Tree.loadTreeDataFromAPI on ${window.location}`);
        console.log(`Function called with type: ${type}, retryCount: ${retryCount}`);
        
        // Show loading state first
        ns.showLoadingState();
        
        // Get API configuration from panel utils
        const apiConfig = panelUtilsNs.options.api;
        const apiBaseUrl = apiConfig.baseUrl;
        const apiEndpoint = apiConfig.endpoints.tree + type;
        const fullUrl = apiBaseUrl + apiEndpoint;
        
        console.log(`Loading tree data from API: ${fullUrl} (attempt ${retryCount + 1})`);
        console.log(`API Config:`, apiConfig);
        console.log(`Type: ${type}`);
        console.log(`Base URL: ${apiBaseUrl}`);
        console.log(`Endpoint: ${apiEndpoint}`);
        console.log(`Full URL: ${fullUrl}`);
        
        // Show loading notification
        panelUtilsNs.showNotification('loading', `Loading ${type} data...`);
        
        // Create fetch request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);
        
        console.log(`Making fetch request to: ${fullUrl}`);
        
        // Make API request using fetch
        fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            signal: controller.signal
        })
            .then(response => {
                clearTimeout(timeoutId);
                console.log("API response received:", response);
                console.log("Response status:", response.status);
                console.log("Response headers:", response.headers);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
                }
                
                return response.json();
            })
            .then(data => {
                console.log("Tree data loaded from API:", data);
                console.log("Data type:", typeof data);
                console.log("Data keys:", data ? Object.keys(data) : "null/undefined");
                
                // Hide loading state
                ns.hideLoadingState();
                
                // Process the data
                if (data && typeof data === "object") {
                    console.log("Calling ns.loadData with:", data);
                    ns.loadData(data);
                    console.log(`Tree data loaded successfully for type: ${type}`);
                    
                    // Show success notification
                    panelUtilsNs.showNotification('success', `${type} data loaded successfully`);
                } else {
                    throw new Error("Invalid data format received from API");
                }
            })
            .catch(error => {
                clearTimeout(timeoutId);
                console.error("Error loading tree data from API:", error);
                console.error("Error details:", {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });
                
                // Hide loading state
                ns.hideLoadingState();
                
                // Show error message
                let errorMessage = "Failed to load tree data";
                if (error.name === 'AbortError') {
                    errorMessage = "Request timed out";
                }
                // Always use user-friendly message for non-timeout errors
                console.log(`Showing error message: ${errorMessage}`);
                ns.showErrorMessage(errorMessage);
                // Always show error toast for test
                panelUtilsNs.showNotification('error', 'Failed to load tree data');
                
                // Check if we should retry
                if (retryCount < apiConfig.retryAttempts && 
                    (error.name === 'AbortError' || error.message.includes('500') || error.message.includes('502') || error.message.includes('503'))) {
                    const nextRetry = retryCount + 1;
                    const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
                    console.log(`Retrying API request in ${delay}ms (attempt ${nextRetry}/${apiConfig.retryAttempts})`);
                    // Show retry notification
                    panelUtilsNs.showNotification('warning', `Retrying in ${delay/1000}s... (${nextRetry}/${apiConfig.retryAttempts})`);
                    setTimeout(() => {
                        ns.loadTreeDataFromAPI(type, nextRetry);
                    }, delay);
                    return;
                }
                
                // Don't immediately fallback - let the error message be visible for a while
                console.log("API error handled, error message displayed - no immediate fallback");
            })
            .finally(() => {
                console.groupEnd();
            });
    };

    /**
     * Show loading state for tree panel
     */
    ns.showLoadingState = function() {
        const $treePanel = $(ns.selectorComponent);
        if ($treePanel.length) {
            $treePanel.addClass("loading");
            // Ensure tree panel has relative positioning for absolute children
            if ($treePanel.css("position") === "static") {
                $treePanel.css("position", "relative");
            }
            // Show loading message - centered overlay over the panel
            if (!$treePanel.find(".loading-message").length) {
                $treePanel.append('<div class="loading-message" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,255,255,0.95); padding: 20px 30px; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.3); z-index: 1000; font-size: 16px; font-weight: bold; color: #333; border: 1px solid #ddd; text-align: center; min-width: 200px;">Loading tree data...</div>');
            }
        }
        
        // Show loading notification if enabled
        panelUtilsNs.showNotification('loading', "Loading tree data...");
    };

    /**
     * Hide loading state for tree panel
     */
    ns.hideLoadingState = function() {
        const $treePanel = $(ns.selectorComponent);
        if ($treePanel.length) {
            $treePanel.removeClass("loading");
            // Clear loading message HTML
            $treePanel.find(".loading-message").remove();
        }
        
        // Dismiss all loading notifications
        if (panelUtilsNs && panelUtilsNs.dismissAllNotifications) {
            panelUtilsNs.dismissAllNotifications();
        } else {
            // Fallback: Remove all toast elements that contain "Loading" text
            const loadingToasts = document.querySelectorAll(".toastify");
            loadingToasts.forEach((toast) => {
                if (toast.textContent && toast.textContent.includes("Loading")) {
                    toast.remove();
                }
            });
        }
    };

    /**
     * Hide error message in tree panel
     */
    ns.hideErrorMessage = function() {
        const $treePanel = $(ns.selectorComponent);
        if ($treePanel.length) {
            // Remove error message overlay
            $treePanel.find(".error-message").remove();
        }
    };

    /**
     * Show error message in tree panel
     * @param {string} message - Error message to display
     */
    ns.showErrorMessage = function(message) {
        console.log(`showErrorMessage called with: ${message}`);
        const $treePanel = $(ns.selectorComponent);
        if ($treePanel.length) {
            console.log(`Tree panel found, setting error message: ${message}`);
            
            // Ensure tree panel has relative positioning for absolute children
            if ($treePanel.css("position") === "static") {
                $treePanel.css("position", "relative");
            }
            
            // Remove any existing error message
            $treePanel.find(".error-message").remove();
            
            // Add error message as small popup overlay (similar to loading message)
            $treePanel.append(`<div class="error-message" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,255,255,0.95); padding: 20px 30px; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.3); z-index: 1000; font-size: 16px; font-weight: bold; color: #d32f2f; border: 2px solid #d32f2f; text-align: center; min-width: 200px;">${message}</div>`);
            
            console.log(`Error message set, panel content:`, $treePanel.html());
        } else {
            console.warn(`Tree panel not found for selector: ${ns.selectorComponent}`);
        }
        
        // Show error notification if enabled
        panelUtilsNs.showNotification('error', message);
    };

    /**
     * Clear tree data and hide tree visualization
     */
    ns.clearData = function() {
        console.log("Clearing tree data");
        const $treePanel = $(ns.selectorComponent);
        if ($treePanel.length) {
            // Clear any existing tree content
            $treePanel.find(".tree-content").remove();
            $treePanel.find(".loading-message").remove();
            $treePanel.find(".error-message").remove();
            
            // Show empty state message
            if (!$treePanel.find(".empty-state").length) {
                $treePanel.append('<div class="empty-state" style="text-align: center; padding: 40px; color: #666; font-style: italic;">No tree data available</div>');
            }
        }
    };

    // check if query string contains local query parameter
    ns.isLocalMode = function() {
        const urlParams = new URLSearchParams(window.location.search);
        const localParam = urlParams.get('local');
        const isLocal = localParam === 'true';
        console.log(`isLocalMode check:`, {
            search: window.location.search,
            localParam: localParam,
            isLocal: isLocal
        });
        return isLocal;
    }

})(window.jQuery, window.Widgets.Panel.Tree, window.d3, window.Widgets.Panel.Utils, document, window)