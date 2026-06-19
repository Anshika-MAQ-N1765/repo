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
     export interface CategoryLayout {
        categoryCount: number;
        categoryThickness: number;
        outerPaddingRatio: number;
        isScalar?: boolean;
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
    }
}
 
/* ===== Publish legacy namespaces onto the shared global `powerbi` =====
* Copies this module's local `powerbi.extensibility.utils` members (ColumnUtil,
* columnChartProps) onto the single shared
* `globalThis.powerbi` object that visual.ts reads from at runtime. */
{
    const g: any = globalThis as any;
    g.powerbi = g.powerbi || {};
    g.powerbi.extensibility = g.powerbi.extensibility || {};
    g.powerbi.extensibility.utils = g.powerbi.extensibility.utils || {};
    if (typeof powerbi !== "undefined" && powerbi.extensibility && powerbi.extensibility.utils) {
        Object.assign(g.powerbi.extensibility.utils, powerbi.extensibility.utils);
    }
}
 