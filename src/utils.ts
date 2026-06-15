/// <reference types="powerbi-visuals-api" />
// @ts-nocheck
import "./legacyUtils";
import type * as PowerbiApi from "powerbi-visuals-api";
import type { VisualDataLabelsSettings, LabelEnabledDataPoint } from "powerbi-visuals-utils-chartutils/lib/dataLabel/dataLabelInterfaces";
import { legendInterfaces } from "powerbi-visuals-utils-chartutils";
import type { IInteractivityService, SelectableDataPoint } from "powerbi-visuals-utils-interactivityutils/lib/interactivityService";
import type { TooltipEnabledDataPoint } from "powerbi-visuals-utils-tooltiputils";
import type * as FormattingUtils from "powerbi-visuals-utils-formattingutils";

type Selector = any;
type DataViewScopeIdentity = any;
type LegendData = legendInterfaces.LegendData;
type DataViewMetadataColumn = PowerbiApi.DataViewMetadataColumn;
type IValueFormatter = FormattingUtils.valueFormatter.IValueFormatter;
//import SelectionId = powerbi.extensibility.visual.SelectionId;
namespace powerbi.extensibility.utils
{
      export class SelectionId{//} implements ISelectionId {
        public selector: Selector;
        // This is a new data structure to support drilling -- in the long term it should replace the 'selector' field
        private selectorsByColumn: Selector;
        private key: string;
        private keyWithoutHighlight: string;
        private DataViewScopeIdentity: DataViewScopeIdentity;
        public highlight: boolean;

        constructor(selector: Selector, highlight: boolean) {
            this.selector = selector;
            this.highlight = highlight;
            this.key = JSON.stringify({ selector: selector ? selector.data : null, highlight: highlight });
            //this.keyWithoutHighlight = JSON.stringify({ selector: selector ? selector.getKey(selector) : null });
        }

     /*   public equals(other: SelectionId): boolean {
            if (!this.selector || !other.selector) {
                return (!this.selector === !other.selector) && this.highlight === other.highlight;
            }
            return this.highlight === other.highlight &&  this.selector.equals(this.selector, other.selector);
        }

        /*public static isEqual(one: SelectionId, other: SelectionId): boolean {
            if (one === other)
                return true;
            if (one == null || other == null)
                return false;
            return one.equals(other);
        }

        /**
         * Checks equality against other for all identifiers existing in this.
         */
       /* public includes(other: SelectionId, ignoreHighlight: boolean = false): boolean {
            let thisSelector = this.selector;
            let otherSelector = other.selector;
            if (!thisSelector || !otherSelector) {
                return false;
            }
            let thisData = thisSelector.data;
            let otherData = otherSelector.data;
            if (!thisData && (thisSelector.metadata && thisSelector.metadata !== otherSelector.metadata))
                return false;
            if (!ignoreHighlight && this.highlight !== other.highlight)
                return false;
            if (thisData) {
                if (!otherData)
                    return false;
                if (thisData.length > 0) {
                    for (let i = 0, ilen = thisData.length; i < ilen; i++) {
                        var thisValue = <DataViewScopeIdentity>thisData[i];
                        if (!otherData.some((otherValue: DataViewScopeIdentity) => DataViewScopeIdentity.equals(thisValue, otherValue)))
                            return false;
                    }
                }
            }
            return true;
        }
*/
        public getKey(): string {
            return this.key;
        }

        public getKeyWithoutHighlight(): string {
            return this.keyWithoutHighlight;
        }
        
        public hasIdentity(): boolean {
            return (this.selector && !!this.selector.data);
        }

        public getSelector(): Selector {
            return this.selector;
        }

        public getSelectorsByColumn(): Selector {
            return this.selectorsByColumn;
        }

        public static createNull(highlight: boolean = false): SelectionId {
            return new SelectionId(null, highlight);
        }

        public static createWithId(id: DataViewScopeIdentity, highlight: boolean = false): SelectionId {
            let selector: Selector = null;
            if (id) {
                selector = {
                    data: [id]
                };
            }
            return new SelectionId(selector, highlight);
        }

        public static createWithMeasure(measureId: string, highlight: boolean = false): SelectionId {
           
            let selector: Selector = {
                metadata: measureId
            };

            let selectionId = new SelectionId(selector, highlight);
            selectionId.selectorsByColumn = { metadata: measureId };
            return selectionId;
        }

        public static createWithIdAndMeasure(id: DataViewScopeIdentity, measureId: string, highlight: boolean = false): SelectionId {
            let selector: powerbi.data.Selector = {};
            if (id) {
                selector.data = [id];
            }
            if (measureId)
                selector.metadata = measureId;
            if (!id && !measureId)
                selector = null;

            let selectionId = new SelectionId(selector, highlight);

            return selectionId;
        }

       /* public static createWithIdAndMeasureAndCategory(id: DataViewScopeIdentity, measureId: string, queryName: string, highlight: boolean = false): SelectionId {
            let selectionId = this.createWithIdAndMeasure(id, measureId, highlight);

            if (selectionId.selector) {
                selectionId.selectorsByColumn = {};
                if (id && queryName) {
                    selectionId.selectorsByColumn.dataMap = {};
                    selectionId.selectorsByColumn.dataMap[queryName] = id;
                }
                if (measureId)
                    selectionId.selectorsByColumn.metadata = measureId;
            }

            return selectionId;
        }
*/
        public static createWithIds(id1: DataViewScopeIdentity, id2: DataViewScopeIdentity, highlight: boolean = false): SelectionId {
            let selector: Selector = null;
            let selectorData = SelectionId.idArray(id1, id2);
            if (selectorData)
                selector = { data: selectorData };
            
            return new SelectionId(selector, highlight);
        }

