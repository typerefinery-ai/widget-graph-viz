---
title: Compose Visualization Module
description: Documentation for the panel-based compose visualization registered with WidgetLoader.
---

# Compose Visualization

The compose visualization (`id: "compose"`) reproduces the original panel-based widget experience (tree, filter, promo, scratch panels). It is located at `src/js/modules/compose/`.

## Lifecycle Summary

| Lifecycle | Responsibility |
|-----------|----------------|
| `init(context)` | Bootstraps D3 tooltip, initializes each panel namespace, wires tooltip suppression, and triggers the first data load (local mode uses fixtures, widget mode sends a `DATA_REQUEST`). Includes a retry loop (10 attempts) to wait for panel namespaces to attach to `window.Widgets.Panel.*`. |
| `loadData(context, data)` | Normalizes incoming payload into node/edge format, stores it via `context.loader.setCurrentData`, and orchestrates `panelUtilsNs.processGraphData`, `panelPromoNs.simGraph/showGraph`, and `panelScratchNs.simGraph/showGraph`. |
| `refresh(context)` | Simply calls `context.requestData()` to ask the parent for fresh data. |
| `destroy(context)` | Removes the tooltip created in `init` and hides any remaining tooltips via `panelUtilsNs.hideTooltip()`. |

## Data Expectations

- Accepts either:
  - Graph objects with `{ nodes, edges }`,
  - Tree structures with `{ children }` (converted internally via `helpers.convertTreeToGraph`),
  - Arbitrary objects (converted to a default graph representation).
- Stores the latest normalized payload in the loader cache (`setCurrentData`) so subsequent refreshes can reuse it.

## Request Configuration

Default request metadata (used when `context.requestData()` is called):

```json
{
  "eventName": "embed-viz-event-payload-data-unattached-force-graph",
  "topics": ["embed-viz-event-payload-data-unattached-force-graph"],
  "action": "load_data",
  "id": "scratch",
  "loadingMessage": "Loading graph data...",
  "successMessage": "Graph data loaded successfully",
  "errorMessage": "Failed to load data"
}
```

Modules consuming the compose visualization can override these values by setting `data-visualization-options` or passing options through `WidgetLoader.configure({ defaultVisualizationId, ... })`.

## Dependencies

- `window.Widgets.Panel.Utils` (notifications, theme, tooltip helpers)
- `window.Widgets.Panel.Tree` (tree rendering + mode detection)
- `window.Widgets.Panel.Filter` (filter UI)
- `window.Widgets.Panel.Promo` (promo panel graphs)
- `window.Widgets.Panel.Scratch` (scratch force graph)
- `d3` (tooltip DOM and tree rendering support)

The module waits until all of these namespaces expose their `init` routines before proceeding.

## Testing

- Covered indirectly via existing Cypress specs (`cypress/e2e/context-menu-interactions.cy.js`) which load the default compose visualization.
- When adding new behavior, prefer writing compose-focused specs in `cypress/e2e/compose-*.cy.js` to avoid conflating module-level changes with loader regression tests.

## Extension Points

- Custom panel behavior should continue to live within the respective `panel.*.js` files.
- Use `context.state` to persist additional module-level information; the loader clears it during teardown.
- Register cleanup tasks through `context.loader.registerCleanup(fn)` so resources are released when the visualization unmounts.

