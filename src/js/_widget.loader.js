// Loader core for widget visualizations
window.Widgets = window.Widgets || {};

(function($, document, window) {
    "use strict";

    const loaderConfig = {
        selector: '[data-widget-root]',
        fallbackSelectors: ['[component="graphviz"]'],
        defaultVisualizationId: null,
    };

    const visualizations = new Map();
    const instances = new Map();
    const listeners = new Map();

    let bootstrapScheduled = false;
    let bootstrapped = false;
    let eventListenerRegistered = false;
    let activeInstance = null;

    const loader = {
        config: loaderConfig,
        configure,
        get defaultVisualizationId() {
            return loaderConfig.defaultVisualizationId;
        },
        set defaultVisualizationId(value) {
            loaderConfig.defaultVisualizationId = value;
        },
        registerVisualization,
        mountComponent,
        getActiveInstance: () => activeInstance,
        _instances: instances, // exposed for debugging until refactor complete
    };

    window.Widgets.Loader = loader;

    // compatibility bridge for legacy modules
    const compatibility = window.Widgets.Widget = window.Widgets.Widget || {};

    function registerVisualization(definition) {
        if (!definition || typeof definition !== "object") {
            throw new Error("Visualization definition must be an object");
        }
        if (typeof definition.id !== "string") {
            throw new Error("Visualization definition requires an 'id' string");
        }
        if (!definition.lifecycle || typeof definition.lifecycle.init !== "function") {
            throw new Error(`Visualization '${definition.id}' must provide a lifecycle with at least an init(context) function`);
        }

        visualizations.set(definition.id, {
            id: definition.id,
            version: definition.version || "0.0.0",
            metadata: definition.metadata || {},
            lifecycle: definition.lifecycle,
        });

        if (!loaderConfig.defaultVisualizationId) {
            loaderConfig.defaultVisualizationId = definition.id;
        }

        if (!bootstrapScheduled) {
            scheduleBootstrap();
        }

        reconcileInstances(definition.id);
    }

    function configure(config = {}) {
        if (config.selector) {
            loaderConfig.selector = config.selector;
        }
        if (Array.isArray(config.fallbackSelectors)) {
            loaderConfig.fallbackSelectors = config.fallbackSelectors;
        }
        if (typeof config.defaultVisualizationId === "string") {
            loaderConfig.defaultVisualizationId = config.defaultVisualizationId;
        }
    }

    function scheduleBootstrap() {
        if (bootstrapScheduled) {
            return;
        }
        bootstrapScheduled = true;
        if (document.readyState !== "loading") {
            bootstrap();
        } else {
            document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
        }
    }

    function bootstrap() {
        if (bootstrapped) {
            return;
        }
        bootstrapped = true;

        const componentsNs = getComponentsNs();
        if (!componentsNs || typeof componentsNs.watchDOMForComponent !== "function") {
            console.error("Widgets namespace is missing watchDOMForComponent");
            return;
        }

        const selectorSet = new Set();
        if (loaderConfig.selector) {
            selectorSet.add(loaderConfig.selector);
        }
        (loaderConfig.fallbackSelectors || []).forEach((selector) => {
            if (selector) {
                selectorSet.add(selector);
            }
        });

        selectorSet.forEach((selector) => {
            componentsNs.watchDOMForComponent(selector, function($component) {
                mountComponent($component);
            });
        });

        ensureGlobalEventListener();

        // compatibility API for legacy modules that still rely on window.Widgets.Widget.*
        compatibility.raiseEventDataRequest = function(eventName, topics, eventAction, id, callbackFn) {
            const instance = loader.getActiveInstance();
            if (!instance) {
                console.warn("No active widget instance to raise event from.");
                return;
            }
            raiseEventDataRequest(instance, eventName, topics, eventAction, id, callbackFn);
        };

        compatibility.loadData = function(data) {
            const instance = loader.getActiveInstance();
            if (!instance) {
                console.warn("No active widget instance to load data into.");
                return;
            }
            handleData(instance, data);
        };
    }

    function ensureGlobalEventListener() {
        if (eventListenerRegistered) {
            return;
        }
        const eventsNs = getEventsNs();
        if (!eventsNs || typeof eventsNs.windowListener !== "function") {
            console.error("Events namespace is missing windowListener");
            return;
        }

        eventsNs.windowListener(function(eventData) {
            try {
                dispatchToListeners(eventData);
                handleGlobalRefresh(eventData);
            } catch (error) {
                console.error("WidgetLoader global event listener error", error);
            }
        });
        eventListenerRegistered = true;
    }

    function dispatchToListeners(eventData) {
        const dataEventName = eventData.type || eventData.topicName || "";
        const action = eventData.action;
        const configAction = eventData.config && eventData.config.action ? eventData.config.action : "";
        const payloadAction = eventData.payload && eventData.payload.action ? eventData.payload.action : "";

        listeners.forEach(function(listener) {
            const match =
                dataEventName === listener.eventName ||
                listener.topics.includes(dataEventName) ||
                action === listener.eventAction ||
                configAction === listener.eventAction ||
                payloadAction === listener.eventAction;
            if (match) {
                listener.callback(eventData);
            }
        });
    }

    function handleGlobalRefresh(eventData) {
        if (eventData.action !== "DATA_REFRESH") {
            return;
        }

        instances.forEach(function(instance) {
            if (eventData.data) {
                handleData(instance, eventData.data, { emitSuccessToast: true });
            } else {
                requestData(instance);
            }
        });
    }

    function resolveVisualizationId($component) {
        const datasetViz = $component.data("visualization");
        if (typeof datasetViz === "string" && datasetViz.length > 0) {
            return datasetViz;
        }

        const query = new URLSearchParams(window.location.search);
        const queryViz = query.get("viz");
        if (queryViz) {
            return queryViz;
        }

        if (loaderConfig.defaultVisualizationId) {
            return loaderConfig.defaultVisualizationId;
        }

        const firstViz = visualizations.keys().next();
        if (!firstViz.done) {
            return firstViz.value;
        }

        return null;
    }

    function resolveOptions($component, metadata = {}) {
        const resolved = {};
        if (metadata.defaultOptions) {
            Object.assign(resolved, metadata.defaultOptions);
        }

        const attrOptions = $component.attr("data-visualization-options");
        if (attrOptions) {
            try {
                Object.assign(resolved, JSON.parse(attrOptions));
            } catch (error) {
                console.warn("Failed to parse data-visualization-options JSON", error);
            }
        }

        const query = new URLSearchParams(window.location.search);
        const queryOptions = query.get("vizOptions");
        if (queryOptions) {
            try {
                Object.assign(resolved, JSON.parse(queryOptions));
            } catch (error) {
                console.warn("Failed to parse vizOptions query JSON", error);
            }
        }

        return resolved;
    }

    function mountComponent($component) {
        if (!$component || $component.length === 0) {
            return;
        }

        if ($component.data("widget-loader-initialized")) {
            return;
        }
        $component.data("widget-loader-initialized", true);

        const hostElement = $component.get(0);
        const visualizationId = resolveVisualizationId($component);
        let visualization = visualizationId ? visualizations.get(visualizationId) : undefined;
        if (!visualization && loaderConfig.defaultVisualizationId) {
            visualization = visualizations.get(loaderConfig.defaultVisualizationId);
        }
        if (!visualization) {
            const first = visualizations.values().next();
            if (!first.done) {
                visualization = first.value;
            }
        }

        if (!visualization) {
            console.error(`No visualization registered for id '${visualizationId}'`);
            return;
        }

        const options = resolveOptions($component, visualization.metadata);
        const instance = {
            id: visualization.id,
            requestedId: visualizationId,
            host: hostElement,
            $host: $component,
            visualization,
            options,
            state: new Map(),
            cleanup: [],
            currentData: null,
        };

        instances.set(hostElement, instance);
        activeInstance = instance;

        const context = createContext(instance);
        instance.context = context;

        try {
            visualization.lifecycle.init(context);
        } catch (error) {
            console.error(`Visualization '${visualization.id}' init failed`, error);
        }
    }

    function getPanelUtils() {
        return (window.Widgets.Panel && window.Widgets.Panel.Utils) || {};
    }

    function getNotificationsNs() {
        return window.Widgets.Notifications || {};
    }

    function createContext(instance) {
        const query = new URLSearchParams(window.location.search);
        const isLocal = query.get("local") === "true";

        const panelUtilsNs = getPanelUtils();
        const notificationsNs = getNotificationsNs();
        const eventsNs = getEventsNs();

        const loaderServices = {
            registerCleanup: (fn) => {
                if (typeof fn === "function") {
                    instance.cleanup.push(fn);
                }
            },
            getConfig: () => Object.assign({}, instance.options),
            updateConfig: (delta = {}) => {
                Object.assign(instance.options, delta);
            },
            getCurrentData: () => instance.currentData,
            setCurrentData: (data) => {
                instance.currentData = data;
            },
        };

        const context = {
            id: instance.id,
            root: instance.host,
            host: instance.host,
            loader: loaderServices,
            utils: panelUtilsNs,
            events: eventsNs,
            notifications: notificationsNs,
            mode: {
                isLocal,
                isWidget: !isLocal,
                query,
            },
            options: instance.options,
            state: instance.state,
            setLoading: (message) => getPanelUtils().showNotification("loading", message || "Loading..."),
            clearLoading: () => {
                const utils = getPanelUtils();
                if (typeof utils.dismissAllNotifications === "function") {
                    utils.dismissAllNotifications();
                } else {
                    const loadingToasts = document.querySelectorAll(".toastify");
                    loadingToasts.forEach((toast) => {
                        if (toast.textContent && toast.textContent.includes("Loading")) {
                            toast.remove();
                        }
                    });
                }
            },
            showToast: (type, message) => getPanelUtils().showNotification(type, message),
            requestData: (override) => requestData(instance, override),
        };

        return context;
    }

    function requestData(instance, override = {}) {
        const baseRequest =
            (instance.options && (instance.options.request || instance.options.dataRequest)) ||
            (instance.visualization.metadata && instance.visualization.metadata.defaultRequest) ||
            null;

        const config = {
            ...(baseRequest || {}),
            ...(override || {}),
        };

        if (!config.eventName || !config.action || !config.id) {
            console.warn(`Visualization '${instance.id}' requestData configuration missing required fields`, config);
            return;
        }

        instance.context.setLoading(config.loadingMessage);

        raiseEventDataRequest(
            instance,
            config.eventName,
            Array.isArray(config.topics) && config.topics.length > 0 ? config.topics : [config.eventName],
            config.action,
            config.id,
            function(eventData) {
                instance.context.clearLoading();

                if (!eventData) {
                    instance.context.showToast("error", config.errorMessage);
                    return;
                }

                if (eventData.error) {
                    instance.context.showToast("error", `${config.errorMessage}: ${eventData.error}`);
                    return;
                }

                if (eventData.data) {
                    handleData(instance, eventData.data, { emitSuccessToast: true, successMessage: config.successMessage });
                } else {
                    instance.context.showToast("error", config.errorMessage);
                }
            }
        );
    }

    function handleData(instance, rawData, options = {}) {
        instance.loader = instance.loader || {};
        instance.currentData = rawData;

        if (instance.visualization.lifecycle && typeof instance.visualization.lifecycle.loadData === "function") {
            try {
                instance.visualization.lifecycle.loadData(instance.context, rawData);
                if (options.emitSuccessToast && options.successMessage) {
                    instance.context.showToast("success", options.successMessage);
                }
            } catch (error) {
                console.error(`Visualization '${instance.id}' loadData failed`, error);
                instance.context.showToast("error", "Failed to render visualization data");
            }
        }
    }

    function raiseEventDataRequest(instance, eventName, topics = [], eventAction, id, callbackFn) {
        const componentId = `${id}-${eventName}-${eventAction}`;
        const payload = {
            action: eventAction,
            id,
            type: "load",
        };

        if (callbackFn) {
            listeners.set(componentId, {
                componentId,
                eventAction,
                topics,
                eventName,
                id,
                callback: callbackFn,
            });
        }

        const eventsNs = getEventsNs();
        if (!eventsNs || typeof eventsNs.compileEventData !== "function") {
            console.error("Events namespace not ready for compileEventData");
            return;
        }
        const eventCompileData = eventsNs.compileEventData(payload, eventName, "DATA_REQUEST", componentId, "");
        if (typeof eventsNs.raiseEvent === "function") {
            eventsNs.raiseEvent(eventName, eventCompileData);
        } else {
            console.error("Events namespace missing raiseEvent");
        }
    }

    function mountComponentCleanup(instance) {
        if (!instance.cleanup || instance.cleanup.length === 0) {
            return;
        }
        instance.cleanup.forEach((fn) => {
            try {
                fn();
            } catch (error) {
                console.error("WidgetLoader cleanup function error", error);
            }
        });
        instance.cleanup = [];
    }

    // expose destroy in case we need manual unmount in future refactors
    loader.destroy = function(hostElement) {
        const instance = instances.get(hostElement);
        if (!instance) {
            return;
        }

        if (instance.visualization.lifecycle && typeof instance.visualization.lifecycle.destroy === "function") {
            try {
                instance.visualization.lifecycle.destroy(instance.context);
            } catch (error) {
                console.error(`Visualization '${instance.id}' destroy failed`, error);
            }
        }

        mountComponentCleanup(instance);
        instances.delete(hostElement);
        $(hostElement).removeData("widget-loader-initialized");
        if (activeInstance === instance) {
            activeInstance = null;
        }
    };

    function getComponentsNs() {
        return window.Widgets || {};
    }

    function getEventsNs() {
        return window.Widgets.Events || {};
    }

    function reconcileInstances(newVisualizationId) {
        instances.forEach((instance, hostElement) => {
            if (instance.requestedId === newVisualizationId && instance.id !== newVisualizationId) {
                loader.destroy(hostElement);
                mountComponent($(hostElement));
            }
        });
    }

})(window.jQuery, document, window);

