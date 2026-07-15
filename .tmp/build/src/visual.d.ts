import powerbiApi from "powerbi-visuals-api";
import "./layout";
import "./selectionId";
import "./Columnutil";
import { legendInterfaces } from "powerbi-visuals-utils-chartutils";
import type { LabelEnabledDataPoint, VisualDataLabelsSettings } from "powerbi-visuals-utils-chartutils/lib/dataLabel/dataLabelInterfaces";
import type { IMargin, IAxisProperties } from "powerbi-visuals-utils-chartutils/lib/axis/axisInterfaces";
import * as formattingUtils from "powerbi-visuals-utils-formattingutils";
import { IInteractiveBehavior, IInteractivityService, ISelectionHandler, SelectableDataPoint } from "powerbi-visuals-utils-interactivityutils/lib/interactivityService";
import { ITooltipServiceWrapper, TooltipEnabledDataPoint } from "powerbi-visuals-utils-tooltiputils";
import { CssConstants, IRect } from "powerbi-visuals-utils-svgutils";
type DataViewObjects = powerbiApi.DataViewObjects;
type DataViewObject = powerbiApi.DataViewObject;
type DataViewObjectPropertyIdentifier = powerbiApi.DataViewObjectPropertyIdentifier;
type DataViewMetadataColumn = powerbiApi.DataViewMetadataColumn;
type DataView = powerbiApi.DataView;
type IViewport = powerbiApi.IViewport;
type NumberRange = powerbiApi.NumberRange;
type VisualTooltipDataItem = powerbiApi.extensibility.VisualTooltipDataItem;
type IColorPalette = powerbiApi.extensibility.IColorPalette;
type Selector = powerbiApi.data.Selector;
type ImageValue = powerbiApi.ImageValue;
type Selection<G = any> = d3.Selection;
interface ClassAndSelector extends CssConstants.ClassAndSelector {
    selector: string;
    class: string;
}
type LegendPositionType = legendInterfaces.LegendPosition;
type LegendData = legendInterfaces.LegendData;
type TextProperties = formattingUtils.interfaces.TextProperties;
type IValueFormatter = formattingUtils.valueFormatter.IValueFormatter;
declare namespace powerbi.extensibility.visual {
    export interface ChartAxesLabels {
        x: string;
        y: string;
        y2?: string;
    }
    export interface VisualBackground {
        image?: ImageValue;
        transparency?: number;
    }
    const SelectionId: any;
    type SelectionId = any;
    export type IGenericAnimator = IAnimator<IAnimatorOptions, IAnimationOptions, IAnimationResult>;
    export interface IGMOLegend {
        getMargins(): IViewport;
        isVisible(): boolean;
        changeOrientation(orientation: LegendPositionType): void;
        getOrientation(): LegendPositionType;
        drawLegend(data: LegendData, viewport: IViewport): any;
        drawLegendInternal(data: LegendData, viewport: IViewport, width: boolean, detailedLegend: any): any;
        reset(): void;
    }
    export interface BehaviorOptions {
        clearCatcher: Selection<any>;
        taskSelection: Selection<any>;
        legendSelection: Selection<any>;
        interactivityService: IInteractivityService;
    }
    export namespace visualBackgroundHelper {
        function getDefaultTransparency(): number;
        function enumeratePlot(enumeration: any, background: VisualBackground): void;
    }
    export class ChartBehavior implements IInteractiveBehavior {
        private options;
        private selectionHandler;
        bindEvents(options: BehaviorOptions, selectionHandler: ISelectionHandler): void;
        renderSelection(hasSelection: boolean): void;
    }
    export namespace AnimatorCommon {
        const MinervaAnimationDuration = 250;
        const MaxDataPointsToAnimate = 1000;
        function GetAnimationDuration(animator: IGenericAnimator, suppressAnimations: boolean): number;
    }
    export const cartesianChartProps: {
        scalarKey: {
            scalarKeyMin: DataViewObjectPropertyIdentifier;
        };
    };
    export const scatterChartProps: {
        general: {
            formatString: DataViewObjectPropertyIdentifier;
        };
        dataPoint: {
            defaultColor: DataViewObjectPropertyIdentifier;
            fill: DataViewObjectPropertyIdentifier;
        };
        trend: {
            show: DataViewObjectPropertyIdentifier;
        };
        colorBorder: {
            show: DataViewObjectPropertyIdentifier;
        };
        fillPoint: {
            show: DataViewObjectPropertyIdentifier;
        };
        colorByCategory: {
            show: DataViewObjectPropertyIdentifier;
        };
        currentFrameIndex: {
            index: DataViewObjectPropertyIdentifier;
        };
        legend: {
            labelColor: DataViewObjectPropertyIdentifier;
        };
        plotArea: {
            image: DataViewObjectPropertyIdentifier;
            transparency: DataViewObjectPropertyIdentifier;
        };
    };
    export const columnChartProps: {
        dataPoint: {
            defaultColor: DataViewObjectPropertyIdentifier;
            fill: DataViewObjectPropertyIdentifier;
            showAllDataPoints: DataViewObjectPropertyIdentifier;
        };
        general: {
            formatString: DataViewObjectPropertyIdentifier;
        };
        categoryAxis: {
            axisType: DataViewObjectPropertyIdentifier;
        };
        legend: {
            labelColor: DataViewObjectPropertyIdentifier;
        };
        plotArea: {
            image: DataViewObjectPropertyIdentifier;
            transparency: DataViewObjectPropertyIdentifier;
        };
    };
    export interface InteractivityOptions {
        /** Indicates that dragging of data points should be permitted. */
        dragDataPoint?: boolean;
        /** Indicates that data points should be selectable. */
        selection?: boolean;
        /** Indicates that the chart and the legend are interactive */
        isInteractiveLegend?: boolean;
        /** Indicates overflow behavior. Values are CSS oveflow strings */
        overflow?: string;
    }
    export interface CalculateScaleAndDomainOptions {
        viewport: IViewport;
        margin: IMargin;
        showCategoryAxisLabel: boolean;
        showValueAxisLabel: boolean;
        forceMerge: boolean;
        categoryAxisScaleType: string;
        valueAxisScaleType: string;
        trimOrdinalDataOnOverflow: boolean;
        playAxisControlLayout?: IRect;
        forcedTickCount?: number;
        forcedYDomain?: any[];
        forcedXDomain?: any[];
        ensureXDomain?: NumberRange;
        ensureYDomain?: NumberRange;
        categoryAxisDisplayUnits?: number;
        categoryAxisPrecision?: number;
        valueAxisDisplayUnits?: number;
        valueAxisPrecision?: number;
    }
    export interface IAnimatorOptions {
        duration?: number;
    }
    export interface IAnimationOptions {
        interactivityService: IInteractivityService;
    }
    export interface IAnimationResult {
        failed: boolean;
    }
    export interface ColumnAxisOptions {
        xScale: d3.scale.Linear<any, any>;
        yScale: d3.scale.Linear<any, any>;
        seriesOffsetScale?: Selection<number>;
        columnWidth: number;
        /** Used by clustered only since categoryWidth !== columnWidth */
        categoryWidth?: number;
        isScalar: boolean;
        margin: IMargin;
    }
    export interface IAnimator<T extends IAnimatorOptions, U extends IAnimationOptions, V extends IAnimationResult> {
        getDuration(): number;
        getEasing(): string;
        animate(options: U): V;
    }
    export interface ColumnChartDataPoint extends CartesianDataPoint, SelectableDataPoint, TooltipEnabledDataPoint, LabelEnabledDataPoint {
        categoryValue: number;
        /** Adjusted for 100% stacked if applicable */
        value: number;
        /** The top (column) or right (bar) of the rectangle, used for positioning stacked rectangles */
        position: number;
        valueAbsolute: number;
        /** Not adjusted for 100% stacked */
        valueOriginal: number;
        seriesIndex: number;
        labelSettings: VisualDataLabelsSettings;
        categoryIndex: number;
        color: string;
        /** The original values from the highlighted rect, used in animations */
        originalValue: number;
        originalPosition: number;
        originalValueAbsolute: number;
        /**
         * True if this data point is a highlighted portion and overflows (whether due to the highlight
         * being greater than original or of a different sign), so it needs to be thinner to accomodate.
         */
        drawThinner?: boolean;
        key: string;
        lastSeries?: boolean;
        chartType: any;
    }
    export interface CartesianData {
        series: CartesianSeries[];
        categoryMetadata: DataViewMetadataColumn;
        categories: any[];
        hasHighlights?: boolean;
    }
    export interface ISelectionId {
        equals(other: ISelectionId): boolean;
        includes(other: ISelectionId, ignoreHighlight?: boolean): boolean;
        getKey(): string;
        selector: Selector;
        getSelector(): Selector;
        getSelectorsByColumn(): Selector;
        hasIdentity(): boolean;
    }
    export interface LabelDataPointGMO {
        textSize: ISizeGMO;
        isPreferred: boolean;
        parentType: LabelDataPointParentTypeGMO;
        parentShape: any;
        hasBackground?: boolean;
        text: string;
        tooltip?: string;
        insideFill: string;
        outsideFill: string;
        identity: ISelectionId;
        key?: string;
        fontSize?: number;
        secondRowText?: string;
        weight?: number;
        hasBeenRendered?: boolean;
        labelSize?: ISizeGMO;
    }
    export interface IColumnLayout {
        shapeLayout: {
            width: (d: ColumnChartDataPoint) => number;
            x: (d: ColumnChartDataPoint) => number;
            y: (d: ColumnChartDataPoint) => number;
            height: (d: ColumnChartDataPoint) => number;
        };
        shapeLayoutWithoutHighlights: {
            width: (d: ColumnChartDataPoint) => number;
            x: (d: ColumnChartDataPoint) => number;
            y: (d: ColumnChartDataPoint) => number;
            height: (d: ColumnChartDataPoint) => number;
        };
        zeroShapeLayout: {
            width: (d: ColumnChartDataPoint) => number;
            x: (d: ColumnChartDataPoint) => number;
            y: (d: ColumnChartDataPoint) => number;
            height: (d: ColumnChartDataPoint) => number;
        };
    }
    export interface ColumnChartSeries extends CartesianSeries {
        displayName: string;
        key: string;
        index: number;
        data: ColumnChartDataPoint[];
        identity: SelectionId;
        color: string;
        labelSettings: VisualDataLabelsSettings;
        tooltip: VisualTooltipDataItem[];
    }
    export interface ColumnChartData extends CartesianData {
        categoryFormatter: IValueFormatter;
        series: ColumnChartSeries[];
        valuesMetadata: DataViewMetadataColumn[];
        legendData: LegendData;
        hasHighlights: boolean;
        categoryMetadata: DataViewMetadataColumn;
        scalarCategoryAxis: boolean;
        labelSettings: VisualDataLabelsSettings;
        axesLabels: ChartAxesLabels;
        hasDynamicSeries: boolean;
        isMultiMeasure: boolean;
        defaultDataPointColor?: string;
        showAllDataPoints?: boolean;
    }
    export interface ColumnChartAnimationOptions extends IAnimationOptions {
        viewModel: ColumnChartData;
        series: Selection<any>;
        layout: IColumnLayout;
        itemCS: ClassAndSelector;
        mainGraphicsContext: Selection<any>;
        viewPort: IViewport;
    }
    export interface ValueMultiplers {
        pos: number;
        neg: number;
    }
    export interface ColumnChartAnimationResult extends IAnimationResult {
        shapes: Selection<any>;
    }
    export type IColumnChartAnimator = IAnimator<IAnimatorOptions, ColumnChartAnimationOptions, ColumnChartAnimationResult>;
    export interface CategoryLayout {
        categoryCount: number;
        categoryThickness: number;
        outerPaddingRatio: number;
        isScalar?: boolean;
    }
    interface CategoryLayoutOptions {
        availableWidth: number;
        categoryCount: number;
        domain: any;
        trimOrdinalDataOnOverflow: boolean;
        isScalar?: boolean;
        isScrollable?: boolean;
    }
    export function getValue<T>(objects: DataViewObjects, objectName: string, propertyName: string, defaultValue: T): T;
    export class GMOSVGLegend implements IGMOLegend {
        private maxLegendTextLength;
        private mainGraphicsContext;
        private labelGraphicsContext;
        private mainGraphicsSVG;
        private orientation;
        private viewport;
        private parentViewport;
        private svg;
        private group;
        private element;
        private clearCatcher;
        private interactivityService;
        private legendDataStartIndex;
        private arrowPosWindow;
        private data;
        private isScrollable;
        private primaryTitle;
        private secondaryTitle;
        private lastCalculatedWidth;
        private visibleLegendWidth;
        TooltipServiceWrapper: ITooltipServiceWrapper;
        private static identity;
        private visibleLegendHeight;
        private legendFontSizeMarginDifference;
        private legendFontSizeMarginValue;
        legendHeight: number;
        legendItemWidth: number;
        static DefaultFontSizeInPt: number;
        private static LegendIconRadius;
        private static LegendIconRadiusFactor;
        private static MaxTextLength;
        private static MaxTitleLength;
        private static TextAndIconPadding;
        private static TitlePadding;
        private static LegendEdgeMariginWidth;
        private static LegendMaxWidthFactor;
        private static TopLegendHeight;
        private static DefaultTextMargin;
        DefaultTextMargin: number;
        private static DefaultMaxLegendFactor;
        private secondaryExists;
        private static LegendArrowOffset;
        private static LegendArrowHeight;
        private static LegendArrowWidth;
        private static LegendArrowTranslateY;
        private detailedLegend;
        private static DefaultFontFamily;
        private static DefaultTitleFontFamily;
        private static LegendItem;
        private static LegendText;
        static LegendIcon: ClassAndSelector;
        static LegendTitle: ClassAndSelector;
        private static NavigationArrow;
        constructor(element: any, legendPosition: LegendPositionType, interactivityService: IInteractivityService, isScrollable: boolean);
        private updateLayout;
        private calculateViewport;
        getMargins(): IViewport;
        isVisible(): boolean;
        changeOrientation(orientation: LegendPositionType): void;
        getOrientation(): LegendPositionType;
        drawLegend(data: LegendData, viewport: IViewport): void;
        drawLegendInternal(data: LegendData, viewport: IViewport, autoWidth: boolean, detailedLegend: any): void;
        private normalizePosition;
        private calculateTitleLayout;
        /** Performs layout offline for optimal perfomance */
        private calculateLayout;
        private updateNavigationArrowLayout;
        private calculateHorizontalNavigationArrowsLayout;
        private calculateVerticalNavigationArrowsLayout;
        private calculateHorizontalLayout;
        private calculateVerticalLayout;
        private drawNavigationArrows;
        private isTopOrBottom;
        private isLeftOrRight;
        private isCentered;
        reset(): void;
        private static getTextProperties;
        private setTooltipToLegendItems;
    }
    export type IColumnChartAnimatorGMO = IAnimator<IAnimatorOptions, ColumnChartAnimationOptionsGMO, ColumnChartAnimationResult>;
    export interface ColumnChartAnimationOptionsGMO extends IAnimationOptions {
        viewModel: StackedChartGMOData;
        series: Selection<any>;
        className: Selection<any>;
        selectorName: Selection<any>;
        layout: IColumnLayout;
        itemCS: ClassAndSelector;
        mainGraphicsContext: Selection<any>;
        viewPort: IViewport;
    }
    export interface ColumnAxisOptionsGMO {
        xScale: d3.scale.Linear<any, any>;
        yScale: d3.scale.Linear<any, any>;
        seriesOffsetScale?: Selection<number>;
        columnWidth: number;
        /** Used by clustered only since categoryWidth !== columnWidth */
        categoryWidth?: number;
        isScalar: boolean;
        margin: IMargin;
    }
    export interface ColumnChartDrawInfoGMO {
        eventGroup: Selection<any>;
        shapesSelection: Selection<any>;
        viewport: IViewport;
        axisOptions: ColumnAxisOptionsGMO;
        labelDataPoints: LabelDataPointGMO[];
    }
    export interface IColumnChartConverterStrategy {
        getLegend(colors: IColorPalette, defaultLegendLabelColor: string, defaultColor?: string): LegendSeriesInfo;
        getValueBySeriesAndCategory(series: number, category: number): number;
        getHighlightBySeriesAndCategory(series: number, category: number): PrimitiveValue;
    }
    export interface LegendSeriesInfo {
        legend: LegendData;
        seriesSources: DataViewMetadataColumn[];
        seriesObjects: DataViewObjects[][];
    }
    export interface ColumnChartContextGMO {
        height: number;
        width: number;
        duration: number;
        hostService: any;
        margin: IMargin;
        /** A group for graphics can be placed that won't be clipped to the data area of the chart. */
        /** A SVG for graphics that should be clipped to the data area, e.g. data bars, columns, lines */
        mainGraphicsContext: Selection<any>;
        layout: CategoryLayout;
        animator: IColumnChartAnimatorGMO;
        onDragStart?: (datum: ColumnChartDataPoint) => void;
        interactivityService: IInteractivityService;
        viewportHeight: number;
        viewportWidth: number;
        is100Pct: boolean;
        isComboChart: boolean;
    }
    export interface CartesianSmallViewPortPropertiesGMO {
        hideLegendOnSmallViewPort: boolean;
        hideAxesOnSmallViewPort: boolean;
        MinHeightLegendVisible: number;
        MinHeightAxesVisible: number;
    }
    export interface CartesianVisualRenderResultGMO {
        dataPoints: SelectableDataPoint[];
        behaviorOptions: any;
        labelDataPoints: LabelDataPointGMO[];
        labelsAreNumeric: boolean;
        labelDataPointGroups?: LabelDataPointGroupGMO[];
    }
    export interface LabelDataPointGroupGMO {
        labelDataPoints: LabelDataPointGMO[];
        maxNumberOfLabels: number;
    }
    export const enum RectLabelPositionGMO {
        None = 0,
        InsideCenter = 1,
        InsideBase = 2,
        InsideEnd = 4,
        OutsideBase = 8,
        OutsideEnd = 16,
        All = 31,
        InsideAll = 7
    }
    export interface IColumnChartStrategyGMO {
        setData(data: ColumnChartData): void;
        setupVisualProps(columnChartProps: ColumnChartContextGMO): void;
        setXScale(forcedXDomain?: any[], axisScaleType?: string, axisDisplayUnits?: number, axisPrecision?: number, ensureXDomain?: NumberRange): IAxisProperties;
        setYScale(is100Pct: boolean, forcedTickCount?: number, forcedYDomain?: any[], axisScaleType?: string, axisDisplayUnits?: number, axisPrecision?: number, ensureYDomain?: NumberRange): IAxisProperties;
        drawColumns(useAnimation: boolean): ColumnChartDrawInfoGMO;
        selectColumn(selectedColumnIndex: number, lastSelectedColumnIndex: number): void;
        getClosestColumnIndex(x: number, y: number): number;
    }
    export class CartesianChartGMO {
        static MinOrdinalRectThickness: number;
        static MinScalarRectThickness: number;
        static OuterPaddingRatio: number;
        static InnerPaddingRatio: number;
        private static FontSize;
        FontSizeString: string;
        static AxisTextProperties: TextProperties;
        static getPreferredCategorySpan(categoryCount: number, categoryThickness: number, noOuterPadding?: boolean): number;
        static getIsScalar(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, type: ValueTypeDescriptor, scalarKeys?: any): boolean;
        private static supportsScalar;
        private static getMinInterval;
        static getCategoryThickness(seriesList: CartesianSeries[], numCategories: number, plotLength: number, domain: number[], isScalar: boolean, trimOrdinalDataOnOverflow: boolean): number;
        static getLayout(data: StackedChartGMOData, options: CategoryLayoutOptions): CategoryLayout;
    }
    export class ColumnChartGMO {
        static SeriesClasses: ClassAndSelector;
        static stackedValidLabelPositions: RectLabelPositionGMO[];
        static getLabelFill(labelColor: string, isInside: boolean, isCombo: boolean): string;
        static getInteractiveColumnChartDomElement(element: any): HTMLElement;
        static sliceSeries(series: StackedChartGMOSeries[], endIndex: number, startIndex?: number): StackedChartGMOSeries[];
    }
    export class StackedChartGMOStrategy implements IColumnChartStrategyGMO {
        private static classes;
        private data;
        private graphicsContext;
        private width;
        private height;
        private margin;
        private xProps;
        private yProps;
        private categoryLayout;
        private columnsCenters;
        private columnSelectionLineHandle;
        private animator;
        private interactivityService;
        private viewportHeight;
        private viewportWidth;
        private layout;
        private isComboChart;
        TooltipServiceWrapper: ITooltipServiceWrapper;
        setupVisualProps(columnChartProps: ColumnChartContextGMO): void;
        setTooltipServiceWrapper(TooltipServiceWrapper: ITooltipServiceWrapper): void;
        setData(data: ColumnChartData): void;
        setXScale(forcedXDomain?: any[], axisScaleType?: string, axisDisplayUnits?: number, axisPrecision?: number): IAxisProperties;
        getCategoryAxis(data: StackedChartGMOData, size: number, layout: CategoryLayout, isVertical: boolean, forcedXMin?: DataViewPropertyValue, forcedXMax?: DataViewPropertyValue, axisScaleType?: string, axisDisplayUnits?: number, axisPrecision?: number, ensureXDomain?: NumberRange): IAxisProperties;
        lookupXValue(data: StackedChartGMOData, index: number, type: any, isScalar: boolean): any;
        calcValueDomain(data: any, is100pct: any): {
            min: any;
            max: any;
        };
        setYScale(is100Pct: boolean, forcedTickCount?: number, forcedYDomain?: any[], axisScaleType?: string, axisDisplayUnits?: number, axisPrecision?: number, y1ReferenceLineValue?: NumberRange): IAxisProperties;
        StackedChartGMOStrategyGetLayout(data: any, axisOptions: any): {
            shapeLayout: {
                width: (d: ColumnChartDataPoint) => any;
                x: (d: ColumnChartDataPoint) => number;
                y: (d: ColumnChartDataPoint) => any;
                height: (d: ColumnChartDataPoint) => number;
            };
            shapeLayoutWithoutHighlights: {
                width: (d: ColumnChartDataPoint) => any;
                x: (d: ColumnChartDataPoint) => number;
                y: (d: ColumnChartDataPoint) => any;
                height: (d: ColumnChartDataPoint) => number;
            };
            zeroShapeLayout: {
                width: (d: ColumnChartDataPoint) => any;
                x: (d: ColumnChartDataPoint) => number;
                y: (d: ColumnChartDataPoint) => any;
                height: (d: ColumnChartDataPoint) => number;
            };
        };
        ColumnUtilDrawSeries(data: any, graphicsContext: any): any;
        ColumnUtilDrawDefaultShapes(data: any, series: any, layout: any, itemCS: any, filterZeros: any, hasSelection: any): any;
        drawColumns(useAnimation: boolean): ColumnChartDrawInfoGMO;
        setChosenColumnOpacity(mainGraphicsContext: Selection<any>, columnGroupSelector: string, selectedColumnIndex: number, lastColumnIndex: number): void;
        selectColumn(selectedColumnIndex: number, lastSelectedColumnIndex: number): void;
        getClosestColumnIndex(x: number, y: number): number;
        /**
         * Get the chart's columns centers (x value).
         */
        private getColumnsCenters;
        private moveHandle;
        static getLayout(data: ColumnChartData, axisOptions: ColumnAxisOptions): IColumnLayout;
        private static getDisplayUnitValueFromAxisFormatter;
        private createLabelDataPoints;
    }
    export const enum NewRectOrientationGMO {
        /** Rectangle with no specific orientation. */
        None = 0,
        /** Vertical rectangle with base at the bottom. */
        VerticalBottomBased = 1,
        /** Vertical rectangle with base at the top. */
        VerticalTopBased = 2,
        /** Horizontal rectangle with base at the left. */
        HorizontalLeftBased = 3,
        /** Horizontal rectangle with base at the right. */
        HorizontalRightBased = 4
    }
    export interface ISizeGMO {
        width: number;
        height: number;
    }
    export const enum LabelDataPointParentTypeGMO {
        Point = 0,
        Rectangle = 1,
        Polygon = 2
    }
    export interface CartesianDataPoint {
        categoryValue: any;
        value: number;
        categoryIndex: number;
        seriesIndex: number;
        highlight?: boolean;
    }
    export interface CartesianSeries {
        data: CartesianDataPoint[];
    }
    export interface StackedChartGMOData extends CartesianData {
        categoryFormatter: IValueFormatter;
        series: StackedChartGMOSeries[];
        valuesMetadata: DataViewMetadataColumn[];
        legendData: LegendData;
        hasHighlights: boolean;
        categoryMetadata: DataViewMetadataColumn;
        scalarCategoryAxis: boolean;
        labelSettings: VisualDataLabelsSettings;
        axesLabels: ChartAxesLabels;
        hasDynamicSeries: boolean;
        isMultiMeasure: boolean;
        defaultDataPointColor?: string;
        showAllDataPoints?: boolean;
    }
    export interface ColumnGMOBehaviorOptions {
        datapoints: SelectableDataPoint[];
        bars: Selection<any>;
        mainGraphicsContext: Selection<any>;
        hasHighlights: boolean;
        viewport: IViewport;
        axisOptions: ColumnAxisOptions;
        showLabel: boolean;
    }
    export interface StackedChartGMOSeries extends CartesianSeries {
        displayName: string;
        key: string;
        index: number;
        data: StackedChartGMODataPoint[];
        identity: SelectionId;
        color: string;
        labelSettings: VisualDataLabelsSettings;
    }
    export interface StackedChartGMODataPoint extends CartesianDataPoint, SelectableDataPoint, TooltipEnabledDataPoint, LabelEnabledDataPoint {
        categoryValue: number;
        /** Adjusted for 100% stacked if applicable */
        value: number;
        /** The top (column) or right (bar) of the rectangle, used for positioning stacked rectangles */
        position: number;
        valueAbsolute: number;
        /** Not adjusted for 100% stacked */
        valueOriginal: number;
        seriesIndex: number;
        labelSettings: VisualDataLabelsSettings;
        categoryIndex: number;
        color: string;
        /** The original values from the highlighted rect, used in animations */
        originalValue: number;
        originalPosition: number;
        originalValueAbsolute: number;
        /**
         * True if this data point is a highlighted portion and overflows (whether due to the highlight
         * being greater than original or of a different sign), so it needs to be thinner to accomodate.
         */
        drawThinner?: boolean;
        key: string;
        lastSeries?: boolean;
        chartType: any;
    }
    export enum StackedChartGMOType {
        clusteredBar,
        clusteredColumn,
        hundredPercentStackedBar,
        hundredPercentStackedColumn,
        stackedBar,
        stackedColumn
    }
    export interface IColumnGMOLayout {
        shapeLayout: {
            width: (d: StackedChartGMODataPoint) => number;
            x: (d: StackedChartGMODataPoint) => number;
            y: (d: StackedChartGMODataPoint) => number;
            height: (d: StackedChartGMODataPoint) => number;
        };
        shapeLayoutWithoutHighlights: {
            width: (d: StackedChartGMODataPoint) => number;
            x: (d: StackedChartGMODataPoint) => number;
            y: (d: StackedChartGMODataPoint) => number;
            height: (d: StackedChartGMODataPoint) => number;
        };
        zeroShapeLayout: {
            width: (d: StackedChartGMODataPoint) => number;
            x: (d: StackedChartGMODataPoint) => number;
            y: (d: StackedChartGMODataPoint) => number;
            height: (d: StackedChartGMODataPoint) => number;
        };
    }
    export interface IStackedChartGMOStrategy {
        setData(data: StackedChartGMOData): void;
        setupVisualProps(columnChartProps: ColumnChartContextGMO): void;
        setXScale(forcedXDomain?: any[], axisScavarype?: string, axisDisplayUnits?: number, axisPrecision?: number): IAxisProperties;
        setYScale(is100Pct: boolean, forcedTickCount?: number, forcedYDomain?: any[], axisScaleType?: string, axisDisplayUnits?: number, axisPrecision?: number): IAxisProperties;
        drawColumns(useAnimation: boolean): ColumnChartDrawInfoGMO;
        selectColumn(selectedColumnIndex: number, lastSelectedColumnIndex: number): void;
        getClosestColumnIndex(x: number, y: number): number;
    }
    export let StackedChartGMOProps: {
        dataPoint: {
            defaultColor: DataViewObjectPropertyIdentifier;
            fill: DataViewObjectPropertyIdentifier;
            showAllDataPoints: DataViewObjectPropertyIdentifier;
        };
        general: {
            formatString: DataViewObjectPropertyIdentifier;
        };
        sampleFilter: {
            show: {
                objectName: string;
                propertyName: string;
            };
        };
        categoryAxis: {
            axisType: DataViewObjectPropertyIdentifier;
        };
        textWrap: {
            show: {
                objectName: string;
                propertyName: string;
            };
        };
        measureTitles: {
            ellipses: {
                objectName: string;
                propertyName: string;
            };
        };
        legend: {
            labelColor: DataViewObjectPropertyIdentifier;
            labelDisplayUnit: DataViewObjectPropertyIdentifier;
            labelPrecision: DataViewObjectPropertyIdentifier;
            primaryMeasureOnoff: DataViewObjectPropertyIdentifier;
        };
        plotArea: {
            image: DataViewObjectPropertyIdentifier;
            transparency: DataViewObjectPropertyIdentifier;
        };
        title: {
            tooltipText: DataViewObjectPropertyIdentifier;
            showTooltip: DataViewObjectPropertyIdentifier;
        };
        show: {
            objectName: string;
            propertyName: string;
        };
        titleText: {
            objectName: string;
            propertyName: string;
        };
        titleFill: {
            objectName: string;
            propertyName: string;
        };
        titleBackgroundColor: {
            objectName: string;
            propertyName: string;
        };
        titleFontSize: {
            objectName: string;
            propertyName: string;
        };
        tooltipText: {
            objectName: string;
            propertyName: string;
        };
        totalLabels: {
            show: {
                objectName: string;
                propertyName: string;
            };
            titleText: {
                objectName: string;
                propertyName: string;
            };
            titleColor: DataViewObjectPropertyIdentifier;
            titleFontFamily: DataViewObjectPropertyIdentifier;
            titleFontSize: DataViewObjectPropertyIdentifier;
            titleBold: DataViewObjectPropertyIdentifier;
            titleItalic: DataViewObjectPropertyIdentifier;
            titleUnderline: DataViewObjectPropertyIdentifier;
            color: DataViewObjectPropertyIdentifier;
            displayUnits: DataViewObjectPropertyIdentifier;
            textPrecision: DataViewObjectPropertyIdentifier;
            fontSize: DataViewObjectPropertyIdentifier;
            fontFamily: DataViewObjectPropertyIdentifier;
            fontBold: DataViewObjectPropertyIdentifier;
            fontItalic: DataViewObjectPropertyIdentifier;
            fontUnderline: DataViewObjectPropertyIdentifier;
        };
        secondaryLabels: {
            titleText: {
                objectName: string;
                propertyName: string;
            };
            titleColor: DataViewObjectPropertyIdentifier;
            titleFontFamily: DataViewObjectPropertyIdentifier;
            titleFontSize: DataViewObjectPropertyIdentifier;
            titleBold: DataViewObjectPropertyIdentifier;
            titleItalic: DataViewObjectPropertyIdentifier;
            titleUnderline: DataViewObjectPropertyIdentifier;
            color: DataViewObjectPropertyIdentifier;
            displayUnits: DataViewObjectPropertyIdentifier;
            textPrecision: DataViewObjectPropertyIdentifier;
            fontSize: DataViewObjectPropertyIdentifier;
            fontFamily: DataViewObjectPropertyIdentifier;
            fontBold: DataViewObjectPropertyIdentifier;
            fontItalic: DataViewObjectPropertyIdentifier;
            fontUnderline: DataViewObjectPropertyIdentifier;
        };
        tertiaryLabels: {
            titleText: {
                objectName: string;
                propertyName: string;
            };
            titleColor: DataViewObjectPropertyIdentifier;
            titleFontFamily: DataViewObjectPropertyIdentifier;
            titleFontSize: DataViewObjectPropertyIdentifier;
            titleBold: DataViewObjectPropertyIdentifier;
            titleItalic: DataViewObjectPropertyIdentifier;
            titleUnderline: DataViewObjectPropertyIdentifier;
            color: DataViewObjectPropertyIdentifier;
            displayUnits: DataViewObjectPropertyIdentifier;
            textPrecision: DataViewObjectPropertyIdentifier;
            fontSize: DataViewObjectPropertyIdentifier;
            fontFamily: DataViewObjectPropertyIdentifier;
            fontBold: DataViewObjectPropertyIdentifier;
            fontItalic: DataViewObjectPropertyIdentifier;
            fontUnderline: DataViewObjectPropertyIdentifier;
        };
        quaternaryLabels: {
            titleText: {
                objectName: string;
                propertyName: string;
            };
            titleColor: DataViewObjectPropertyIdentifier;
            titleFontFamily: DataViewObjectPropertyIdentifier;
            titleFontSize: DataViewObjectPropertyIdentifier;
            titleBold: DataViewObjectPropertyIdentifier;
            titleItalic: DataViewObjectPropertyIdentifier;
            titleUnderline: DataViewObjectPropertyIdentifier;
            color: DataViewObjectPropertyIdentifier;
            displayUnits: DataViewObjectPropertyIdentifier;
            textPrecision: DataViewObjectPropertyIdentifier;
            fontSize: DataViewObjectPropertyIdentifier;
            fontFamily: DataViewObjectPropertyIdentifier;
            fontBold: DataViewObjectPropertyIdentifier;
            fontItalic: DataViewObjectPropertyIdentifier;
            fontUnderline: DataViewObjectPropertyIdentifier;
        };
        FifthLabels: {
            titleText: {
                objectName: string;
                propertyName: string;
            };
            titleColor: DataViewObjectPropertyIdentifier;
            titleFontFamily: DataViewObjectPropertyIdentifier;
            titleFontSize: DataViewObjectPropertyIdentifier;
            titleBold: DataViewObjectPropertyIdentifier;
            titleItalic: DataViewObjectPropertyIdentifier;
            titleUnderline: DataViewObjectPropertyIdentifier;
            color: DataViewObjectPropertyIdentifier;
            displayUnits: DataViewObjectPropertyIdentifier;
            textPrecision: DataViewObjectPropertyIdentifier;
            fontSize: DataViewObjectPropertyIdentifier;
            fontFamily: DataViewObjectPropertyIdentifier;
            fontBold: DataViewObjectPropertyIdentifier;
            fontItalic: DataViewObjectPropertyIdentifier;
            fontUnderline: DataViewObjectPropertyIdentifier;
        };
        SixthLabels: {
            titleText: {
                objectName: string;
                propertyName: string;
            };
            titleColor: DataViewObjectPropertyIdentifier;
            titleFontFamily: DataViewObjectPropertyIdentifier;
            titleFontSize: DataViewObjectPropertyIdentifier;
            titleBold: DataViewObjectPropertyIdentifier;
            titleItalic: DataViewObjectPropertyIdentifier;
            titleUnderline: DataViewObjectPropertyIdentifier;
            color: DataViewObjectPropertyIdentifier;
            displayUnits: DataViewObjectPropertyIdentifier;
            textPrecision: DataViewObjectPropertyIdentifier;
            fontSize: DataViewObjectPropertyIdentifier;
            fontFamily: DataViewObjectPropertyIdentifier;
            fontBold: DataViewObjectPropertyIdentifier;
            fontItalic: DataViewObjectPropertyIdentifier;
            fontUnderline: DataViewObjectPropertyIdentifier;
        };
    };
    export interface sampleFilterSettings {
        show: boolean;
    }
    export interface textWrapSettings {
        show: boolean;
    }
    export interface measureTitlesSettings {
        ellipsesStrength: number;
    }
    export interface totalLabelSettings {
        show: boolean;
        titleText: string;
        titleColor: string;
        titleFontFamily: string;
        titleFontSize: number;
        titleBold: boolean;
        titleItalic: boolean;
        titleUnderline: boolean;
        color: string;
        displayUnits: number;
        textPrecision: number;
        fontSize: number;
        fontFamily: string;
        fontBold: boolean;
        fontItalic: boolean;
        fontUnderline: boolean;
    }
    export interface secondaryLabelSettings {
        titleText: string;
        titleColor: string;
        titleFontFamily: string;
        titleFontSize: number;
        titleBold: boolean;
        titleItalic: boolean;
        titleUnderline: boolean;
        color: string;
        displayUnits: number;
        textPrecision: number;
        fontSize: number;
        fontFamily: string;
        fontBold: boolean;
        fontItalic: boolean;
        fontUnderline: boolean;
    }
    export interface tertiaryLabelSettings {
        titleText: string;
        titleColor: string;
        titleFontFamily: string;
        titleFontSize: number;
        titleBold: boolean;
        titleItalic: boolean;
        titleUnderline: boolean;
        color: string;
        displayUnits: number;
        textPrecision: number;
        fontSize: number;
        fontFamily: string;
        fontBold: boolean;
        fontItalic: boolean;
        fontUnderline: boolean;
    }
    export interface quaternaryLabelSettings {
        titleText: string;
        titleColor: string;
        titleFontFamily: string;
        titleFontSize: number;
        titleBold: boolean;
        titleItalic: boolean;
        titleUnderline: boolean;
        color: string;
        displayUnits: number;
        textPrecision: number;
        fontSize: number;
        fontFamily: string;
        fontBold: boolean;
        fontItalic: boolean;
        fontUnderline: boolean;
    }
    export interface FifthLabelSettings {
        titleText: string;
        titleColor: string;
        titleFontFamily: string;
        titleFontSize: number;
        titleBold: boolean;
        titleItalic: boolean;
        titleUnderline: boolean;
        color: string;
        displayUnits: number;
        textPrecision: number;
        fontSize: number;
        fontFamily: string;
        fontBold: boolean;
        fontItalic: boolean;
        fontUnderline: boolean;
    }
    export interface SixthLabelSettings {
        titleText: string;
        titleColor: string;
        titleFontFamily: string;
        titleFontSize: number;
        titleBold: boolean;
        titleItalic: boolean;
        titleUnderline: boolean;
        color: string;
        displayUnits: number;
        textPrecision: number;
        fontSize: number;
        fontFamily: string;
        fontBold: boolean;
        fontItalic: boolean;
        fontUnderline: boolean;
    }
    export interface ITextStyle extends IStyleInfo {
        fontFace?: string;
        fontSize?: string;
        fontWeight?: string;
        color: IColorInfo;
    }
    export interface IVisualStyle {
        colorPalette: IColorPalette;
        isHighContrast: boolean;
        titleText: ITextStyle;
        subTitleText: ITextStyle;
        labelText: ITextStyle;
        maxMarginFactor?: number;
    }
    /**
    * Renders a stacked and clustered column chart.
    */
    export class Visual implements IVisual {
        private root;
        private updateCount;
        private static ColumnChartClassName;
        static SeriesClasses: ClassAndSelector;
        private legend;
        private static MainGraphicsContextClassName;
        private AxisGraphicsContextClassName;
        private ColorPalette;
        private background;
        TooltipServiceWrapper: ITooltipServiceWrapper;
        private svg;
        private svgScrollable;
        private mainGraphicsContext;
        private labelGraphicsContext;
        private axisGraphicsContext;
        private axisGraphicsContextScrollable;
        private xAxisGraphicsContext;
        private backgroundGraphicsContext;
        private y1AxisGraphicsContext;
        private clearCatcher;
        private mainGraphicsG;
        private xAxisProperties;
        private yAxisProperties;
        isLegendValue: boolean;
        private isAxistype;
        private isSameAxis;
        private isSecondaryMeasure;
        private isPrimaryMeasure;
        private ScrollBarWidth;
        private data;
        private style;
        private colors;
        private static AxisFontSize;
        private yAxisOrientation;
        private scrollY;
        private scrollX;
        private textProperties;
        private chartType;
        private columnChart;
        private hostService;
        private cartesianVisualHost;
        private legendObjectProperties;
        private removeFlags;
        private layerLegendData;
        private legendLabelFontSize;
        private interactivity;
        private cartesianSmallViewPortProperties;
        private options;
        private static LabelDisplayUnitsDefault;
        private mainGraphicsSVG;
        private lastInteractiveSelectedColumnIndex;
        private interactivityService;
        private dataView;
        dataViews: DataView[];
        private dataViewCat;
        private categoryAxisType;
        private hasCategoryAxis;
        private yAxisIsCategorical;
        private bottomMarginLimit;
        private leftRightMarginLimit;
        private isXScrollBarVisible;
        private isYScrollBarVisible;
        private animator;
        private isScrollable;
        private tooltipsEnabled;
        private element;
        private seriesLabelFormattingEnabled;
        private isComboChart;
        private formattingSettingsService;
        private formattingSettingsModel;
        private categoryAxisProperties;
        private valueAxisProperties;
        visualOptions: CalculateScaleAndDomainOptions;
        private categoryAxisHasUnitType;
        private valueAxisHasUnitType;
        private static LegendLabelFontSizeDefault;
        private static totalHeight;
        private _margin;
        legendDataGlobal: LegendData;
        private get margin();
        private set margin(value);
        private _viewport;
        private get viewport();
        private set viewport(value);
        private _viewportIn;
        private get viewportIn();
        private static substractMargin;
        applyViewportSettings(): void;
        constructor(options: VisualConstructorOptions);
        private matrixToCategorical;
        update(options: VisualUpdateOptions): void;
        private shouldRenderAxis;
        private populateObjectProperties;
        private getValueAxisProperties;
        private getCategoryAxisProperties;
        private renderLegend;
        getLegendTitle(name: any, showPrimaryMeasure: any): string;
        private getCategoryLayout;
        getTickLabelMargins(viewport: any, yMarginLimit: any, textWidthMeasurer: any, textHeightMeasurer: any, axes: any, bottomMarginLimit: any, properties: any, scrollbarVisible: any, showOnRight: any, renderXAxis: any, renderY1Axis: any, renderY2Axis: any): {
            xMax: number;
            yLeft: number;
            yRight: number;
        };
        applyUserMinMax(isScalar: boolean, dataView: DataViewCategorical, xAxisCardProperties: DataViewObject): DataViewCategorical;
        getLegend(colors: IColorPalette, defaultLegendLabelColor: string, defaultColor?: string): LegendSeriesInfo;
        converter(dataViewAll: DataView[], dataView: DataViewCategorical, colors: IColorPalette, is100PercentStacked: boolean, isScalar?: boolean, dataViewMetadata?: DataViewMetadata, chartType?: any, interactivityService?: IInteractivityService): StackedChartGMOData;
        private static canSupportOverflow;
        private static getCategoryValueType;
        private static columnDataTypeHasValue;
        private static isDateTime;
        private static normalizeNonFiniteNumber;
        private static getStackedMultiplier;
        createTooltipInfo(seriesIndex: number, categoryIndex: number): VisualTooltipDataItem[];
        private createDataPoints;
        private static getDataPointColor;
        private static getStackedLabelColor;
        static getInteractiveColumnChartDomElement(element: any): SVGTextElement;
        static legendInfo: LegendData;
        setData(dataViews: DataView[]): void;
        calculateLegend(): LegendData;
        hasLegend(): boolean;
        getFormattingModel(): powerbiApi.visuals.FormattingModel;
        private applyDynamicFormatting;
        private getSampleFilterSettings;
        private getTextWrapSettings;
        private getMeasureTitlesSettings;
        private getTotalLabelSettings;
        private getMeasureLabelSettings;
        private getTitleFontFamily;
        private getTitleFontFlag;
        private getSecondaryLabelSettings;
        private getTertiaryLabelSettings;
        private getQuaternaryLabelSettings;
        private getFifthLabelSettings;
        private getSixthLabelSettings;
        getDefaultSampleFilterSettings(): sampleFilterSettings;
        getDefaultTextWrapSettings(): textWrapSettings;
        getDefaultMeasureTitlesSettings(): measureTitlesSettings;
        getDefaultTotalLabelSettings(): totalLabelSettings;
        getDefaultMeasureLabelSettings(): secondaryLabelSettings;
        getDefaultSecondaryLabelSettings(): secondaryLabelSettings;
        getDefaultTertiaryLabelSettings(): tertiaryLabelSettings;
        getDefaultQuaternaryLabelSettings(): quaternaryLabelSettings;
        getDefaultFifthLabelSettings(): FifthLabelSettings;
        getDefaultSixthLabelSettings(): SixthLabelSettings;
        format(d: number, displayunitValue: number, precisionValue: number, columnType: string): string;
        numberWithCommas(x: any): any;
        private getShowTitle;
        private getTitleText;
        private getTooltipText;
        private getTitleFill;
        private getTitleBgcolor;
        private getTitleSize;
        calculateAxesProperties(options: CalculateScaleAndDomainOptions): IAxisProperties[];
        getPreferredPlotArea(isScalar: boolean, categoryCount: number, categoryThickness: number): IViewport;
        private ApplyInteractivity;
        private selectColumn;
        private createInteractiveLegendDataPoints;
        calculateAxes(categoryAxisProperties: DataViewObject, valueAxisProperties: DataViewObject, textProperties: TextProperties, scrollbarVisible: boolean): IAxisProperties[];
        render(suppressAnimations: boolean, resize: boolean): CartesianVisualRenderResultGMO;
        spliceMeasures(measure: any[]): void;
        private getMaxMarginFactor;
        private hideAxisLabels;
        private renderBackground;
        private renderChart;
        private darkenZeroLine;
        private getValueAxisFill;
        private getCategoryAxisFill;
        private renderAxesLabels;
        private adjustMargins;
        private updateAxis;
        private getUnitType;
        private addUnitTypeToAxisLabel;
        onClearSelection(): void;
        getLegendDispalyUnits(dataView: DataView, propertyName: string): any;
    }
    export {};
}
export import Visual = powerbi.extensibility.visual.Visual;
export {};
