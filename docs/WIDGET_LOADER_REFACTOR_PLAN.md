---
title: Widget Loader Refactor Plan
description: Architecture plan to transform widget.js into a reusable visualization loader.
---

# Widget Loader Refactor Plan

## 1. Goals
- Decouple orchestration (`widget.js`) from any specific visualization implementation.
- Allow forks to swap visualization layers (e.g., current panel-based vs. `src/js/simulation.js`) without touching loader internals.
- Standardize interfaces so new visualizations observe the same lifecycle, configuration, event, and testing requirements.
- Preserve existing features (local/widget modes, notifications, event bus) while making them reusable across contexts.

## 2. Current State Summary
- `widget.js` orchestrates UI by invoking hard-coded panel modules (`Tree`, `Filter`, `Promo`, `Scratch`).
- Data flow assumptions revolve around tree/promo/scratch structures.
- Visualization logic spreads across panel modules, with loader managing tooltips, toasts, and event listeners in tight coupling.
- No abstraction for visualization packages beyond naming conventions.

## 3. Target Architecture

### 3.1 Loader Core (`widget-loader.js`)
- Singular entry point responsible for:
  - Configuration discovery (URL params, injected options, runtime config event).
  - Creating a visualization sandbox (DOM container, tooltip root, event hooks).
  - Managing lifecycle hooks (`initialize`, `loadData`, `refresh`, `destroy`) provided by visualization packages.
  - Handling mode detection (local vs. widget) and parent iframe communication.
- Loader exposes a registration API:
  ```javascript
  WidgetLoader.registerVisualization({
      id: "panels-tree",
      init: (context) => { ... },
      loadData: (context, data) => { ... },
      refresh: (context) => { ... },
      destroy: (context) => { ... },
      metadata: { displayName, version, supportedModes, defaultOptions }
  });
  ```
- Loader loads a visualization based on:
  - `data-visualization` attribute on the root element,
  - URL query parameter (e.g., `?viz=simulation`),
  - Config shipped from parent via event pre-init.

### 3.2 Visualization Packages
- Each visualization resides under `src/js/modules/<module-id>/` containing:
  - `index.js`: Exports the lifecycle implementation registered above and calls `WidgetLoader.registerVisualization`.
  - Optional `options.json`: Default visualization configuration.
  - Visualization-specific assets (CSS/SASS, data transforms, components, panels).
- Existing panel-based visualization becomes `src/js/modules/compose/` (compose = current composer layout).
- Simulation visualization becomes `src/js/modules/overview/` (overview = simulation.js-driven view).
- A minimalist example blueprint lives at `src/js/modules/example/`.
- Additional forks can drop new modules under this directory without modifying loader internals.

### 3.3 Shared Infrastructure
- Notifications, event system, and selection utilities continue to live in `panel._utils.js`; the loader injects the namespaces directly so modules do not import them manually.
- Loader injects shared services into visualization context:
  ```javascript
  const context = {
      id,
      root,
      host,
      loader,
      utils,
      events,
      notifications,
      mode,
      options,
      state,
      setLoading(message),
      clearLoading(),
      showToast(type, message),
      requestData(override),
  };
  ```
- Full context and lifecycle specifications are defined in `docs/WIDGET_LOADER_CONTEXT_API.md`.
- Loader configuration is adjustable via `WidgetLoader.configure({ selector, fallbackSelectors, defaultVisualizationId })`, allowing consuming apps to change the DOM hook without modifying internal code. The default selector is `[data-widget-root]` with `[component="graphviz"]` retained as fallback for backwards compatibility.

## 4. Standards & Conventions

| Item | Standard |
|------|----------|
| Visualization ID | Kebab-case (e.g., `panels-tree`, `force-simulation`) |
| Lifecycle Methods | `init(context)`, `loadData(context, data)`, `refresh(context)`, `destroy(context)` (all optional except `init`) |
| Configuration | Provide defaults in `options.json`; allow overrides via loader config |
| Data Contract | Visualizations should accept structured graph data (nodes/edges) but can declare their own expectations in metadata |
| Testing | Visualization packages must ship at least one Cypress spec verifying initialization; loader retains integration suite |
| Events | All postMessage communications pass through loader; visualizations emit/subscribe via provided context API |
| Documentation | Each visualization includes `docs/viz/<id>.md` explaining requirements, events, and usage |

## 5. Migration Approach

1. **Scaffold Loader Core**
   - Extract reusable pieces from `widget.js` into a new `WidgetLoader` module.
   - Provide bootstrap that registers default visualizations and mounts loader.
2. **Convert Existing Panels Visualization**
   - Move tree/filter/promo/scratch logic into `src/js/modules/compose/`.
   - Adapt code to lifecycle API; ensure loader options pass to panels.
3. **Integrate Simulation Visualization**
   - Wrap `src/js/simulation.js` into new visualization package.
   - Provide conversion utilities or data adapters as needed.
4. **Update Bundle Entry**
   - Ensure webpack includes `src/js/modules/**` before loader initialization.
5. **Backwards Compatibility**
   - Provide alias so `panels-tree` remains default if no visualization specified.
   - Document migration steps for forks.

## 6. Documentation Deliverables
- Update `README.md` with multi-visualization overview.
- Create `docs/LOADER_API_REFERENCE.md` describing loader API and context object.
- Add individual visualization guides (`docs/viz/panels-tree.md`, `docs/viz/simulation.md`).
- Update `docs/WIDGET_JS_REFERENCE.md` after refactor to describe new module structure.

## 7. Testing Strategy
- Introduce loader-level unit tests for visualization registration and lifecycle calls.
- Adapt existing E2E tests to run under both panels and simulation visualizations (two separate spec runs or parameterized tests).
- Provide harness tests ensuring toggling visualization via URL / config works correctly.

## 8. Risks & Mitigation
- **Risk**: Loader refactor breaks existing forks relying on panels modules.  
  **Mitigation**: Provide compatibility wrapper exporting legacy namespaces until forks migrate.
- **Risk**: Visualization packages require shared utilities not exposed in context.  
  **Mitigation**: Explicitly define what utilities are injected; avoid direct import from legacy modules.
- **Risk**: Event payload differences between visualizations.  
  **Mitigation**: Document expected actions per visualization in `metadata` and enforce via loader-level validation.

## 9. Implementation Phases
1. **Preparation**  
   - Freeze current behavior with additional regression tests.
   - Announce forthcoming changes in repo docs.
2. **Loader Extraction**  
   - Introduce new loader while keeping legacy `widget.js` as wrapper.
3. **Visualization Modularization**  
   - Move panels visualization into new package.
4. **Simulation Integration**  
   - Implement second visualization package and ensure loader toggle.
5. **Cleanup & Deprecation**  
   - Deprecate direct panel namespace usage in loader.
   - Update documentation, samples, and tests.

## 10. Next Steps
- Finalize interface details (context shape, metadata schema).
- Align naming conventions with `eventsNs` and notification systems.
- Draft migration guide for forks (especially simulation-focused ones).
- Begin phased implementation aligned with the todo list below.

