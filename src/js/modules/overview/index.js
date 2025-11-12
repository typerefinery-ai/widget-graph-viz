// Overview visualization module (simulation-based)
(function($, loader, d3, document, window) {
    if (!loader) {
        console.error("WidgetLoader is required before registering visualizations.");
        return;
    }

    const defaultOptions = {
        width: 1000,
        height: 720,
        radius: 40,
        margin: { top: 30, right: 80, bottom: 30, left: 30 },
        assetPrefix: "https://raw.githubusercontent.com/os-threat/images/main/img/",
        iconShape: "rect-",
        tooltipClass: "overview-tooltip",
        cooldown: {
            alpha: 0.3,
            decay: 0.02,
        },
        localDataPath: "src/assets/data/unattached-force-graph.json",
        request: {
            eventName: "embed-viz-event-payload-data-unattached-force-graph",
            topics: ["embed-viz-event-payload-data-unattached-force-graph"],
            action: "load_data",
            id: "scratch",
            loadingMessage: "Loading graph data...",
            successMessage: "Graph data loaded successfully",
            errorMessage: "Failed to load data",
        },
    };

    const overviewVisualization = {
        id: "overview",
        version: "0.1.0",
        metadata: {
            displayName: "Overview Simulation",
            description: "Force-directed overview visualization derived from simulation.js.",
            supportedModes: ["local", "widget"],
            defaultOptions: { ...defaultOptions },
            defaultRequest: { ...defaultOptions.request },
        },
        lifecycle: {
            init(context) {
                const settings = {
                    ...defaultOptions,
                    ...(context.options || {}),
                };

                const container = document.createElement("div");
                container.className = "overview-simulation";
                container.style.position = "relative";
                context.root.appendChild(container);

                const svg = d3
                    .select(container)
                    .append("svg")
                    .attr("width", settings.width)
                    .attr("height", settings.height);

                const g = svg
                    .append("g")
                    .attr("transform", `translate(${settings.margin.left}, ${settings.margin.top})`);

                const tooltip = document.createElement("div");
                tooltip.className = settings.tooltipClass;
                tooltip.style.position = "absolute";
                tooltip.style.pointerEvents = "none";
                tooltip.style.background = "rgba(0, 0, 0, 0.75)";
                tooltip.style.color = "#fff";
                tooltip.style.padding = "6px 10px";
                tooltip.style.borderRadius = "4px";
                tooltip.style.fontSize = "12px";
                tooltip.style.opacity = "0";
                tooltip.style.transition = "opacity 120ms ease";
                container.appendChild(tooltip);

                const simulation = d3
                    .forceSimulation()
                    .force(
                        "link",
                        d3
                            .forceLink()
                            .id((d) => d.id)
                            .distance(() => settings.radius * 4)
                    )
                    .force("charge", d3.forceManyBody().strength(-500))
                    .force(
                        "center",
                        d3.forceCenter(
                            (settings.width - settings.margin.left - settings.margin.right) / 2,
                            (settings.height - settings.margin.top - settings.margin.bottom) / 2
                        )
                    );

                const state = {
                    settings,
                    container,
                    svg,
                    g,
                    tooltip,
                    simulation,
                    linksSelection: null,
                    nodesSelection: null,
                    edgepathsSelection: null,
                };

                context.state.set("overview", state);
                context.loader.registerCleanup(() => {
                    simulation.stop();
                    svg.remove();
                    container.remove();
                });

                // If the loader already has data, render immediately; otherwise request when appropriate.
                const currentData = context.loader.getCurrentData();
                if (currentData) {
                    overviewVisualization.lifecycle.loadData(context, currentData);
                } else if (context.mode.isLocal) {
                    fetch(settings.localDataPath)
                        .then((response) => response.json())
                        .then((localData) => {
                            overviewVisualization.lifecycle.loadData(context, localData);
                        })
                        .catch((error) => {
                            console.error("Failed to load local data for overview visualization", error);
                            context.showToast("error", "Failed to load local overview data");
                        });
                } else {
                    context.requestData();
                }
            },

            loadData(context, data) {
                const state = context.state.get("overview");
                if (!state) {
                    return;
                }

                const graph = normalizeGraph(data);
                state.simulation.nodes(graph.nodes);
                state.simulation.force("link").links(graph.edges);

                const links = state.g
                    .selectAll(".overview-link")
                    .data(graph.edges, (d) => `${d.source.id || d.source}-${d.target.id || d.target}`)
                    .join("line")
                    .attr("class", "overview-link")
                    .attr("stroke-width", 0.75)
                    .attr("stroke", "grey")
                    .attr("marker-end", "url(#overview-arrowhead)");

                state.linksSelection = links;

                const edgepaths = state.g
                    .selectAll(".overview-edgepath")
                    .data(graph.edges, (d) => `${d.source.id || d.source}-${d.target.id || d.target}`)
                    .join("path")
                    .attr("class", "overview-edgepath")
                    .attr("fill-opacity", 0)
                    .attr("stroke-opacity", 0)
                    .attr("pointer-events", "none");

                edgepaths
                    .selectAll("textPath")
                    .data((d, i) => [Object.assign({ id: i }, d)])
                    .join(
                        (enter) =>
                            enter
                                .append("textPath")
                                .attr("startOffset", "50%")
                                .style("text-anchor", "middle")
                                .style("pointer-events", "none")
                                .text((d) => d.label || ""),
                        (update) => update.text((d) => d.label || "")
                    );

                state.edgepathsSelection = edgepaths;

                const nodes = state.g
                    .selectAll(".overview-node")
                    .data(graph.nodes, (d) => d.id)
                    .join("image")
                    .attr("class", "overview-node")
                    .attr("width", state.settings.radius + 5)
                    .attr("height", state.settings.radius + 5)
                    .attr("xlink:href", (d) =>
                        `${state.settings.assetPrefix}${state.settings.iconShape}${d.icon || "default"}.svg`
                    )
                    .call(
                        d3
                            .drag()
                            .on("start", (d) => {
                                if (!d3.event.active) {
                                    state.simulation.alphaTarget(state.settings.cooldown.alpha).restart();
                                }
                                d.fx = d.x;
                                d.fy = d.y;
                            })
                            .on("drag", (d) => {
                                d.fx = d3.event.x;
                                d.fy = d3.event.y;
                            })
                            .on("end", (d) => {
                                if (!d3.event.active) {
                                    state.simulation.alphaTarget(0);
                                }
                                d.fx = null;
                                d.fy = null;
                            })
                    )
                    .on("mouseover", function(d) {
                        state.tooltip.style.opacity = "1";
                        state.tooltip.textContent = d.name || d.id;
                    })
                    .on("mousemove", function() {
                        state.tooltip.style.left = `${d3.event.offsetX + 12}px`;
                        state.tooltip.style.top = `${d3.event.offsetY + 12}px`;
                    })
                    .on("mouseout", function() {
                        state.tooltip.style.opacity = "0";
                    });

                state.nodesSelection = nodes;

                ensureArrowhead(state);

                state.simulation.on("tick", () => {
                    links
                        .attr("x1", (d) => d.source.x)
                        .attr("y1", (d) => d.source.y)
                        .attr("x2", (d) => d.target.x)
                        .attr("y2", (d) => d.target.y);

                    nodes
                        .attr("x", (d) => d.x - state.settings.radius / 2)
                        .attr("y", (d) => d.y - state.settings.radius / 2);

                    edgepaths.attr("d", (d) => {
                        if (!(d.source && d.target)) {
                            return "M 0 0 L 0 0";
                        }
                        return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
                    });
                });

                context.loader.setCurrentData(graph);
            },

            refresh(context) {
                context.requestData();
            },

            destroy(context) {
                const state = context.state.get("overview");
                if (state) {
                    state.simulation.stop();
                    if (state.container && state.container.parentNode) {
                        state.container.parentNode.removeChild(state.container);
                    }
                }
            },
        },
    };

    loader.registerVisualization(overviewVisualization);

    function ensureArrowhead(state) {
        const defs =
            state.svg.select("defs").empty() ? state.svg.append("defs") : state.svg.select("defs");
        const selector = "#overview-arrowhead";
        if (!defs.select(selector).empty()) {
            return;
        }

        defs
            .append("marker")
            .attr("id", "overview-arrowhead")
            .attr("viewBox", "-0 -5 10 10")
            .attr("refX", state.settings.radius * 1.25)
            .attr("refY", 0)
            .attr("orient", "auto")
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .attr("xoverflow", "visible")
            .append("svg:path")
            .attr("d", "M 0,-5 L 10 ,0 L 0,5")
            .attr("fill", "#999")
            .style("stroke", "none");
    }

    function normalizeGraph(rawData) {
        if (!rawData) {
            return { nodes: [], edges: [] };
        }
        if (rawData.nodes && rawData.edges) {
            return rawData;
        }
        if (rawData.children && Array.isArray(rawData.children)) {
            return convertTreeToGraph(rawData);
        }
        return createDefaultGraphData(rawData);
    }

    function convertTreeToGraph(treeData) {
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
    }

    function createDefaultGraphData(data) {
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
    }
})(window.jQuery, window.Widgets.Loader, window.d3, document, window);

