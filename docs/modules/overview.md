---
title: Overview Visualization Module
description: Documentation for the simulation-based overview visualization registered with WidgetLoader.
---

# Overview Visualization

The overview visualization (`id: "overview"`) wraps the legacy force-directed simulation into a loader-compatible module. Source: `src/js/modules/overview/`.

## Lifecycle Summary

| Lifecycle | Responsibility |
|-----------|----------------|
| `init(context)` | Builds container markup (`.overview-simulation`), creates SVG + `<g>` group, attaches tooltip DOM, instantiates a D3 force simulation, and registers cleanup. If cached data exists it renders immediately; otherwise it fetches local fixtures (`src/assets/data/unattached-force-graph.json`) when in local mode or triggers `context.requestData()` in widget mode. |
| `loadData(context, data)` | Normalizes incoming data into `{ nodes, edges }` (supports trees and generic objects), binds D3 selections for links/nodes/edge labels, enables drag interactions, updates tooltip content, and wires simulation ticks to position elements. Stores the graph via `context.loader.setCurrentData(graph)`. |
| `refresh(context)` | Delegates to `context.requestData()` (merges module + override request metadata). |
| `destroy(context)` | Stops the D3 simulation and removes the container from the DOM. |

## Data Expectations

- Accepts:
  - Graph objects (`nodes`, `edges`),
  - Tree data (`children`), or
  - Arbitrary objects (converted to a single-node graph with property fan-out).
- Uses module-local helpers (`convertTreeToGraph`, `createDefaultGraphData`) to normalize payloads.

## Request Configuration

Default request metadata:

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

These values can be overridden via `data-visualization-options`, URL `vizOptions`, or `WidgetLoader.configure`.

## Local Fixture

- `context.mode.isLocal === true` → loads `src/assets/data/unattached-force-graph.json`. Update this path if you add new fixture data.

## Dependencies

- `d3` (force simulation, drag behaviour)
- Loader context utilities (`context.loader`, `context.showToast`, etc.)
- No reliance on `panel.*` namespaces, ensuring isolation from the compose module.

## Testing

- Cypress coverage: `cypress/e2e/overview-module.cy.js` visits the widget with `?viz=overview`, asserts that the loader activates the module, and verifies nodes/links render.
- When extending functionality, add focused tests in the same spec or in new overview-specific specs.

## Extension Points

- Leverage `context.state` to store simulation artefacts (currently stores `linksSelection`, `nodesSelection`, etc.).
- Use `context.loader.registerCleanup` for any additional timers or event listeners.
- Adjust default options (radius, asset prefix, margins) through metadata or runtime configuration to suit alternative datasets.

