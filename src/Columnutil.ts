/// <reference types="powerbi-visuals-api" />
import "./legacyUtils";
import "./layout";
import powerbiApi from "powerbi-visuals-api";
import { axis as AxisHelper, dataLabelUtils, legendInterfaces, legendPosition } from "powerbi-visuals-utils-chartutils";
import type { IAxisProperties, IMargin } from "powerbi-visuals-utils-chartutils/lib/axis/axisInterfaces";
import type { VisualDataLabelsSettings } from "powerbi-visuals-utils-chartutils/lib/dataLabel/dataLabelInterfaces";
import * as formattingUtils from "powerbi-visuals-utils-formattingutils";
import type { IInteractivityService, SelectableDataPoint } from "powerbi-visuals-utils-interactivityutils/lib/interactivityService";
import type { TooltipEnabledDataPoint } from "powerbi-visuals-utils-tooltiputils";
import { CssConstants } from "powerbi-visuals-utils-svgutils";
import { valueType, double as Double, prototype as Prototype } from "powerbi-visuals-utils-typeutils";

type DataViewObjectPropertyIdentifier = powerbiApi.DataViewObjectPropertyIdentifier;
type DataViewCategorical = powerbiApi.DataViewCategorical;
type DataViewObject = powerbiApi.DataViewObject;
type DataViewMetadataColumn = powerbiApi.DataViewMetadataColumn;
type DataViewPropertyValue = powerbiApi.DataViewPropertyValue;
type DataViewObjects = powerbiApi.DataViewObjects;
type IViewport = powerbiApi.IViewport;
type NumberRange = powerbiApi.NumberRange;
type IColorPalette = powerbiApi.extensibility.IColorPalette;
type PrimitiveValue = powerbiApi.PrimitiveValue;
type Selector = powerbiApi.data.Selector;
type LegendData = legendInterfaces.LegendData;
type LabelEnabledDataPoint = import("powerbi-visuals-utils-chartutils/lib/dataLabel/dataLabelInterfaces").LabelEnabledDataPoint;
type IValueFormatter = formattingUtils.valueFormatter.IValueFormatter;
interface ClassAndSelector extends CssConstants.ClassAndSelector {
    selector: string;
    class: string;
}
type Selection<G = any> = d3.Selection<G>;

function createClassAndSelector(className: string): ClassAndSelector {
    const cs = CssConstants.createClassAndSelector(className);
    return { ...cs, selector: cs.selectorName, class: cs.className };
}

const NewDataLabelUtils = dataLabelUtils;
const valueFormatter = formattingUtils.valueFormatter;
const LegendPosition = legendInterfaces.LegendPosition;
type LegendPositionType = legendInterfaces.LegendPosition;
const ValueType = valueType.ValueType;

