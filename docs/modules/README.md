---
title: Visualization Modules
description: Overview of the visualization modules packaged with Widget Graph Viz.
---

# Visualization Modules

Visualization modules live under `src/js/modules/<module-id>/`. Each module registers itself with `WidgetLoader` and implements the lifecycle described in `docs/WIDGET_LOADER_CONTEXT_API.md`.

| Module ID | Path | Purpose |
|-----------|------|---------|
| `compose` | `src/js/modules/compose/` | Original panel-based composer (tree, filter, promo, scratch) |
| `overview` | `src/js/modules/overview/` | Force-directed overview visualization built from the legacy simulation |
| `example` | `src/js/modules/example/` | Minimal blueprint showing how to implement a new visualization |

## Selecting a Module

- **Markup**: Add `data-visualization="<module-id>"` to the widget root element (default selector `[data-widget-root]`).
- **URL**: Append `?viz=<module-id>` to the widget URL.
- **Runtime config**: Call `WidgetLoader.configure({ defaultVisualizationId: "<module-id>" })` before the loader mounts components.

## Adding a New Module

1. Create a folder `src/js/modules/<module-id>/`.
2. Export `index.js` that calls `WidgetLoader.registerVisualization` with metadata and lifecycle.
3. Optionally add visualization-specific documentation in `docs/modules/<module-id>.md`.
4. Provide Cypress coverage to verify initialization (see `cypress/e2e/overview-module.cy.js` for an example).

Modules receive a standardized context (utilities, events, notifications, loader helpers). See `docs/WIDGET_LOADER_CONTEXT_API.md` for the full contract.

