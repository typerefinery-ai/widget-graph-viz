// Compose visualization module registration
(function($, loader, document, window) {
    if (!loader) {
        console.error("WidgetLoader is required before registering visualizations.");
        return;
    }

    const defaultRequestConfig = {
        eventName: "embed-viz-event-payload-data-unattached-force-graph",
        topics: ["embed-viz-event-payload-data-unattached-force-graph"],
        action: "load_data",
        id: "scratch",
        loadingMessage: "Loading graph data...",
        successMessage: "Graph data loaded successfully",
        errorMessage: "Failed to load data",
    };

    const composeVisualization = {
        id: "compose",
        version: "1.0.0",
        metadata: {
            displayName: "Graph Composer",
            description: "Panel-based visualization layout.",
            supportedModes: ["local", "widget"],
            defaultOptions: {
                request: { ...defaultRequestConfig },
                dataRequest: {
                    ...defaultRequestConfig,
                },
            },
            defaultRequest: { ...defaultRequestConfig },
        },
        lifecycle: {
            init(context) {
                const $component = $(context.host);
                const d3 = window.d3;
                const panelUtilsNs = getPanelUtils();
                const panelFilterNs = getPanelFilter();
                const panelTreeNs = getPanelTree();
                const panelPromoNs = getPanelPromo();
                const panelScratchNs = getPanelScratch();

                const dependenciesReady =
                    panelUtilsNs &&
                    panelFilterNs &&
                    panelTreeNs &&
                    panelPromoNs &&
                    panelScratchNs &&
                    typeof panelUtilsNs.showNotification === "function" &&
                    typeof panelFilterNs.init === "function" &&
                    typeof panelTreeNs.init === "function" &&
                    typeof panelPromoNs.init === "function" &&
                    typeof panelScratchNs.init === "function";

                if (!dependenciesReady) {
                    const retryKey = "__composeInitRetry";
                    const attempts = context.state.get(retryKey) || 0;
                    if (attempts < 10) {
                        context.state.set(retryKey, attempts + 1);
                        setTimeout(() => composeVisualization.lifecycle.init(context), 50);
                        return;
                    }
                    console.error("Compose visualization dependencies are not ready after retries.", {
                        panelUtilsNs,
                        panelFilterNs,
                        panelTreeNs,
                        panelPromoNs,
                        panelScratchNs,
                    });
                    return;
                }
                context.state.delete("__composeInitRetry");

                if (
                    !panelUtilsNs ||
                    !panelFilterNs ||
                    !panelTreeNs ||
                    !panelPromoNs ||
                    !panelScratchNs ||
                    typeof panelFilterNs.init !== "function" ||
                    typeof panelTreeNs.init !== "function" ||
                    typeof panelPromoNs.init !== "function" ||
                    typeof panelScratchNs.init !== "function"
                ) {
                    console.error("Compose visualization dependencies are not ready.", {
                        panelUtilsNs,
                        panelFilterNs,
                        panelTreeNs,
                        panelPromoNs,
                        panelScratchNs,
                    });
                    return;
                }

                if (!panelUtilsNs.theme) {
                    panelUtilsNs.theme = panelUtilsNs.options.theme === "light"
                        ? panelUtilsNs.options.light_theme
                        : panelUtilsNs.options.dark_theme;
                }

                const tooltip = d3
                    .select("body")
                    .append("div")
                    .attr("class", "tooltip")
                    .attr("id", "tooltip")
                    .style("display", "block")
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("background-color", panelUtilsNs.theme.tooltip.fill)
                    .style("border", "solid")
                    .style("border-width", panelUtilsNs.theme.tooltip.stroke)
                    .style("border-color", panelUtilsNs.theme.tooltip.scolour)
                    .style("border-radius", panelUtilsNs.theme.tooltip.corner)
                    .style("max-width", panelUtilsNs.theme.tooltip.maxwidth)
                    .style("overflow-x", panelUtilsNs.theme.tooltip.overeflow)
                    .style("padding", panelUtilsNs.theme.tooltip.padding)
                    .style("opacity", 0);

                window.Widgets.Widget.tooltip = tooltip;
                context.state.set("tooltip", tooltip);
                context.loader.registerCleanup(() => {
                    tooltip.remove();
                    $component.off("mouseover.compose");
                });

                const $treePanel = $component.find(panelTreeNs.selectorComponent);
                panelTreeNs.init($treePanel, window.Widgets.Panel.Utils.options, $component.closest('[component="graphviz"]'));

                const $filterPanel = $component.find(panelFilterNs.selectorComponent);
                panelFilterNs.init($filterPanel, window.Widgets.Panel.Utils.options);

                const $promoPanel = $component.find(panelPromoNs.selectorComponent);
                panelPromoNs.init($promoPanel, window.Widgets.Panel.Utils.options);

                const $scratchPanel = $component.find(panelScratchNs.selectorComponent);
                panelScratchNs.init($scratchPanel, window.Widgets.Panel.Utils.options);

                $component.on("mouseover.compose", function() {
                    panelUtilsNs.hideTooltip();
                });

                const isLocal = panelTreeNs.isLocalMode();
                if (isLocal) {
                    setTimeout(() => {
                        const defaultType = panelUtilsNs.options.tree_data_default || "sighting";
                        panelTreeNs.updateTree(defaultType);
                    }, 100);
                } else {
                    context.requestData();
                }
            },

            loadData(context, data) {
                const panelUtilsNs = getPanelUtils();
                const panelPromoNs = getPanelPromo();
                const panelScratchNs = getPanelScratch();

                let graphData = data;
                if (!graphData || typeof graphData !== "object") {
                    graphData = composeVisualization.helpers.createDefaultGraphData({ name: "Unknown Data" });
                } else if (!graphData.nodes || !graphData.edges) {
                    if (graphData.children && Array.isArray(graphData.children)) {
                        graphData = composeVisualization.helpers.convertTreeToGraph(graphData);
                    } else {
                        graphData = composeVisualization.helpers.createDefaultGraphData(graphData);
                    }
                }

                context.loader.setCurrentData(graphData);

                panelUtilsNs.processGraphData(graphData);
                panelPromoNs.simGraph();
                panelPromoNs.showGraph();
                panelScratchNs.simGraph();
                panelScratchNs.showGraph();
            },

            refresh(context) {
                context.requestData();
            },

            destroy(context) {
                const panelUtilsNs = getPanelUtils();

                const tooltip = context.state.get("tooltip");
                if (tooltip) {
                    tooltip.remove();
                }
                panelUtilsNs.hideTooltip();
            },
        },
        helpers: {
            convertTreeToGraph(treeData) {
                const nodes = [];
                const edges = [];
                const nodeMap = new Map();

                function processNode(node, parentId = null) {
                    const nodeId = node.id || `node-${nodes.length}`;

                    if (!nodeMap.has(nodeId)) {
                        nodes.push({
                            id: nodeId,
                            name: node.name || node.heading || nodeId,
                            type: node.type || "unknown",
                            icon: node.icon || "default",
                            description: node.description || "",
                            original: node.original || {},
                        });
                        nodeMap.set(nodeId, true);
                    }

                    if (parentId) {
                        edges.push({
                            source: parentId,
                            target: nodeId,
                            type: "parent-child",
                        });
                    }

                    if (node.children && Array.isArray(node.children)) {
                        node.children.forEach((child) => processNode(child, nodeId));
                    }
                }

                processNode(treeData);
                return { nodes, edges };
            },

            createDefaultGraphData(data) {
                const nodes = [];
                const edges = [];

                const defaultNode = {
                    id: "default-node",
                    name: data.name || data.heading || "Data Node",
                    type: data.type || "default",
                    icon: data.icon || "default",
                    description: data.description || "Default data node",
                    original: data,
                };

                nodes.push(defaultNode);

                if (data && typeof data === "object") {
                    Object.keys(data).forEach((key) => {
                        if (["name", "heading", "type", "icon", "description", "children", "nodes", "edges"].includes(key)) {
                            return;
                        }

                        const propertyNode = {
                            id: `property-${key}`,
                            name: key,
                            type: "property",
                            icon: "property",
                            description: `Property: ${key}`,
                            original: { value: data[key] },
                        };

                        nodes.push(propertyNode);
                        edges.push({
                            source: "default-node",
                            target: `property-${key}`,
                            type: "has-property",
                        });
                    });
                }

                return { nodes, edges };
            },
        },
    };

    loader.registerVisualization(composeVisualization);

    // compatibility helpers for legacy modules
    window.Widgets.Widget.convertTreeToGraph = composeVisualization.helpers.convertTreeToGraph;
    window.Widgets.Widget.createDefaultGraphData = composeVisualization.helpers.createDefaultGraphData;

    // workbench simulation controls
    window.addEventListener("message", function(event) {
        let eventData = event.data;
        if (typeof eventData === "string") {
            try {
                eventData = JSON.parse(eventData);
            } catch (error) {
                // ignore
            }
        }
        if (!eventData || typeof eventData !== "object") {
            return;
        }
        switch (eventData.type) {
            case "SIMULATE_ERROR":
                panelUtilsNs.showNotification("error", eventData.payload && eventData.payload.message ? eventData.payload.message : "Simulated error received");
                break;
            case "SIMULATE_TIMEOUT":
                panelUtilsNs.showNotification("error", eventData.payload && eventData.payload.message ? eventData.payload.message : "Simulated timeout received");
                break;
            case "SIMULATE_CRASH":
                panelUtilsNs.showNotification("error", eventData.payload && eventData.payload.message ? eventData.payload.message : "Simulated crash received");
                break;
            case "RELOAD_WIDGET":
                panelUtilsNs.showNotification("info", eventData.payload && eventData.payload.message ? eventData.payload.message : "Widget reload triggered");
                setTimeout(() => {
                    window.location.reload();
                }, 500);
                break;
            default:
                break;
        }
    });
})(
    window.jQuery,
    window.Widgets.Loader,
    document,
    window
);

function getPanelRoot() {
    return window.Widgets.Panel || {};
}

function getPanelUtils() {
    return getPanelRoot().Utils || {};
}

function getPanelFilter() {
    return getPanelRoot().Filter || {};
}

function getPanelTree() {
    return getPanelRoot().Tree || {};
}

function getPanelPromo() {
    return getPanelRoot().Promo || {};
}

function getPanelScratch() {
    return getPanelRoot().Scratch || {};
}

