/// <reference types="powerbi-visuals-api" />

declare namespace d3 {
    type Selection<GElement = any, Datum = any, PElement = any, PDatum = any> = any;

    namespace selection {
        type Update<GElement = any, Datum = any, PElement = any, PDatum = any> = Selection<GElement, Datum, PElement, PDatum>;
    }

    namespace scale {
        interface Linear<Domain, Range> {
            (value: Domain): Range;
            domain(domain?: Domain[]): Domain[] | this;
            range(range?: Range[]): Range[] | this;
            copy(): Linear<Domain, Range>;
        }

        function Linear<Domain = any, Range = any>(): Linear<Domain, Range>;
    }

    const select: any;
    const event: any;
    const min: any;
    const max: any;
    function mouse(container: any): [number, number];

    namespace behavior {
        function drag(): any;
    }

    function pointer(event: any, container: any): [number, number];
    function drag<Datum = any>(): any;
    function format(specifier: string): (n: number) => string;
    function transform(transformString?: string): any;
}

declare module "d3-axis" {
    interface Axis<Domain> {
        orient?(orientation: string): this;
        tickPadding?(padding: number): this;
        tickSize?(size: number): this;
        tickFormat?(format: any): this;
    }
}

declare const _: any;
declare const $: any;
declare interface JQuery {}

// ---- Ambient aliases for legacy Power BI API type names referenced unqualified ----
// The 2023-era code uses many short, unqualified type names that were globals in the
// old namespace model. Declaring them here keeps the legacy source compiling without
// rewriting thousands of references. Structural data-view types are mapped to `any`
// (legacy port); visual-lifecycle types are mapped to their real API equivalents.
declare type DataViewCategorical = any;
declare type DataViewValueColumn = any;
declare type DataViewMetadata = any;
declare type DataViewScopeIdentity = any;
declare type DataViewPropertyValue = any;
declare type PrimitiveValue = any;
declare type ValueTypeDescriptor = any;
declare type IStyleInfo = any;
declare type IColorInfo = any;
declare type IVisual = powerbi.extensibility.visual.IVisual;
declare type VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
declare type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
declare type EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
declare type VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;

declare namespace powerbi.extensibility.visual {
    interface ChartAxesLabels {
        x: string;
        y: string;
        y2?: string;
    }

    interface VisualBackground {
        image?: ImageValue;
        transparency?: number;
    }

    class SelectionId {
        selector: powerbi.data.Selector;
        highlight: boolean;
        getKey(): string;
        getSelector(): powerbi.data.Selector;
        hasIdentity(): boolean;
    }

    namespace axisType {
        const scalar: string;
        const categorical: string;
        const both: string;
    }

    namespace yAxisPosition {
        const left: string;
        const right: string;
    }
}

type Fill = any;

declare namespace powerbi.extensibility {
    namespace utils {
        namespace dataview {
            const converterHelper: any;
            const DataViewObjects: any;
            const DataViewObject: any;
        }

        namespace tooltip {
            type ITooltipServiceWrapper = any;
            type TooltipEventArgs = any;
            type TooltipEnabledDataPoint = any;
            const createTooltipServiceWrapper: any;
        }

        namespace type {
            class ValueType {
                static fromDescriptor(descriptor: any): ValueType;
            }
            namespace Double {
                function equal(a: number, b: number): boolean;
                function greaterOrEqual(a: number, b: number): boolean;
            }
            namespace Prototype {
                function inherit<T>(obj: T): T;
            }
            namespace EnumExtensions {
                function hasFlag(value: number, flag: number): boolean;
                function toString(enumType: any, value: number): string;
            }
            namespace PixelConverter {
                function toString(px: number): string;
                function fromPoint(pt: number): string;
                function fromPointToPixel(pt: number): number;
                function toPoint(px: number): number;
            }
        }

        namespace formatting {
            const valueFormatter: any;
            const textMeasurementService: any;
            type TextProperties = any;
            const font: any;
            const wordBreaker: any;
            type IValueFormatter = any;
        }

        namespace interactivity {
            const appendClearCatcher: any;
            const createInteractivityService: any;
            const dataHasSelection: any;
            interface IInteractiveBehavior {
                bindEvents(behaviorOptions: any, selectionHandler: ISelectionHandler): void;
                renderSelection(hasSelection: boolean): void;
            }
            interface IInteractivityService {
                bind(dataPoints: any[], behavior: IInteractiveBehavior, behaviorOptions: any, options?: any): any;
                clearSelection(): void;
                applySelectionStateToData(dataPoints: any[], hasHighlights?: boolean): boolean;
                hasSelection(): boolean;
            }
            interface ISelectionHandler {
                handleSelection(dataPoint: any, multiSelect: boolean): void;
                handleClearSelection(): void;
            }
            interface SelectableDataPoint {
                selected: boolean;
                identity: any;
            }
        }

        namespace color {
            class ColorHelper {
                constructor(colorPalette: any, style: any, isHighContrast: boolean);
                getColorForMeasure(measure: any, fallback?: string): string;
                getFillColor(identity: any): string;
            }
        }

        namespace svg {
            namespace CssConstants {
                type ClassAndSelector = any;
                const createClassAndSelector: any;
            }
            type IRect = any;
            const translate: any;
            const createArrow: any;
            namespace shapes {
                class Rect {
                    constructor(left?: number, top?: number, width?: number, height?: number);
                }
            }
        }

        namespace chart {
            const axis: any;
            namespace axis {
                type IMargin = any;
                type IAxisProperties = any;
                const scale: any;
                const style: any;
                const LabelLayoutStrategy: any;
                const createAxis: any;
                const createDomain: any;
                const isDateTime: any;
                const isOrdinal: any;
                const isOrdinalScale: any;
                const combineDomain: any;
                const scaleShouldClamp: any;
                const getCategoryValueType: any;
                const getRecommendedNumberOfTicksForXAxis: any;
                const getRecommendedNumberOfTicksForYAxis: any;
                const applyCustomizedDomain: any;
                const getTickLabelMargins: any;
                const createAxisLabel: any;
                const diffScaled: any;
                const normalizeNonFiniteNumber: any;
            }

            namespace dataLabel {
                type VisualDataLabelsSettings = any;
                type IDataLabelSettings = any;
                type DataLabelObject = any;
                type LabelEnabledDataPoint = any;
                const utils: any;
            }

            namespace legend {
                const LegendPosition: any;
                type LegendData = any;
                interface LegendDataPoint {
                    label: string;
                    color: string;
                    selected?: boolean;
                    icon?: any;
                    [key: string]: any;
                }
                const legendProps: any;
                const position: any;
                const SVGLegend: any;
                interface LegendBehaviorOptions {
                    legendItems: d3.Selection<any>;
                    legendIcons: d3.Selection<any>;
                    clearCatcher: d3.Selection<any>;
                }
                class LegendBehavior implements interactivity.IInteractiveBehavior {
                    static dimmedLegendColor: string;
                    bindEvents(options: LegendBehaviorOptions, selectionHandler: interactivity.ISelectionHandler): void;
                    renderSelection(hasSelection: boolean): void;
                }
            }

            const legend: any;
        }

        namespace CartesianHelper {
            const getCategoryAxisProperties: any;
            const getValueAxisProperties: any;
            const isScalar: any;
            const getPrecision: any;
        }
    }
}
