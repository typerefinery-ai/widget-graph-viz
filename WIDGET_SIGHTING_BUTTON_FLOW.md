# Widget Sighting Button Data Flow Documentation

## Overview
This document illustrates the complete data flow when a user clicks the "Sighting" button in the widget's filter panel. The flow differs based on whether the widget is running in **Local Mode** or **Widget Mode**.

## HTML Structure
```html
<input type="radio" class="btn-check" name="vbtn-radio2" id="sighting" value="sighting" autocomplete="off" checked />
<label class="btn btn-outline-warning" for="sighting">Sighting</label>
```

## Data Flow Diagram

```mermaid
graph TD
    A[User clicks "Sighting" button] --> B[Filter Panel Event Handler]
    B --> C{Check Widget Mode}
    
    C -->|Local Mode ?local=true| D[Local Mode Path]
    C -->|Widget Mode| E[Widget Mode Path]
    
    %% Local Mode Path
    D --> D1[panel.filter.js: filter.change event]
    D1 --> D2[Get filter value: 'sighting']
    D2 --> D3[Map to tree_data: 'sighting']
    D3 --> D4[Call panelTreeNs.updateTree('sighting')]
    D4 --> D5[panel.tree.js: updateTree()]
    D5 --> D6[Check isLocalMode() - returns true]
    D6 --> D7[Call loadTreeDataFromAPI('sighting')]
    D7 --> D8[Show loading state & notification]
    D8 --> D9[Make API request to:<br/>https://flow.typerefinery.localhost:8101/viz-data/tree-sighting]
    D9 --> D10{API Response}
    D10 -->|Success| D11[Process response data]
    D10 -->|Error| D12[Show error notification<br/>Retry up to 3 times]
    D11 --> D13[Call processGraphData(data)]
    D13 --> D14[Render tree visualization]
    D14 --> D15[Show success notification]
    
    %% Widget Mode Path
    E --> E1[panel.filter.js: filter.change event]
    E1 --> E2[Get filter value: 'sighting']
    E2 --> E3[Map to tree_data: 'sighting']
    E3 --> E4[Call panelTreeNs.updateTree('sighting')]
    E4 --> E5[panel.tree.js: updateTree()]
    E5 --> E6[Check isLocalMode() - returns false]
    E6 --> E7[Call loadTreeDataFromParent('sighting')]
    E7 --> E8[Show loading notification]
    E8 --> E9[Raise event: embed-viz-event-payload-data-tree-sighting]
    E9 --> E10[Send postMessage to parent]
    E10 --> E11[Parent processes request]
    E11 --> E12[Parent sends response via postMessage]
    E12 --> E13[Widget receives message]
    E13 --> E14[Process response data]
    E14 --> E15[Call processGraphData(data)]
    E15 --> E16[Render tree visualization]
    E16 --> E17[Show success notification]
    
    %% Common Processing
    D13 --> F[panel._utils.js: processGraphData()]
    E15 --> F
    F --> G[Validate input data]
    G --> H[Split data into promo/scratch sections]
    H --> I[Process nodes and edges]
    I --> J[Apply theme and layout]
    J --> K[Render D3.js tree visualization]
    K --> L[Update #tree_panel DOM]
    
    %% Error Handling
    D12 --> M[Show error message in tree panel]
    M --> N[Fallback to parent mode after max retries]
    
    %% Styling
    classDef localMode fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef widgetMode fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef common fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px
    
    class D,D1,D2,D3,D4,D5,D6,D7,D8,D9,D10,D11,D13,D14,D15 localMode
    class E,E1,E2,E3,E4,E5,E6,E7,E8,E9,E10,E11,E12,E13,E14,E15,E16,E17 widgetMode
    class F,G,H,I,J,K,L common
    class D12,M,N error
```

## Key Components

### 1. Filter Panel (`panel.filter.js`)
- **Event Handler**: Listens for radio button changes
- **Mapping**: Maps button value to tree data type
- **Trigger**: Calls `panelTreeNs.updateTree(type)`

### 2. Tree Panel (`panel.tree.js`)
- **Mode Detection**: `isLocalMode()` checks URL for `?local=true`
- **Local Mode**: `loadTreeDataFromAPI()` makes direct API calls
- **Widget Mode**: `loadTreeDataFromParent()` sends postMessage events

### 3. Panel Utils (`panel._utils.js`)
- **Data Processing**: `processGraphData()` handles response data
- **Validation**: Input validation and error handling
- **Rendering**: D3.js tree visualization setup

### 4. Event System (`_events.js`)
- **PostMessage**: Communication with parent application
- **Event Compilation**: Formats events for parent consumption
- **Message Handling**: Processes incoming parent messages

## API Endpoints (Local Mode)

| Button | Value | API Endpoint |
|--------|-------|--------------|
| Sighting | `sighting` | `/viz-data/tree-sighting` |
| Task | `task` | `/viz-data/tree-task` |
| Impact | `impact` | `/viz-data/tree-impact` |
| Event | `event` | `/viz-data/tree-event` |
| Me | `me` | `/viz-data/tree-user` |
| Company | `company` | `/viz-data/tree-company` |

## Event Flow (Widget Mode)

1. **Request Event**: `embed-viz-event-payload-data-tree-sighting`
2. **Parent Response**: PostMessage with data payload
3. **Data Processing**: `processGraphData()` handles response
4. **Visualization**: D3.js renders tree in `#tree_panel`

## Error Handling

- **API Failures**: Retry mechanism (up to 3 attempts)
- **Network Timeouts**: 10-second timeout with abort controller
- **Invalid Data**: Input validation with error notifications
- **Fallback**: Switch to parent mode after max retries

## Loading States

- **Visual**: Loading overlay in `#tree_panel`
- **Notifications**: Toast notifications for status updates
- **Console**: Detailed logging for debugging

## Configuration

```javascript
// panel._utils.js options
tree_data: {
    sighting: 'sighting',
    task: 'task',
    impact: 'impact',
    event: 'event',
    me: 'user',
    company: 'company',
},
tree_data_default: 'sighting',
api: {
    baseUrl: "https://flow.typerefinery.localhost:8101",
    endpoints: {
        tree: "/viz-data/tree-",
    },
    timeout: 10000,
    retryAttempts: 3
}
```

## Testing Considerations

- **Local Mode Tests**: Mock API responses with `cy.intercept()`
- **Widget Mode Tests**: Mock postMessage events
- **Error Scenarios**: Test retry logic and fallback behavior
- **Loading States**: Verify loading indicators and notifications
- **Data Validation**: Ensure proper data processing and rendering 