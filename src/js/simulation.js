window.Widgets = window.Widgets || {};
window.Widgets.Simulation = window.Widgets.Simulation || {};

(function($, ns, loader, visualizationsNs, document, window) {
    "use strict";

    const OVERVIEW_ID = "overview";

    ns.init = function($component, options) {
        if (!loader) {
            console.error("WidgetLoader is required to mount the overview visualization from simulation.js");
            return;
        }

        const $host = ensureComponent($component, options);
        logDeprecationWarning();

        try {
            loader.mountComponent($host);
        } catch (error) {
            console.error("Failed to mount overview visualization via simulation.js bridge", error);
        }
    };

    ns.loadFromData = function($component, data) {
        if (!loader) {
            console.error("WidgetLoader is required to load data into the overview visualization.");
            return;
        }

        const instance = resolveInstance($component);
        if (!instance) {
            console.warn("No overview visualization instance available for Widgets.Simulation.loadFromData.");
            return;
        }

        const helpers = getOverviewHelpers();
        const normalizedData = helpers && typeof helpers.normalizeGraph === "function"
            ? helpers.normalizeGraph(data)
            : data;

        try {
            instance.visualization.lifecycle.loadData(instance.context, normalizedData);
        } catch (error) {
            console.error("Overview visualization loadData failed via simulation.js bridge.", error);
        }
    };

    ns.configure = function(options) {
        if (!loader) {
            return {};
        }
        const helpers = getOverviewHelpers();
        const defaults = helpers && helpers.defaultOptions ? helpers.defaultOptions : {};
        loader.configure({ defaultVisualizationId: OVERVIEW_ID });
        return Object.assign({}, defaults, options || {});
    };

    function ensureComponent($component, options) {
        const $host = $component && $component.length > 0 ? $component : $('[data-widget-root]');
        if ($host.length === 0) {
            throw new Error("Widgets.Simulation.init requires a component element.");
        }
        $host.attr("data-visualization", OVERVIEW_ID);
        if (options && typeof options === "object") {
            $host.attr("data-visualization-options", JSON.stringify(options));
        }
        return $host;
    }

    function resolveInstance($component) {
        const hostElement = $component && $component.length ? $component.get(0) : null;

        if (loader.getActiveInstance) {
            const active = loader.getActiveInstance();
            if (active && (!hostElement || active.host === hostElement) && active.id === OVERVIEW_ID) {
                return active;
            }
        }

        if (loader._instances && hostElement && loader._instances.has(hostElement)) {
            const instance = loader._instances.get(hostElement);
            if (instance && instance.id === OVERVIEW_ID) {
                return instance;
            }
        }

        return null;
    }

    function getOverviewHelpers() {
        return visualizationsNs && visualizationsNs.Overview ? visualizationsNs.Overview : null;
    }

    function logDeprecationWarning() {
        if (!window.__simulationDeprecationWarningLogged) {
            console.warn(
                "window.Widgets.Simulation is deprecated. Use WidgetLoader with the 'overview' visualization module instead."
            );
            window.__simulationDeprecationWarningLogged = true;
        }
    }
})(window.jQuery, window.Widgets.Simulation, window.Widgets.Loader, (window.Widgets && window.Widgets.Visualizations) || {}, document, window);
