---
title: Widget Loader Context API
description: Definitive specification for visualization lifecycle interfaces and loader-provided context.
---

# Widget Loader Context API

This document formalizes the contract between the future `WidgetLoader` core and any visualization module shipped under `src/modules/<module-id>/`. It supplements the refactor plan and serves as the canonical source for lifecycle and context semantics.

---

## 1. Visualization Registration

Visualizations register themselves during bundle execution by calling:

```javascript
WidgetLoader.registerVisualization({
    id: "compose",
    version: "1.0.0",
    metadata: {
        displayName: "Panel-Based Graph Composer",
        description: "Original panel-driven visualization for Widget Graph Viz.",
        supportedModes: ["local", "widget"],
        defaultOptions: {},
    },
    lifecycle: {
        init,
        loadData,
        refresh,
        destroy,
    },
});
```

### 1.1 Required fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (kebab-case) | Unique identifier used in selectors, URL params, and docs. |
| `version` | `string` | SemVer-compatible visualization version. |
| `metadata` | `VisualizationMetadata` | See below. |
| `lifecycle` | `VisualizationLifecycle` | Object containing lifecycle handlers (at minimum `init`). |

### 1.2 `VisualizationMetadata`
```typescript
type VisualizationMetadata = {
    displayName: string;
    description?: string;
    supportedModes: Array<"local" | "widget">;
    defaultOptions?: Record<string, unknown>;
    defaultRequest?: RequestOptions;
    requires?: {
        graphFormat?: "nodes-edges" | "tree" | "custom";
        events?: string[];
        assets?: string[];
    };
};
```

---

## 2. Lifecycle Signatures

Loader invokes lifecycle handlers with a standardized `VisualizationContext` (see Section 3). Each handler may return either `void` or a Promise resolving to `void`.

```typescript
type VisualizationLifecycle = {
    init: (context: VisualizationContext) => void | Promise<void>;
    loadData?: (context: VisualizationContext, data: unknown) => void | Promise<void>;
    refresh?: (context: VisualizationContext) => void | Promise<void>;
    destroy?: (context: VisualizationContext) => void | Promise<void>;
};
```

### 2.1 Handler responsibilities
| Handler | Timing | Responsibilities |
|---------|--------|------------------|
| `init` | Once per widget mount | Set up DOM, attach listeners, register internal state in `context.state`. |
| `loadData` | Whenever loader receives new data payload | Validate and render incoming data. May assume normalized graph format if `metadata.requires.graphFormat === "nodes-edges"`. |
| `refresh` | On explicit reload (e.g., user interactions, parent event) | Optional; should re-render using cached state or re-request data as needed. |
| `destroy` | Before widget teardown | Clean up DOM, listeners, timers, and release references stored in `context.state`. |

Loader guarantees the following sequence:
1. `init`
2. `loadData` (0..n times)
3. `refresh` (0..n times, interleaved with loadData)
4. `destroy` (once before widget element is removed)

---

## 3. Visualization Context

```typescript
type VisualizationContext = {
    id: string;                               // Visualization ID (e.g., "compose")
    root: HTMLElement;                        // Root element the visualization should render into
    host: HTMLElement;                        // Widget root (component="graphviz")
    loader: LoaderServices;                   // Core loader utilities
    utils: WidgetUtilities;                   // Shared widget utilities (selection, formatting, etc.)
    events: EventsNamespace;                  // Wrapper around Widgets.Events*
    notifications: NotificationsNamespace;    // Wrapper around Widgets.Notifications*
    mode: {
        isLocal: boolean;
        isWidget: boolean;
        query: URLSearchParams;
    };
    options: Record<string, unknown>;         // Resolved visualization options (defaultOptions merged with overrides)
    state: Map<string, unknown>;              // Visualization-owned state storage
    setLoading: (message: string) => void;
    clearLoading: () => void;
    showToast: (type: ToastType, message: string) => void;
    requestData: (override?: RequestOptions) => void;
};
```

