# 100% Stacked Chart - Power BI Custom Visual

## Architecture & Structure Documentation

### Overview
The 100% Stacked Chart is a custom Power BI visualization that displays comparative data using stacked horizontal or vertical bars where each bar represents 100% of the total value. This visual is used for analyzing the contribution of each value to the total value across different categories.

**Current Version**: 1.4.7  
**Power BI API Version**: 1.13.0  
**Target Version**: Power BI v7 compatible  

---

## Project Structure

```
Stack Chart/
├── src/                          # TypeScript source files
│   ├── visual.ts                 # Main visual class and rendering logic
│   ├── interfaces.ts             # TypeScript interface definitions and type declarations
│   ├── layout.ts                 # Layout calculations and positioning logic
│   ├── Behavior.ts               # Interactivity behavior (selection, click handlers)
│   ├── Columnutil.ts             # Column utility functions
│   ├── utils.ts                  # General utility functions and SelectionId class
│   └── selectionId.ts            # Selection ID management
├── style/                        # LESS stylesheets
│   └── visual.less               # Visual styling
├── assets/                       # Icon and thumbnail resources
│   ├── icon.png
│   ├── thumbnail.png
│   └── screenshot.png
├── capabilities.json             # Power BI capabilities definition
├── pbiviz.json                   # Power BI visual metadata
├── package.json                  # NPM dependencies
├── tsconfig.json                 # TypeScript configuration
├── tslint.json                   # Code quality rules
└── .api/                         # Power BI API type definitions
    └── v1.13.0/
        └── PowerBI-visuals.d.ts  # API type definitions
```

---

## Core Components

### 1. **visual.ts** - Main Visual Class
**Purpose**: Entry point and main rendering engine for the visual

**Key Responsibilities**:
- Implements the `Visual` class extending Power BI's visual base
- Handles data transformation from Power BI's DataView format
- Manages SVG rendering and D3.js visualization
- Handles updates and responsive rendering
- Manages interactivity events (selection, tooltips)
- Handles property pane settings

**Key Imports**:
- D3 v3.5.5 for SVG rendering and data binding
- Power BI Utils for data labels, tooltips, formatting, and interactivity
- Custom utility modules

**Main Methods**:
- `constructor(options)` - Initializes the visual
- `update(options)` - Called when data or properties change
- `render()` - Renders the chart using D3
- `onDataChanged()` - Handles data updates
- `onResizing()` - Handles responsive resizing
- `destroy()` - Cleanup on visual removal

### 2. **interfaces.ts** - Type Definitions
**Purpose**: Defines all TypeScript interfaces and type contracts

**Key Interfaces**:
```typescript
StackedChartGMODataPoint    // Data point structure for stacked chart
BehaviorOptions             // Options for interactivity behavior
IGMOLegend                  // Legend configuration interface
IStackedChartSettings       // Settings for chart customization
```

**Utilities Exposed**:
- `PixelConverter` - Converts between pixels and points
- `StringExtensions` - String utility functions
- `LogicExtensions` - Logical operation utilities
- `JsonComparer` - JSON comparison utilities
- `TextSizeDefaults` - Text sizing utilities

### 3. **layout.ts** - Layout & Positioning
**Purpose**: Calculates and manages layout dimensions and positioning

**Key Responsibilities**:
- Calculates margins and available chart area
- Positions axes, labels, and legend
- Manages responsive layout adjustments
- Handles text wrapping and truncation
- Calculates bar positioning and dimensions

### 4. **Behavior.ts** - Interactivity Handler
**Purpose**: Manages user interactions and selections

**Key Features**:
- Implements `IInteractiveBehavior` interface
- Handles click events for data point selection
- Manages multi-selection (Ctrl+Click)
- Provides visual feedback for selections
- Updates opacity for selected/unselected items

**Methods**:
- `bindEvents()` - Binds click handlers to data elements
- `renderSelection()` - Updates visual based on selection state

### 5. **Columnutil.ts** - Column Utilities
**Purpose**: Utility functions for column operations and transformations

**Key Functions**:
- Data column parsing and validation
- Column metadata extraction
- Role-based column filtering

### 6. **utils.ts** - General Utilities
**Purpose**: Common utility functions used throughout the visual

**Key Components**:
- `SelectionId` class - Manages selection identifiers
- Formatting utilities
- Data transformation helpers
- Type conversion functions

### 7. **selectionId.ts** - Selection Management
**Purpose**: Manages Power BI selection IDs for cross-filtering

**Features**:
- Generates unique selection identifiers
- Tracks selection state
- Supports highlighting functionality

---

## Data Flow Architecture

### Data Processing Pipeline

```
Power BI DataView
    ↓
Visual.update()
    ↓
Data Transformation (Columnutil + utils)
    ↓
Create StackedChartGMODataPoint array
    ↓
Layout Calculation (layout.ts)
    ↓
D3 Data Binding
    ↓
SVG Rendering
    ↓
Behavior Binding (Behavior.ts)
    ↓
Final Visual Output
```

### Key Data Structures

**StackedChartGMODataPoint**:
```typescript
{
  categoryName: string        // X-axis category label
  seriesName: string          // Series/Legend label
  value: number               // Bar value
  percentage: number          // Percentage of total (for 100% stacking)
  color: string               // Fill color
  selectionId: SelectionId    // For cross-filtering
  tooltipData: string[]       // Tooltip content
  selected: boolean           // Selection state
}
```

---