        public static createWithIdsAndMeasure(id1: DataViewScopeIdentity, id2: DataViewScopeIdentity, measureId: string, highlight: boolean = false): SelectionId {
            let selector: Selector = {};
            let selectorData = SelectionId.idArray(id1, id2);
            if (selectorData)
                selector.data = selectorData;

            if (measureId)
                selector.metadata = measureId;
            if (!id1 && !id2 && !measureId)
                selector = null;
            return new SelectionId(selector, highlight);
        }

        public static createWithSelectorForColumnAndMeasure(dataMap: Selector, measureId: string, highlight: boolean = false): SelectionId {
            let selectionId: SelectionId;
            let keys = Object.keys(dataMap);
            if (keys.length === 2) {
                selectionId = this.createWithIdsAndMeasure(<DataViewScopeIdentity>dataMap[keys[0]], <DataViewScopeIdentity>dataMap[keys[1]], measureId, highlight);
            } else if (keys.length === 1) {
                selectionId = this.createWithIdsAndMeasure(<DataViewScopeIdentity>dataMap[keys[0]], null, measureId, highlight);
            } else {
                selectionId = this.createWithIdsAndMeasure(null, null, measureId, highlight);
            }

            let selectorsByColumn: Selector = {};
           // if (!_.isEmpty(dataMap))
             //   selectorsByColumn.dataMap = dataMap;
                //selectorsByColumn.data.map= dataMap;
            if (measureId)
                selectorsByColumn.metadata = measureId;
            if (!dataMap && !measureId)
                selectorsByColumn = null;

            selectionId.selectorsByColumn = selectorsByColumn;

            return selectionId;
        }

        public static createWithHighlight(original: SelectionId): SelectionId {
          
            let newId = new SelectionId(original.getSelector(), /*highlight*/ true);
            newId.selectorsByColumn = original.selectorsByColumn;

            return newId;
        }

        private static idArray(id1: DataViewScopeIdentity, id2: DataViewScopeIdentity): DataViewScopeIdentity[] {
            if (id1 || id2) {
                let data = [];
                if (id1)
                    data.push(id1);
                if (id2 && id2 !== id1)
                    data.push(id2);
                return data;
            }
        }
    }

}
namespace powerbi.extensibility.visual {
    export interface ChartAxesLabels {
        x: string;
        y: string;
        y2?: string;
    }

    export interface VisualBackground {
        image?: ImageValue;
        transparency?: number;
    }

    export namespace visualBackgroundHelper {
        export function getDefaultColor(): string {
            return '#FFF';
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

        /**
         * Renders a stacked and clustered column chart.
         */
        export interface IAnimationOptions {
            interactivityService: IInteractivityService;
        }

        export interface IAnimationResult {
            failed: boolean;
        }
        export interface IAnimatorOptions {
            duration?: number;
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
        interface CartesianData {
            series: CartesianSeries[];
            categoryMetadata: DataViewMetadataColumn;
            categories: any[];
            hasHighlights?: boolean;
        }
        export interface ISelectionId {
            equals(other: ISelectionId): boolean;
            includes(other: ISelectionId, ignoreHighlight?: boolean): boolean;
            getKey(): string;
            getSelector(): Selector;
            getSelectorsByColumn(): Selector;
            hasIdentity(): boolean;
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
            identity: powerbi.extensibility.utils.SelectionId;
            key?: string;
            fontSize?: number;
            secondRowText?: string;
            weight?: number;
            hasBeenRendered?: boolean;
            labelSize?: ISizeGMO;
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

        export interface ColumnChartSeries extends CartesianSeries {
            displayName: string;
            key: string;
            index: number;
            data: ColumnChartDataPoint[];
            identity: SelectionId;
            color: string;
            labelSettings: VisualDataLabelsSettings;
        }
        /*export interface ColumnChartData extends CartesianData {
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
*/
        export namespace visualBackgroundHelper {
            export function getDefaultColor(): string {
                return '#FFF';
            }

            export function getDefaultTransparency(): number {
                return 50;
            }

            export function getDefaultShow(): boolean {
                return false;
            }

            export function getDefaultValues() {
                return {
                    color: getDefaultColor(),
                    transparency: getDefaultTransparency(),
                    show: getDefaultShow()
                };
            }
        }
        export const scatterChartProps = {
            general: {
                formatString: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'formatString' },
            },
            dataPoint: {
                defaultColor: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'defaultColor' },
                fill: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'fill' },
            },
            trend: {
                show: <DataViewObjectPropertyIdentifier>{ objectName: 'trend', propertyName: 'show' },
            },
            colorBorder: {
                show: <DataViewObjectPropertyIdentifier>{ objectName: 'colorBorder', propertyName: 'show' },
            },
            fillPoint: {
                show: <DataViewObjectPropertyIdentifier>{ objectName: 'fillPoint', propertyName: 'show' },
            },
            colorByCategory: {
                show: <DataViewObjectPropertyIdentifier>{ objectName: 'colorByCategory', propertyName: 'show' },
            },
            currentFrameIndex: {
                index: <DataViewObjectPropertyIdentifier>{ objectName: 'currentFrameIndex', propertyName: 'index' },
            },
            legend: {
                labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelColor' },
            },
            plotArea: {
                image: <DataViewObjectPropertyIdentifier>{ objectName: 'plotArea', propertyName: 'image' },
                transparency: <DataViewObjectPropertyIdentifier>{ objectName: 'plotArea', propertyName: 'transparency' },
            },
        };
        export interface IAnimator<T extends IAnimatorOptions, U extends IAnimationOptions, V extends IAnimationResult> {
            getDuration(): number;
            getEasing(): string;

            animate(options: U): V;
        }
    }
    
}