namespace powerbi.extensibility.utils {
     export const columnChartProps = {
        dataPoint: {
            defaultColor: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'defaultColor' },
            fill: <DataViewObjectPropertyIdentifier>{},
            showAllDataPoints: <DataViewObjectPropertyIdentifier>{},
        },
        general: {
            formatString: <DataViewObjectPropertyIdentifier>{},
        },
        categoryAxis: {
            axisType: <DataViewObjectPropertyIdentifier>{},
        },
        legend: {
            labelColor: <DataViewObjectPropertyIdentifier>{},
        },
        plotArea: {
            image: <DataViewObjectPropertyIdentifier>{},
            transparency: <DataViewObjectPropertyIdentifier>{},
        },
    };
   
  export interface ChartAxesLabels {
        x: string;
        y: string;
        y2?: string;
    }

    //import columnChartProps = 
    export namespace ColumnUtil {
        export const DimmedOpacity = 0.4;
        export const DefaultOpacity = 1.0;
        export const enum RectLabelPositionGMO {
        None = 0,
        InsideCenter = 1,
        InsideBase = 2,
        InsideEnd = 4,
        OutsideBase = 8,
        OutsideEnd = 16,

        All =
        InsideCenter |
        InsideBase |
        InsideEnd |
        OutsideBase |
        OutsideEnd,

        InsideAll =
        InsideCenter |
        InsideBase |
        InsideEnd,
    }
export class ColumnChartGMO {
        public static SeriesClasses: ClassAndSelector = createClassAndSelector('series');
        public static stackedValidLabelPositions: RectLabelPositionGMO[] = [RectLabelPositionGMO.InsideCenter, RectLabelPositionGMO.InsideEnd, RectLabelPositionGMO.InsideBase];
        public static getLabelFill(labelColor: string, isInside: boolean, isCombo: boolean): string {
            if (labelColor) {
                return labelColor;
            }
            if (isInside && !isCombo) {
                return NewDataLabelUtils.defaultInsideLabelColor;
            }
            return NewDataLabelUtils.defaultLabelColor;
        }
        public static getInteractiveColumnChartDomElement(element: any): SVGTextElement {
            return element.children("svg").get(0);
        }
        public static sliceSeries(series: StackedChartGMOSeries[], endIndex: number, startIndex: number = 0): StackedChartGMOSeries[] {
            let newSeries: StackedChartGMOSeries[] = [];
            if (series && series.length > 0) {
                for (let i = 0, len = series.length; i < len; i++) {
                    let iNewSeries = newSeries[i] = Prototype.inherit(series[i]);
                    // TODO: [investigate] possible perf improvement.
                    // if data[n].categoryIndex > endIndex implies data[n+1].categoryIndex > endIndex
                    // then we could short circuit the filter loop.
                    iNewSeries.data = series[i].data.filter(d => d.categoryIndex >= startIndex && d.categoryIndex < endIndex);
                }
            }
            return newSeries;
        }
    }
        export function applyUserMinMax(isScalar: boolean, dataView: DataViewCategorical, xAxisCardProperties: DataViewObject): DataViewCategorical {
            if (isScalar) {
                let min = xAxisCardProperties['start'];
                let max = xAxisCardProperties['end'];

                return ColumnUtil.transformDomain(dataView, min, max);
            }

            return dataView;
        }
         export interface IAnimatorOptions {
        duration?: number;
    }
     export interface CategoryLayout {
        categoryCount: number;
        categoryThickness: number;
        outerPaddingRatio: number;
        isScalar?: boolean;
    }
    export interface IAnimationOptions {
        interactivityService: IInteractivityService;
    }
    export interface ColumnChartSeries extends CartesianSeries {
        displayName: string;
        key: string;
        index: number;
        data: ColumnChartDataPoint[];
        identity: ISelectionId;
        color: string;
        labelSettings: VisualDataLabelsSettings;
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
  
    export interface ISelectionId {
        equals(other: ISelectionId): boolean;
        includes(other: ISelectionId, ignoreHighlight?: boolean): boolean;
        getKey(): string;
        selector: Selector,
        getSelector(): Selector;
        getSelectorsByColumn(): Selector;
        hasIdentity(): boolean;
    }
    export interface IAnimationResult {
        failed: boolean;
    }
    enum LegendIcon {
                    Box,
                    Circle,
                    Line
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
    export interface ISizeGMO {
        width: number;
        height: number;
    }

    export const enum LabelDataPointParentTypeGMO {
        /* parent shape of data label is a point*/
        Point,

        /* parent shape of data label is a rectangle*/
        Rectangle,

        /* parent shape of data label is a polygon*/
        Polygon
    }
   export interface LabelDataPointGMO {
        textSize: ISizeGMO;
        isPreferred: boolean;
        parentType: LabelDataPointParentTypeGMO;
        parentShape;
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
    export interface IAnimator<T extends IAnimatorOptions, U extends IAnimationOptions, V extends IAnimationResult> {
        getDuration(): number;
        getEasing(): string;

        animate(options: U): V;
    }
        export type IGenericAnimator = IAnimator<IAnimatorOptions, IAnimationOptions, IAnimationResult>;
    //  import IColorPalette= powerbi.extensibility.utils;
    export interface IGMOLegend {
        getMargins(): IViewport;
        isVisible(): boolean;
        changeOrientation(orientation: LegendPositionType): void;
        getOrientation(): LegendPositionType;
        drawLegend(data: LegendData, viewport: IViewport);
        drawLegendInternal(data: LegendData, viewport: IViewport, width: boolean, detailedLegend: any);
        reset(): void;
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
        axesLabels:  ChartAxesLabels;

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
      export type IColumnChartAnimatorGMO = IAnimator<IAnimatorOptions, ColumnChartAnimationOptionsGMO, ColumnChartAnimationResult>;
    export type IColumnChartAnimator = IAnimator<IAnimatorOptions, ColumnChartAnimationOptions, ColumnChartAnimationResult>;
    export interface ColumnGMOBehaviorOptions {
        datapoints: SelectableDataPoint[];
        bars: Selection<any>;
        mainGraphicsContext: Selection<any>;
        hasHighlights: boolean;
        viewport: IViewport;
        axisOptions: ColumnAxisOptions;
        showLabel: boolean;
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
    export interface StackedChartGMOSeries extends CartesianSeries {
        displayName: string;
        key: string;
        index: number;
        data: StackedChartGMODataPoint[];
        identity: ISelectionId;
        color: string;
        labelSettings: VisualDataLabelsSettings;
    }
  export interface CartesianData {
        series: CartesianSeries[];
        categoryMetadata: DataViewMetadataColumn;
        categories: any[];
        hasHighlights?: boolean;
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
     export interface ColumnChartAnimationResult extends IAnimationResult {
        shapes: Selection<any>;
    }

    /*  export interface StackedChartGMOData extends CartesianData {
        categoryFormatter: IValueFormatter;
        series: StackedChartGMOSeries[];
        valuesMetadata: DataViewMetadataColumn[];
        legendData: LegendData;
        hasHighlights: boolean;
        categoryMetadata: DataViewMetadataColumn;
        scalarCategoryAxis: boolean;
        labelSettings: VisualDataLabelsSettings;
        axesLabels:  powerbi.extensibility.visual.ChartAxesLabels;

        hasDynamicSeries: boolean;
        isMultiMeasure: boolean;
        defaultDataPointColor?: string;
        showAllDataPoints?: boolean;

    }*/
       
        export interface ColumnChartAnimationOptionsGMO extends IAnimationOptions {
        viewModel: StackedChartGMOData;
        series: Selection<any>;
        className: Selection<any>;
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
    export interface LegendSeriesInfo {
        legend: LegendData;
        seriesSources: DataViewMetadataColumn[];
        seriesObjects: DataViewObjects[][];
    }

    export interface ColumnChartDrawInfo {
        eventGroup: Selection<any>;
        shapesSelection: Selection<any>;
        viewport: IViewport;
        axisOptions: ColumnAxisOptions;
        labelDataPoints: LabelDataPointGMO[];
    }

    export interface ColumnChartContextGMO {
        height: number;
        width: number;
        duration: number;
        hostService: any;
        margin: IMargin;
        /** A group for graphics can be placed that won't be clipped to the data area of the chart. */
        //unclippedGraphicsContext: Selection<any>;
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

     export interface ColumnChartContext {
        height: number;
        width: number;
        duration: number;
       // hostService: IVisualHostServices;
        margin: IMargin;
        /** A group for graphics can be placed that won't be clipped to the data area of the chart. */
        unclippedGraphicsContext: Selection<any>;
        /** A SVG for graphics that should be clipped to the data area, e.g. data bars, columns, lines */
        mainGraphicsContext: Selection<any>;
        layout: CategoryLayout;
        animator: IColumnChartAnimator;
        onDragStart?: (datum: ColumnChartDataPoint) => void;
        interactivityService: IInteractivityService;
        viewportHeight: number;
        viewportWidth: number;
        is100Pct: boolean;
        isComboChart: boolean;
    }
          export interface IColumnChartStrategy {
        setData(data: ColumnChartData): void;
        setupVisualProps(columnChartProps: ColumnChartContext): void;
        setXScale(is100Pct: boolean, forcedTickCount?: number, forcedXDomain?: any[], axisScaleType?: string, axisDisplayUnits?: number, axisPrecision?: number, ensureXDomain?: NumberRange): IAxisProperties;
        setYScale(is100Pct: boolean, forcedTickCount?: number, forcedYDomain?: any[], axisScaleType?: string, axisDisplayUnits?: number, axisPrecision?: number, ensureYDomain?: NumberRange): IAxisProperties;
        drawColumns(useAnimation: boolean): ColumnChartDrawInfo;
        selectColumn(selectedColumnIndex: number, lastSelectedColumnIndex: number): void;
        getClosestColumnIndex(x: number, y: number): number;
    }

    export interface IColumnChartConverterStrategy {
        getLegend(colors: IColorPalette, defaultLegendLabelColor: string, defaultColor?: string): LegendSeriesInfo;
        getValueBySeriesAndCategory(series: number, category: number): number;
        getHighlightBySeriesAndCategory(series: number, category: number): PrimitiveValue;
    }

        export function transformDomain(dataView: DataViewCategorical, min: DataViewPropertyValue, max: DataViewPropertyValue): DataViewCategorical {
            if (!dataView.categories || !dataView.values || dataView.categories.length === 0 || dataView.values.length === 0)
                return dataView;// no need to do something when there are no categories

            if (typeof min !== "number" && typeof max !== "number")
                return dataView;//user did not set min max, nothing to do here

            let category = dataView.categories[0];//at the moment we only support one category
            let categoryType = category ? category.source.type : null;

            // Min/Max comparison won't work if category source is Ordinal
            if (AxisHelper.isOrdinal(categoryType))
                return dataView;

            let categoryValues = category.values;
            let categoryObjects = category.objects;

            if (!categoryValues || !categoryObjects)
                return dataView;
            let newcategoryValues = [];
            let newValues = [];
            let newObjects = [];

            //get new min max
            if (typeof min !== "number") {
                min = categoryValues[0];
            }
            if (typeof max !== "number") {
                max = categoryValues[categoryValues.length - 1];
            }

            //don't allow this
            if (min > max)
                return dataView;

            //build measure array
            for (let j = 0, len = dataView.values.length; j < len; j++) {
                newValues.push([]);
            }

            for (let t = 0, len = categoryValues.length; t < len; t++) {
                if (categoryValues[t] >= min && categoryValues[t] <= max) {
                    newcategoryValues.push(categoryValues[t]);
                    if (categoryObjects) {
                        newObjects.push(categoryObjects[t]);
                    }

                    //on each measure set the new range
                    if (dataView.values) {
                        for (let k = 0; k < dataView.values.length; k++) {
                            newValues[k].push(dataView.values[k].values[t]);
                        }
                    }
                }
            }

            //don't write directly to dataview
            let resultDataView = Prototype.inherit(dataView);
            let resultDataViewValues = resultDataView.values = Prototype.inherit(resultDataView.values);
            let resultDataViewCategories = resultDataView.categories = Prototype.inherit(dataView.categories);
            let resultDataViewCategories0 = resultDataView.categories[0] = Prototype.inherit(resultDataViewCategories[0]);

            resultDataViewCategories0.values = newcategoryValues;
            //only if we had objects, then you set the new objects
            if (resultDataViewCategories0.objects) {
                resultDataViewCategories0.objects = newObjects;
            }

            //update measure array
            for (let t = 0, len = dataView.values.length; t < len; t++) {
                let measureArray = resultDataViewValues[t] = Prototype.inherit(resultDataViewValues[t]);
                measureArray.values = newValues[t];
            }

            return resultDataView;
        }

        export function getCategoryAxis(
            data: ColumnChartData,
            size: number,
            layout: CategoryLayout,
            isVertical: boolean,
            forcedXMin?: DataViewPropertyValue,
            forcedXMax?: DataViewPropertyValue,
            axisScaleType?: string,
            axisDisplayUnits?: number,
            axisPrecision?: number,
            ensureXDomain?: NumberRange): IAxisProperties {

            let categoryThickness = layout.categoryThickness;
            let isScalar = layout.isScalar;
            let outerPaddingRatio = layout.outerPaddingRatio;
            let domain = AxisHelper.createDomain(data.series, data.categoryMetadata ? data.categoryMetadata.type : ValueType.fromDescriptor({ text: true }), isScalar, [forcedXMin, forcedXMax], ensureXDomain);

            let axisProperties = AxisHelper.createAxis({
                pixelSpan: size,
                dataDomain: domain,
                metaDataColumn: data.categoryMetadata,
                formatString: valueFormatter.getFormatString(data.categoryMetadata, columnChartProps.general.formatString),
                outerPadding: categoryThickness * outerPaddingRatio,
                isCategoryAxis: true,
                isScalar: isScalar,
                isVertical: isVertical,
                categoryThickness: categoryThickness,
                useTickIntervalForDisplayUnits: true,
                getValueFn: (index, type) => (powerbiApi as any).extensibility.utils.CartesianHelper.lookupXValue(data, index, type, isScalar),
                scaleType: axisScaleType,
                axisDisplayUnits: axisDisplayUnits,
                axisPrecision: axisPrecision
            });

            // intentionally updating the input layout by ref
            layout.categoryThickness = axisProperties.categoryThickness;

            return axisProperties;
        }

        export function applyInteractivity(columns: d3.Selection<any>, onDragStart): void {
            //debug.assertValue(columns, 'columns');

            if (onDragStart) {
                columns
                    .attr('draggable', 'true')
                    .on('dragstart', onDragStart);
            }
        }

        export function getFillOpacity(selected: boolean, highlight: boolean, hasSelection: boolean, hasPartialHighlights: boolean): number {
            if ((hasPartialHighlights && !highlight) || (hasSelection && !selected))
                return DimmedOpacity;
            return DefaultOpacity;
        }

        export function getClosestColumnIndex(coordinate: number, columnsCenters: number[]): number {
            let currentIndex = 0;
            let distance: number = Number.MAX_VALUE;
            for (let i = 0, ilen = columnsCenters.length; i < ilen; i++) {
                let currentDistance = Math.abs(coordinate - columnsCenters[i]);
                if (currentDistance < distance) {
                    distance = currentDistance;
                    currentIndex = i;
                }
            }

            return currentIndex;
        }

        /* ## export function setChosenColumnOpacity(mainGraphicsContext: d3.Selection<any>, columnGroupSelector: string, selectedColumnIndex: number, lastColumnIndex: number): void {
            let series = mainGraphicsContext.selectAll(ColumnChart.SeriesClasses.selector);
            let lastColumnUndefined = typeof lastColumnIndex === 'undefined';
            // find all columns that do not belong to the selected column and set a dimmed opacity with a smooth animation to those columns
            series.selectAll(rectName + columnGroupSelector).filter((d: ColumnChartDataPoint) => {
                return (d.categoryIndex !== selectedColumnIndex) && (lastColumnUndefined || d.categoryIndex === lastColumnIndex);
            }).transition().style('fill-opacity', DimmedOpacity);

            // set the default opacity for the selected column
            series.selectAll(rectName + columnGroupSelector).filter((d: ColumnChartDataPoint) => {
                return d.categoryIndex === selectedColumnIndex;
            }).style('fill-opacity', DefaultOpacity);
        }*/

        // export function drawSeries(data: ColumnChartData, graphicsContext: d3.Selection<any>, axisOptions: ColumnAxisOptions): d3.Selection<any> {
        //     let colGroupSelection = graphicsContext.selectAll(ColumnChart.SeriesClasses.selectorName);
        //     let series = colGroupSelection.data(data.series, (d: ColumnChartSeries) => d.key);

        //     series
        //         .enter()
        //         .append('g')
        //         .classed(ColumnChart.SeriesClasses.className, true);

        //     series
        //         .style({
        //             fill: (d: ColumnChartSeries) => d.color,
        //         });

        //     series
        //         .exit()
        //         .remove();

        //     return series;
        // }

       /* export function drawDefaultShapes(data: ColumnChartData, series: d3.Selection<any>, layout: IColumnLayout, itemCS: ClassAndSelector, filterZeros: boolean, hasSelection: boolean): D3.UpdateSelection {
            // We filter out invisible (0, null, etc.) values from the dataset
            // based on whether animations are enabled or not, Dashboard and
            // Exploration mode, respectively.
            let dataSelector: (d: ColumnChartSeries) => any[];
            if (filterZeros) {
                dataSelector = (d: ColumnChartSeries) => {
                    let filteredData = _.filter(d.data, (datapoint: ColumnChartDataPoint) => !!datapoint.value);
                    return filteredData;
                };
            }
            else {
                dataSelector = (d: ColumnChartSeries) => d.data;
            }

            let shapeSelection = series.selectAll(itemCS.selector);
            let shapes = shapeSelection.data(dataSelector, (d: ColumnChartDataPoint) => d.key);

            shapes.enter()
                .append(rectName)
                .attr("class", (d: ColumnChartDataPoint) => itemCS.class.concat(d.highlight ? " highlight" : ""));

            shapes
                .style("fill-opacity", (d: ColumnChartDataPoint) => ColumnUtil.getFillOpacity(d.selected, d.highlight, hasSelection, data.hasHighlights))
                .style("fill", (d: ColumnChartDataPoint) => d.color !== data.series[d.seriesIndex].color ? d.color : null)  // PERF: Only set the fill color if it is different than series.
                .attr(layout.shapeLayout);

            shapes
                .exit()
                .remove();

            return shapes;
        }

        export function drawDefaultLabels(series: d3.Selection<any>, context: d3.Selection<any>, layout: ILabelLayout, viewPort: IViewport, isAnimator: boolean = false, animationDuration?: number): D3.UpdateSelection {
            if (series) {
                let seriesData = series.data();
                let dataPoints: ColumnChartDataPoint[] = [];

                for (let i = 0, len = seriesData.length; i < len; i++) {
                    Array.prototype.push.apply(dataPoints, seriesData[i].data);
                }

                return dataLabelUtils.drawDefaultLabelsForDataPointChart(dataPoints, context, layout, viewPort, isAnimator, animationDuration);
            }
            else {
                dataLabelUtils.cleanDataLabels(context);
            }
        }

        export function normalizeInfinityInScale(scale: d3.scale.GenericScale<any>): void {
            // When large values (eg Number.MAX_VALUE) are involved, a call to scale.nice occasionally
            // results in infinite values being included in the domain. To correct for that, we need to
            // re-normalize the domain now to not include infinities.
            let scaledDomain = scale.domain();
            for (let i = 0, len = scaledDomain.length; i < len; ++i) {
                if (scaledDomain[i] === Number.POSITIVE_INFINITY)
                    scaledDomain[i] = Number.MAX_VALUE;
                else if (scaledDomain[i] === Number.NEGATIVE_INFINITY)
                    scaledDomain[i] = -Number.MAX_VALUE;
            }

            scale.domain(scaledDomain);
        }

        export function calculatePosition(d: ColumnChartDataPoint, axisOptions: ColumnAxisOptions): number {
            let xScale = axisOptions.xScale;
            let yScale = axisOptions.yScale;
            let scaledY0 = yScale(0);
            let scaledX0 = xScale(0);
            switch (d.chartType) {
                case ColumnChartType.stackedBar:
                case ColumnChartType.hundredPercentStackedBar:
                    return scaledX0 + Math.abs(AxisHelper.diffScaled(xScale, 0, d.valueAbsolute)) +
                        AxisHelper.diffScaled(xScale, d.position - d.valueAbsolute, 0) + dataLabelUtils.defaultColumnLabelMargin;
                case ColumnChartType.clusteredBar:
                    return scaledX0 + AxisHelper.diffScaled(xScale, Math.max(0, d.value), 0) + dataLabelUtils.defaultColumnLabelMargin;
                case ColumnChartType.stackedColumn:
                case ColumnChartType.hundredPercentStackedColumn:
                    return scaledY0 + AxisHelper.diffScaled(yScale, d.position, 0) - dataLabelUtils.defaultColumnLabelMargin;
                case ColumnChartType.clusteredColumn:
                    return scaledY0 + AxisHelper.diffScaled(yScale, Math.max(0, d.value), 0) - dataLabelUtils.defaultColumnLabelMargin;
            }

        }*/
    
 export interface IColumnChartConverterStrategy {
        getLegend(colors: IColorPalette, defaultLegendLabelColor: string, defaultColor?: string): LegendSeriesInfo;
        getValueBySeriesAndCategory(series: number, category: number): number;
        getHighlightBySeriesAndCategory(series: number, category: number): PrimitiveValue;
    }
    export namespace ClusteredUtil {

        export function clearColumns(
            mainGraphicsContext: d3.Selection<any>,
            itemCS: ClassAndSelector): void {

            // debug.assertValue(mainGraphicsContext, 'mainGraphicsContext');
            // debug.assertValue(itemCS, 'itemCS');

            let cols = mainGraphicsContext.selectAll(itemCS.selector)
                .data([]);

            cols.exit().remove();
        }
    }

    export interface ValueMultiplers {
        pos: number;
        neg: number;
    }

    export namespace StackedUtil {
        const PctRoundingError = 0.0001;

        /*export function getSize(scale: D3.Scale.GenericScale<any>, size: number, zeroVal: number = 0): number {
            return AxisHelper.diffScaled(scale, zeroVal, size);
        }*/

        export function calcValueDomain(data: ColumnChartSeries[], is100pct: boolean): NumberRange {
            let defaultNumberRange = {
                min: 0,
                max: 10
            };

            if (data.length === 0)
                return defaultNumberRange;

            // Can't use AxisHelper because Stacked layout has a slightly different calc, (position - valueAbs)
            let min = (d3 as any).min(data, (d: ColumnChartSeries) => (d3 as any).min(d.data, (e: ColumnChartDataPoint) => e.position - e.valueAbsolute));
            let max = (d3 as any).max(data, (d: ColumnChartSeries) => (d3 as any).max(d.data, (e: ColumnChartDataPoint) => e.position));

            if (is100pct) {
                min = Double.roundToPrecision(min, PctRoundingError);
                max = Double.roundToPrecision(max, PctRoundingError);
            }

            return {
                min: min,
                max: max,
            };
        }

        export function getStackedMultiplier(
            dataView: DataViewCategorical,
            rowIdx: number,
            seriesCount: number,
            categoryCount: number,
            converterStrategy: IColumnChartConverterStrategy): ValueMultiplers {
            // debug.assertValue(dataView, 'dataView');
            // debug.assertValue(rowIdx, 'rowIdx');

            let pos: number = 0,
                neg: number = 0;

            for (let i = 0; i < seriesCount; i++) {
                let value: number = converterStrategy.getValueBySeriesAndCategory(i, rowIdx);
                value = AxisHelper.normalizeNonFiniteNumber(value);

                if (value > 0)
                    pos += value;
                else if (value < 0)
                    neg -= value;
            }

            let absTotal = pos + neg;
            return {
                pos: pos ? (pos / absTotal) / pos : 1,
                neg: neg ? (neg / absTotal) / neg : 1,
            };
        }

        export function clearColumns(
            mainGraphicsContext: d3.Selection<any>,
            itemCS: ClassAndSelector): void {



            let bars = mainGraphicsContext.selectAll(itemCS.selector)
                .data([]);

            bars.exit().remove();
        }
    }
}
}