## Dependency Stack

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `d3` | ^3.5.5 | SVG rendering and data visualization |
| `jquery` | ^3.2.1 | DOM manipulation (legacy) |
| `lodash` | ^4.17.4 | Utility functions |
| `powerbi-visuals-api` | ~1.13.0 | Power BI visual API |
| `powerbi-visuals-utils-chartutils` | 0.3.0 | Chart utilities (axes, legends) |
| `powerbi-visuals-utils-colorutils` | ^0.2.2 | Color utilities |
| `powerbi-visuals-utils-dataviewutils` | 1.5.0 | Data view transformation |
| `powerbi-visuals-utils-formattingutils` | ^0.4.0 | Text formatting |
| `powerbi-visuals-utils-interactivityutils` | ^0.2.1 | Selection/interactivity |
| `powerbi-visuals-utils-tooltiputils` | ^0.3.2 | Tooltip handling |

### Development Dependencies (Implied)
- TypeScript ~2.x
- TSLint for code quality
- Webpack for bundling

---

## Key Features & Capabilities

### Visual Features
1. **100% Stacked Bars** - Each bar represents 100% of total value
2. **Multiple Series** - Support for multiple data series
3. **Legend** - Configurable legend with position options
4. **Data Labels** - Optional display of values on bars
5. **Tooltips** - Interactive tooltips with detailed information
6. **Selection & Cross-Filtering** - Click to select and filter across visuals
7. **Formatting Options**:
   - Data label formatting
   - Color customization per series
   - Legend position control
   - Font and size adjustments

### Power BI Integration
- Full data view support
- Property pane customization
- Selection manager integration
- Host services integration
- Tooltip service integration
- Color palette support

---

## Configuration Files

### pbiviz.json
- Visual metadata and identification
- API version specification (1.13.0)
- Asset references
- Visual properties schema

### capabilities.json
- Data role definitions (Category, Values)
- Object definitions for formatting
- Sorting capabilities
- Filter capabilities

### tsconfig.json
- Compilation target: ES5
- Module: Namespace (AMD-style modules)
- Output: `.tmp/build/visual.js`
- Source maps enabled

### tslint.json
- Strict security rules (no eval, no innerHTML, etc.)
- Code style enforcement
- TypeScript-specific rules
- React accessibility rules

---

## Rendering Pipeline

### D3 V3 Rendering Process

1. **Data Binding** - Bind data to SVG selections
2. **Enter Selection** - Create new SVG elements for new data points
3. **Update Selection** - Update existing elements with new values
4. **Exit Selection** - Remove elements for deleted data points
5. **Transitions** - Animate changes (if enabled)
6. **Event Binding** - Attach interaction handlers

### SVG Structure

```
<svg class="visual">
  <g class="margin">
    <g class="chart-area">
      <g class="bars">
        <g class="bar-group">  <!-- Per category -->
          <rect class="bar-segment"/>  <!-- Per series value -->
        </g>
      </g>
      <g class="axes">
        <g class="x-axis"/>
        <g class="y-axis"/>
      </g>
    </g>
    <g class="legend-area">
      <g class="legend-items"/>
    </g>
  </g>
</svg>
```

---

## Styling

### LESS Compilation
- Compiles to CSS at build time
- Located in `style/visual.less`
- Provides CSS classes for SVG elements

### Common CSS Classes
- `.visual` - Root container
- `.bars` - Bar group container
- `.bar-segment` - Individual bar segments
- `.axis` - Axis elements
- `.legend` - Legend container
- `.data-label` - Data label text

---

## Build & Packaging

### Build Process
1. TypeScript compilation to ES5
2. LESS to CSS compilation
3. Resource bundling
4. Package creation (.pbiviz file)

### Output
- **Distribution Package**: `100per-Stackchart.pbiviz` - Ready for Power BI deployment

---

## Browser Compatibility

### Current Support (PBI v1 API)
- Modern browsers with ES5 support
- Chrome, Firefox, Safari, Edge
- Internet Explorer 11+

### Accessibility
- Keyboard navigation support
- ARIA labels where applicable
- Color-blind friendly palette options

---

## Performance Considerations

1. **D3 V3 Performance** - Suitable for moderate data volumes (~10K rows)
2. **Rendering** - SVG rendering with D3 transitions
3. **Memory** - Full data loaded in memory
4. **Update Cycle** - Incremental updates on property changes

### Recommended Data Limits
- Categories: < 500
- Series: < 50
- Total Data Points: < 10,000

---

## Known Limitations (v1)

1. **Legacy D3 V3** - Not WebGL accelerated
2. **No Virtual Scrolling** - All data rendered
3. **Limited Animation** - Basic D3 transitions only
4. **jQuery Dependency** - Legacy dependency
5. **Power BI API v1** - Missing modern API features
6. **TypeScript ES5** - No modern JavaScript features
7. **No Tree-shaking** - No bundle optimization

---

## Summary

The 100% Stacked Chart is a well-structured custom visual built on:
- **Presentation Layer**: D3 V3 + SVG rendering
- **Logic Layer**: TypeScript modules with clear separation of concerns
- **Integration Layer**: Power BI utilities for data, formatting, and interactivity
- **Data Layer**: Power BI DataView transformation and SelectionId management

The architecture supports extensibility through modular design while maintaining compatibility with the Power BI v1 API. Upgrading to Power BI v7 will require modernizing dependencies, updating the API layer, and refactoring for performance improvements.