### 3.1 `LoaderServices`
```typescript
type LoaderServices = {
    registerCleanup: (fn: () => void) => void;
    getConfig: () => Record<string, unknown>;
    updateConfig: (delta: Record<string, unknown>) => void;
    getCurrentData: () => unknown;
    setCurrentData: (data: unknown) => void;
    config: {
        selector: string;
        fallbackSelectors: string[];
        defaultVisualizationId: string | null;
    };
};
```

### 3.2 Toast Types
```typescript
type ToastType = "success" | "error" | "warning" | "info" | "loading";
```

### 3.3 Request Options
```typescript
type RequestOptions = {
    eventName: string;
    topics?: string[];
    action: string;
    id: string;
    payload?: Record<string, unknown>;
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
};
```

---

## 4. Module Layout Convention

```
src/js/modules/
  compose/
    index.js            # Visualization registration + lifecycle
    options.json        # Optional default options
    README.md           # Visualization-specific notes
    ...additional files (panel implementations, styling)...
  overview/
    index.js            # Wraps simulation visualization
    options.json
    README.md
```

`widget.js` (or future `widget-loader.js`) imports module entrypoints, each of which self-registers when executed.

---

## 5. Loader Configuration Resolution

Loader resolves `context.options` using the following precedence (highest first):
1. DOM attribute `data-visualization-options` (JSON string).
2. URL query `vizOptions` (JSON string).
3. Parent-provided config event (`CONFIG_UPDATE`).
4. Visualization `metadata.defaultOptions`.

Visualization modules should treat `context.options` as immutable snapshots. To persist edits, call `loader.updateConfig(delta)` which merges and re-emits configuration events to the parent if necessary.
- Loader configuration itself can be adjusted at runtime via `WidgetLoader.configure({ selector, fallbackSelectors, defaultVisualizationId })`. The default selector is `[data-widget-root]` with `[component="graphviz"]` retained as a fallback for backwards compatibility.

---

## 6. Data Handling Rules

- Loader stores last successful payload via `loader.setCurrentData(data)` and surfaces it through `loader.getCurrentData`.
- If a visualization requires a specific data schema, it must validate inside `loadData` and throw descriptive errors; loader will catch and present them via `showToast("error", ...)`.
- Visualizations may call `requestData` to trigger a new `DATA_REQUEST` event; loader merges overrides with `context.options.request` (and `metadata.defaultRequest`) and ensures loading toasts are displayed. Modules MUST provide the required request metadata because the loader no longer ships composer-specific defaults.

---

## 7. Event Bus Usage

- `context.events` exposes the same API as current `window.Widgets.Events` (compileEventData, raiseEvent, registerEvent, etc.).
- Visualizations should prefer using context-provided `events` rather than importing the namespace directly, enabling future mocking in tests.

---

## 8. Testing Expectations

- **Unit**: Visualizations export pure helper functions (data transforms, layout calculations) that can be tested independently.
- **Loader**: Provide test harness to mount a visualization stub that records lifecycle calls; used to ensure `init`/`loadData`/`refresh` dispatch correctly under local and widget modes.
- **E2E**: Ensure `cypress/e2e` includes specs for both `compose` and `overview` modules; loader selection should be parameterized (`?viz=overview`).

---

## 9. Migration Checklist

- [ ] Update `widget-loader.js` to consume this API.
- [ ] Wrap existing panels visualization as `src/modules/compose`.
- [ ] Integrate simulation visualization as `src/modules/overview`.
- [ ] Provide compatibility layer to map legacy global namespaces to the new module interface until forks migrate fully.
- [ ] Update documentation and test suites accordingly.

---

## 10. Open Questions

1. Should loader support dynamic importing for visualizations to reduce bundle size? (Consider `import()` with Webpack chunking.)
2. Do we need explicit subscription APIs for parent-driven configuration updates beyond `context.options` snapshots?
3. How should multiple visualizations coexist on the same page (e.g., two widget instances with different IDs)? Context currently assumes isolation per root element; confirm event scoping strategy.

All open questions should be resolved before deprecating the current loader workflow.

