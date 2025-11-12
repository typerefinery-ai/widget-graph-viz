// Example visualization module demonstrating minimal interface.
(function($, loader, document, window) {
    if (!loader) {
        console.error("WidgetLoader is required before registering visualizations.");
        return;
    }

    const exampleVisualization = {
        id: "example",
        version: "0.1.0",
        metadata: {
            displayName: "Example Visualization",
            description: "Minimal blueprint visualization that renders basic placeholder content.",
            supportedModes: ["local", "widget"],
            defaultOptions: {},
        },
        lifecycle: {
            init(context) {
                const $host = $(context.host);
                const placeholder = document.createElement("div");
                placeholder.setAttribute("data-example-viz", "");
                placeholder.style.padding = "24px";
                placeholder.style.textAlign = "center";
                placeholder.style.color = "#666";
                placeholder.textContent = "Example visualization mounted.";
                context.root.appendChild(placeholder);

                context.state.set("placeholder", placeholder);
                context.loader.registerCleanup(() => {
                    placeholder.remove();
                });
            },
            loadData(context, data) {
                const placeholder = context.state.get("placeholder");
                if (placeholder) {
                    placeholder.textContent = `Example visualization received data: ${JSON.stringify(data).slice(0, 120)}...`;
                }
            },
            refresh(context) {
                context.showToast("info", "Example visualization refresh requested.");
            },
            destroy(context) {
                const placeholder = context.state.get("placeholder");
                if (placeholder) {
                    placeholder.remove();
                }
            },
        },
    };

    loader.registerVisualization(exampleVisualization);
})(window.jQuery, window.Widgets.Loader, document, window);

