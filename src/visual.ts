/// <reference types="powerbi-visuals-api" />
/// <reference path="./legacyShim.d.ts" />
import powerbiApi from "powerbi-visuals-api";
import { drag as d3Drag, pointer as d3Pointer } from "d3"; import "./layout"; import "./selectionId"; import "./Columnutil"; import { converterHelper } from "powerbi-visuals-utils-dataviewutils"; import * as dataViewObjects from "powerbi-visuals-utils-dataviewutils/lib/dataViewObjects"; import * as dataViewObject from "powerbi-visuals-utils-dataviewutils/lib/dataViewObject"; import { axis as AxisHelper, axisScale, axisStyle, dataLabelUtils, legend, legendInterfaces, legendPosition, svgLegend, } from "powerbi-visuals-utils-chartutils"; import type { IDataLabelSettings, DataLabelObject, LabelEnabledDataPoint, VisualDataLabelsSettings, } from "powerbi-visuals-utils-chartutils/lib/dataLabel/dataLabelInterfaces"; import type { IMargin, IAxisProperties } from "powerbi-visuals-utils-chartutils/lib/axis/axisInterfaces"; import { ColorHelper } from "powerbi-visuals-utils-colorutils"; import * as formattingUtils from "powerbi-visuals-utils-formattingutils"; import { appendClearCatcher, createInteractivityService, dataHasSelection, IInteractiveBehavior, IInteractivityService, ISelectionHandler, SelectableDataPoint, } from "powerbi-visuals-utils-interactivityutils/lib/interactivityService"; import { createTooltipServiceWrapper, ITooltipServiceWrapper, TooltipEnabledDataPoint, TooltipEventArgs, } from "powerbi-visuals-utils-tooltiputils"; import { CssConstants, IRect, manipulation, Rect } from "powerbi-visuals-utils-svgutils"; import { valueType, double as Double, prototype as Prototype, enumExtensions as EnumExtensions, pixelConverter as PixelConverter } from "powerbi-visuals-utils-typeutils";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "./formattingSettings";
 
type DataViewObjects = powerbiApi.DataViewObjects; type DataViewObject = powerbiApi.DataViewObject; type DataViewObjectPropertyIdentifier = powerbiApi.DataViewObjectPropertyIdentifier; type DataViewMetadataColumn = powerbiApi.DataViewMetadataColumn; type DataView = powerbiApi.DataView; type IViewport = powerbiApi.IViewport; type NumberRange = powerbiApi.NumberRange; type VisualObjectInstance = powerbiApi.VisualObjectInstance; type VisualTooltipDataItem = powerbiApi.extensibility.VisualTooltipDataItem; type IColorPalette = powerbiApi.extensibility.IColorPalette; type Selector = powerbiApi.data.Selector; type ImageValue = powerbiApi.ImageValue; type UpdateSelection<G = any> = d3.selection.Update; type Selection<G = any> = d3.Selection; interface ClassAndSelector extends CssConstants.ClassAndSelector { selector: string; class: string; }
 
function createClassAndSelector(className: string): ClassAndSelector { const cs = CssConstants.createClassAndSelector(className); return { ...cs, selector: cs.selectorName, class: cs.className, }; }
 
const NewDataLabelUtils = dataLabelUtils; const Legend = legend; const LegendPosition = legendInterfaces.LegendPosition; type LegendPositionType = legendInterfaces.LegendPosition; type LegendData = legendInterfaces.LegendData; type LegendDataPoint = legendInterfaces.LegendDataPoint; const legendProps = legendInterfaces.legendProps; const SVGLegend = svgLegend.SVGLegend;
// Read the legend behavior from the SHARED global `powerbi` (populated by
// legacyUtils). visual.ts has its own file-local `powerbi` namespace, so we must
// go through globalThis to see members published by the other modules.
const LegendBehavior = (globalThis as any).powerbi?.extensibility?.utils?.chart?.legend?.LegendBehavior;
type LegendBehaviorOptions = any;
const valueFormatter = formattingUtils.valueFormatter;
const TextMeasurementService = formattingUtils.textMeasurementService;
type TextProperties = formattingUtils.interfaces.TextProperties;
const font = formattingUtils.font;
const wordBreaker = formattingUtils.wordBreaker;
type IValueFormatter = formattingUtils.valueFormatter.IValueFormatter;
 
/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
 
namespace powerbi.extensibility.visual { export interface ChartAxesLabels { x: string; y: string; y2?: string; }
 
export interface VisualBackground {
   image?: ImageValue;
   transparency?: number;
}
 
    const ValueType = valueType.ValueType;
    // These members live in OTHER modules' `namespace powerbi {}` blocks, which in
    // the ES-module build are file-local. The publish footers in layout.ts,
    // Columnutil.ts and selectionId.ts copy them onto the SHARED globalThis.powerbi,
    // and the side-effect imports above guarantee those run before this point.
    const ColumnUtil = (globalThis as any).powerbi?.extensibility?.utils?.ColumnUtil;
    const CartesianHelper = (globalThis as any).powerbi?.extensibility?.utils?.CartesianHelper;
    const axisType = (globalThis as any).powerbi?.extensibility?.visual?.axisType;
    const yAxisPosition = (globalThis as any).powerbi?.extensibility?.visual?.yAxisPosition;
    const SelectionId = (globalThis as any).powerbi?.extensibility?.visual?.SelectionId;
    type SelectionId = any;
    const SelectionIdBuilder = (globalThis as any).powerbi?.extensibility?.visual?.SelectionIdBuilder;let globalallDataPoints : StackedChartGMODataPoint[] = [];
 
export type IGenericAnimator = IAnimator<IAnimatorOptions, IAnimationOptions, IAnimationResult>;
export interface IGMOLegend {
   getMargins(): IViewport;
   isVisible(): boolean;
   changeOrientation(orientation: LegendPositionType): void;
   getOrientation(): LegendPositionType;
   drawLegend(data: LegendData, viewport: IViewport);
   drawLegendInternal(data: LegendData, viewport: IViewport, width: boolean, detailedLegend: any);
   reset(): void;
}
 
export interface BehaviorOptions { 
   clearCatcher: Selection<any>; 
   taskSelection: Selection<any>; 
   legendSelection: Selection<any>; 
   interactivityService: IInteractivityService; 
} 
export namespace visualBackgroundHelper { 
   export function getDefaultTransparency(): number { 
       return 50; 
   } 
   export function enumeratePlot(enumeration: any, background: VisualBackground): void { 
       let transparency = (background && background.transparency); 
       if (transparency == null) 
           transparency = getDefaultTransparency(); 
 
       let backgroundObject: VisualObjectInstance = { 
           selector: null, 
           properties: { 
               transparency: transparency, 
               image: (background && background.image) 
           }, 
           objectName: 'plotArea', 
       }; 
 
       enumeration.pushInstance(backgroundObject); 
   } 
} 
export class ChartBehavior implements IInteractiveBehavior { 
   private options: BehaviorOptions; 
   private selectionHandler: ISelectionHandler; 
 
   public bindEvents(options: BehaviorOptions, selectionHandler: ISelectionHandler) { 
       this.options = options; 
       let clearCatcher: Selection<any> = options.clearCatcher; 
       this.selectionHandler = selectionHandler; 
 
       options.taskSelection.on("click", (event: MouseEvent, d: SelectableDataPoint) => { 
           selectionHandler.handleSelection(d, event.ctrlKey); 
           event.stopPropagation(); 
       }); 
 
       clearCatcher.on("click", () => { 
           selectionHandler.handleClearSelection(); 
       }); 
   } 
 
   public renderSelection(hasSelection: boolean) { 
       this.options.taskSelection.style("opacity", (d: SelectableDataPoint) => { 
           return (hasSelection && !d.selected) ? 0.2 : 0.8; 
       }); 
   } 
} 
export namespace AnimatorCommon { 
   export const MinervaAnimationDuration = 250; 
   export const MaxDataPointsToAnimate = 1000; 
   export function GetAnimationDuration(animator: IGenericAnimator, suppressAnimations: boolean) { 
       return (suppressAnimations || !animator) ? 0 : animator.getDuration(); 
   } 
} 
export const cartesianChartProps = { 
   scalarKey: { 
       scalarKeyMin: <DataViewObjectPropertyIdentifier>{ objectName: 'scalarKey', propertyName: 'min' }, 
   }, 
}; 
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
   selector: Selector, 
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
interface CardFormatSetting { 
   showTitle: boolean; 
   textSize: number; 
   wordWrap: boolean; 
} 
 
interface TitleLayout { 
   x: number; 
   y: number; 
   text: string; 
   width: number; 
} 
const enum NavigationArrowType { 
   Increase, 
   Decrease 
} 
interface NavigationArrow { 
   x: number; 
   y: number; 
   path: string; 
   rotateTransform: string; 
   type: NavigationArrowType; 
} 
interface LegendLayout { 
   numberOfItems: number; 
   title: TitleLayout; 
   navigationArrows: NavigationArrow[]; 
} 
interface LegendItem { 
   dataPoint: LegendDataPoint; 
   textProperties: TextProperties; 
   width: number; 
   desiredWidth: number; 
   desiredOverMaxWidth: boolean; 
} 
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
export function getValue<T>(objects: DataViewObjects, objectName: string, propertyName: string, defaultValue: T): T { 
   if (objects) { 
       let object = objects[objectName]; 
       if (object) { 
           let property: T = <T>object[propertyName]; 
           if (property !== undefined) { 
               return property; 
           } 
       } 
   } 
   return defaultValue; 
} 
 
export class GMOSVGLegend implements IGMOLegend { 
   private maxLegendTextLength; 
   private mainGraphicsContext: Selection<any>; 
   private labelGraphicsContext: Selection<any>; 
   private mainGraphicsSVG: Selection<any>; 
   private orientation: LegendPositionType; 
   private viewport: IViewport; 
   private parentViewport: IViewport; 
   private svg: Selection<any>; 
   private group: Selection<any>; 
   private element: JQuery; 
   private clearCatcher: Selection<any>; 
   private interactivityService: IInteractivityService; 
   private legendDataStartIndex = 0; 
   private arrowPosWindow = 1; 
   private data: LegendData; 
   private isScrollable: boolean; 
   private primaryTitle: string = ''; 
   private secondaryTitle: string = ''; 
   private lastCalculatedWidth = 0; 
   private visibleLegendWidth = 0; 
   public TooltipServiceWrapper: ITooltipServiceWrapper; 
   private static identity: ISelectionId; 
   private visibleLegendHeight = 0; 
   private legendFontSizeMarginDifference = 0; 
   private legendFontSizeMarginValue = 0; 
   public legendHeight: number = 0; 
   public legendItemWidth: number = 0; 
   public static DefaultFontSizeInPt = 8; 
   private static LegendIconRadius = 5; 
   private static LegendIconRadiusFactor = 5; 
   private static MaxTextLength = 150; 
   private static MaxTitleLength = 80; 
   private static TextAndIconPadding = 5; 
   private static TitlePadding = 15; 
   private static LegendEdgeMariginWidth = 10; 
   private static LegendMaxWidthFactor = 0.3; 
   private static TopLegendHeight = 24; 
   private static DefaultTextMargin: number; 
   DefaultTextMargin = PixelConverter.fromPointToPixel(GMOSVGLegend.DefaultFontSizeInPt); 
   private static DefaultMaxLegendFactor = GMOSVGLegend.MaxTitleLength / GMOSVGLegend.DefaultTextMargin; 
   private secondaryExists: number = 0; 
   private static LegendArrowOffset = 10; 
   private static LegendArrowHeight = 15; 
   private static LegendArrowWidth = 7.5; 
   private static LegendArrowTranslateY = 3.5; 
   private detailedLegend: string = ''; 
   private static DefaultFontFamily = 'Segoe UI'; 
   private static DefaultTitleFontFamily = 'Segoe UI'; 
   private static LegendItem: ClassAndSelector = createClassAndSelector('legendItem'); 
   private static LegendText: ClassAndSelector = createClassAndSelector('legendText'); 
   public static LegendIcon: ClassAndSelector = createClassAndSelector('legendIcon'); 
   public static LegendTitle: ClassAndSelector = createClassAndSelector('legendTitle'); 
   private static NavigationArrow: ClassAndSelector = createClassAndSelector('navArrow'); 
 
   constructor( 
       
       element: any, 
       legendPosition: LegendPositionType, 
       interactivityService: IInteractivityService, 
       isScrollable: boolean) { 
       d3.select(element).style('fill', 'transparent'); 
       this.svg = d3.select(element).append('svg').style('position', 'absolute'); 
       this.svg.style('display', 'inherit'); 
       this.svg.classed('legend', true); 
       if (interactivityService) 
           this.clearCatcher = appendClearCatcher(this.svg); 
       this.group = this.svg.append('g').attr('id', 'legendGroup'); 
       this.interactivityService = interactivityService; 
       this.isScrollable = isScrollable; 
       this.element = element; 
       this.changeOrientation(legendPosition); 
       this.parentViewport = { height: 0, width: 0 }; 
       this.calculateViewport([], ""); 
       this.updateLayout(''); 
 
   } 
 
   private updateLayout(detailedLegend) { 
       let legendViewport = this.viewport; 
       let orientation = this.orientation; 
       if (this.data) { 
 
let check=(detailedLegend!=="None"); if (this.isTopOrBottom(this.orientation)) { if ( check && this.secondaryExists) { legendViewport.height = legendViewport.height + 3 * (this.legendFontSizeMarginDifference) + 20; } else if (check|| this.secondaryExists) { legendViewport.height = legendViewport.height + 2 * (this.legendFontSizeMarginDifference) + 20; } 

          } 
       } 
       let legend = this.svg 
       legend.attr({ 
           'height': legendViewport.height || (orientation === LegendPosition.None ? 0 : this.parentViewport.height), 
           'width': legendViewport.width || (orientation === LegendPosition.None ? 0 : this.parentViewport.width) 
       }); 
 
       let isRight = orientation === LegendPosition.Right || orientation === LegendPosition.RightCenter; 
       let isBottom = orientation === LegendPosition.Bottom || orientation === LegendPosition.BottomCenter; 
       legend.style({ 
           'left': isRight ? (this.parentViewport.width - legendViewport.width) + 'px' : null, 
           'top': isBottom ? (this.parentViewport.height - legendViewport.height) + 'px' : null, 
       }); 
   } 
 
   private calculateViewport(data, detailedLegend): void { 
       switch (this.orientation) { 
           case LegendPosition.Top: 
           case LegendPosition.Bottom: 
           case LegendPosition.TopCenter: 
           case LegendPosition.BottomCenter: 
               let pixelHeight = PixelConverter.fromPointToPixel(this.data && this.data.fontSize ? this.data.fontSize : SVGLegend.DefaultFontSizeInPt); 
               let fontHeightSize = GMOSVGLegend.TopLegendHeight + (pixelHeight - SVGLegend.DefaultFontSizeInPt); 
               this.viewport = { height: fontHeightSize, width: 0 }; 
               return; 
           case LegendPosition.Right: 
           case LegendPosition.Left: 
           case LegendPosition.RightCenter: 
           case LegendPosition.LeftCenter: 
               let width = this.lastCalculatedWidth ? this.lastCalculatedWidth : this.parentViewport.width * GMOSVGLegend.LegendMaxWidthFactor; 
               if (detailedLegend!=="None") { 
                   width = ((data.dataPoints[0]['measure'].length + data.dataPoints[0]['percentage'].length + 1) * this.data.fontSize / 2); 
               } 
 
             else if ((detailedLegend === undefined || detailedLegend === "None") && data.dataPoints[0]['secondarymeasure'] > 0) { 
                   width = data.dataPoints[0]['secondarymeasure'].length * this.data.fontSize / 2; 
               } 
               this.viewport = { height: 0, width: width + this.data.fontSize }; 
               return; 
 
           case LegendPosition.None: 
               this.viewport = { height: 0, width: 0 }; 
       } 
   } 
 
   public getMargins(): IViewport { 
       return this.viewport; 
   } 
 
   public isVisible(): boolean { 
       return this.orientation !== LegendPosition.None; 
   } 
 
   public changeOrientation(orientation: LegendPositionType): void { 
       if (orientation) { 
           this.orientation = orientation; 
       } else { 
           this.orientation = LegendPosition.Top; 
       } 
       this.svg.attr('orientation', orientation); 
   } 
 
   public getOrientation(): LegendPositionType { 
       return this.orientation; 
   } 
   public drawLegend(data: LegendData, viewport: IViewport): void { 
       // clone because we modify legend item label with ellipsis if it is truncated 
       let clonedData = Prototype.inherit(data); 
       let newDataPoints: LegendDataPoint[] = []; 
       for (let dp of data.dataPoints) { 
           newDataPoints.push(Prototype.inherit(dp)); 
       } 
       clonedData.dataPoints = newDataPoints; 
 
       this.setTooltipToLegendItems(clonedData); 
       this.drawLegendInternal(clonedData, viewport, true, ""); 
   } 
 
   public drawLegendInternal(data: LegendData, viewport: IViewport, autoWidth: boolean, detailedLegend): void { 
       let clonedData = Prototype.inherit(data); 
       this.data = clonedData; 
       this.parentViewport = viewport; 
       this.detailedLegend = detailedLegend; 
 
       if (this.interactivityService) { 
           this.interactivityService.applySelectionStateToData(data.dataPoints); 
       } 
       if (data.dataPoints.length === 0) { 
           this.changeOrientation(LegendPosition.Top); 
       } 
       if (this.getOrientation() === LegendPosition.None) { 
           data.dataPoints = []; 
       } 
       let mapControl = $(this.element).children(".mapControl"); 
       if (mapControl.length > 0 && !this.isTopOrBottom(this.orientation)) { 
           mapControl.css("display", "inline-block"); 
       } 
       this.calculateViewport(data, detailedLegend); 
       let layout = this.calculateLayout(data, autoWidth, detailedLegend); 
       let titleLayout = layout.title; 
       let titleData = titleLayout ? [titleLayout] : []; 
       let group = this.group; 
 
       let hasSelection = this.interactivityService && dataHasSelection(data.dataPoints); 
       this.group 
           .selectAll(GMOSVGLegend.LegendItem.selector).remove(); 
       this.group 
           .selectAll(GMOSVGLegend.LegendTitle.selector).remove(); 
 
       if (this.isCentered(this.orientation)) { 
           let centerOffset = 0; 
           if (this.isTopOrBottom(this.orientation)) { 
               centerOffset = Math.max(0, (this.parentViewport.width - this.visibleLegendWidth) / 2); 
               group.attr('transform', manipulation.translate(centerOffset, 0)); 
           } 
           else { 
               centerOffset = Math.max((this.parentViewport.height - this.visibleLegendHeight) / 2); 
               group.attr('transform', manipulation.translate(0, centerOffset)); 
           } 
       } 
       else { 
           group.attr('transform', null); 
       } 
       if (titleLayout) { 
           let legendTitle = group 
               .selectAll(GMOSVGLegend.LegendTitle.selector) 
               .data(titleData); 
 
           legendTitle.enter() 
               .append('text').attr({ 
                   'x': (d: TitleLayout) => d.x, 
                   'y': (d: TitleLayout) => d.y 
               }).text(titleLayout.text).style({ 
                   'fill': data.labelColor, 
                   'font-size': PixelConverter.fromPoint(data.fontSize), 
                   'font-family': GMOSVGLegend.DefaultTitleFontFamily 
               }).classed(GMOSVGLegend.LegendTitle.class, true); 
           legendTitle 
               .append('title').text(this.data.title); 
 
           legendTitle.exit().remove(); 
       } 
 
       if (data.dataPoints.length) { 
           let virtualizedDataPoints = data.dataPoints.slice(this.legendDataStartIndex, this.legendDataStartIndex + layout.numberOfItems); 
           let iconRadius = TextMeasurementService.estimateSvgTextHeight(GMOSVGLegend.getTextProperties(false, '', this.data.fontSize)) / GMOSVGLegend.LegendIconRadiusFactor; 
           iconRadius = (this.legendFontSizeMarginValue > GMOSVGLegend.DefaultTextMargin) && iconRadius > GMOSVGLegend.LegendIconRadius 
               ? iconRadius : 
               GMOSVGLegend.LegendIconRadius; 
           let legendItems = group 
               .selectAll(GMOSVGLegend.LegendItem.selector) 
               .data(virtualizedDataPoints) 
           let itemsEnter = legendItems.enter() 
               .append('g') 
               .classed(GMOSVGLegend.LegendItem.class, true); 
 
           itemsEnter 
               .append('circle') 
               .classed(GMOSVGLegend.LegendIcon.class, true); 
           itemsEnter 
               .append('text').text((d: LegendDataPoint) => d.tooltip).attr({ 
                   'x': (d: LegendDataPoint) => d.textPosition.x, 
                   'y': (d: LegendDataPoint) => d.textPosition.y + 1, 
               }).style('fill', data.labelColor) 
               .style('font-size', PixelConverter.fromPoint(data.fontSize)) 
               .classed(GMOSVGLegend.LegendText.class, true); 
 
           itemsEnter 
               .append('title') 
               .text((d: LegendDataPoint) => d.tooltip); 
           itemsEnter 
               .style({ 
                   'font-family': GMOSVGLegend.DefaultFontFamily 
               }); 
 
           let textElement = legendItems.selectAll('.legend > #legendGroup > .legendItem > .legendText'); 
           if (textElement.length) { 
               for (let i = 0; i < textElement.length; i++) { 
                   let SVGTextElement = <SVGTextElement>textElement[i][0] 
                   TextMeasurementService.wordBreak(SVGTextElement, this.maxLegendTextLength, 150); 
                   let tSpanElements = SVGTextElement.childNodes.length; 
                   for (let j = 0; j < tSpanElements; j++) { 
                       (<HTMLElement>SVGTextElement.childNodes[j]).setAttribute('x', SVGTextElement.getAttribute('x')); 
                   } 
                   if (SVGTextElement.childNodes && SVGTextElement.childNodes[0]) { 
                       (<HTMLElement>SVGTextElement.childNodes[0]).setAttribute('y', '0'); 
                   } 
               } 
           } 
           legendItems 
               .select(GMOSVGLegend.LegendIcon.selector) 
               .attr({ 
                   'cx': (d: LegendDataPoint, i) => d.glyphPosition.x, 
                   'cy': (d: LegendDataPoint) => d.glyphPosition.y, 
                   'r': iconRadius, 
               }) 
               .style({ 
                   'fill': (d: LegendDataPoint) => { 
                       if (hasSelection && !d.selected) 
                           return LegendBehavior.dimmedLegendColor; 
                       else 
                           return d.color; 
                   } 
               }); 
           if (this.interactivityService) { 
               let iconsSelection = legendItems.select(GMOSVGLegend.LegendIcon.selector); 
               let behaviorOptions: LegendBehaviorOptions = { 
                   legendItems: legendItems, 
                   legendIcons: iconsSelection, 
                   clearCatcher: this.clearCatcher, 
               }; 
 
               this.interactivityService.bind(data.dataPoints, new LegendBehavior(), behaviorOptions, { isLegend: true }); 
           } 
 
           legendItems.exit().remove(); 
           this.updateLayout(detailedLegend); 
           this.drawNavigationArrows(layout.navigationArrows, detailedLegend, titleLayout); 
       } 
   } 
 
   private normalizePosition(points: any[]): void { 
       if (this.legendDataStartIndex >= points.length) { 
           this.legendDataStartIndex = points.length - 1; 
       } 
 
       if (this.legendDataStartIndex < 0) { 
           this.legendDataStartIndex = 0; 
       } 
   } 
 
   private calculateTitleLayout(title: string): TitleLayout { 
       let width = 0; 
       let hasTitle = !_.isEmpty(title); 
 
       if (hasTitle) { 
           let isHorizontal = this.isTopOrBottom(this.orientation); 
           let maxMeasureLength: number; 
 
           if (isHorizontal) { 
               let fontSizeMargin = this.legendFontSizeMarginValue > GMOSVGLegend.DefaultTextMargin ? GMOSVGLegend.TextAndIconPadding + this.legendFontSizeMarginDifference : GMOSVGLegend.TextAndIconPadding; 
               let fixedHorizontalIconShift = GMOSVGLegend.TextAndIconPadding + GMOSVGLegend.LegendIconRadius; 
               let fixedHorizontalTextShift = GMOSVGLegend.LegendIconRadius + fontSizeMargin + fixedHorizontalIconShift; 
               maxMeasureLength = this.parentViewport.width * GMOSVGLegend.LegendMaxWidthFactor - fixedHorizontalTextShift - GMOSVGLegend.LegendEdgeMariginWidth; 
           } 
           else { 
               maxMeasureLength = this.legendFontSizeMarginValue < GMOSVGLegend.DefaultTextMargin ? GMOSVGLegend.MaxTitleLength : 
                   GMOSVGLegend.MaxTitleLength + (GMOSVGLegend.DefaultMaxLegendFactor * this.legendFontSizeMarginDifference); 
           } 
           let textProperties = GMOSVGLegend.getTextProperties(true, title, this.data.fontSize); 
           let text = title; 
           let titlewidth = TextMeasurementService.measureSvgTextWidth(textProperties); 
           let primaryTitleWidth: number = 0; 
           if (this.data['primaryTitle']) 
               primaryTitleWidth = TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(true, this.data['primaryTitle'], this.data.fontSize)); 
           width = titlewidth > primaryTitleWidth ? titlewidth : primaryTitleWidth; 
           if (titlewidth > maxMeasureLength || primaryTitleWidth > maxMeasureLength) { 
 
               text = TextMeasurementService.getTailoredTextOrDefault(textProperties, maxMeasureLength); 
               width = maxMeasureLength; 
               if (this.data['primaryTitle']) { 
                   this.primaryTitle = this.data['primaryTitle'] = TextMeasurementService.getTailoredTextOrDefault(GMOSVGLegend.getTextProperties(true, this.data['primaryTitle'], this.data.fontSize), maxMeasureLength); 
               } 
           } 
           else { 
               this.primaryTitle = this.data['primaryTitle']; 
           } 
 
           if (isHorizontal) 
               width += GMOSVGLegend.TitlePadding; 
           else { 
               if (width < maxMeasureLength) { 
                   text = TextMeasurementService.getTailoredTextOrDefault(textProperties, titlewidth); 
                   if (this.data['primaryTitle']) { 
                       this.primaryTitle = this.data['primaryTitle'] = TextMeasurementService.getTailoredTextOrDefault(GMOSVGLegend.getTextProperties(true, this.data['primaryTitle'], this.data.fontSize), width); 
                   } 
               } 
 
           } 
           return { 
               x: 0, 
               y: 0, 
               text: text, 
               width: width, 
           }; 
       } 
       return null; 
 
   } 
   /** Performs layout offline for optimal perfomance */ 
   private calculateLayout(data: LegendData, autoWidth: boolean, detailedLegend): LegendLayout { 
       let dataPoints = data.dataPoints; 
       if (data.dataPoints.length === 0) { 
           return { 
               numberOfItems: 0, 
               title: null, 
               navigationArrows: [] 
           }; 
       } 
       this.legendFontSizeMarginValue = PixelConverter.fromPointToPixel(this.data && this.data.fontSize !== undefined ? this.data.fontSize : SVGLegend.DefaultFontSizeInPt); 
       this.legendFontSizeMarginDifference = (this.legendFontSizeMarginValue - this.DefaultTextMargin); 
 
       this.normalizePosition(dataPoints); 
       if (this.legendDataStartIndex < dataPoints.length) { 
           dataPoints = dataPoints.slice(this.legendDataStartIndex); 
       } 
       let title = this.calculateTitleLayout(data.title); 
       let navArrows: NavigationArrow[]; 
       let numberOfItems: number; 
       if (this.isTopOrBottom(this.orientation)) { 
           navArrows = this.isScrollable ? this.calculateHorizontalNavigationArrowsLayout(title, detailedLegend) : []; 
           numberOfItems = this.calculateHorizontalLayout(dataPoints, title, navArrows, detailedLegend); 
       } 
       else { 
           navArrows = this.isScrollable ? this.calculateVerticalNavigationArrowsLayout(title, detailedLegend) : []; 
           numberOfItems = this.calculateVerticalLayout(dataPoints, title, navArrows, autoWidth, detailedLegend); 
       } 
       return { 
           numberOfItems: numberOfItems, 
           title: title, 
           navigationArrows: navArrows 
       }; 
   } 
 
   private updateNavigationArrowLayout(navigationArrows: NavigationArrow[], remainingDataLength, visibleDataLength, title) { 
       if (this.legendDataStartIndex === 0) { 
           navigationArrows.shift(); 
       } 
 
       let lastWindow = this.arrowPosWindow; 
       this.arrowPosWindow = visibleDataLength; 
 
       if (navigationArrows.length > 0 && this.arrowPosWindow === remainingDataLength) { 
           this.arrowPosWindow = lastWindow; 
           navigationArrows.length = navigationArrows.length - 1; 
       } 
   } 
 
   private calculateHorizontalNavigationArrowsLayout(title: TitleLayout, detailedLegend): NavigationArrow[] { 
       let legendGroupHeight = 0; 
       if (this.svg) { 
           legendGroupHeight = parseInt(this.svg.style('height'), 10); 
       } 
       let height = GMOSVGLegend.LegendArrowHeight; 
       let width = GMOSVGLegend.LegendArrowWidth; 
       let translateY = GMOSVGLegend.LegendArrowTranslateY; 
 
       let data: NavigationArrow[] = []; 
       let rightShift = title ? title.x + title.width : 0; 
       let arrowLeft = manipulation.createArrow(width, height, 180 /*angle*/); 
       let arrowRight = manipulation.createArrow(width, height, 0 /*angle*/); 
       if (this.isTopOrBottom(this.orientation)) { 
           if (detailedLegend!=="None") { 
               translateY = legendGroupHeight / 3; 
           } 
       } 
       data.push({ 
           x: rightShift, 
           y: translateY, 
           path: arrowLeft.path, 
           rotateTransform: arrowLeft.transform, 
           type: NavigationArrowType.Decrease 
       }); 
 
       data.push({ 
           x: this.parentViewport.width - width, 
           y: translateY, 
           path: arrowRight.path, 
           rotateTransform: arrowRight.transform, 
           type: NavigationArrowType.Increase 
       }); 
 
       return data; 
   } 
 
   private calculateVerticalNavigationArrowsLayout(title: TitleLayout, detailedLegend): NavigationArrow[] { 
       let height = GMOSVGLegend.LegendArrowHeight; 
       let width = GMOSVGLegend.LegendArrowWidth; 
 
       let data: NavigationArrow[] = []; 
       let rightShift = 40; 
       let arrowTop = manipulation.createArrow(width, height, 270 /*angle*/); 
       let arrowBottom = manipulation.createArrow(width, height, 90 /*angle*/); 
       let translateY = 0; 
       if (this.isLeftOrRight(this.orientation)) { 
           translateY = 0; 
           let hasTitle = !_.isEmpty(title); 
 
           if (hasTitle) { 
               if (detailedLegend!=="None") { 
                   translateY = title.y * 2; 
               } 
               else { 
                   translateY = height + GMOSVGLegend.LegendArrowOffset / 2; 
               } 
           } 
           else { 
               translateY = GMOSVGLegend.LegendArrowOffset / 2; 
           } 
 
       } 
       data.push({ 
           x: rightShift, 
           y: translateY, 
           path: arrowTop.path, 
           rotateTransform: arrowTop.transform, 
           type: NavigationArrowType.Decrease 
       }); 
       data.push({ 
           x: rightShift, 
           y: this.parentViewport.height - height - 31, 
           path: arrowBottom.path, 
           rotateTransform: arrowBottom.transform, 
           type: NavigationArrowType.Increase 
       }); 
       return data; 
   } 
 
   private calculateHorizontalLayout(dataPoints: LegendDataPoint[], title: TitleLayout, navigationArrows: NavigationArrow[], detailedLegend): number { 
       let HorizontalTextShift = 4; 
       let HorizontalIconShift = 11; 
       let fontSizeBiggerThenDefault = this.legendFontSizeMarginDifference > 0; 
       let fontSizeMargin = fontSizeBiggerThenDefault ? GMOSVGLegend.TextAndIconPadding + this.legendFontSizeMarginDifference : GMOSVGLegend.TextAndIconPadding; 
       let fixedTextShift = GMOSVGLegend.LegendIconRadius + fontSizeMargin + HorizontalTextShift; 
       let fixedIconShift = HorizontalIconShift + (fontSizeBiggerThenDefault ? this.legendFontSizeMarginDifference : 0); 
       let totalSpaceOccupiedThusFar = 0; 
       let iconTotalItemPadding = GMOSVGLegend.LegendIconRadius * 2 + fontSizeMargin * 3; 
       let numberOfItems: number = dataPoints.length; 
       if (title) { 
           totalSpaceOccupiedThusFar = title.width; 
           title.y = fixedTextShift; 
       } 
       if (this.legendDataStartIndex > 0) { 
           totalSpaceOccupiedThusFar += GMOSVGLegend.LegendArrowOffset; 
       } 
       let dataPointsLength = dataPoints.length; 
       let parentWidth = this.parentViewport.width; 
       let maxTextLength = dataPointsLength > 0 
           ? (((parentWidth - totalSpaceOccupiedThusFar) - (iconTotalItemPadding * dataPointsLength)) / dataPointsLength) | 0 
           : 0; 
       maxTextLength = maxTextLength > GMOSVGLegend.MaxTextLength ? maxTextLength : GMOSVGLegend.MaxTextLength; 
       this.maxLegendTextLength = maxTextLength; 
 
let dp,textProperties: any,primaryWidth=0,labelwidth:any;; for (let i = 0; i < dataPointsLength; i++) { dp = dataPoints[i]; 

          dp.glyphPosition = { 
               x: totalSpaceOccupiedThusFar + GMOSVGLegend.LegendIconRadius, 
               y: fixedIconShift 
           }; 
           dp.textPosition = { 
               x: totalSpaceOccupiedThusFar + fixedTextShift, 
               y: fixedTextShift 
           }; 
 
           textProperties = GMOSVGLegend.getTextProperties(false, dp.label, this.data.fontSize); 
            labelwidth = TextMeasurementService.measureSvgTextWidth(textProperties); 
            
               if (detailedLegend === "Value") { 
                   primaryWidth = TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp.measure, this.data.fontSize)); 
               } 
               else if (detailedLegend === "Percentage") { 
                   primaryWidth = TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp['percentage'], this.data.fontSize)); 
               } 
               else if(detailedLegend==="Both"){ 
                   primaryWidth = TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp.measure + ' ' + dp['percentage'], this.data.fontSize)); 
               } 
         //  } 
           let width = labelwidth > primaryWidth ? labelwidth : primaryWidth; 
           width += 15;//indicators 
           let spaceTakenByItem = 0; 
           if (width < maxTextLength) { 
               spaceTakenByItem = iconTotalItemPadding + width; 
               if (detailedLegend === "Value") { 
                   dp.measure = dp.measure; 
               } 
               else if (detailedLegend === "Both") { 
                   dp.measure = dp.measure + ' ' + dp['percentage']; 
               } 
           } else { 
               let text = TextMeasurementService.getTailoredTextOrDefault( 
                   textProperties, 
                   maxTextLength); 
               dp.label = text; 
               if (detailedLegend === "Value") { 
                   dp.measure = TextMeasurementService.getTailoredTextOrDefault( 
                       GMOSVGLegend.getTextProperties(false, dp.measure, this.data.fontSize), 
                       maxTextLength); 
               } 
               spaceTakenByItem = iconTotalItemPadding + maxTextLength; 
           } 
 
           totalSpaceOccupiedThusFar += spaceTakenByItem; 
 
           if (totalSpaceOccupiedThusFar > parentWidth) { 
               numberOfItems = i; 
               break; 
           } 
       } 
 
       this.visibleLegendWidth = totalSpaceOccupiedThusFar; 
 
       this.updateNavigationArrowLayout(navigationArrows, dataPointsLength, numberOfItems, title); 
 
       return numberOfItems; 
   } 
 
   private calculateVerticalLayout( 
       dataPoints: LegendDataPoint[], 
       title: TitleLayout, 
       navigationArrows: NavigationArrow[], 
       autoWidth: boolean, detailedLegend): number { 
       let fontSizeBiggerThenDefault = this.legendFontSizeMarginDifference > 0; 
       let fontFactor = fontSizeBiggerThenDefault ? this.legendFontSizeMarginDifference : 0; 
       let verticalLegendHeight = 20 + fontFactor; 
       this.legendHeight = verticalLegendHeight; 
       let spaceNeededByTitle = 15 + (fontFactor * 1.3); 
       let totalSpaceOccupiedThusFar = 0; 
       let extraShiftForTextAlignmentToIcon = 4 + (fontFactor * 1.3); 
       let fixedHorizontalIconShift = GMOSVGLegend.TextAndIconPadding + GMOSVGLegend.LegendIconRadius; 
       let fixedHorizontalTextShift = GMOSVGLegend.LegendIconRadius + GMOSVGLegend.TextAndIconPadding + fixedHorizontalIconShift; 
       let maxHorizontalSpaceAvaliable = autoWidth 
           ? this.parentViewport.width * GMOSVGLegend.LegendMaxWidthFactor 
           - fixedHorizontalTextShift - GMOSVGLegend.LegendEdgeMariginWidth 
           : this.lastCalculatedWidth 
           - fixedHorizontalTextShift - GMOSVGLegend.LegendEdgeMariginWidth; 
       let numberOfItems: number = dataPoints.length; 
 
       let maxHorizontalSpaceUsed = 0; 
       let parentHeight = this.parentViewport.height; 
       if (title) { 
           totalSpaceOccupiedThusFar += spaceNeededByTitle; 
           title.x = GMOSVGLegend.TextAndIconPadding; 
           title.y = spaceNeededByTitle; 
           maxHorizontalSpaceUsed = title.width || 0; 
           if (this.data['primaryTitle'] && this.data['secondaryTitle'] && detailedLegend !== 'None' && detailedLegend !== undefined) { 
               spaceNeededByTitle = 3 * title.y + this.legendFontSizeMarginDifference / 2; 
               totalSpaceOccupiedThusFar += spaceNeededByTitle; 
           } 
           else if (this.data['primaryTitle']) { 
               spaceNeededByTitle = 2 * title.y + this.legendFontSizeMarginDifference / 2; 
               totalSpaceOccupiedThusFar += spaceNeededByTitle; 
           } 
           else { 
               totalSpaceOccupiedThusFar += spaceNeededByTitle; 
           } 
       } 
       else { 
           totalSpaceOccupiedThusFar += spaceNeededByTitle; 
       } 
 
       if (this.legendDataStartIndex > 0) 
           totalSpaceOccupiedThusFar += GMOSVGLegend.LegendArrowOffset; 
           let dp,textProperties: any,primaryWidth=0,labelwidth:any;; 
       let dataPointsLength = dataPoints.length; 
       for (let i = 0; i < dataPointsLength; i++) { 
         dp = dataPoints[i]; 
 
           dp.glyphPosition = { 
               x: fixedHorizontalIconShift, 
               y: totalSpaceOccupiedThusFar + fontFactor 
           }; 
           dp.textPosition = { 
               x: fixedHorizontalTextShift, 
               y: totalSpaceOccupiedThusFar + extraShiftForTextAlignmentToIcon 
           }; 
           if (detailedLegend !== "None") { 
               totalSpaceOccupiedThusFar = totalSpaceOccupiedThusFar + 20 + (this.legendFontSizeMarginDifference / 2); 
           } 
         
           textProperties = GMOSVGLegend.getTextProperties(false, dp.label, this.data.fontSize); 
           labelwidth = TextMeasurementService.measureSvgTextWidth(textProperties); 
            
          // if (detailedLegend === "Value" || detailedLegend === "Percentage" || detailedLegend === "Both") { 
 
               if (detailedLegend === "Value") { 
                   primaryWidth = TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp.measure, this.data.fontSize)); 
               } 
               else if (detailedLegend === "Percentage") { 
                   primaryWidth = TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp['percentage'], this.data.fontSize)); 
               } 
               else if(detailedLegend === "Both"){ 
                   primaryWidth = TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp.measure + ' ' + dp['percentage'], this.data.fontSize)); 
               } 
         //  } 
           let width = labelwidth > primaryWidth ? labelwidth : primaryWidth; 
           width += 15;//indicators 
           if (width > maxHorizontalSpaceUsed) { 
               maxHorizontalSpaceUsed = width; 
           } 
 
           if (width > maxHorizontalSpaceAvaliable) { 
               let text = TextMeasurementService.getTailoredTextOrDefault( 
                   GMOSVGLegend.getTextProperties(false, dp.label, this.data.fontSize), 
                   maxHorizontalSpaceAvaliable); 
               dp.label = text; 
               if (detailedLegend === "Value") { 
                   dp.measure = TextMeasurementService.getTailoredTextOrDefault( 
                       GMOSVGLegend.getTextProperties(false, dp.measure, this.data.fontSize), 
                       maxHorizontalSpaceAvaliable); 
               } 
           } 
           else { 
               if (detailedLegend === "Value") { 
                   dp.measure = dp.measure; 
               } 
           } 
 
           totalSpaceOccupiedThusFar += verticalLegendHeight; 
 
           if (totalSpaceOccupiedThusFar > parentHeight) { 
               numberOfItems = i - 1; 
               break; 
           } 
       } 
 
       if (autoWidth) { 
           if (maxHorizontalSpaceUsed < maxHorizontalSpaceAvaliable) { 
               this.lastCalculatedWidth = this.viewport.width = Math.ceil(maxHorizontalSpaceUsed + fixedHorizontalTextShift + GMOSVGLegend.LegendEdgeMariginWidth); 
           } else { 
               this.lastCalculatedWidth = this.viewport.width = Math.ceil(maxHorizontalSpaceAvaliable + fixedHorizontalTextShift + GMOSVGLegend.LegendEdgeMariginWidth); 
           } 
       } 
       else { 
           this.viewport.width = this.lastCalculatedWidth; 
       } 
 
       this.visibleLegendHeight = totalSpaceOccupiedThusFar - verticalLegendHeight; 
 
       navigationArrows.forEach(d => d.x = this.lastCalculatedWidth / 2); 
       this.updateNavigationArrowLayout(navigationArrows, dataPointsLength, numberOfItems, title); 
 
       return numberOfItems; 
   } 
 
   private drawNavigationArrows(layout: NavigationArrow[], detailedLegend, title) { 
       let arrows = this.group.selectAll(GMOSVGLegend.NavigationArrow.selector) 
           .data(layout); 
 
       arrows 
           .enter() 
           .append('g') 
           .on('click', (d: NavigationArrow) => { 
               let pos = this.legendDataStartIndex; 
               this.legendDataStartIndex = d.type === NavigationArrowType.Increase 
                   ? pos + this.arrowPosWindow : pos - this.arrowPosWindow; 
               this.drawLegendInternal(this.data, this.parentViewport, false, this.detailedLegend); 
           }) 
           .classed(GMOSVGLegend.NavigationArrow.class, true) 
           .append('path'); 
 
       arrows 
           .attr('transform', (d: NavigationArrow) => manipulation.translate(d.x, d.y)) 
           .select('path') 
           .attr({ 
               'd': (d: NavigationArrow) => d.path, 
               'transform': (d: NavigationArrow) => d.rotateTransform, 
               'fill': 'black' 
           }); 
 
       if (this.isTopOrBottom(this.orientation)) { 
           let legendGroupHeight = parseInt(this.svg.style('height'), 10); 
           let translateY = 0; 
           if (detailedLegend!=="None") { 
               translateY = legendGroupHeight / 3; 
           } 
           else if ((detailedLegend === undefined || detailedLegend === "None")) { 
               translateY = 3.5; 
           } 
           arrows 
               .attr('transform', (d: NavigationArrow) => manipulation.translate(d.x, translateY)) 
               .select('path') 
               .attr({ 
                   'd': (d: NavigationArrow) => d.path, 
                   'transform': (d: NavigationArrow) => d.rotateTransform 
               }); 
       } 
 
       if (this.isLeftOrRight(this.orientation)) { 
           let translateY = 0; 
           let hasTitle = !_.isEmpty(title); 
 
           if (hasTitle) { 
               if (detailedLegend!=="None") { 
                   translateY = title.y * 2 + this.legendFontSizeMarginDifference; 
               } 
               else { 
                   translateY = GMOSVGLegend.LegendArrowHeight + GMOSVGLegend.LegendArrowOffset / 2; 
               } 
           } 
           else { 
               translateY = GMOSVGLegend.LegendArrowHeight + GMOSVGLegend.LegendArrowOffset / 2; 
           } 
           if (this.svg.select('.navArrow')[0][0] !== null) { 
               let t = d3.transform(this.svg.select('.navArrow').attr("transform")); 
               if (t.translate[1] === 0) { 
                   this.svg.select('.navArrow').attr('transform', (d: NavigationArrow) => manipulation.translate(d.x, translateY)); 
                   this.svg.select('.navArrow').style('fill', 'black'); 
               } 
           } 
       } 
 
       arrows.exit().remove(); 
   } 
 
   private isTopOrBottom(orientation: LegendPositionType) { 
       switch (orientation) { 
           case LegendPosition.Top: 
           case LegendPosition.Bottom: 
           case LegendPosition.BottomCenter: 
           case LegendPosition.TopCenter: 
               return true; 
           default: 
               return false; 
       } 
   } 
 
   private isLeftOrRight(orientation: LegendPositionType) { 
       switch (orientation) { 
           case LegendPosition.Left: 
           case LegendPosition.Right: 
           case LegendPosition.LeftCenter: 
           case LegendPosition.RightCenter: 
               return true; 
           default: 
               return false; 
       } 
   } 
 
   private isCentered(orientation: LegendPositionType): boolean { 
       switch (orientation) { 
           case LegendPosition.BottomCenter: 
           case LegendPosition.LeftCenter: 
           case LegendPosition.RightCenter: 
           case LegendPosition.TopCenter: 
               return true; 
           default: 
               return false; 
       } 
   } 
 
   public reset(): void { 
       // Intentionally left blank. 
   } 
 
   private static getTextProperties(isTitle: boolean, text?: string, fontSize?: number): TextProperties { 
       return { 
           text: text, 
           fontFamily: isTitle ? GMOSVGLegend.DefaultTitleFontFamily : GMOSVGLegend.DefaultFontFamily, 
           fontSize: PixelConverter.fromPoint(fontSize || SVGLegend.DefaultFontSizeInPt) 
       }; 
   } 
 
   private setTooltipToLegendItems(data: LegendData) { 
       //we save the values to tooltip before cut 
       for (let dataPoint of data.dataPoints) { 
           dataPoint.tooltip = dataPoint.label; 
       } 
   } 
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
 
class ColumnChartConverterHelper implements IColumnChartConverterStrategy { 
   private dataView: DataViewCategorical; 
 
   constructor(dataView: DataViewCategorical) { 
        
       this.dataView = dataView; 
   } 
 
   public getLegend(colors: IColorPalette, defaultLegendLabelColor: string, defaultColor?: string): any {// Anushka LegendSeriesInfo { 
 
   } 
 
   public getValueBySeriesAndCategory(series: number, category: number): number { 
       return parseFloat(this.dataView.values[series].values[category] ? this.dataView.values[series].values[category].toString() : "0"); 
   } 
 
   public getMeasureNameByIndex(index: number): string { 
       return this.dataView.values[index].source.queryName; 
   } 
 
   public hasHighlightValues(series: number): boolean { 
       let column = this.dataView && this.dataView.values ? this.dataView.values[series] : undefined; 
       return column && !!column.highlights; 
   } 
 
   public getHighlightBySeriesAndCategory(series: number, category: number): number { 
       return parseFloat(this.dataView.values[series].highlights[category] ? this.dataView.values[series].highlights[category].toString() : "0"); 
   } 
} 
export interface ColumnChartDrawInfoGMO { 
   eventGroup: Selection<any>; 
   shapesSelection: Selection<any>; 
   viewport: IViewport; 
   axisOptions: ColumnAxisOptionsGMO; 
   labelDataPoints: LabelDataPointGMO[]; 
} 
export interface ColumnChartContext { 
   height: number; 
   width: number; 
   duration: number; 
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
   setXScale(forcedXDomain?: any[], axisScaleType?: string, axisDisplayUnits?: number, axisPrecision?: number, ensureXDomain?: NumberRange): IAxisProperties; 
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
   public static MinOrdinalRectThickness = 20; 
   public static MinScalarRectThickness = 2; 
   public static OuterPaddingRatio = 0.4; 
   public static InnerPaddingRatio = 0.2; 
   private static FontSize = 11; 
 //  private static FontSizeString; 
   FontSizeString = PixelConverter.toString(CartesianChartGMO.FontSize); 
 
   public static AxisTextProperties: TextProperties = { 
       fontFamily: font.Family.regular.css, 
       fontSize: '30', 
   }; 
 
   public static getPreferredCategorySpan(categoryCount: number, categoryThickness: number, noOuterPadding?: boolean): number { 
       let span = (categoryThickness * categoryCount); 
       if (noOuterPadding) 
           return span; 
       return span + (categoryThickness * CartesianChartGMO.OuterPaddingRatio * 2); 
   } 
 
   public static getIsScalar(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, type: ValueTypeDescriptor, scalarKeys?: any): boolean { 
       if (!CartesianChartGMO.supportsScalar(type, scalarKeys)) 
           return false; 
 
       let axisTypeValue = dataViewObjects.getValue(objects, propertyId); 
       if (!objects || axisTypeValue == null) 
           return true; 
 
       return (axisTypeValue === axisType.scalar); 
   } 
 
   private static supportsScalar(type: ValueTypeDescriptor, scalarKeys?: any): boolean { 
       // if scalar key is present, it supports scalar 
       if (scalarKeys && !_.isEmpty(scalarKeys.values)) 
           return true; 
 
       // otherwise does not support scalar if the type is non-numeric. 
       return !AxisHelper.isOrdinal(type); 
   } 
 
   private static getMinInterval(seriesList: CartesianSeries[]): number { 
       let minInterval = Number.MAX_VALUE; 
       if (seriesList.length > 0) { 
           let series0data = seriesList[0].data.filter(d => !d.highlight); 
           for (let i = 0, ilen = series0data.length - 1; i < ilen; i++) { 
               minInterval = Math.min(minInterval, Math.abs(series0data[i + 1].categoryValue - series0data[i].categoryValue)); 
           } 
       } 
       return minInterval; 
   } 
 
   public static getCategoryThickness(seriesList: CartesianSeries[], numCategories: number, plotLength: number, domain: number[], isScalar: boolean, trimOrdinalDataOnOverflow: boolean): number { 
       let thickness; 
       if (numCategories < 2) 
           thickness = plotLength * (1 - CartesianChartGMO.OuterPaddingRatio); 
       else if (isScalar && domain && domain.length > 1) { 
           // the smallest interval defines the column width. 
           let minInterval = CartesianChartGMO.getMinInterval(seriesList); 
           let domainSpan = domain[domain.length - 1] - domain[0]; 
           // account for outside padding 
           let ratio = minInterval / (domainSpan + (minInterval * CartesianChartGMO.OuterPaddingRatio * 2)); 
           thickness = plotLength * ratio; 
           thickness = Math.max(thickness, CartesianChartGMO.MinScalarRectThickness); 
       } 
       else { 
           // Divide the available width up including outer padding (in terms of category thickness) on 
           // both sides of the chart, and categoryCount categories. Reverse math: 
           thickness = plotLength / (numCategories + (CartesianChartGMO.OuterPaddingRatio * 2)); 
           if (trimOrdinalDataOnOverflow) { 
               thickness = Math.max(thickness, CartesianChartGMO.MinOrdinalRectThickness); 
           } 
       } 
 
       // spec calls for using the whole plot area, but the max rectangle thickness is "as if there were three categories" 
       // (outerPaddingRatio has the same units as '# of categories' so they can be added) 
       let maxRectThickness = plotLength / (3 + (CartesianChartGMO.OuterPaddingRatio * 2)); 
 
       thickness = Math.min(thickness, maxRectThickness); 
 
       if (!isScalar && numCategories >= 3 && trimOrdinalDataOnOverflow) { 
           return Math.max(thickness, CartesianChartGMO.MinOrdinalRectThickness); 
       } 
 
       return thickness; 
   } 
 
   public static getLayout(data: StackedChartGMOData, options: CategoryLayoutOptions): CategoryLayout { 
 
       let categoryCount = options.categoryCount, 
           availableWidth = options.availableWidth, 
           domain = options.domain, 
           trimOrdinalDataOnOverflow = options.trimOrdinalDataOnOverflow, 
           isScalar = !!options.isScalar, 
           isScrollable = !!options.isScrollable; 
 
       let categoryThickness = CartesianChartGMO.getCategoryThickness(data ? data.series : null, categoryCount, availableWidth, domain, isScalar, trimOrdinalDataOnOverflow); 
 
       // Total width of the outer padding, the padding that exist on the far right and far left of the chart. 
       let totalOuterPadding = categoryThickness * CartesianChartGMO.OuterPaddingRatio * 2; 
 
       // visibleCategoryCount will be used to discard data that overflows on ordinal-axis charts. 
       // Needed for dashboard visuals 
       let calculatedBarCount = Double.floorWithPrecision((availableWidth - totalOuterPadding) / categoryThickness); 
       let visibleCategoryCount = Math.min(calculatedBarCount, categoryCount); 
       let willScroll = visibleCategoryCount < categoryCount && isScrollable; 
 
       let outerPaddingRatio = CartesianChartGMO.OuterPaddingRatio; 
       if (!isScalar && !willScroll) { 
           // use dynamic outer padding to improve spacing when we have few categories 
           let oneOuterPadding = (availableWidth - (categoryThickness * visibleCategoryCount)) / 2; 
           outerPaddingRatio = oneOuterPadding / categoryThickness; 
       } 
 
       // If scrollable, visibleCategoryCount will be total categories 
       if (!isScalar && isScrollable) 
           visibleCategoryCount = categoryCount; 
 
       return { 
           categoryCount: visibleCategoryCount, 
           categoryThickness: categoryThickness, 
           outerPaddingRatio: outerPaddingRatio, 
           isScalar: isScalar 
       }; 
   } 
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
   public static getInteractiveColumnChartDomElement(element: any): HTMLElement { 
       return element.children("svg").get(0); 
   } 
   public static sliceSeries(series: StackedChartGMOSeries[], endIndex: number, startIndex: number = 0): StackedChartGMOSeries[] { 
       let newSeries: StackedChartGMOSeries[] = [],iNewSeries; 
       if (series.length > 0) { 
           for (let i = 0, len = series.length; i < len; i++) { 
               iNewSeries = newSeries[i] = Prototype.inherit(series[i]); 
               iNewSeries.data = series[i].data.filter(d => d.categoryIndex >= startIndex && d.categoryIndex < endIndex); 
           } 
       } 
       return newSeries; 
   } 
} 
 
export class StackedChartGMOStrategy implements IColumnChartStrategyGMO { 
   private static classes = { 
       item: { 
           className: 'column', 
           selectorName: '.column' 
       }, 
       highlightItem: { 
           class: 'highlightColumn', 
           selector: '.highlightColumn' 
       }, 
   }; 
 
   private data: StackedChartGMOData; 
   private graphicsContext: ColumnChartContextGMO; 
   private width: number; 
   private height: number; 
   private margin: IMargin; 
   private xProps: IAxisProperties; 
   private yProps: IAxisProperties; 
   private categoryLayout: CategoryLayout; 
   private columnsCenters: number[]; 
   private columnSelectionLineHandle: Selection<any>; 
   private animator: IColumnChartAnimatorGMO; 
   private interactivityService: IInteractivityService; 
   private viewportHeight: number; 
   private viewportWidth: number; 
   private layout: IColumnGMOLayout; 
   private isComboChart: boolean; 
 
   public TooltipServiceWrapper: ITooltipServiceWrapper; 
 
   public setupVisualProps(columnChartProps: ColumnChartContextGMO): void { 
       this.graphicsContext = columnChartProps; 
       this.margin = columnChartProps.margin; 
       this.width = this.graphicsContext.width; 
       this.height = this.graphicsContext.height; 
       this.categoryLayout = columnChartProps.layout; 
       this.animator = columnChartProps.animator; 
       this.interactivityService = columnChartProps.interactivityService; 
       this.viewportHeight = columnChartProps.viewportHeight; 
       this.viewportWidth = columnChartProps.viewportWidth; 
       this.isComboChart = columnChartProps.isComboChart; 
   } 
 
   public setTooltipServiceWrapper(TooltipServiceWrapper: ITooltipServiceWrapper) { 
       this.TooltipServiceWrapper = TooltipServiceWrapper; 
   } 
 
   public setData(data: ColumnChartData) { 
       this.data = data; 
 
   } 
 
   public setXScale(forcedXDomain?: any[], axisScaleType?: string, axisDisplayUnits?: number, axisPrecision?: number): IAxisProperties { 
       let width = this.width; 
 
       let forcedXMin, forcedXMax; 
 
       if (forcedXDomain.length === 2) { 
           forcedXMin = forcedXDomain[0]; 
           forcedXMax = forcedXDomain[1]; 
       } 
 
       let props = this.xProps = this.getCategoryAxis( 
           this.data, 
           width, 
           this.categoryLayout, 
           false, 
           forcedXMin, 
           forcedXMax, 
           axisScaleType, 
           axisDisplayUnits, 
           axisPrecision 
       ); 
       props.values = this.xProps.values = this.data.categories; 
       return props; 
   } 
 
   public getCategoryAxis( 
       data: StackedChartGMOData, 
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
           getValueFn: (index, type) => this.lookupXValue(data, index, type, isScalar), 
           scaleType: axisScaleType, 
           axisDisplayUnits: axisDisplayUnits, 
           axisPrecision: axisPrecision 
       }); 
 
       layout.categoryThickness = axisProperties.categoryThickness; 
 
       return axisProperties; 
   } 
 
   public lookupXValue(data: StackedChartGMOData, index: number, type: any, isScalar: boolean): any { 
 
       let isDateTime = AxisHelper.isDateTime(type); 
 
       if (isScalar) { 
           if (isDateTime) 
               return new Date(index); 
 
           // index is the numeric value 
           return index; 
       } 
 
       if (type.text) { 
 
           return data.categories[index]; 
       } 
 
       if (data.series.length > 0) { 
           let firstSeries = data.series[0]; 
           if (firstSeries) { 
               let seriesValues = firstSeries.data; 
               if (seriesValues) { 
                   if (data.hasHighlights) 
                       index = index * 2; 
                   let dataAtIndex = seriesValues[index]; 
                   if (dataAtIndex) { 
                       if (isDateTime && dataAtIndex.categoryValue != null) 
                           return new Date(dataAtIndex.categoryValue); 
                       return dataAtIndex.categoryValue; 
                   } 
               } 
           } 
       } 
 
       return index; 
   } 
 
   public calcValueDomain(data, is100pct) { 
       let defaultNumberRange = { 
           min: 0, 
           max: 10 
       }; 
 
       if (data.length === 0) 
           return defaultNumberRange; 
 
       // Can't use AxisHelper because Stacked layout has a slightly different calc, (position - valueAbs) 
       let min = d3.min(data, d => d3.min(d.data, e => e.position - e.valueAbsolute)); 
       let max = d3.max(data, d => d3.max(d.data, e => e.position)); 
 
       if (is100pct) { 
           min = Double.roundToPrecision(min, 0.0001); 
           max = Double.roundToPrecision(max, 0.0001); 
       } 
 
       return { 
           min: min, 
           max: max, 
       }; 
   } 
 
   public setYScale(is100Pct: boolean, forcedTickCount?: number, forcedYDomain?: any[], axisScaleType?: string, axisDisplayUnits?: number, axisPrecision?: number, y1ReferenceLineValue?: NumberRange): IAxisProperties { 
       let height = this.height; 
       let valueDomain = this.calcValueDomain(this.data.series, is100Pct); 
       let valueDomainArr = [valueDomain.min, valueDomain.max]; 
 
       let combinedDomain = AxisHelper.combineDomain(forcedYDomain, valueDomainArr, y1ReferenceLineValue); 
       if ((combinedDomain[1]) >= 1) { 
           combinedDomain = [0, 1]; 
       } 
       let shouldClamp = AxisHelper.scaleShouldClamp(combinedDomain, valueDomainArr); 
       let metadataColumn = this.data.valuesMetadata[0]; 
       valueFormatter.getFormatString(this.data.valuesMetadata[0], columnChartProps.general.formatString) 
       let formatString = is100Pct ? 
           this.graphicsContext.hostService.getLocalizedString('Percentage') 
           : valueFormatter.getFormatString(metadataColumn, columnChartProps.general.formatString); 
 
       this.yProps = AxisHelper.createAxis({ 
           pixelSpan: height, 
           dataDomain: combinedDomain, 
           metaDataColumn: metadataColumn, 
           formatString: formatString, 
           outerPadding: 0, 
           isScalar: true, 
           isVertical: true, 
           forcedTickCount: forcedTickCount, 
           useTickIntervalForDisplayUnits: true, 
           isCategoryAxis: false, 
           scaleType: axisScaleType, 
           axisDisplayUnits: axisDisplayUnits, 
           axisPrecision: axisPrecision, 
           is100Pct: is100Pct, 
           shouldClamp: shouldClamp, 
       }); 
 
       return this.yProps; 
   } 
 
   public StackedChartGMOStrategyGetLayout(data, axisOptions) { 
       let columnWidth = axisOptions.columnWidth; 
       let isScalar = axisOptions.isScalar; 
       let xScale = axisOptions.xScale; 
       let yScale = axisOptions.yScale; 
       let xScaleOffset = 0; 
       if (isScalar) 
           xScaleOffset = columnWidth / 2; 
 
       // d.position is the top left corner (for drawing) - set in columnChart.converter 
       // for positive values, this is the previous stack position + the new value, 
       // for negative values it is just the previous stack position 
 
       return { 
           shapeLayout: { 
               width: (d: ColumnChartDataPoint) => columnWidth, 
               x: (d: ColumnChartDataPoint) => xScale(isScalar ? d.categoryValue : d.categoryIndex) - xScaleOffset, 
               y: (d: ColumnChartDataPoint) => yScale(d.position), 
               height: (d: ColumnChartDataPoint) => yScale(d.position - d.valueAbsolute) - yScale(d.position), 
           }, 
           shapeLayoutWithoutHighlights: { 
               width: (d: ColumnChartDataPoint) => columnWidth, 
               x: (d: ColumnChartDataPoint) => xScale(isScalar ? d.categoryValue : d.categoryIndex) - xScaleOffset, 
               y: (d: ColumnChartDataPoint) => yScale(d.originalPosition), 
               height: (d: ColumnChartDataPoint) => yScale(d.originalPosition - d.originalValueAbsolute) - yScale(d.originalPosition), 
           }, 
           zeroShapeLayout: { 
               width: (d: ColumnChartDataPoint) => columnWidth, 
               x: (d: ColumnChartDataPoint) => xScale(isScalar ? d.categoryValue : d.categoryIndex) - xScaleOffset, 
               y: (d: ColumnChartDataPoint) => d.value >= 0 ? yScale(d.position - d.valueAbsolute) : yScale(d.position), 
               height: (d: ColumnChartDataPoint) => 0 
           }, 
       }; 
   } 
 
   public ColumnUtilDrawSeries(data, graphicsContext) { 
       // d3 v7: bind one <g class="series"> per data series, then merge the 
       // entering and updating selections so styling/tooltips apply to all. 
       let seriesSelection: UpdateSelection<ColumnChartSeries> = graphicsContext 
           .selectAll(ColumnChartGMO.SeriesClasses.selector) 
           .data(data.series, (d: ColumnChartSeries) => d.key); 
 
       let seriesEnter = seriesSelection 
           .enter() 
           .append('g') 
           .classed(ColumnChartGMO.SeriesClasses.class, true); 
 
       let seriesMerged = seriesEnter.merge(seriesSelection); 
 
       seriesMerged.style('fill', (d: ColumnChartSeries) => d.color); 
 
       seriesSelection.exit().remove(); 
 
       this.TooltipServiceWrapper.addTooltip(seriesMerged, 
           ((tooltipEvent: TooltipEventArgs<any>) => (tooltipEvent && tooltipEvent.data ? tooltipEvent.data.tooltip : undefined))); 
 
       return seriesMerged; 
   } 
 
   public ColumnUtilDrawDefaultShapes(data, series, layout, itemCS, filterZeros, hasSelection) { 
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
 
       // d3 v7: append entering rects, then merge with the update selection so 
       // the layout (x/y/width/height) and fill styles are applied to BOTH the 
       // newly created and the existing rectangles. Without merge, brand new 
       // rects on first render get no geometry and stay invisible. 
       let shapesEnter = shapes.enter() 
           .append("rect") 
           .classed(itemCS.class, true); 
 
       let shapesMerged = shapesEnter.merge(shapes); 
 
       shapesMerged 
           .style("fill-opacity", (d: ColumnChartDataPoint) => ColumnUtil.getFillOpacity(d.selected, d.highlight, hasSelection, data.hasHighlights)) 
           .style("fill", (d: ColumnChartDataPoint) => d.color !== data.series[d.seriesIndex].color ? d.color : null)  // PERF: Only set the fill color if it is different than series. 
           .attr(layout.shapeLayout); 
 
       shapes 
           .exit() 
           .remove(); 
       return shapesMerged; 
   } 
 
   public drawColumns(useAnimation: boolean): ColumnChartDrawInfoGMO { 
       let data = this.data; 
 
       this.columnsCenters = null; // invalidate the columnsCenters so that will be calculated again 
       let categoryWidth; 
       if ((this.categoryLayout.categoryThickness * (1 - CartesianChartGMO.InnerPaddingRatio)) < 0) { 
           categoryWidth = 0; 
       } 
       else { 
           categoryWidth = (this.categoryLayout.categoryThickness * (1 - CartesianChartGMO.InnerPaddingRatio)); 
       } 
 
       let axisOptions: ColumnAxisOptions = { 
           columnWidth: this.categoryLayout.categoryThickness * (1 - CartesianChartGMO.InnerPaddingRatio), 
           xScale: this.xProps.scale, 
           yScale: this.yProps.scale, 
           isScalar: this.categoryLayout.isScalar, 
           margin: this.margin, 
       }; 
       let stackedColumnLayout = this.layout = this.StackedChartGMOStrategyGetLayout(data, axisOptions); 
       let dataLabelSettings = data.labelSettings; 
       let labelDataPoints: LabelDataPointGMO[] = []; 
       if (dataLabelSettings.show) { 
           labelDataPoints = this.createLabelDataPoints(); 
       } 
 
       let result: ColumnChartAnimationResult; 
       let shapes: Selection<any>; 
       let series = this.ColumnUtilDrawSeries(data, this.graphicsContext.mainGraphicsContext); 
 
       if (this.animator && useAnimation) { 
           result = this.animator.animate({ 
               viewModel: data, 
               className: null, 
               selectorName: null, 
               series: series, 
               layout: stackedColumnLayout, 
               itemCS: undefined, 
               interactivityService: this.interactivityService, 
               mainGraphicsContext: this.graphicsContext.mainGraphicsContext, 
               viewPort: { height: this.height, width: this.width } 
           }); 
           shapes = result.shapes; 
       } 
       if (!this.animator || !useAnimation || result.failed) { 
           shapes = this.ColumnUtilDrawDefaultShapes(data, series, stackedColumnLayout, StackedChartGMOStrategy.classes.item, !this.animator, this.interactivityService && this.interactivityService.hasSelection()); 
       } 
 
       ColumnUtil.applyInteractivity(shapes, this.graphicsContext.onDragStart); 
 
       return { 
           eventGroup: this.graphicsContext.mainGraphicsContext, 
           shapesSelection: shapes, 
           viewport: { height: this.height, width: this.width }, 
           axisOptions, 
           labelDataPoints: labelDataPoints, 
       }; 
   } 
 
   public setChosenColumnOpacity(mainGraphicsContext: Selection<any>, columnGroupSelector: string, selectedColumnIndex: number, lastColumnIndex: number): void { 
       let series = mainGraphicsContext.selectAll(ColumnChartGMO.SeriesClasses.selector); 
       let lastColumnUndefined = typeof lastColumnIndex === 'undefined'; 
       // find all columns that do not belong to the selected column and set a dimmed opacity with a smooth animation to those columns 
       series.selectAll("rect" + columnGroupSelector).filter((d: ColumnChartDataPoint) => { 
           return (d.categoryIndex !== selectedColumnIndex) && (lastColumnUndefined || d.categoryIndex === lastColumnIndex); 
       }).transition().style('fill-opacity', 0.4); 
 
       // set the default opacity for the selected column 
       series.selectAll("rect" + columnGroupSelector).filter((d: ColumnChartDataPoint) => { 
           return d.categoryIndex === selectedColumnIndex; 
       }).style('fill-opacity', 1.0); 
   } 
 
   public selectColumn(selectedColumnIndex: number, lastSelectedColumnIndex: number): void { 
       this.setChosenColumnOpacity(this.graphicsContext.mainGraphicsContext, StackedChartGMOStrategy.classes.item.selectorName, selectedColumnIndex, lastSelectedColumnIndex); 
       this.moveHandle(selectedColumnIndex); 
   } 
 
   public getClosestColumnIndex(x: number, y: number): number { 
       return ColumnUtil.getClosestColumnIndex(x, this.getColumnsCenters()); 
   } 
 
   /** 
    * Get the chart's columns centers (x value). 
    */ 
   private getColumnsCenters(): number[] { 
       if (!this.columnsCenters) { 
           let categoryWidth: number = this.categoryLayout.categoryThickness * (1 - CartesianChartGMO.InnerPaddingRatio); 
           // use the axis scale and first series data to get category centers 
           if (this.data.series.length > 0) { 
               let xScaleOffset = 0; 
               if (!this.categoryLayout.isScalar) 
                   xScaleOffset = categoryWidth / 2; 
               let firstSeries = this.data.series[0]; 
               this.columnsCenters = firstSeries.data.map(d => this.xProps.scale(this.categoryLayout.isScalar ? d.categoryValue : d.categoryIndex) + xScaleOffset); 
           } 
       } 
       return this.columnsCenters; 
   } 
 
   private moveHandle(selectedColumnIndex: number) { 
       let columnCenters = this.getColumnsCenters(); 
       let x = columnCenters[selectedColumnIndex]; 
       if (!this.columnSelectionLineHandle) { 
           let handle = this.columnSelectionLineHandle = this.graphicsContext.mainGraphicsContext.append('g'); 
           handle.append('line') 
               .classed('interactive-hover-line', true) 
               .attr({ 
                   x1: x, 
                   x2: x, 
                   y1: 0, 
                   y2: this.height, 
               }); 
 
           handle.append('circle') 
               .attr({ 
                   cx: x, 
                   cy: this.height, 
                   r: '6px', 
               }) 
               .classed('drag-handle', true); 
       } 
       else { 
           let handle = this.columnSelectionLineHandle; 
           handle.select('line').attr({ x1: x, x2: x }); 
           handle.select('circle').attr({ cx: x }); 
       } 
   } 
 
   public static getLayout(data: ColumnChartData, axisOptions: ColumnAxisOptions): IColumnLayout { 
       let columnWidth = axisOptions.columnWidth; 
       let isScalar = axisOptions.isScalar; 
       let xScale = axisOptions.xScale; 
       let yScale = axisOptions.yScale; 
       let xScaleOffset = 0; 
       if (isScalar) 
           xScaleOffset = columnWidth / 2; 
 
       // d.position is the top right corner for bars - set in columnChart.converter 
       // for positive values, this is the previous stack position + the new value, 
       // for negative values it is just the previous stack position 
       return { 
           shapeLayout: { 
               width: (d: ColumnChartDataPoint) => columnWidth, 
               x: (d: ColumnChartDataPoint) => xScale(isScalar ? d.categoryValue : d.categoryIndex) - xScaleOffset, 
               y: (d: ColumnChartDataPoint) => yScale(d.position), 
               height: (d: ColumnChartDataPoint) => yScale(d.position - d.valueAbsolute) - yScale(d.position), 
           }, 
           shapeLayoutWithoutHighlights: { 
               width: (d: ColumnChartDataPoint) => columnWidth, 
               x: (d: ColumnChartDataPoint) => xScale(isScalar ? d.categoryValue : d.categoryIndex) - xScaleOffset, 
               y: (d: ColumnChartDataPoint) => yScale(d.originalPosition), 
               height: (d: ColumnChartDataPoint) => yScale(d.originalPosition - d.originalValueAbsolute) - yScale(d.originalPosition), 
           }, 
           zeroShapeLayout: { 
               width: (d: ColumnChartDataPoint) => columnWidth, 
               x: (d: ColumnChartDataPoint) => xScale(isScalar ? d.categoryValue : d.categoryIndex) - xScaleOffset, 
               y: (d: ColumnChartDataPoint) => d.value >= 0 ? yScale(d.position - d.valueAbsolute) : yScale(d.position), 
               height: (d: ColumnChartDataPoint) => 0 
           }, 
       }; 
   } 
   private static getDisplayUnitValueFromAxisFormatter(yAxisProperties: IAxisProperties, labelSettings: VisualDataLabelsSettings): number { 
       return (yAxisProperties.formatter && yAxisProperties.formatter.displayUnit && labelSettings.displayUnits === 0) ? yAxisProperties.formatter.displayUnit.value : null; 
   } 
   private createLabelDataPoints(): LabelDataPointGMO[] { 
       let labelDataPoints: LabelDataPointGMO[] = []; 
       let data = this.data; 
       let series = data.series; 
       let formattersCache = NewDataLabelUtils.createColumnFormatterCacheManager(); 
       let shapeLayout = this.layout.shapeLayout; 
       for (let currentSeriesIndex in series) { 
           let currentSeries = series[currentSeriesIndex]; 
           let labelSettings = currentSeries.labelSettings ? currentSeries.labelSettings : data.labelSettings; 
           if (!labelSettings.show) 
               continue; 
           let axisFormatter: number = StackedChartGMOStrategy.getDisplayUnitValueFromAxisFormatter(this.yProps, labelSettings); 
           for (let dataPointIndex in currentSeries.data) { 
               let dataPoint = currentSeries.data[dataPointIndex]; 
               if ((data.hasHighlights && !dataPoint.highlight) || dataPoint.value == null) { 
                   continue; 
               } 
 
               // Calculate parent rectangle 
               let parentRect: IRect = { 
                   left: shapeLayout.x(dataPoint), 
                   top: shapeLayout.y(dataPoint), 
                   width: shapeLayout.width(dataPoint), 
                   height: shapeLayout.height(dataPoint), 
               }; 
 
               // Calculate label text 
               let formatString = undefined; 
 
               if (this.graphicsContext.is100Pct) { 
                   formatString = NewDataLabelUtils.hundredPercentFormat; 
               } 
               else { 
                   formatString = dataPoint.labelFormatString; 
               } 
             //  let formatter = formattersCache.getOrCreate(formatString, labelSettings, axisFormatter); 
               let text = dataPoint.value.toString(); 
 
               // Calculate text size 
               let properties: TextProperties = { 
                   text: text, 
                   fontFamily: NewDataLabelUtils.LabelTextProperties.fontFamily, 
                   fontSize: PixelConverter.fromPoint(labelSettings.fontSize || 12), 
                   fontWeight: NewDataLabelUtils.LabelTextProperties.fontWeight, 
               }; 
               let textWidth = TextMeasurementService.measureSvgTextWidth(properties); 
               let textHeight = TextMeasurementService.estimateSvgTextHeight(properties, true /* tightFitForNumeric */); 
 
               labelDataPoints.push({ 
                   isPreferred: true, 
                   text: text, 
                   textSize: { 
                       width: textWidth, 
                       height: textHeight, 
                   }, 
                   outsideFill: ColumnChartGMO.getLabelFill(labelSettings.labelColor, false, this.isComboChart), 
                   insideFill: ColumnChartGMO.getLabelFill(labelSettings.labelColor, true, this.isComboChart), 
                   parentType: LabelDataPointParentTypeGMO.Rectangle, 
                   parentShape: { 
                       rect: parentRect, 
                       orientation: dataPoint.value >= 0 ? NewRectOrientationGMO.VerticalBottomBased : NewRectOrientationGMO.VerticalTopBased, 
                       validPositions: ColumnChartGMO.stackedValidLabelPositions, 
                   }, 
                   identity: undefined, 
                   fontSize: labelSettings.fontSize || 12, 
               }); 
           } 
       } 
 
       return labelDataPoints; 
   } 
} 
 
export const enum NewRectOrientationGMO { 
   /** Rectangle with no specific orientation. */ 
   None, 
   /** Vertical rectangle with base at the bottom. */ 
   VerticalBottomBased, 
   /** Vertical rectangle with base at the top. */ 
   VerticalTopBased, 
   /** Horizontal rectangle with base at the left. */ 
   HorizontalLeftBased, 
   /** Horizontal rectangle with base at the right. */ 
   HorizontalRightBased, 
} 
 
export interface LabelParentRect { 
   /** The rectangle this data label belongs to */ 
   rect: IRect; 
   /** The orientation of the parent rectangle */ 
   orientation: NewRectOrientationGMO; 
   /** Valid positions to place the label ordered by preference */ 
   validPositions: RectLabelPositionGMO[]; 
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
 
let flagBar: number = 1 << 1; 
let flagColumn: number = 1 << 2; 
let flagClustered: number = 1 << 3; 
let flagStacked: number = 1 << 4; 
let flagStacked100: number = flagStacked | (1 << 5); 
 
export enum StackedChartGMOType { 
   clusteredBar = flagBar | flagClustered, 
   clusteredColumn = flagColumn | flagClustered, 
   hundredPercentStackedBar = flagBar | flagStacked100, 
   hundredPercentStackedColumn = flagColumn | flagStacked100, 
   stackedBar = flagBar | flagStacked, 
   stackedColumn = flagColumn | flagStacked, 
} 
 
export interface ColumnAxisGMOOptions { 
   xScale: Selection<number>; 
   yScale: Selection<number>; 
   seriesOffsetScale?: Selection<number>; 
   columnWidth: number; 
   /** Used by clustered only since categoryWidth !== columnWidth */ 
   categoryWidth?: number; 
   isScalar: boolean; 
   margin: IMargin; 
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
 
export interface StackedChartGMOContext { 
   height: number; 
   width: number; 
   duration: number; 
   hostService: any; 
   margin: IMargin; 
   mainGraphicsContext: Selection<any>; 
   labelGraphicsContext: Selection<any>; 
   layout: CategoryLayout; 
   animator: IColumnChartAnimatorGMO; 
   onDragStart?: (datum: StackedChartGMODataPoint) => void; 
   interactivityService: IInteractivityService; 
   viewportHeight: number; 
   viewportWidth: number; 
   is100Pct: boolean; 
   isComboChart: boolean; 
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
 
export interface IColumnChartConverterGMOStrategy { 
   getLegend(colors: IColorPalette, defaultLegendLabelColor: string, defaultColor?: string): LegendSeriesInfo; 
   getValueBySeriesAndCategory(series: number, category: number): number; 
   getMeasureNameByIndex(series: number, category: number): string; 
   hasHighlightValues(series: number): boolean; 
   getHighlightBySeriesAndCategory(series: number, category: number): number; 
} 
 
export interface LegendSeriesGMOInfo { 
   legend: LegendData; 
   seriesSources: DataViewMetadataColumn[]; 
   seriesObjects: DataViewObjects[][]; 
} 
 
export interface ColumnChartDrawGMOInfo { 
   shapesSelection: Selection<any>; 
   viewport: IViewport; 
   axisOptions: ColumnAxisOptions; 
   labelDataPoints: LabelDataPointGMO[]; 
} 
let RoleNames = { 
   category: 'Category', 
   series: 'Series', 
   y: 'Y', 
}; 
 
export let StackedChartGMOProps = { 
   dataPoint: { 
       defaultColor: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'defaultColor' }, 
       fill: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'fill' }, 
       showAllDataPoints: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'showAllDataPoints' }, 
   }, 
   general: { 
       formatString: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'formatString' }, 
   }, 
   sampleFilter: { 
       show: { objectName: 'sampleFilter', propertyName: 'show' }, 
   }, 
   categoryAxis: { 
       axisType: <DataViewObjectPropertyIdentifier>{ objectName: 'categoryAxis', propertyName: 'axisType' }, 
   }, 
   textWrap: { 
       show: { objectName: 'textWrap', propertyName: 'show' } 
   }, 
   measureTitles: { 
       ellipses: { objectName: 'measureTitles', propertyName: 'ellipses' }, 
   }, 
   legend: { 
       labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelColor' }, 
       labelDisplayUnit: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelDisplayUnit' }, 
       labelPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelPrecision' }, 
       primaryMeasureOnoff: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'primaryMeasureOnoff' }, 
   }, 
   plotArea: { 
       image: <DataViewObjectPropertyIdentifier>{ objectName: 'plotArea', propertyName: 'image' }, 
       transparency: <DataViewObjectPropertyIdentifier>{ objectName: 'plotArea', propertyName: 'transparency' }, 
   }, 
   title: { 
       tooltipText: <DataViewObjectPropertyIdentifier>{ objectName: 'title', propertyName: 'tooltipText' }, 
       showTooltip: <DataViewObjectPropertyIdentifier>{ objectName: 'title', propertyName: 'showTooltip' }, 
   }, 
   // MAQCode 
   show: { objectName: 'GMOColumnChartTitle', propertyName: 'show' }, 
   titleText: { objectName: 'GMOColumnChartTitle', propertyName: 'titleText' }, 
   titleFill: { objectName: 'GMOColumnChartTitle', propertyName: 'fill1' }, 
   titleBackgroundColor: { objectName: 'GMOColumnChartTitle', propertyName: 'backgroundColor' }, 
   titleFontSize: { objectName: 'GMOColumnChartTitle', propertyName: 'fontSize' }, 
   tooltipText: { objectName: 'GMOColumnChartTitle', propertyName: 'tooltipText' }, 
 
   totalLabels: { 
       show: { objectName: 'totalLabels', propertyName: 'show' }, 
       titleText: { objectName: 'totalLabels', propertyName: 'titleText' }, 
       color: <DataViewObjectPropertyIdentifier>{ objectName: 'totalLabels', propertyName: 'color' }, 
       displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'totalLabels', propertyName: 'labelDisplayUnits' }, 
       textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'totalLabels', propertyName: 'labelPrecision' }, 
       fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'totalLabels', propertyName: 'fontSize' }, 
   }, 
   secondaryLabels: { 
       titleText: { objectName: 'secondaryLabels', propertyName: 'titleText' }, 
       color: <DataViewObjectPropertyIdentifier>{ objectName: 'secondaryLabels', propertyName: 'color' }, 
       displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'secondaryLabels', propertyName: 'labelDisplayUnits' }, 
       textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'secondaryLabels', propertyName: 'labelPrecision' }, 
       fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'secondaryLabels', propertyName: 'fontSize' }, 
   }, 
   tertiaryLabels: { 
       titleText: { objectName: 'tertiaryLabels', propertyName: 'titleText' }, 
       color: <DataViewObjectPropertyIdentifier>{ objectName: 'tertiaryLabels', propertyName: 'color' }, 
       displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'tertiaryLabels', propertyName: 'labelDisplayUnits' }, 
       textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'tertiaryLabels', propertyName: 'labelPrecision' }, 
       fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'tertiaryLabels', propertyName: 'fontSize' }, 
   }, 
   quaternaryLabels: { 
       titleText: { objectName: 'quaternaryLabels', propertyName: 'titleText' }, 
       color: <DataViewObjectPropertyIdentifier>{ objectName: 'quaternaryLabels', propertyName: 'color' }, 
       displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'quaternaryLabels', propertyName: 'labelDisplayUnits' }, 
       textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'quaternaryLabels', propertyName: 'labelPrecision' }, 
       fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'quaternaryLabels', propertyName: 'fontSize' }, 
   }, 
   FifthLabels: { 
       titleText: { objectName: 'FifthLabels', propertyName: 'titleText' }, 
       color: <DataViewObjectPropertyIdentifier>{ objectName: 'FifthLabels', propertyName: 'color' }, 
       displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'FifthLabels', propertyName: 'labelDisplayUnits' }, 
       textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'FifthLabels', propertyName: 'labelPrecision' }, 
       fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'FifthLabels', propertyName: 'fontSize' }, 
   }, 
   SixthLabels: { 
       titleText: { objectName: 'SixthLabels', propertyName: 'titleText' }, 
       color: <DataViewObjectPropertyIdentifier>{ objectName: 'SixthLabels', propertyName: 'color' }, 
       displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'SixthLabels', propertyName: 'labelDisplayUnits' }, 
       textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'SixthLabels', propertyName: 'labelPrecision' }, 
       fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'SixthLabels', propertyName: 'fontSize' }, 
   }, 
}; 
export interface sampleFilterSettings { 
   show: boolean; 
}; 
export interface textWrapSettings { 
   show: boolean; 
}; 
export interface measureTitlesSettings { 
   ellipsesStrength: number; 
}; 
export interface totalLabelSettings { 
   show: boolean; 
   titleText: string; 
   color: string; 
   displayUnits: number; 
   textPrecision: number; 
   fontSize: number; 
}; 
export interface secondaryLabelSettings { 
   titleText: string; 
   color: string; 
   displayUnits: number; 
   textPrecision: number; 
   fontSize: number; 
}; 
export interface tertiaryLabelSettings { 
   titleText: string; 
   color: string; 
   displayUnits: number; 
   textPrecision: number; 
   fontSize: number; 
}; 
export interface quaternaryLabelSettings { 
   titleText: string; 
   color: string; 
   displayUnits: number; 
   textPrecision: number; 
   fontSize: number; 
}; 
export interface FifthLabelSettings { 
   titleText: string; 
   color: string; 
   displayUnits: number; 
   textPrecision: number; 
   fontSize: number; 
}; 
export interface SixthLabelSettings { 
   titleText: string; 
   color: string; 
   displayUnits: number; 
   textPrecision: number; 
   fontSize: number; 
}; 
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
   private root: Selection<any>; 
   private updateCount: number = 0; 
   private static ColumnChartClassName = 'StackedChartGMO'; 
   public static SeriesClasses: ClassAndSelector = createClassAndSelector('series'); 
   private legend: IGMOLegend; 
   private static MainGraphicsContextClassName = 'mainGraphicsContext'; 
   private AxisGraphicsContextClassName = 'axisGraphicsContext'; 
  // private y1AxisReferenceLines: DataViewObjectMap; 
   private ColorPalette: IColorPalette; 
   private background: VisualBackground; 
   public TooltipServiceWrapper: ITooltipServiceWrapper; 
   private svg: Selection<any>; 
 //  private barsCenters: number[]; 
   private svgScrollable: Selection<any>; 
   private mainGraphicsContext: Selection<any>; 
   private labelGraphicsContext: Selection<any>; 
   private axisGraphicsContext: Selection<any>; 
   private axisGraphicsContextScrollable: Selection<any>; 
   private xAxisGraphicsContext: Selection<any>; 
   private backgroundGraphicsContext: Selection<any>; 
   private y1AxisGraphicsContext: Selection<any>; 
   private clearCatcher: Selection<any>; 
   private mainGraphicsG: Selection<any>; 
   private xAxisProperties: IAxisProperties; 
   private yAxisProperties: IAxisProperties; 
   public isLegendValue: boolean = false; 
   private isAxistype: boolean; 
   private isSameAxis: boolean; 
   private isSecondaryMeasure: boolean = false; 
   private isPrimaryMeasure: boolean; 
   private ScrollBarWidth = 10; 
   private data: StackedChartGMOData; 
   private style: IVisualStyle; 
   private colors: IColorPalette; 
   private static AxisFontSize = 11; 
   private yAxisOrientation: string; 
   private scrollY: boolean; 
   private scrollX: boolean; 
   private textProperties: TextProperties = { 
       fontFamily: 'Segoe UI', 
       fontSize: PixelConverter.toString(Visual.AxisFontSize), 
   }; 
   private chartType: any; 
   private columnChart: IStackedChartGMOStrategy; 
   private hostService: any; 
   private cartesianVisualHost: any; 
   private legendObjectProperties: DataViewObject; 
   private removeFlags: number[]; 
 
   private layerLegendData: LegendData; 
   private legendLabelFontSize: number; 
   private interactivity: InteractivityOptions; 
   private cartesianSmallViewPortProperties: CartesianSmallViewPortPropertiesGMO; 
   private options: any; 
   private static LabelDisplayUnitsDefault: number = 0; 
   private mainGraphicsSVG: Selection<any>; 
   private lastInteractiveSelectedColumnIndex: number; 
   private interactivityService: IInteractivityService; 
   private dataView: DataView; 
   public dataViews: DataView[]; 
   private dataViewCat: DataViewCategorical; 
   private categoryAxisType: string; 
   private hasCategoryAxis: boolean; 
   private yAxisIsCategorical: boolean; 
   private bottomMarginLimit: number; 
   private leftRightMarginLimit: number; 
   private isXScrollBarVisible: boolean; 
   private isYScrollBarVisible: boolean; 
   private animator: IColumnChartAnimatorGMO; 
   private isScrollable: boolean; 
   private tooltipsEnabled: boolean; 
   private element: any; 
   private seriesLabelFormattingEnabled: boolean; 
   private isComboChart: boolean; 
    private formattingSettingsService = new FormattingSettingsService();
    private formattingSettingsModel = new VisualFormattingSettingsModel();
   private categoryAxisProperties: DataViewObject & { [key: string]: any }; 
   private valueAxisProperties: DataViewObject; 
   public visualOptions: CalculateScaleAndDomainOptions; 
   private categoryAxisHasUnitType: boolean; 
   private valueAxisHasUnitType: boolean; 
   private static LegendLabelFontSizeDefault: number = 9; 
   private static totalHeight = 0; 
   private _margin: IMargin; 
   public legendDataGlobal: LegendData; 
   private get margin(): IMargin { 
       return this._margin || { left: 0, right: 0, top: 0, bottom: 0 }; 
   } 
 
   private set margin(value: IMargin) { 
       this._margin = $.extend({}, value); 
       this._viewportIn = Visual.substractMargin(this.viewport, this.margin); 
   } 
 
   private _viewport: IViewport; 
   private get viewport(): IViewport { 
       return this._viewport || { width: 0, height: 0 }; 
   } 
 
   private set viewport(value: IViewport) { 
       this._viewport = $.extend({}, value); 
       this._viewportIn = Visual.substractMargin(this.viewport, this.margin); 
   } 
 
   private _viewportIn: IViewport; 
   private get viewportIn(): IViewport { 
       return this._viewportIn || this.viewport; 
   } 
 
   private static substractMargin(viewport: IViewport, margin: IMargin): IViewport { 
       return { 
           width: Math.max(viewport.width - (margin.left + margin.right), 0), 
           height: Math.max(viewport.height - (margin.top + margin.bottom), 0) 
       }; 
   } 
 
   public updateVisualMetadata(x: IAxisProperties, y: IAxisProperties, margin) { 
       this.xAxisProperties = x; 
       this.yAxisProperties = y; 
       this.margin = margin; 
   } 
   public applyViewportSettings(): void { 
       if ( this.viewport.height < 370 || this.viewport.width < 390 ) { 
           this.categoryAxisProperties['fontSize'] = this.categoryAxisProperties['fontSize'] > 16 ? 16 : this.categoryAxisProperties['fontSize']; 
           this.categoryAxisProperties['fontSize'] = this.categoryAxisProperties['fontSize'] > 16 ? 16 : this.categoryAxisProperties['fontSize']; 
       } else if ( this.viewport.height < 550 || this.viewport.width < 560 ) { 
           this.categoryAxisProperties['fontSize'] = this.categoryAxisProperties['fontSize'] > 21 ? 21 : this.categoryAxisProperties['fontSize']; 
           this.categoryAxisProperties['fontSize'] = this.categoryAxisProperties['fontSize'] > 21 ? 21 : this.categoryAxisProperties['fontSize']; 
       } else if ( this.viewport.height < 600 || this.viewport.width < 640 ) { 
           this.categoryAxisProperties['fontSize'] = this.categoryAxisProperties['fontSize'] > 32 ? 32 : this.categoryAxisProperties['fontSize']; 
           this.categoryAxisProperties['fontSize'] = this.categoryAxisProperties['fontSize'] > 32 ? 32 : this.categoryAxisProperties['fontSize']; 
       } 
       // if ( !categoryFlag ) { 
       //     this.settingsAxis.axis.x.padding = 0; 
       // } else { 
       //     this.settingsAxis.axis.x.padding = this.settingsAxis.border.halfOfTop; 
       // } 
   } 
 
   /** 
    * Renders a runtime error directly onto the visual surface so that failures 
    * are visible (with the failing call stack) instead of showing a blank visual. 
    * This method must never throw itself. 
    */ 
   private renderFatalError(phase: string, error: any, element?: HTMLElement): void { 
       try { 
           const host: HTMLElement = 
               element 
               || <HTMLElement>(<any>this.element) 
               || (this.options && <HTMLElement>(<any>this.options.element)) 
               || document.body; 
           if (!host) { 
               return; 
           } 
           while (host.firstChild) { 
               host.removeChild(host.firstChild); 
           } 
           const message: string = 
               error && (error.stack || error.message) 
                   ? (error.stack || error.message) 
                   : String(error); 
           const container: HTMLDivElement = document.createElement('div'); 
           container.setAttribute( 
               'style', 
               'box-sizing:border-box;width:100%;height:100%;overflow:auto;' 
               + 'padding:12px;font-family:Segoe UI,sans-serif;font-size:12px;' 
               + 'color:#a80000;background:#fff3f3;'); 
           const title: HTMLDivElement = document.createElement('div'); 
           title.setAttribute('style', 'font-weight:600;margin-bottom:6px;'); 
           title.textContent = 'Visual error during ' + phase + '()'; 
           const pre: HTMLPreElement = document.createElement('pre'); 
           pre.setAttribute('style', 'white-space:pre-wrap;word-break:break-word;margin:0;color:#5c0000;'); 
           pre.textContent = message; 
           container.appendChild(title); 
           container.appendChild(pre); 
           host.appendChild(container); 
           // eslint-disable-next-line no-console 
           console.error('[100per-Stackchart] ' + phase + '() failed:', error); 
       } catch (ignored) { 
           // The error renderer must never throw. 
       } 
   } 
 
   constructor(options: VisualConstructorOptions) { 
     try { 
       this.categoryAxisType = null; 
       this.tooltipsEnabled = true; 
       this.root = d3.select(options.element); 
       this.viewport; 
       this.hostService = options.host; 
 
       this.interactivityService = createInteractivityService(this.hostService); 
 
       this.options = options; 
       this.TooltipServiceWrapper = createTooltipServiceWrapper( 
           options.host.tooltipService, 
           options.element); 
 
       const titleDiv = d3.select(options.element) 
           .append('div') 
           .classed('Title_Div_Text', true) 
           .style({ 'width': '100%', 'display': 'inline-block', 'position': 'static' }); 
       titleDiv.append('div') 
           .classed('GMOColumnChartTitleDiv', true) 
           .style({ 
               'max-width': '80%', 'overflow': 'hidden', 
               'text-overflow': 'ellipsis', 'white-space': 'nowrap', 
               'display': 'inline-block' 
           }); 
       titleDiv.append('span') 
           .classed('GMOColumnChartTitleIcon', true) 
           .style({ 'width': '2%', 'cursor': 'pointer', 'position': 'absolute' }) 
           .text('\u00A0(?)'); 
       d3.select(options.element) 
           .append('div') 
           .classed('EmptyDiv', true) 
           .style({ 'width': '100%', 'position': 'relative', 'visibility': 'hidden', 'height': '8px' }) 
           .text('.'); 
 
       d3.select(options.element) 
           .append('div') 
           .classed('errorMessage', true) 
           .text("Please select 'Primary Measure' value") 
           .style({ 
               'display': 'none', 'text-align': 'center' 
               , 'top': this.viewport.height / 2 + 'px', 'position': 'relative' 
               , 'width': '100%' 
           }); 
 
       this.svg = d3.select(options.element) 
           .append('svg') 
           .style('position', 'absolute').classed('cartesianChart', true); 
       this.margin = { 
           top: 1, 
           right: 1, 
           bottom: 1, 
           left: 1 
       }; 
       this.yAxisOrientation = yAxisPosition.left; 
       let element = this.element = options.element; 
       element.setAttribute("class", Visual.ColumnChartClassName); 
       this.adjustMargins(); 
       let showLinesOnX = this.scrollY = true; 
 
       let showLinesOnY = this.scrollX = true; 
 
       this.mainGraphicsContext = this.svg.append('g').classed('columnChartMainGraphicsContext', true); 
       let axisGraphicsContext = this.axisGraphicsContext = this.svg.append('g') 
           .classed(this.AxisGraphicsContextClassName, true); 
 
       this.svgScrollable = this.svg.append('svg') 
           .classed('svgScrollable', true) 
           .style('overflow', 'hidden'); 
 
       this.labelGraphicsContext = this.svgScrollable.append('g') 
           .classed('labelGraphicsContext', true); 
       let axisGraphicsContextScrollable = this.axisGraphicsContextScrollable = this.svgScrollable.append('g') 
           .classed(this.AxisGraphicsContextClassName, true); 
 
       this.clearCatcher = appendClearCatcher(this.axisGraphicsContextScrollable); 
       let axisGroup = showLinesOnX ? axisGraphicsContextScrollable : axisGraphicsContext; 
 
       this.backgroundGraphicsContext = axisGraphicsContext.append('svg:image'); 
       this.xAxisGraphicsContext = axisGroup.append('g').attr('class', 'x axis'); 
       this.y1AxisGraphicsContext = axisGroup.append('g').attr('class', 'y axis'); 
 
       this.xAxisGraphicsContext.classed('showLinesOnAxis', showLinesOnX); 
       this.y1AxisGraphicsContext.classed('showLinesOnAxis', showLinesOnY); 
 
       this.xAxisGraphicsContext.classed('hideLinesOnAxis', !showLinesOnX); 
       this.y1AxisGraphicsContext.classed('hideLinesOnAxis', !showLinesOnY); 
       this.interactivityService = createInteractivityService(this.hostService); 
       this.isComboChart = false; 
       this.mainGraphicsG = this.axisGraphicsContextScrollable.append('g') 
           .classed(Visual.MainGraphicsContextClassName, true); 
       this.mainGraphicsContext = this.mainGraphicsG.append('svg'); 
       this.ColorPalette = options.host.colorPalette; 
       this.legend = new GMOSVGLegend(element, LegendPosition.Top, this.interactivityService, true); 
     } catch (e) { 
         this.renderFatalError('constructor', e, options && options.element); 
     } 
} 
   public update(options: VisualUpdateOptions) { 
     try { 
       Visual.totalHeight = options.viewport.height; 
             if (options.dataViews && options.dataViews.length > 0) {
                     this.formattingSettingsModel = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews[0]);
             }
        
       this.root.selectAll('.svgScrollable > .axisGraphicsContext > .mainGraphicsContext > .dataLabels > .dataLabel').remove(); 
       //total, secondary, tertiary and quarternay fifth sixth 
       this.root.selectAll('.cartesianChart > .measureLabelTitle').remove(); 
       this.root.selectAll('.svgScrollable > .axisGraphicsContext > .totalLabels').remove(); 
       this.root.selectAll('.svgScrollable > .axisGraphicsContext > .secLabels').remove(); 
       this.root.selectAll('.svgScrollable > .axisGraphicsContext > .terLabels').remove(); 
       this.root.selectAll('.svgScrollable > .axisGraphicsContext > .quatLabels').remove(); 
       this.root.selectAll('.svgScrollable > .axisGraphicsContext > .fiveLabels').remove(); 
       this.root.selectAll('.svgScrollable > .axisGraphicsContext > .sixLabels').remove(); 
 
this.root.selectAll('.legendGroup').remove(); this.root.selectAll('.legendIcon').remove(); this.root.selectAll('.legendText').remove(); this.root.selectAll('.legendItem').remove(); this.updateCount++; 

      this.isPrimaryMeasure = false; 
       this.isLegendValue = false; 
       this.isAxistype = false; 
       this.isSecondaryMeasure = false; 
       this.isSameAxis = false; 
       let dataViews = options.dataViews; 
       this.viewport = (options.viewport); 
       let axisIterator = 0, legendIterator = 0; 
       if (!dataViews || 0 === dataViews.length) { 
           this.updateCount = 0; 
           this.root.select('.errorMessage').style({ 'display': 'block', 'top': this.viewport.height / 2 + 'px' }); 
           this.root.select('.legend').style({ 'display': 'none' }); 
           this.svg.style({ 'display': 'none' }); 
           this.root.select('.Title_Div_Text').style({ 'display': 'none' }); 
           return; 
       } 
       else if (dataViews.length !== 0 && dataViews[0].metadata.columns.length === 0) { 
           this.updateCount = 0; 
           this.root.select('.errorMessage').text('No data available'); 
           this.root.select('.errorMessage').style({ 'display': 'block', 'top': this.viewport.height / 2 + 'px' }); 
           this.root.select('.legend').style({ 'display': 'none' }); 
           this.svg.style({ 'display': 'none' }); 
           this.root.select('.Title_Div_Text').style({ 'display': 'none' }); 
           return; 
       } 
       else if (dataViews[0].categorical.categories && dataViews[0].categorical.categories[0].values.length == 0 && dataViews[0].categorical.values && dataViews[0].categorical.values[0].values.length == 0) { 
           this.updateCount = 0; 
           this.root.select('.errorMessage').text('No data available'); 
           this.root.select('.errorMessage').style({ 'display': 'block', 'top': this.viewport.height / 2 + 'px' }); 
           this.root.select('.legend').style({ 'display': 'none' }); 
           this.svg.style({ 'display': 'none' }); 
           this.root.select('.Title_Div_Text').style({ 'display': 'none' }); 
           return; 
       } 
 
       let axisName; 
       let legendName; 
       let metadataarray=dataViews[0].metadata.columns; 
       if (metadataarray) { 
           for (let i = 0; i < dataViews[0].metadata.columns.length; i++) { 
               if (metadataarray[i].roles && metadataarray[i].roles.hasOwnProperty('Y')) { 
                   this.isPrimaryMeasure = true; 
               } 
               if (metadataarray[i].roles && metadataarray[i].roles.hasOwnProperty('Category') && !axisIterator) { 
                   this.isAxistype = true; 
                   axisName = dataViews[0].metadata.columns[i].displayName; 
                   axisIterator++; 
 
               } 
               if (metadataarray[i].roles && metadataarray[i].roles.hasOwnProperty('Series') && !legendIterator) { 
                   legendName = dataViews[0].metadata.columns[i].displayName; 
                   legendIterator++; 
               } 
           } 
       } 
       let resize: boolean = false; 
       if (this.dataView === options.dataViews[0]) { 
           resize = true; 
       } 
       this.dataView = options.dataViews[0]; 
       // ---- Multi-measure delivery (modern Power BI emits ONE dataView) ----
       // This visual was originally written for API 1.x, where each of its 7
       // dataViewMappings produced its own dataView (so dataViews[1]=secondary,
       // [3]=tertiary, etc.). Modern Power BI (API 5.x) emits a SINGLE dataView
       // and DROPS value-only categorical mappings entirely (confirmed at runtime:
       // dataViews.length===1 with only the Y role present). So every measure must
       // be delivered together inside dataViews[0].categorical.values (grouped by
       // Series), and we reconstruct here exactly what the renderer expects:
       //   (a) a Y-ONLY categorical clone for the stacking chart, so the existing
       //       converter (which indexes the flat values array) is unaffected; and
       //   (b) one synthesized, aggregated-per-category dataView for each extra
       //       measure, placed at its fixed index: [1]=secondary [2]=sampleSize
       //       [3]=tertiary [4]=quaternary [5]=fifth [6]=sixth.
       {
           const host0: any = options.dataViews[0];
           const cat: any = host0 && host0.categorical;
           const allValues: any = cat && cat.values ? cat.values : null;
           // A SINGLE column can carry MULTIPLE roles at once. When the same field
           // is dropped into several measure wells (e.g. "Sum of Sales" assigned to
           // Primary + Secondary + Quaternary), modern Power BI returns ONE column
           // with roles {Y:true, secondaryMeasure:true, quaternaryMeasure:true} -
           // it does NOT duplicate the column. So we must test each role
           // INDEPENDENTLY (hasRole) rather than pick a single "first" role; the old
           // roleOf approach silently dropped every role after the first, which is
           // why secondary/quaternary rows went missing while a single-role column
           // (tertiary = "Count of Month") still worked.
           const hasRole = (col: any, role: string): boolean => {
               const r = col && col.source && col.source.roles;
               return !!(r && r[role]);
           };
           const normalized: DataView[] = [];
           if (allValues && typeof allValues.grouped === 'function') {
               const origGroups: any[] = allValues.grouped() || [];
               const categories: any = cat.categories;
               const catLen: number = categories && categories[0] && categories[0].values
                   ? categories[0].values.length : 0;

               // (a) Y-only categorical clone -> stacking chart sees exactly what it
               //     sees today when only the Primary measure is bound.
               const yOnlyValues: any = allValues.filter((c: any) => hasRole(c, 'Y'));
               yOnlyValues.source = allValues.source;
               yOnlyValues.grouped = () => origGroups.map((g: any) => {
                   const ng: any = Object.assign({}, g);
                   ng.values = (g.values || []).filter((c: any) => hasRole(c, 'Y'));
                   return ng;
               });
               const chartDataView: any = Object.assign({}, host0);
               chartDataView.categorical = Object.assign({}, cat, { values: yOnlyValues });
               normalized[0] = chartDataView;
               this.dataView = chartDataView;

               // (b) synthesize an aggregated-per-category dataView per extra measure.
               const ROLE_TO_INDEX: { [role: string]: number } = {
                   secondaryMeasure: 1,
                   sampleSize: 2,
                   tertiaryMeasure: 3,
                   quaternaryMeasure: 4,
                   fifthMeasure: 5,
                   sixthMeasure: 6,
               };
               for (const role in ROLE_TO_INDEX) {
                   let srcCol: any = null;
                   for (const g of origGroups) {
                       const found = (g.values || []).find((c: any) => hasRole(c, role));
                       if (found) { srcCol = found; break; }
                   }
                   if (!srcCol) { continue; }
                   const sums: any[] = new Array(catLen).fill(null);
                   for (const g of origGroups) {
                       const col = (g.values || []).find((c: any) => hasRole(c, role));
                       if (!col || !col.values) { continue; }
                       for (let c = 0; c < catLen; c++) {
                           const v = col.values[c];
                           if (v != null) {
                               const n = typeof v === 'number' ? v : (parseFloat(v) || 0);
                               sums[c] = (sums[c] == null ? 0 : sums[c]) + n;
                           }
                       }
                   }
                   const synthValues: any = [{ source: srcCol.source, values: sums }];
                   synthValues.source = undefined;
                   normalized[ROLE_TO_INDEX[role]] = <any>{
                       metadata: { columns: [srcCol.source], objects: host0.metadata ? host0.metadata.objects : null },
                       categorical: { categories: categories, values: synthValues },
                   };
               }
           } else {
               normalized[0] = host0;
           }
           this.dataViews = normalized; 
       }
       this.svg.selectAll('.columnChartMainGraphicsContext').remove(); 
       this.mainGraphicsContext = this.svg.append('g').classed('columnChartMainGraphicsContext', true); 
       this.axisGraphicsContextScrollable.selectAll('.' + Visual.MainGraphicsContextClassName).remove(); 
       this.mainGraphicsG = this.axisGraphicsContextScrollable.append('g') 
           .classed(Visual.MainGraphicsContextClassName, true); 
       this.mainGraphicsContext = this.mainGraphicsG.append('svg'); 
 
       if (axisName === legendName) 
           this.isSameAxis = true; 
       
       if (!this.isPrimaryMeasure) { 
           this.root.select('.errorMessage').style({ 'display': 'block', 'top': this.viewport.height / 2 + 'px' }); 
           this.root.select('.legend').style({ 'display': 'none' }); 
           this.svg.style({ 'display': 'none' }); 
           this.root.select('.Title_Div_Text').style({ 'display': 'none' }); 
           return; 
       } 
       else { 
           this.root.select('.errorMessage').style({ 'display': 'none' }); 
           this.root.select('.legend').style({ 'display': 'inherit' }); 
           this.svg.style({ 'display': 'block' }); 
           this.root.select('.Title_Div_Text').style({ 'display': 'inline-block' }); 
       } 
 
       if (dataViews[0] && dataViews[0].categorical && dataViews[0].categorical.values && dataViews[0].categorical.values.source && dataViews[0].categorical.values.source.roles) { 
           if (dataViews[0].categorical.values.source.roles.hasOwnProperty('Series')) 
               this.isLegendValue = true; 
       } 
 
       if (dataViews.length > 0) { 
           this.populateObjectProperties(dataViews); 
       } 
       // MAQ Code 
       let GMOColumnChartTitleOnOffStatus: boolean = false 
           , titleText: string = "" 
           , tooltiptext: string = "" 
           , titlefontsize 
 
           , titlecolor: string 
           , titlebgcolor: string; 
 
       if (this.getShowTitle(this.dataView)) { 
           GMOColumnChartTitleOnOffStatus = true; 
       } 
       let title=this.getTitleText(this.dataView) 
       let Ttext=this.getTooltipText(this.dataView) 
 
       if (title) { 
           titleText = title; 
       } 
 
       if (Ttext) { 
           tooltiptext = Ttext; 
       } 
       this.applyViewportSettings(); 
       titlefontsize = this.getTitleSize(this.dataView); 
       if (!titlefontsize) titlefontsize = 12; 
 
let Tcolor=this.getTitleFill(this.dataView) 
if (Tcolor) { titlecolor = Tcolor.solid.color; } let TBgcolor=this.getTitleBgcolor(this.dataView) 
    if (TBgcolor) { titlebgcolor = TBgcolor.solid.color; if ("none" === titlebgcolor) { titlebgcolor = "#ffffff"; } } this.root.select('.GMOColumnChartTitleDiv') .text(titleText); 

      this.root.select('.GMOColumnChartTitleIcon').style({ 'display': 'none' }); 
 
       if ("" !== tooltiptext && (1 !== this.updateCount || "" !== titleText)) { 
           this.root.select('.GMOColumnChartTitleIcon') 
               .style({ 'display': 'inline-block' }) 
               .attr('title', tooltiptext); 
       } 
 
       // MAQ Code Ends 
       // Feed the reconstructed dataViews (Y-only chart view at [0] + synthesized
       // per-measure views at [1..6]) to setData so the stacking converter sees a
       // single Y measure per series group, exactly as in the working chart.
       this.setData(this.dataViews); 
       if (this.data.categories.length == 0) { 
           this.updateCount = 0; 
           (<HTMLElement>this.root.select('.errorMessage')[0][0]).innerHTML = 'Statistically Insignificant Data'; 
           this.root.select('.errorMessage').style({ 'display': 'block', 'top': this.viewport.height / 2 + 'px' }); 
           this.root.select('.legend').style({ 'display': 'none' }); 
           this.svg.style({ 'display': 'none' }); 
           this.root.select('.Title_Div_Text').style({ 'display': 'none' }); 
           return; 
       } 
 
       if (dataViews.length > 0) { 
           let dataViewMetadata = dataViews[0].metadata; 
           let dataView = dataViews[0]; 
           if (dataViewMetadata) { 
               this.background = { 
                   image: dataViewObjects.getValue<ImageValue>(dataView.metadata.objects, scatterChartProps.plotArea.image), 
                   transparency: dataViewObjects.getValue(dataView.metadata.objects, scatterChartProps.plotArea.transparency, visualBackgroundHelper.getDefaultTransparency()), 
               }; 
           } 
       } 
       let xAxisCardProperties = CartesianHelper.getCategoryAxisProperties(options.dataViews[0].metadata); 
       let valueAxisProperties = CartesianHelper.getValueAxisProperties(options.dataViews[0].metadata); 
       this.visualOptions = { 
           viewport: this.viewport, 
           margin: this.margin, 
           forcedXDomain: [xAxisCardProperties ? xAxisCardProperties['start'] : null, xAxisCardProperties ? xAxisCardProperties['end'] : null], 
           forceMerge: valueAxisProperties && valueAxisProperties['secShow'] === false, 
           showCategoryAxisLabel: true, 
           showValueAxisLabel: true, 
           trimOrdinalDataOnOverflow: undefined, 
           categoryAxisScaleType: xAxisCardProperties && xAxisCardProperties['axisScale'] != null ? <string>xAxisCardProperties['axisScale'] : axisScale.linear, 
           valueAxisScaleType: valueAxisProperties && valueAxisProperties['axisScale'] != null ? <string>valueAxisProperties['axisScale'] : axisScale.linear, 
           categoryAxisDisplayUnits: xAxisCardProperties && xAxisCardProperties['labelDisplayUnits'] != null ? <number>xAxisCardProperties['labelDisplayUnits'] : 0, 
           valueAxisDisplayUnits: valueAxisProperties && valueAxisProperties['labelDisplayUnits'] != null ? <number>valueAxisProperties['labelDisplayUnits'] : 0, 
           categoryAxisPrecision: xAxisCardProperties ? CartesianHelper.getPrecision(xAxisCardProperties['labelPrecision']) : null, 
           valueAxisPrecision: valueAxisProperties ? CartesianHelper.getPrecision(valueAxisProperties['labelPrecision']) : null, 
           playAxisControlLayout: undefined, 
       }; 
 
       if (GMOColumnChartTitleOnOffStatus && (titleText || tooltiptext)) { 
           this.root.select('.Title_Div_Text') 
               .style({ 
                   "display": "inline-block", 
                   "background-color": titlebgcolor, 
                   "font-size": PixelConverter.fromPointToPixel(titlefontsize) + 'px', 
                   "color": titlecolor 
               }); 
 
           let legendPosition = parseFloat(this.root.select('.legend').attr('orientation')); 
           let customTitleHeight = parseFloat(this.root.select('.Title_Div_Text').style('height')); 
           let legendHeight = parseFloat(this.root.select('.legend').style('height')); 
           let legendWidth = parseFloat(this.root.select('.legend').style('width')); 
           if (isNaN(legendHeight) || isNaN(legendWidth) || 0 === legendWidth || !(0 === legendPosition || 5 === legendPosition) || !this.legendObjectProperties['show'] || !this.isLegendValue) { 
               legendHeight = 0; 
 
           } 
           if (isNaN(customTitleHeight)) { 
               customTitleHeight = 0; 
           } 
           customTitleHeight = PixelConverter.fromPointToPixel(customTitleHeight); 
           legendHeight = PixelConverter.fromPointToPixel(legendHeight); 
           if (1 === legendPosition || 6 === legendPosition) { 
               this.root.select('.legend').style({ 'padding-top': 0 + 'px' }); 
           } 
           else { 
               this.root.select('.legend').style({ 'padding-top': 0 + 'px' }); 
           } 
           let isBarChart = EnumExtensions.hasFlag(this.chartType, flagBar); 
           if (isBarChart) { 
               if (this.isSecondaryMeasure && legendIterator === 1) 
                   this.svg.style({ 'position': 'absolute', 'padding-top': (10) + "px" }); 
               else 
                   this.svg.style({ 'position': 'absolute', 'padding-top': 0 + 'px' }); 
           } 
           else { 
               this.svg.style({ 'position': 'absolute', 'padding-top': 0 + 'px' }); 
           } 
       } 
       else { 
           this.root.select('.Title_Div_Text').style({ 'display': 'none' }); 
           this.root.select('.legend').style({ 'padding': '0px' }); 
           this.svg.style({ 'position': 'absolute' }); 
       } 
 
       if (!(this.options.interactivity && this.options.interactivity.isInteractiveLegend)) { 
           this.renderLegend(); 
       } 
       this.margin = this.visualOptions.margin; 
       this.calculateAxesProperties(this.visualOptions); 
       this.render(true, resize); 
     } catch (e) { this.renderFatalError('update', e); } 
   } 
   private shouldRenderAxis(axisProperties: IAxisProperties, propertyName: string = "show"): boolean { 

      if (!axisProperties) { 
           return false; 
       } 
 
       else if (axisProperties.isCategoryAxis && (!this.categoryAxisProperties || this.categoryAxisProperties[propertyName] == null || this.categoryAxisProperties[propertyName])) { 
           return axisProperties.values && axisProperties.values.length > 0; 
       } 
       else if (!axisProperties.isCategoryAxis && (!this.valueAxisProperties || this.valueAxisProperties[propertyName] == null || this.valueAxisProperties[propertyName])) { 
           return axisProperties.values && axisProperties.values.length > 0; 
       } 
 
       return false; 
   } 
   private populateObjectProperties(dataViews: DataView[]) { 
       if (dataViews.length > 0) { 
           let dataViewMetadata = dataViews[0].metadata; 
 
           if (dataViewMetadata) { 
               this.legendObjectProperties = dataViewObjects.getObject(dataViewMetadata.objects, 'legend', {}); 
           } 
           else { 
               this.legendObjectProperties = {}; 
           } 
           this.categoryAxisProperties = this.getCategoryAxisProperties(dataViewMetadata); 
           this.valueAxisProperties = this.getValueAxisProperties(dataViewMetadata); 
           let axisPosition = this.valueAxisProperties['position']; 
           this.yAxisOrientation = axisPosition ? axisPosition.toString() : yAxisPosition.left; 
       } 
   } 
   private getValueAxisProperties(dataViewMetadata: DataViewMetadata, axisTitleOnByDefault?: boolean): DataViewObject { 
       let toReturn: DataViewObject = {}; 
       if (!dataViewMetadata) 
           return toReturn; 
 
       let objects = dataViewMetadata.objects; 
 
       if (objects) { 
           let valueAxisObject = objects['valueAxis']; 
           if (valueAxisObject) { 
               toReturn = { 
                   show: valueAxisObject['show'], 
                   position: valueAxisObject['position'], 
                   axisScale: valueAxisObject['axisScale'], 
                   start: valueAxisObject['start'], 
                   end: valueAxisObject['end'], 
                   showAxisTitle: valueAxisObject['showAxisTitle'] == null ? axisTitleOnByDefault : valueAxisObject['showAxisTitle'], 
                   axisStyle: valueAxisObject['axisStyle'], 
                   axisColor: valueAxisObject['axisColor'], 
                   secShow: valueAxisObject['secShow'], 
                   secPosition: valueAxisObject['secPosition'], 
                   secAxisScale: valueAxisObject['secAxisScale'], 
                   secStart: valueAxisObject['secStart'], 
                   secEnd: valueAxisObject['secEnd'], 
                   secShowAxisTitle: valueAxisObject['secShowAxisTitle'], 
                   secAxisStyle: valueAxisObject['secAxisStyle'], 
                   labelDisplayUnits: valueAxisObject['labelDisplayUnits'], 
               }; 
           } 
       } 
       return toReturn; 
   } 
 
   private getCategoryAxisProperties(dataViewMetadata: DataViewMetadata, axisTitleOnByDefault?: boolean): DataViewObject { 
      
       let toReturn: DataViewObject = {}; 
       if (!dataViewMetadata) 
           return toReturn; 
 
       let objects = dataViewMetadata.objects; 
 
       if (objects) { 
           let categoryAxisObject = objects['categoryAxis']; 
 
           if (categoryAxisObject) { 
               toReturn = { 
                   show: categoryAxisObject['show'], 
                   axisType: categoryAxisObject['axisType'], 
                   axisColor: categoryAxisObject['axisColor'], 
                   showAxisTitle: categoryAxisObject['showAxisTitle'] == null ? axisTitleOnByDefault : categoryAxisObject['showAxisTitle'], 
                   axisStyle: categoryAxisObject['axisStyle'], 
                   labelDisplayUnits: categoryAxisObject['labelDisplayUnits'], 
                   fontSize : categoryAxisObject['fontSize'] 
               }; 
           } 
       } 
       return toReturn; 
   } 
 
   private renderLegend(): void { 
       let legendProperties = this.legendObjectProperties; 
       let legendData = this.data.legendData; 
       legendData.fontSize = this.legendLabelFontSize = dataViewObject.getValue<number>(this.legendObjectProperties, legendProps.fontSize, Visual.LegendLabelFontSizeDefault); 
       let legend: IGMOLegend = this.legend; 
 
       this.layerLegendData = this.data.legendData; 
       //** added if else for title*/ 
       if (this.layerLegendData) { 
           if (!this.legendObjectProperties['showTitle']) { 
               legendData.title = ""; 
           } 
           else { 
               legendData.title = <string>this.legendObjectProperties['titleText'] || this.layerLegendData.title; 
           } 
           if (this.legendObjectProperties['labelColor']) { 
               let labelcolor = this.legendObjectProperties['labelColor']; 
               let solid = labelcolor['solid']; 
               legendData.labelColor = solid['color']; 
           } 
 
          legendData.fontSize = this.legendLabelFontSize; 
           if (this.layerLegendData.grouped) { 
               legendData.grouped = true; 
           } 
       } 
       let showPrimaryMeasure; 
       if (this.isPrimaryMeasure) { 
           showPrimaryMeasure = 'Value'; 
       } 
       else { 
           showPrimaryMeasure = 'None'; 
       } 
       if (this.layerLegendData) { 
           if (this.isPrimaryMeasure) { 
               legendData['primaryTitle'] = this.getLegendTitle('primaryTitle', showPrimaryMeasure); 
           } 
       } 
 
       if (legendProperties) { 
           let position = <string>legendProperties[legendProps.position]; 
           if (position) { 
               legend.changeOrientation(LegendPosition[position]); 
           } 
 
       } 
       else { 
           legend.changeOrientation(LegendPosition.Top); 
       } 
        
       legend.drawLegendInternal( 
            
           legendData, this.viewport, true, showPrimaryMeasure /* perform auto width */); 
 
       let customTitleHeight = isNaN(parseFloat(this.root.select('.Title_Div_Text').style('height'))) ? 0 : parseFloat(this.root.select('.Title_Div_Text').style('height')); 
       legend['viewport'].height += customTitleHeight; 
       Legend.positionChartArea(this.svg, legend); 
   } 
 
   public getLegendTitle(name, showPrimaryMeasure): string { 
       switch (name) { 
           case 'title': 
               // If category exists, we render title using category source. If not, we render title 
               // using measure. 
 
var categories=this.dataView.categorical.categories 
var values=this.dataView.categorical.values 
let dvCategorySourceName = categories && categories.length > 0 && categories[0].source ? categories[0].source.displayName : ""; if (categories[0].values) { return dvCategorySourceName; } break; case 'primaryTitle': let source = values && (values[0].source || values[1].source); let dvValuesSourceName: string = ''; if (source && showPrimaryMeasure && showPrimaryMeasure !== 'None') { let index: number = values[0].source.roles.hasOwnProperty('Y') ? 0 : 1; dvValuesSourceName = values[index].source.displayName; } 

              return dvValuesSourceName; 
       } 
   } 
 
   private getCategoryLayout(numCategoryValues: number, options: CalculateScaleAndDomainOptions): CategoryLayout { let availableWidth: number; let legendPosition = parseFloat(this.root.select('.legend').attr('orientation')); 

      let customTitleHeight = parseFloat(this.root.select('.Title_Div_Text').style('height')); 
       if (isNaN(customTitleHeight)) { 
           customTitleHeight = 0; 
       } 
 
       let legendHeight = parseFloat(this.root.select('.legend').style('height')) - 20; 
       let legendWidth = parseFloat(this.root.select('.legend').style('width')); 
 
       customTitleHeight = PixelConverter.fromPointToPixel(customTitleHeight); 
 
       legendHeight = PixelConverter.fromPointToPixel(legendHeight); 
       if (EnumExtensions.hasFlag(this.chartType, flagBar)) { 
           if (isNaN(legendHeight) || isNaN(legendWidth) || 0 === legendWidth || !(0 === legendPosition || 5 === legendPosition || 1 === legendPosition || 6 === legendPosition) || !this.legendObjectProperties['show'] || !this.isLegendValue) { 
               legendHeight = 0; 
           } 
           if (this.viewport.height > (this.margin.top + this.margin.bottom + customTitleHeight + legendHeight)) { 
               availableWidth = this.viewport.height - (this.margin.top + this.margin.bottom + customTitleHeight + legendHeight); 
           } else { 
               availableWidth = -(this.viewport.height - (this.margin.top + this.margin.bottom + customTitleHeight + legendHeight)); 
           } 
 
       } 
       else { 
           if (isNaN(legendHeight) || isNaN(legendWidth) || 0 === legendWidth || !(2 === legendPosition || 3 === legendPosition || 7 === legendPosition || 8 === legendPosition) || !this.legendObjectProperties['show'] || !this.isLegendValue) { 
               legendWidth = 0; 
           } 
           if (this.viewport.width > (this.margin.left + this.margin.right + customTitleHeight + legendWidth)) { 
               availableWidth = this.viewport.width - (this.margin.left + this.margin.right + customTitleHeight + legendWidth); 
           } else { 
               availableWidth = -(this.viewport.width - (this.margin.left + this.margin.right + customTitleHeight + legendWidth)); 
           } 
 
       } 
 
       let metaDataColumn = this.data ? this.data.categoryMetadata : undefined; 
       let categoryDataType: any = AxisHelper.getCategoryValueType(metaDataColumn); 
       let isScalar = this.data ? this.data.scalarCategoryAxis : false; 
       let domain = AxisHelper.createDomain(this.data.series, categoryDataType, isScalar, options.forcedXDomain); 
       return CartesianChartGMO.getLayout( 
           this.data, 
           { 
               availableWidth: availableWidth, 
               categoryCount: numCategoryValues, 
               domain: domain, 
               isScalar: isScalar, 
               isScrollable: this.isScrollable, 
               trimOrdinalDataOnOverflow: options.trimOrdinalDataOnOverflow 
           }); 
   } 
   public getTickLabelMargins(viewport, yMarginLimit, textWidthMeasurer, textHeightMeasurer, axes, bottomMarginLimit, properties, scrollbarVisible, showOnRight, renderXAxis, renderY1Axis, renderY2Axis) { 
       let xAxisProperties = axes.x; 
       let XLabelMaxAllowedOverflow = 35; 
       let y1AxisProperties = axes.y1; 
       let y2AxisProperties = axes.y2; 
       let xLabels = xAxisProperties.values; 
       let y1Labels = y1AxisProperties.values; 
       let leftOverflow = 0; 
       let rightOverflow = 0; 
       let maxWidthY1 = 0; 
       let maxWidthY2 = 0; 
       let xMax = 0; 
       let ordinalLabelOffset = xAxisProperties.categoryThickness ? xAxisProperties.categoryThickness / 2 : 0; 
       let scaleIsOrdinal = AxisHelper.isOrdinalScale(xAxisProperties.scale); 
       let xLabelOuterPadding = 0; 
       if (xAxisProperties.outerPadding !== undefined) { 
           xLabelOuterPadding = xAxisProperties.outerPadding; 
       } 
       else if (xAxisProperties.xLabelMaxWidth !== undefined) { 
           xLabelOuterPadding = Math.max(0, (viewport.width - xAxisProperties.xLabelMaxWidth * xLabels.length) / 2); 
       } 
       if ((AxisHelper.getRecommendedNumberOfTicksForXAxis(viewport.width) as number) !== 0 
           || (AxisHelper.getRecommendedNumberOfTicksForYAxis(viewport.height) as number) !== 0) { 
           let rotation; 
           if (scrollbarVisible) 
               rotation = AxisHelper.LabelLayoutStrategy.DefaultRotationWithScrollbar; 
           else 
               rotation = AxisHelper.LabelLayoutStrategy.DefaultRotation; 
           if (renderY1Axis) { 
               for (let i = 0, len = y1Labels.length; i < len; i++) { 
                   properties.text = y1Labels[i]; 
                   maxWidthY1 = Math.max(maxWidthY1, textWidthMeasurer(properties)); 
               } 
           } 
           if (y2AxisProperties && renderY2Axis) { 
               let y2Labels = y2AxisProperties.values; 
               for (let i = 0, len = y2Labels.length; i < len; i++) { 
                   properties.text = y2Labels[i]; 
                   maxWidthY2 = Math.max(maxWidthY2, textWidthMeasurer(properties)); 
               } 
           } 
           let textHeight = textHeightMeasurer(properties); 
           let maxNumLines = Math.floor(bottomMarginLimit / textHeight); 
           let xScale = xAxisProperties.scale; 
           let xDomain = xScale.domain(); 
           if (renderXAxis && xLabels.length > 0) { 
               for (let i = 0, len = xLabels.length; i < len; i++) { 
                   // find the max height of the x-labels, perhaps rotated or wrapped 
                   let height = void 0; 
                   properties.text = xLabels[i]; 
                   let width = textWidthMeasurer(properties); 
                   if (xAxisProperties.willLabelsWordBreak) { 
                       // Split label and count rows 
                       let wordBreaks = wordBreaker.splitByWidth(properties.text, properties, textWidthMeasurer, xAxisProperties.xLabelMaxWidth, maxNumLines); 
                       height = wordBreaks.length * textHeight; 
                   } 
                   else if (!xAxisProperties.willLabelsFit) { 
                       height = width * rotation.sine; 
                       width = width * rotation.cosine; 
                   } 
                   else { 
 
                       height = 10; 
 
                   } 
                   // calculate left and right overflow due to wide X labels 
                   // (Note: no right overflow when rotated) 
                   if (i === 0) { 
                       if (scaleIsOrdinal) { 
                           if (!xAxisProperties.willLabelsFit /*rotated text*/) 
                               leftOverflow = width - ordinalLabelOffset - xLabelOuterPadding; 
                           else 
                               leftOverflow = (width / 2) - ordinalLabelOffset - xLabelOuterPadding; 
                           leftOverflow = Math.max(leftOverflow, 0); 
                       } 
                       else if (xDomain.length > 1) { 
 
                           let xPos = xScale(xDomain[0]); 
                           // xPos already incorporates xLabelOuterPadding, don't subtract it twice 
                           leftOverflow = (width / 2) - xPos; 
                           leftOverflow = Math.max(leftOverflow, 0); 
                       } 
                   } 
                   else if (i === len - 1 && (xAxisProperties.willLabelsFit || xAxisProperties.willLabelsWordBreak)) { 
                       // if we are rotating text (!willLabelsFit) there won't be any right overflow 
                       if (scaleIsOrdinal) { 
 
                           rightOverflow = (width / 2) - ordinalLabelOffset - xLabelOuterPadding; 
                           rightOverflow = Math.max(rightOverflow, 0); 
                       } 
                       else if (xDomain.length > 1) { 
 
                           let xPos = xScale(xDomain[1]); 
 
                           rightOverflow = (width / 2) - (viewport.width - xPos); 
                           rightOverflow = Math.max(rightOverflow, 0); 
                       } 
                   } 
                   xMax = Math.max(xMax, height); 
               } 
               // trim any actual overflow to the limit 
               leftOverflow = Math.min(leftOverflow, XLabelMaxAllowedOverflow); 
               rightOverflow = Math.min(rightOverflow, XLabelMaxAllowedOverflow); 
           } 
       } 
       let rightMargin = 0, leftMargin = 0, bottomMargin = Math.min(Math.ceil(xMax), bottomMarginLimit); 
       if (showOnRight) { 
           leftMargin = Math.min(Math.max(leftOverflow, maxWidthY2), yMarginLimit); 
           rightMargin = Math.min(Math.max(rightOverflow, maxWidthY1), yMarginLimit); 
       } 
       else { 
           leftMargin = Math.min(Math.max(leftOverflow, maxWidthY1), yMarginLimit); 
           rightMargin = Math.min(Math.max(rightOverflow, maxWidthY2), yMarginLimit); 
       } 
       return { 
           xMax: Math.ceil(bottomMargin), 
           yLeft: Math.ceil(leftMargin), 
           yRight: Math.ceil(rightMargin), 
       }; 
   } 
   public applyUserMinMax(isScalar: boolean, dataView: DataViewCategorical, xAxisCardProperties: DataViewObject): DataViewCategorical { 
       if (isScalar) { 
           let min = xAxisCardProperties['start']; 
           let max = xAxisCardProperties['end']; 
 
           return ColumnUtil.transformDomain(dataView, min, max); 
       } 
 
       return dataView; 
   } 
   public getLegend(colors: IColorPalette, defaultLegendLabelColor: string, defaultColor?: string): LegendSeriesInfo { 
       let legend: LegendDataPoint[] = new Array(); 
       let seriesSources: DataViewMetadataColumn[] = new Array(); 
       let seriesObjects: DataViewObjects[][] = new Array(); 
       let grouped: boolean; 
 
       grouped = false; 
   let colorHelper; 
       colorHelper = new ColorHelper(colors, columnChartProps.dataPoint.fill, defaultColor); 
       let legendTitle; 
       legendTitle = undefined; 
       let legendData: LegendData; 
 
       if (this.dataView.categorical.values) { 
           let allValues = this.dataView.categorical.values; 
           let valueGroups = allValues.grouped(); 
           let hasDynamicSeries; 
           hasDynamicSeries = !!(allValues && allValues.source); 
           let formatStringProp; 
           formatStringProp = columnChartProps.general.formatString; 
           let valueGroupsIndex: number; 
           let valueGroupsLen: number; 
           for (valueGroupsIndex = 0, valueGroupsLen = valueGroups.length; valueGroupsIndex < valueGroupsLen; valueGroupsIndex++) { 
               let valueGroup; 
               valueGroup = valueGroups[valueGroupsIndex]; 
               let valueGroupObjects; 
               valueGroupObjects = valueGroup.objects; 
               let values; 
               values = valueGroup.values; 
               let valueIndex: number; 
             //  let valuesLen: number; 
               let color; 
               for (valueIndex = 0; valueIndex < 1; valueIndex++) { 
 
                   let series: any; 
                   series = values[valueIndex]; 
                   let source; 
                   source = series.source; 
                   // if(!source.groupName) 
                   //     source.groupName = parseInt("0"); 
                   seriesSources.push(source); 
                   seriesObjects.push(series.objects); 
 
                   let selectionId; 
                   selectionId = this.hostService.createSelectionIdBuilder() 
                       .withSeries(this.dataView.categorical.categories[0], valueGroup) 
                       .createSelectionId(); 
                   if (valueGroupObjects) { 
                       let dataPointval = valueGroupObjects.dataPoint; 
 
                       let fill = dataPointval['fill']; 
 
                       let solid = fill['solid']; 
 
                       color = solid['color']; 
                   } 
                   else { 
                       color = colors.getColor(source.groupName).value; 
                   } 
 
                   let label; 
                   label = valueFormatter.format(source.groupName, formatStringProp); 
                   legend.push(<any>{ 
                       icon: LegendIcon.Box, 
                       color: color, 
                       label: label, 
                       identity: selectionId, 
                       selected: false, 
                       tooltip: label, 
                       measure: '', 
                   }); 
               } 
           } 
 
           let dvValues; 
           dvValues = this.dataView.categorical.values;     
           legendTitle = dvValues && dvValues.source ? dvValues.source.displayName : ""; 
       } 
 
       legendData = { 
           title: legendTitle, 
           dataPoints: legend, 
           grouped: grouped, 
           labelColor: defaultLegendLabelColor, 
       }; 
 
       return { 
           legend: legendData, 
           seriesSources: seriesSources, 
           seriesObjects: seriesObjects, 
       }; 
   } 
   public converter( 
       dataViewAll: DataView[], 
       dataView: DataViewCategorical, 
       colors: IColorPalette, 
       is100PercentStacked: boolean, 
       isScalar: boolean = false, 
       dataViewMetadata: DataViewMetadata = null, 
       chartType?: any, 
       interactivityService?: IInteractivityService): StackedChartGMOData { 
        
       is100PercentStacked = true; 
 
       interface PivotedCategoryInfo { 
           categories?: any[]; 
           categoryFormatter?: IValueFormatter; 
           categoryIdentities?: DataViewScopeIdentity[]; 
           categoryObjects?: DataViewObjects[]; 
       } 
       function getPivotedCategories(dataView: DataViewCategorical, formatStringProp: DataViewObjectPropertyIdentifier): PivotedCategoryInfo { 
           if (dataView.categories && dataView.categories.length > 0) { 
               let category = dataView.categories[0]; 
               let categoryValues = category.values; 
 
               for (var count = 0; count < categoryValues.length; count++) { 
                   if (!categoryValues[count]) 
                       categoryValues[count] = parseInt("0"); 
               } 
 
               return category.values.length > 0 
                   ? { 
                       categories: categoryValues, 
                       categoryFormatter: valueFormatter.create({ 
                           format: valueFormatter.getFormatString(category.source, formatStringProp), 
                           value: categoryValues[0], 
                           value2: categoryValues[categoryValues.length - 1], 
 
                       }), 
                       categoryIdentities: category.identity, 
                       categoryObjects: category.objects, 
                   } 
                   : { 
                       categories: [], 
                       categoryFormatter: { format: valueFormatter.format }, 
                   }; 
           } 
 
           // For cases where the category source is just a series role, we are pivoting the data on the role which means we 
           // will have no categories. 
           return defaultCategories(); 
       } 
       function defaultCategories(): PivotedCategoryInfo { 
           return { 
               categories: [null], 
               categoryFormatter: { format: valueFormatter.format }, 
           }; 
       } 
       function createAxesLabels(categoryAxisProperties: DataViewObject, 
           valueAxisProperties: DataViewObject, 
           category: DataViewMetadataColumn, 
           values: DataViewMetadataColumn[]) { 
           let xAxisLabel = null; 
           let yAxisLabel = null; 
 
           if (categoryAxisProperties) { 
               // Take the value only if it's there 
               if (category && category.displayName) { 
                   xAxisLabel = category.displayName; 
               } 
           } 
 
           if (valueAxisProperties) { 
               let valuesNames: string[] = []; 
 
               if (values) { 
                   // Take the name from the values, and make it unique because there are sometimes duplications 
                   valuesNames = values.map(v => v ? v.displayName : '').filter((value, index, self) => value !== '' && self.indexOf(value) === index); 
                   yAxisLabel = valueFormatter.formatListAnd(valuesNames); 
               } 
           } 
           return { xAxisLabel: xAxisLabel, yAxisLabel: yAxisLabel }; 
       } 
       let xAxisCardProperties = CartesianHelper.getCategoryAxisProperties(dataViewAll[0].metadata); 
       let valueAxisProperties = CartesianHelper.getValueAxisProperties(dataViewAll[0].metadata); 
 
       isScalar = CartesianHelper.isScalar(isScalar, xAxisCardProperties); 
       dataView = ColumnUtil.applyUserMinMax(isScalar, dataView, xAxisCardProperties); 
 
       let converterStrategy = new ColumnChartConverterHelper(dataView); 
       let sampleFilterSettings: sampleFilterSettings = this.getSampleFilterSettings(this.dataViews[0]); 
       let categoryInfo = getPivotedCategories(dataView, columnChartProps.general.formatString); 
       let DCategory=dataView.categories 
       let categories = categoryInfo.categories, 
           categoryFormatter: IValueFormatter = categoryInfo.categoryFormatter, 
           categoryIdentities: DataViewScopeIdentity[] = categoryInfo.categoryIdentities, 
           categoryMetadata: DataViewMetadataColumn = DCategory && DCategory.length > 0 ? DCategory[0].source : undefined; 
       let labelSettings: VisualDataLabelsSettings = dataLabelUtils.getDefaultColumnLabelSettings(is100PercentStacked || EnumExtensions.hasFlag(chartType, flagStacked)); 
       let defaultLegendLabelColor = 'rgb(119, 119, 119)'; 
       let defaultDataPointColor = undefined; 
       let showAllDataPoints = undefined; 
       if (dataViewMetadata && dataViewMetadata.objects) { 
           let objects = dataViewMetadata.objects; 
 
           defaultDataPointColor = dataViewObjects.getFillColor(objects, columnChartProps.dataPoint.defaultColor); 
           showAllDataPoints = dataViewObjects.getValue<boolean>(objects, columnChartProps.dataPoint.showAllDataPoints); 
           defaultLegendLabelColor = dataViewObjects.getFillColor(objects, columnChartProps.legend.labelColor, 'rgb(119, 119, 119)'); 
 
           let labelsObj = <DataLabelObject>objects['labels']; 
 
           dataLabelUtils.updateLabelSettingsFromLabelsObject(labelsObj, labelSettings); 
           labelSettings.precision = 4; 
       } 
 
       let legendAndSeriesInfo = this.getLegend(colors, defaultLegendLabelColor, defaultDataPointColor); 
       let legend: LegendDataPoint[] = legendAndSeriesInfo.legend.dataPoints; 
       let seriesSources: DataViewMetadataColumn[] = legendAndSeriesInfo.seriesSources; 
 
       // Determine data points 
       let result = this.createDataPoints( 
           dataView, 
           categories, 
          // categoryIdentities, 
           legend, 
           legendAndSeriesInfo.seriesObjects, 
           converterStrategy, 
           labelSettings, 
           is100PercentStacked, 
           isScalar, 
          // converterHelper.categoryIsAlsoSeriesRole(dataView, RoleNames.series, RoleNames.category), 
           categoryInfo.categoryObjects, 
          // defaultDataPointColor, 
           chartType, 
           categoryMetadata); 
       let columnSeries: StackedChartGMOSeries[] = result.series; 
       this.removeFlags = []; 
       if (sampleFilterSettings.show) { 
           let dataSeries = columnSeries.slice(0); 
           let dataCategories = categories.slice(0); 
           let aggregatedValues = []; 
           let sampleSize; 
           sampleSize = -9999; 
           let dvaCategorical=dataViewAll[2] && dataViewAll[2].categorical 
           if (dataViewAll[2] && dvaCategorical && dvaCategorical.values) { 
               let values= dvaCategorical.values[0].values; 
               let length=values.length 
               for (let i = 0; i <length; i++) { 
                   if (values[i] !== null) { 
                       sampleSize = values[i]; 
                       break; 
                   } 
               } 
               let dclength=dataCategories.length,dslength=dataSeries.length 
               for (let k = 0; k < dclength; k++) { 
                   let sum = 0; 
                   for (let i = 0; i < dslength; i++) { 
                       for (let j = 0; j < dclength; j++) { 
                           if (dataSeries[i].data[j]) { 
                               if (dataSeries[i].data[j].categoryValue == dataCategories[k]) { 
                                   sum = sum + dataSeries[i].data[j].valueOriginal; 
                                   break; 
                               } 
                           } 
                           else { 
                               break; 
                           } 
                       } 
                   } 
                   aggregatedValues.push(sum); 
               } 
               let newCategoryIndex = -1,avlength=aggregatedValues.length; 
               for (let k = avlength - 1; k >= 0; k--) { 
                   if (aggregatedValues[k] < sampleSize) { 
                       this.removeFlags.push(k); 
                       for (let i = 0; i < dslength; i++) { 
                           for (let j = 0; j < dclength; j++) { 
                               if (dataSeries[i].data[j]) { 
                                   if (dataSeries[i].data[j].categoryValue == dataCategories[k]) { 
                                       dataSeries[i].data.splice(j, 1); 
                                       break; 
                                   } 
                               } 
                               else { 
                                   break; 
                               } 
                           } 
                       } 
                       aggregatedValues.splice(k, 1); 
                       dataCategories.splice(k, 1); 
                   } 
               } 
 
               newCategoryIndex = -1; 
               for (let k = 0; k < avlength; k++) { 
                   newCategoryIndex++; 
                   for (let i = 0; i < dslength; i++) { 
                       for (let j = 0; j < dclength; j++) { 
                           if (dataSeries[i].data[j]) { 
                               if (dataSeries[i].data[j].categoryValue == dataCategories[k]) { 
                                   dataSeries[i].data[j].categoryIndex = newCategoryIndex; 
                                   break; 
                               } 
                           } 
                           else { 
                               break; 
                           } 
                       } 
                   } 
               } 
               categories = dataCategories; 
 
           } 
       } 
       let valuesMetadata: DataViewMetadataColumn[] = []; 
       for (let j = 0, jlen = legend.length; j < jlen; j++) { 
           valuesMetadata.push(seriesSources[j]); 
       } 
 
       let labels = createAxesLabels(xAxisCardProperties, valueAxisProperties, categoryMetadata, valuesMetadata); 
       if (!EnumExtensions.hasFlag(chartType, flagColumn)) { 
 
           let temp = labels.xAxisLabel; 
           labels.xAxisLabel = labels.yAxisLabel; 
           labels.yAxisLabel = temp; 
       } 
       return { 
           categories: categories, 
           categoryFormatter: categoryFormatter, 
           series: columnSeries, 
           valuesMetadata: valuesMetadata, 
           legendData: legendAndSeriesInfo.legend, 
           hasHighlights: result.hasHighlights, 
           categoryMetadata: categoryMetadata, 
           scalarCategoryAxis: isScalar, 
           labelSettings: labelSettings, 
           axesLabels: { x: labels.xAxisLabel, y: labels.yAxisLabel }, 
           hasDynamicSeries: result.hasDynamicSeries, 
           isMultiMeasure: result.isMultiMeasure, 
           defaultDataPointColor: defaultDataPointColor, 
           showAllDataPoints: showAllDataPoints, 
       }; 
   } 
 
   private static canSupportOverflow(chartType: any, seriesCount: number): boolean { 
       return !EnumExtensions.hasFlag(chartType, flagStacked) || seriesCount === 1; 
   } 
 
   private static getCategoryValueType(metadataColumn, isScalar?) { 
       if (metadataColumn && Visual.columnDataTypeHasValue(metadataColumn.type)) 
           return metadataColumn.type; 
       if (isScalar) { 
           return ValueType.fromDescriptor({ numeric: true }); 
       } 
       return ValueType.fromDescriptor({ text: true }); 
   } 
 
   private static columnDataTypeHasValue(dataType) { 
       return dataType && (dataType.bool || dataType.numeric || dataType.text || dataType.dateTime); 
   } 
 
   private static isDateTime(type) { 
       return !!(type && type.dateTime); 
   } 
 
   private static normalizeNonFiniteNumber(value: number) { 
       if (isNaN(value)) 
           return null; 
       else if (value === Number.POSITIVE_INFINITY) 
           return Number.MAX_VALUE; 
       else if (value === Number.NEGATIVE_INFINITY) 
           return -Number.MAX_VALUE; 
       return value; 
   } 
 
   private static getStackedMultiplier(rawValues, 
       categoryIndex) { 
 
       let pos = 0, neg = 0; 
       for (let seriesIndex = 0, seriesCount = rawValues.length; seriesIndex < seriesCount; seriesIndex++) { 
           let value = rawValues[seriesIndex][categoryIndex]; 
           value = Visual.normalizeNonFiniteNumber(value); 
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
   public createTooltipInfo(seriesIndex: number, categoryIndex: number): VisualTooltipDataItem[] { 
       
       const tooltipDataItems: VisualTooltipDataItem[] = []; 
       let dvCategories = this.dataView && this.dataView.categorical; 
       if (dvCategories && dvCategories.values) { 
           let categories = dvCategories.categories && dvCategories.categories.length > 0 ? dvCategories.categories[0] : null; 
           let values = dvCategories.values; 
           let valueColumn = values[seriesIndex]; 
           //let index = this.getIndexOfValue(values[categoryIndex]); 
           let iValueFormatter = valueFormatter.create({ format: valueColumn && valueColumn.source ? valueColumn.source.format : undefined }); 

           // Category tooltip item 
           if (categories && categories.source) { 
               let value1 = <string>categories.values[categoryIndex] 
               tooltipDataItems.push({ 
                   value: value1, 
                   displayName: <string>categories.source.displayName, 
               }) 
           } 

           // Series (dynamic series) tooltip item - only present when a Series/Legend field is assigned 
           if (values.source && valueColumn && valueColumn.source) { 
               tooltipDataItems.push({ 
                   value: <string>valueColumn.source.groupName,//values[index].values[categoryIndex], 
                   displayName: <string>values.source.displayName, 
               }) 
           } 

           // Measure value tooltip item 
           if (valueColumn && valueColumn.source) { 
               tooltipDataItems.push({ 
                   value: iValueFormatter.format(valueColumn.values[categoryIndex]), 
                   displayName: <string>valueColumn.source.displayName, 
               }) 
           } 

       } 

       return tooltipDataItems; 
   } 
   public getIndexOfValue(values: DataViewValueColumn): number { 
       for (var i = 0; i < values.values.length; i++) { 
           if (values.values[i] != null) 
               return i; 
       } 
       return 0; 
   } 
   private createDataPoints( 
        
       dataViewCat: DataViewCategorical, 
       categories: any[], 
      // categoryIdentities: DataViewScopeIdentity[], 
       legend: LegendDataPoint[], 
       seriesObjectsList: DataViewObjects[][], 
       converterStrategy: ColumnChartConverterHelper, 
       defaultLabelSettings: VisualDataLabelsSettings, 
       is100PercentStacked: boolean, 
       isScalar: boolean = false, 
     //isCategoryAlsoSeries?: boolean, 
       categoryObjectsList?: DataViewObjects[], 
       //defaultDataPointColor?: string, 
       chartType?: any, 
       categoryMetadata?: DataViewMetadataColumn): { series: StackedChartGMOSeries[]; hasHighlights: boolean; hasDynamicSeries: boolean; isMultiMeasure: boolean } { 
       is100PercentStacked = true; 
       let grouped = dataViewCat && dataViewCat.values ? dataViewCat.values.grouped() : undefined; 
       let categoryCount = categories.length; 
       let seriesCount = legend.length; 
       let columnSeries: StackedChartGMOSeries[] = []; 
 
       if (seriesCount < 1 || categoryCount < 1) 
           return { series: columnSeries, hasHighlights: false, hasDynamicSeries: false, isMultiMeasure: false }; 
 
       let dvCategories = dataViewCat.categories; 
       categoryMetadata = (dvCategories && dvCategories.length > 0) 
           ? dvCategories[0].source 
           : null; 
 
       let categoryType = Visual.getCategoryValueType(categoryMetadata); 
       let isDateTime = Visual.isDateTime(categoryType); 
       let baseValuesPos = [], baseValuesNeg = []; 
 
       let rawValues: number[][] = []; 
       let rawHighlightValues: number[][] = []; 
           let dvc=dataViewCat.values 
       let hasDynamicSeries = !!(dvc && dvc.source); 
       let isMultiMeasure = !hasDynamicSeries && seriesCount > 1; 
 
       let highlightsOverflow = false; // Overflow means the highlight larger than value or the signs being different 
       let hasHighlights = converterStrategy.hasHighlightValues(0); 
       for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) { 
            
           let seriesValues = []; 
           let seriesHighlightValues = []; 
           for (let categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) { 
               let value = converterStrategy.getValueBySeriesAndCategory(seriesIndex, categoryIndex); 
               seriesValues[categoryIndex] = value; 
               if (hasHighlights) { 
                   let highlightValue = converterStrategy.getHighlightBySeriesAndCategory(seriesIndex, categoryIndex); 
                   seriesHighlightValues[categoryIndex] = highlightValue; 
                   // There are two cases where we don't use overflow logic; if all are false, use overflow logic appropriate for the chart. 
                   if (!((value >= 0 && highlightValue >= 0 && value >= highlightValue) || // Both positive; value greater than highlight 
                       (value <= 0 && highlightValue <= 0 && value <= highlightValue))) { // Both negative; value less than highlight 
                       highlightsOverflow = true; 
                   } 
               } 
           } 
           rawValues.push(seriesValues); 
           if (hasHighlights) { 
               rawHighlightValues.push(seriesHighlightValues); 
           } 
       } 
       if (highlightsOverflow && !Visual.canSupportOverflow(chartType, seriesCount)) { 
           highlightsOverflow = false; 
           hasHighlights = false; 
           rawValues = rawHighlightValues; 
       } 
       let dataPointObjects: DataViewObjects[] = categoryObjectsList, 
           formatStringProp = columnChartProps.general.formatString; 

       for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) { 
           let seriesDataPoints: StackedChartGMODataPoint[] = [], 
               legendItem = legend[seriesIndex], 
               seriesLabelSettings: VisualDataLabelsSettings; 
 
           if (!hasDynamicSeries) { 
               let labelsSeriesGroup = grouped && grouped.length > 0 && grouped[0].values ? grouped[0].values[seriesIndex] : null; 
               let lsgsoruce = labelsSeriesGroup ? labelsSeriesGroup.source : null; 
               let labelObjects = (labelsSeriesGroup && lsgsoruce && lsgsoruce.objects) ? <DataLabelObject>lsgsoruce.objects['labels'] : null; 
               if (labelObjects) { 
                   seriesLabelSettings = Prototype.inherit(defaultLabelSettings); 
                   dataLabelUtils.updateLabelSettingsFromLabelsObject(labelObjects, seriesLabelSettings); 
               } 
           } 
           let tooltipInfo: VisualTooltipDataItem[] = this.createTooltipInfo(seriesIndex, seriesIndex); 
           let color; 
 
let dvcvalues=this.dataView.categorical.values 
if (dvcvalues && dvcvalues[seriesIndex]) { let valueObj = dvcvalues[seriesIndex]; let vosObjects=valueObj.source.objects 
    if (vosObjects&& vosObjects["dataPoint"]) { let dataPointObj = vosObjects["dataPoint"]; color = dataPointObj["fill"]; legendItem.color = color.solid.color; } } columnSeries.push({ displayName: legendItem.label, key: 'series' + seriesIndex, index: seriesIndex, data: seriesDataPoints, identity: legendItem.identity['selector'], color: legendItem.color, labelSettings: seriesLabelSettings }); 

          if (seriesCount > 1) 
               dataPointObjects = seriesObjectsList[seriesIndex]; 
 
           let metadata = dataViewCat.values[seriesIndex].source; 
           
           for (let categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) { 
                
               if (seriesIndex === 0) { 
                   baseValuesPos.push(0); 
                   baseValuesNeg.push(0); 
               } 
 
               let value = Visual.normalizeNonFiniteNumber(rawValues[seriesIndex][categoryIndex]); 
               if (value == null) { 
                   // Optimization: Ignore null dataPoints from the fabricated category/series combination in the self cross-join. 
                   // However, we must retain the first series because it is used to compute things like axis scales, and value lookups. 
                   if (seriesIndex > 0) 
                       continue; 
               } 
 
              // let originalValue: number = value; 
               let categoryValue = categories[categoryIndex]; 
 
               // ignore variant measures 
               if (isDateTime && categoryValue != null && !(categoryValue instanceof Date)) 
                   continue; 
 
               if (isDateTime && categoryValue) 
                   categoryValue = categoryValue.getTime(); 
 
               if (isScalar && (categoryValue == null || isNaN(categoryValue))) 
                   continue; 
 
               let multipliers: ValueMultiplers; 
               if (is100PercentStacked) 
                   multipliers = Visual.getStackedMultiplier(rawValues, categoryIndex); 
 
               let unadjustedValue = value, 
                   isNegative = value < 0; 
 
               if (multipliers) { 
                   if (isNegative) 
                       value *= multipliers.neg; 
                   else 
                       value *= multipliers.pos; 
               } 
 
               let valueAbsolute = Math.abs(value); 
               let position: number; 
               if (isNegative) { 
                   position = baseValuesNeg[categoryIndex]; 
 
                   if (!isNaN(valueAbsolute)) 
                       baseValuesNeg[categoryIndex] -= valueAbsolute; 
               } 
               else { 
                   if (!isNaN(valueAbsolute)) 
                       baseValuesPos[categoryIndex] += valueAbsolute; 
 
                   position = baseValuesPos[categoryIndex]; 
               } 
 
let dvcCategories= dataViewCat.categories 

let seriesGroup = grouped && grouped.length > seriesIndex && grouped[seriesIndex].values ? grouped[seriesIndex].values[0] : null; let category = dvcCategories&& dvcCategories.length > 0 ? dvcCategories[0] : null; let identity = SelectionIdBuilder.builder() .withCategory(category, categoryIndex) .withSeries(dataViewCat.values, seriesGroup) .withMeasure(converterStrategy.getMeasureNameByIndex(seriesIndex)) .createSelectionId(); 

             // let rawCategoryValue = categories[categoryIndex]; 
               let color = Visual.getDataPointColor(legendItem, categoryIndex, dataPointObjects); 
               let series = columnSeries[seriesIndex]; 
               let dataPointLabelSettings = (series.labelSettings) ? series.labelSettings : defaultLabelSettings; 
               let labelColor = dataPointLabelSettings.labelColor; 
               let lastValue = undefined; 
 
               if ((EnumExtensions.hasFlag(chartType, flagStacked))) { 
                   lastValue = Visual.getStackedLabelColor(isNegative, seriesIndex, seriesCount, categoryIndex, rawValues); 
                   labelColor = (lastValue || (seriesIndex === seriesCount - 1 && !isNegative)) ? labelColor : dataLabelUtils.defaultInsideLabelColor; 
               } 
               tooltipInfo = this.createTooltipInfo(seriesIndex, categoryIndex); 
               let dataPoint: StackedChartGMODataPoint = { 
                   categoryValue: categoryValue, 
                   value: value, 
                   position: position, 
                   valueAbsolute: valueAbsolute, 
                   valueOriginal: unadjustedValue, 
                   seriesIndex: seriesIndex, 
                   labelSettings: dataPointLabelSettings, 
                   categoryIndex: categoryIndex, 
                   color: color, 
                   selected: false, 
                   originalValue: value, 
                   originalPosition: position, 
                   originalValueAbsolute: valueAbsolute, 
                   identity: identity, 
                   key: identity.getKey(), 
                   tooltipInfo: tooltipInfo, 
                   labelFill: labelColor, 
                   labelFormatString: metadata.format, 
                   lastSeries: lastValue, 
                   chartType: chartType 
               }; 
                
               seriesDataPoints.push(dataPoint); 
                
               if (hasHighlights) { 
                
                   let valueHighlight = rawHighlightValues[seriesIndex][categoryIndex]; 
                   let unadjustedValueHighlight = valueHighlight; 
 
                   let highlightedTooltip: boolean = true; 
                   if (valueHighlight === null) { 
                       valueHighlight = 0; 
                       highlightedTooltip = false; 
                   } 
 
                   if (is100PercentStacked) { 
                       valueHighlight *= multipliers.pos; 
                   } 
                   let absoluteValueHighlight = Math.abs(valueHighlight); 
                   let highlightPosition = position; 
 
                   if (valueHighlight > 0) { 
                       highlightPosition -= valueAbsolute - absoluteValueHighlight; 
                   } 
                   else if (valueHighlight === 0 && value > 0) { 
                       highlightPosition -= valueAbsolute; 
                   } 
 
                   let highlightIdentity = SelectionId.createWithHighlight(identity); 
                 //  let rawCategoryValue = categories[categoryIndex]; 
                   //let highlightedValue: number = highlightedTooltip ? valueHighlight : undefined; 
 
                   let highlightDataPoint: StackedChartGMODataPoint = { 
                       categoryValue: categoryValue, 
                       value: valueHighlight, 
                       position: highlightPosition, 
                       valueAbsolute: absoluteValueHighlight, 
                       valueOriginal: unadjustedValueHighlight, 
                       seriesIndex: seriesIndex, 
                       labelSettings: dataPointLabelSettings, 
                       categoryIndex: categoryIndex, 
                       color: color, 
                       selected: false, 
                       highlight: true, 
                       originalValue: value, 
                       originalPosition: position, 
                       originalValueAbsolute: valueAbsolute, 
                       drawThinner: highlightsOverflow, 
                       identity: highlightIdentity, 
                       key: highlightIdentity.getKey(), 
                       tooltipInfo: tooltipInfo, 
                       labelFormatString: metadata.format, 
                       labelFill: labelColor, 
                       lastSeries: lastValue, 
                       chartType: chartType 
                   }; 
 
                   seriesDataPoints.push(highlightDataPoint); 
               } 
                
           } 
           globalallDataPoints = globalallDataPoints.concat(seriesDataPoints); 
            
       } 
       return { 
           series: columnSeries, 
           hasHighlights: hasHighlights, 
           hasDynamicSeries: hasDynamicSeries, 
           isMultiMeasure: isMultiMeasure, 
       }; 
   } 
 
   private static getDataPointColor( 
 
       legendItem: LegendDataPoint, 
       categoryIndex: number, 
       dataPointObjects?: DataViewObjects[]): string { 
 
       if (dataPointObjects) { 
           let colorOverride = dataViewObjects.getFillColor(dataPointObjects[categoryIndex], columnChartProps.dataPoint.fill); 
 
           if (colorOverride) 
               return colorOverride; 
       } 
 
       return legendItem.color; 
   } 
 
   private static getStackedLabelColor(isNegative: boolean, seriesIndex: number, seriesCount: number, categoryIndex: number, rawValues: number[][]): boolean { 
       let lastValue = !(isNegative && seriesIndex === seriesCount - 1 && seriesCount !== 1); 
       //run for the next series and check if current series is last 
       for (let i = seriesIndex + 1; i < seriesCount; i++) { 
           let nextValues = Visual.normalizeNonFiniteNumber(rawValues[i][categoryIndex]); 
           if ((nextValues !== null) && (((!isNegative || (isNegative && seriesIndex === 0)) && nextValues > 0) || (isNegative && seriesIndex !== 0))) { 
               lastValue = false; 
               break; 
           } 
       } 
       return lastValue; 
   } 
 
   public static getInteractiveColumnChartDomElement(element: any): SVGTextElement { 
       return element.children("svg").get(0); 
   } 
   public static legendInfo: LegendData; 
 
   public setData(dataViews: DataView[]): void { 
        
       let is100PctStacked = EnumExtensions.hasFlag(this.chartType, flagStacked100); 
       this.data = { 
           categories: [], 
           categoryFormatter: null, 
           series: [], 
           valuesMetadata: [], 
           legendData: null, 
           hasHighlights: false, 
           categoryMetadata: null, 
           scalarCategoryAxis: false, 
           labelSettings: dataLabelUtils.getDefaultColumnLabelSettings(is100PctStacked || EnumExtensions.hasFlag(this.chartType, flagStacked)), 
           axesLabels: { x: null, y: null }, 
           hasDynamicSeries: false, 
           defaultDataPointColor: null, 
           isMultiMeasure: false, 
       }; 
       if (dataViews.length > 0) { 
           let dataView = this.dataView = dataViews[0]; 
 
           if (dataView && dataView.categorical) { 
               let dataViewCat = this.dataViewCat = dataView.categorical; 
               let dvCategories = dataViewCat.categories; 
               let categoryMetadata = (dvCategories && dvCategories.length > 0) 
                   ? dvCategories[0].source 
                   : null; 
               let categoryType = AxisHelper.getCategoryValueType(categoryMetadata); 
               this.data = this.converter( 
                   this.dataViews, 
                   dataViewCat, 
                   this.ColorPalette, 
                   is100PctStacked, 
                   CartesianChartGMO.getIsScalar(dataView.metadata ? dataView.metadata.objects : null, columnChartProps.categoryAxis.axisType, categoryType), 
                   dataView.metadata, 
                   this.chartType, 
                   this.interactivityService); 
               Visual.legendInfo = this.data.legendData; 
           } 
       } 
       this.columnChart = new StackedChartGMOStrategy(); 
       (<StackedChartGMOStrategy>this.columnChart).setTooltipServiceWrapper(this.TooltipServiceWrapper) 
   } 
 
   public calculateLegend(): LegendData { 
       // if we're in interactive mode, return the interactive legend 
       if (this.interactivity && this.interactivity.isInteractiveLegend) { 
           return this.createInteractiveLegendDataPoints(0); 
       } 
       let legendData = this.data ? this.data.legendData : null; 
       let legendDataPoints = legendData ? legendData.dataPoints : []; 
 
       if (_.isEmpty(legendDataPoints)) 
           return null; 
 
       return legendData; 
   } 
 
   public hasLegend(): boolean { 
       return this.data && (this.data.hasDynamicSeries || (this.data.series && this.data.series.length > 1)); 
   } 
 
   public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions, series?: StackedChartGMOSeries): VisualObjectInstanceEnumeration { 
       let objectEnumeration: VisualObjectInstance[] = []; 
       try { 
       let sampleFilterSettings = this.getSampleFilterSettings(this.dataViews[0]); 
       let textWrapSettings: textWrapSettings = this.getTextWrapSettings(this.dataViews[0]); 
       let measureTitlesSettings: measureTitlesSettings = this.getMeasureTitlesSettings(this.dataViews[0]); 
       let totalLabelSettings: totalLabelSettings = this.getTotalLabelSettings(this.dataViews[0]); 
       let secondaryLabelSettings: secondaryLabelSettings = this.getSecondaryLabelSettings(this.dataViews[1]); 
       let tertiaryLabelSettings: tertiaryLabelSettings = this.getTertiaryLabelSettings(this.dataViews[3]); 
       let quaternaryLabelSettings: quaternaryLabelSettings = this.getQuaternaryLabelSettings(this.dataViews[4]); 
       let FifthLabelSettings: FifthLabelSettings = this.getFifthLabelSettings(this.dataViews[5]); 
       let SixthLabelSettings: SixthLabelSettings = this.getSixthLabelSettings(this.dataViews[6]); 
 
       switch (options.objectName) { 
           case 'dataPoint': 
              // let categoricalDataView: DataViewCategorical = this.data && this.dataViewCat ? this.dataViewCat : null; 
               this.enumerateDataPoints(objectEnumeration); 
               break; 
           case 'categoryAxis': 
               this.getCategoryAxisValues(objectEnumeration); 
               break; 
           case 'textWrap': 
               objectEnumeration.push({ 
                   objectName: 'textWrap', 
                   displayName: 'X-Axis text wrap', 
                   selector: series && series.identity ? series.identity.getSelector() : null, 
                   properties: { 
                       show: textWrapSettings.show, 
                   } 
               }); 
               break; 
           case 'measureTitles': 
               objectEnumeration.push({ 
                   objectName: 'measureTitles', 
                   displayName: 'Measure Titles', 
                   selector: series && series.identity ? series.identity.getSelector() : null, 
                   properties: { 
                       ellipses: measureTitlesSettings.ellipsesStrength, 
                   } 
               }); 
               break; 
           case 'valueAxis': 
               this.getValueAxisValues(objectEnumeration); 
               break; 
 
           case 'labels': 
               this.enumerateDataLabels(objectEnumeration); 
               break; 
 
           case 'totalLabels': 
               objectEnumeration.push({ 
                   objectName: 'totalLabels', 
                   displayName: 'Total Labels', 
                   selector: series && series.identity ? series.identity.getSelector() : null, 
                   properties: { 
                       show: totalLabelSettings.show, 
                       titleText: totalLabelSettings.titleText, 
                       color: totalLabelSettings.color, 
                       labelDisplayUnits: totalLabelSettings.displayUnits, 
                       labelPrecision: totalLabelSettings.textPrecision, 
                       fontSize: totalLabelSettings.fontSize 
                   } 
               }); 
               break; 
           case 'secondaryLabels': 
               objectEnumeration.push({ 
                   objectName: 'secondaryLabels', 
                   displayName: 'Secondary Labels', 
                   selector: series && series.identity ? series.identity.getSelector() : null, 
                   properties: { 
                       titleText: secondaryLabelSettings.titleText, 
                       color: secondaryLabelSettings.color, 
                       labelDisplayUnits: secondaryLabelSettings.displayUnits, 
                       labelPrecision: secondaryLabelSettings.textPrecision, 
                       fontSize: secondaryLabelSettings.fontSize 
                   } 
               }); 
               break; 
           case 'tertiaryLabels': 
               objectEnumeration.push({ 
                   objectName: 'tertiaryLabels', 
                   displayName: 'Tertiary Labels', 
                   selector: series && series.identity ? series.identity.getSelector() : null, 
                   properties: { 
                       titleText: tertiaryLabelSettings.titleText, 
                       color: tertiaryLabelSettings.color, 
                       labelDisplayUnits: tertiaryLabelSettings.displayUnits, 
                       labelPrecision: tertiaryLabelSettings.textPrecision, 
                       fontSize: tertiaryLabelSettings.fontSize 
                   } 
               }); 
               break; 
           case 'quaternaryLabels': 
               objectEnumeration.push({ 
                   objectName: 'quaternaryLabels', 
                   displayName: 'Quaternary Labels', 
                   selector: series && series.identity ? series.identity.getSelector() : null, 
                   properties: { 
                       titleText: quaternaryLabelSettings.titleText, 
                       color: quaternaryLabelSettings.color, 
                       labelDisplayUnits: quaternaryLabelSettings.displayUnits, 
                       labelPrecision: quaternaryLabelSettings.textPrecision, 
                       fontSize: quaternaryLabelSettings.fontSize 
                   } 
               }); 
               break; 
           case 'FifthLabels': 
               objectEnumeration.push({ 
                   objectName: 'FifthLabels', 
                   displayName: 'Fifth Labels', 
                   selector: series && series.identity ? series.identity.getSelector() : null, 
                   properties: { 
                       titleText: FifthLabelSettings.titleText, 
                       color: FifthLabelSettings.color, 
                       labelDisplayUnits: FifthLabelSettings.displayUnits, 
                       labelPrecision: FifthLabelSettings.textPrecision, 
                       fontSize: FifthLabelSettings.fontSize 
                   } 
               }); 
               break; 
           case 'SixthLabels': 
               objectEnumeration.push({ 
                   objectName: 'SixthLabels', 
                   displayName: 'Sixth Labels', 
                   selector: series && series.identity ? series.identity.getSelector() : null, 
                   properties: { 
                       titleText: SixthLabelSettings.titleText, 
                       color: SixthLabelSettings.color, 
                       labelDisplayUnits: SixthLabelSettings.displayUnits, 
                       labelPrecision: SixthLabelSettings.textPrecision, 
                       fontSize: SixthLabelSettings.fontSize 
                   } 
               }); 
               break; 
           case 'legend': 
 
               this.getLegendValue(objectEnumeration); 
               break; 
           // MAQCode 
           case 'GMOColumnChartTitle': 
               objectEnumeration.push({ 
                   objectName: 'GMOColumnChartTitle', 
                   displayName: 'Stacked Chart title', 
                   selector: series && series.identity ? series.identity.getSelector() : null, 
                   properties: { 
                       show: this.getShowTitle(this.dataViews[0]), 
                       titleText: this.getTitleText(this.dataViews[0]), 
                       tooltipText: this.getTooltipText(this.dataViews[0]), 
                       fill1: this.getTitleFill(this.dataViews[0]), 
                       backgroundColor: this.getTitleBgcolor(this.dataViews[0]), 
                       fontSize: this.getTitleSize(this.dataViews[0]), 
                   } 
               }); 
               break; 
 
       } 
       } catch (e) { 
           // The format pane must never break the visual surface. 
           // eslint-disable-next-line no-console 
           console.error('[100per-Stackchart] enumerateObjectInstances() failed:', e); 
       } 
       return objectEnumeration; 
   } 

   public getFormattingModel(): powerbiApi.visuals.FormattingModel {
       try {
           this.applyDynamicFormatting();
       } catch (e) {
           // The format pane must never break the visual surface.
           // eslint-disable-next-line no-console
           console.error('[100per-Stackchart] getFormattingModel() dynamic step failed:', e);
       }
       return this.formattingSettingsService.buildFormattingModel(this.formattingSettingsModel);
   }
 
   // Injects data-driven values into the formatting model right before it is
   // built: one "Data colors" swatch per value shown in the legend, plus the
   // measure-label titles taken from each bound column when the user hasn't
   // typed an override.
   private applyDynamicFormatting(): void {
       const model = this.formattingSettingsModel;
 
       // Per-series data colors (one color picker per legend value).
       const points = (this.data && this.data.legendData && this.data.legendData.dataPoints) || [];
       model.setDataColors(points.map((dp: any) => ({
           displayName: dp.label,
           color: dp.color,
           selector: dp.identity
               ? (typeof dp.identity.getSelector === 'function' ? dp.identity.getSelector() : dp.identity.selector)
               : null
       })));
 
       // Measure-label titles default to the bound column's display name.
       const dvs = this.dataViews;
       if (dvs && dvs.length) {
           if (dvs[0]) { model.totalLabelsCard.titleText.value = this.getTotalLabelSettings(dvs[0]).titleText; }
           if (dvs[1]) { model.secondaryLabelsCard.titleText.value = this.getSecondaryLabelSettings(dvs[1]).titleText; }
           if (dvs[3]) { model.tertiaryLabelsCard.titleText.value = this.getTertiaryLabelSettings(dvs[3]).titleText; }
           if (dvs[4]) { model.quaternaryLabelsCard.titleText.value = this.getQuaternaryLabelSettings(dvs[4]).titleText; }
           if (dvs[5]) { model.fifthLabelsCard.titleText.value = this.getFifthLabelSettings(dvs[5]).titleText; }
           if (dvs[6]) { model.sixthLabelsCard.titleText.value = this.getSixthLabelSettings(dvs[6]).titleText; }
       }
   }
 
   private getLegendValue(enumeration: VisualObjectInstance[], series?: StackedChartGMOSeries): void { 
 
       if (!this.hasLegend()) 
           return; 
       let show = dataViewObject.getValue<boolean>(this.legendObjectProperties, legendProps.show, false); 
       let showTitle = dataViewObject.getValue<boolean>(this.legendObjectProperties, legendProps.showTitle, false); 
       //let primaryMeasureOnOff = this.getShowPrimaryMeasure(this.dataView); 
       let titleText = dataViewObject.getValue<string>(this.legendObjectProperties, legendProps.titleText, this.layerLegendData ? this.layerLegendData.title : ''); 
       let legendLabelColor = dataViewObject.getValue<string>(this.legendObjectProperties, legendProps.labelColor, this.layerLegendData.labelColor);  //changed last argument from red to this 
       this.legendLabelFontSize = dataViewObject.getValue<number>(this.legendObjectProperties, legendProps.fontSize, Visual.LegendLabelFontSizeDefault); 
       //let labelDisplayUnits = this.getLegendDispalyUnits(this.dataViews[0], 'labelDisplayUnits'); 
       let labelPrecision = this.getLegendDispalyUnits(this.dataViews[0], 'labelPrecision'); 
      // let position = this.getLegendDispalyUnits(this.dataViews[0], 'position'); 
       if (labelPrecision && labelPrecision > 20) { 
           labelPrecision = 20; 
       } 
 
       enumeration.push({ 
           selector: series && series.identity ? series.identity.getSelector() : null, 
           properties: { 
               show: show, 
               position: LegendPosition[this.legend.getOrientation()], 
               showTitle: showTitle, 
               titleText: titleText, 
               labelColor: legendLabelColor, 
               fontSize: this.legendLabelFontSize 
           }, 
           objectName: 'legend' 
       }); 
   } 
 
   private getSampleFilterSettings(dataView: DataView): sampleFilterSettings { 
       let objects: DataViewObjects = null; 
       let sampleFilterSetting: sampleFilterSettings = this.getDefaultSampleFilterSettings(); 
 
       if (!dataView.metadata || !dataView.metadata.objects) 
           return sampleFilterSetting; 
 
       objects = dataView.metadata.objects; 
       let sampleFilterProperties = StackedChartGMOProps; 
       sampleFilterSetting.show = dataViewObjects.getValue(objects, sampleFilterProperties.sampleFilter.show, sampleFilterSetting.show); 
 
       return sampleFilterSetting; 
   } 
 
   private getTextWrapSettings(dataView: DataView): textWrapSettings { 
       let objects: DataViewObjects = null; 
       let textWrapSetting: textWrapSettings = this.getDefaultTextWrapSettings(); 
 
       if (!dataView.metadata || !dataView.metadata.objects) 
           return textWrapSetting; 
 
       objects = dataView.metadata.objects; 
       let wrapTextProperties = StackedChartGMOProps; 
       textWrapSetting.show = dataViewObjects.getValue(objects, wrapTextProperties.textWrap.show, textWrapSetting.show); 
 
       return textWrapSetting; 
   } 
 
   private getMeasureTitlesSettings(dataView: DataView): measureTitlesSettings { 
       let objects: DataViewObjects = null; 
       let measureTitlesSettings: measureTitlesSettings = this.getDefaultMeasureTitlesSettings(); 
 
       if (!dataView.metadata || !dataView.metadata.objects) 
           return measureTitlesSettings; 
 
       objects = dataView.metadata.objects; 
       let measureTitlesProperties = StackedChartGMOProps; 
       measureTitlesSettings.ellipsesStrength = dataViewObjects.getValue(objects, measureTitlesProperties.measureTitles.ellipses, measureTitlesSettings.ellipsesStrength); 
 
       return measureTitlesSettings; 
   } 
 
   private getTotalLabelSettings(dataView: DataView): totalLabelSettings { 
       let objects: DataViewObjects = null; 
       let labelSettings: totalLabelSettings = this.getDefaultTotalLabelSettings(); 
 
       if (!dataView.metadata || !dataView.metadata.objects) 
           return this.getDefaultTotalLabelSettings(); 
 
       objects = dataView.metadata.objects; 
       let totalLabelsProperties = StackedChartGMOProps; 
       labelSettings.show = dataViewObjects.getValue(objects, totalLabelsProperties.totalLabels.show, labelSettings.show); 
       labelSettings.titleText = dataViewObjects.getValue(objects, totalLabelsProperties.totalLabels.titleText, labelSettings.titleText); 
       labelSettings.textPrecision = dataViewObjects.getValue(objects, totalLabelsProperties.totalLabels.textPrecision, labelSettings.textPrecision); 
       labelSettings.textPrecision = labelSettings.textPrecision < 0 ? 0 : (labelSettings.textPrecision > 20 ? 20 : labelSettings.textPrecision); 
       labelSettings.fontSize = dataViewObjects.getValue(objects, totalLabelsProperties.totalLabels.fontSize, labelSettings.fontSize); 
       labelSettings.displayUnits = dataViewObjects.getValue(objects, totalLabelsProperties.totalLabels.displayUnits, labelSettings.displayUnits); 
       labelSettings.color = dataViewObjects.getFillColor(objects, totalLabelsProperties.totalLabels.color, labelSettings.color); 
 
       return labelSettings; 
   } 
 
   // Shared body for the secondary..sixth measure label settings. These five
   // settings are identical except for the property-bag they read from
   // (StackedChartGMOProps.<name>Labels), so the common logic lives here.
   private getMeasureLabelSettings(dataView: DataView, props: any, labelSettings: any): any {
       if (!dataView || !dataView.categorical) { return labelSettings; }
       if (dataView.categorical.values) {
           labelSettings.titleText = dataView.categorical.values[0].source.displayName;
       }
       if (!dataView.metadata || !dataView.metadata.objects) { return labelSettings; }
       let objects = dataView.metadata.objects;
       labelSettings.titleText = dataViewObjects.getValue(objects, props.titleText, labelSettings.titleText);
       labelSettings.textPrecision = dataViewObjects.getValue(objects, props.textPrecision, labelSettings.textPrecision);
       labelSettings.textPrecision = labelSettings.textPrecision < 0 ? 0 : (labelSettings.textPrecision > 20 ? 20 : labelSettings.textPrecision);
       labelSettings.fontSize = dataViewObjects.getValue(objects, props.fontSize, labelSettings.fontSize);
       labelSettings.displayUnits = dataViewObjects.getValue(objects, props.displayUnits, labelSettings.displayUnits);
       labelSettings.color = dataViewObjects.getFillColor(objects, props.color, labelSettings.color);
       return labelSettings;
   }

   private getSecondaryLabelSettings(dataView: DataView): secondaryLabelSettings {
       return this.getMeasureLabelSettings(dataView, StackedChartGMOProps.secondaryLabels, this.getDefaultSecondaryLabelSettings());
   }
 
   private getTertiaryLabelSettings(dataView: DataView): tertiaryLabelSettings {
       return this.getMeasureLabelSettings(dataView, StackedChartGMOProps.tertiaryLabels, this.getDefaultTertiaryLabelSettings());
   }
 
   private getQuaternaryLabelSettings(dataView: DataView): quaternaryLabelSettings {
       return this.getMeasureLabelSettings(dataView, StackedChartGMOProps.quaternaryLabels, this.getDefaultQuaternaryLabelSettings());
   }
   private getFifthLabelSettings(dataView: DataView): FifthLabelSettings {
       return this.getMeasureLabelSettings(dataView, StackedChartGMOProps.FifthLabels, this.getDefaultFifthLabelSettings());
   }
   private getSixthLabelSettings(dataView: DataView): SixthLabelSettings {
       return this.getMeasureLabelSettings(dataView, StackedChartGMOProps.SixthLabels, this.getDefaultSixthLabelSettings());
   }
 
   public getDefaultSampleFilterSettings(): sampleFilterSettings { 
       return { 
           show: false 
       } 
   } 
 
   public getDefaultTextWrapSettings(): textWrapSettings { 
       return { 
           show: false 
       } 
   } 
 
   public getDefaultMeasureTitlesSettings(): measureTitlesSettings { 
       return { 
           ellipsesStrength: 120 
       } 
   } 
 
   public getDefaultTotalLabelSettings(): totalLabelSettings { 
       return { 
           show: true, 
           titleText: 'Total', 
           color: '#777', 
           displayUnits: 0, 
           textPrecision: 0, 
           fontSize: 9, 
       } 
   } 
 
   // Shared defaults for the secondary..sixth measure labels (all identical).
   public getDefaultMeasureLabelSettings(): secondaryLabelSettings { 
       return { 
           titleText: '', 
           color: '#777', 
           displayUnits: 0, 
           textPrecision: 0, 
           fontSize: 9, 
       } 
   } 
   public getDefaultSecondaryLabelSettings(): secondaryLabelSettings { return this.getDefaultMeasureLabelSettings(); } 
 
   public getDefaultTertiaryLabelSettings(): tertiaryLabelSettings { return this.getDefaultMeasureLabelSettings(); } 
 
   public getDefaultQuaternaryLabelSettings(): quaternaryLabelSettings { return this.getDefaultMeasureLabelSettings(); } 
   public getDefaultFifthLabelSettings(): FifthLabelSettings { return this.getDefaultMeasureLabelSettings(); } 
   public getDefaultSixthLabelSettings(): SixthLabelSettings { return this.getDefaultMeasureLabelSettings(); } 
 
   //Get Measure value 
   public measureValue(measure, measureFormat, legendObjectProperties, modelingPrecision) { 
       let displayUnits, modelPrecisionValue: number = 0; 
       if (legendObjectProperties && legendObjectProperties['labelPrecision']) { 
           let precisionValue = legendObjectProperties['labelPrecision']; 
           if (!precisionValue) { 
               if (modelingPrecision) 
                   modelPrecisionValue = modelingPrecision; 
           } 
           else { 
               modelPrecisionValue = precisionValue; 
           } 
 
           if (modelPrecisionValue > 20) 
               modelPrecisionValue = 20; 
           if (precisionValue > 20) 
               precisionValue = 20; 
       } 
       else { 
           if (modelingPrecision) { 
               modelPrecisionValue = modelingPrecision; 
           } 
           else { 
               modelPrecisionValue = 0; 
           } 
       } 
       if (legendObjectProperties && legendObjectProperties['labelDisplayUnits']) { 
           displayUnits = legendObjectProperties['labelDisplayUnits']; 
       } 
       else { 
           displayUnits = 0; 
       } 
 
       let itemValue = valueFormatter.format(measure, measureFormat); 
       let formattedValue; 
       if (measureFormat && measureFormat.search('%') > 0) { 
           formattedValue = itemValue; 
       } 
       else { 
           formattedValue = this.format(parseInt(measure, 10), displayUnits, modelPrecisionValue, 'sample'); 
           if (isNaN(parseInt(itemValue, 10)) || isNaN(parseInt(itemValue[itemValue.length - 1], 10))) 
               formattedValue = this.addSpecialCharacters(formattedValue, itemValue); 
       } 
       return formattedValue; 
   } 
   // This function is to perform KMB formatting on values 
   public format(d: number, displayunitValue: number, precisionValue: number, columnType: string) { 
       let result: string; 
       switch (displayunitValue) { 
           case 0: 
               { 
                   // Auto display units. d3 v3's formatPrefix().scale()/.symbol and
                   // d3.round were all removed in d3 v4+, so compute the K/M/bn/T
                   // suffix directly. Mirrors the explicit cases below to keep the
                   // same output (and uses numberWithCommas for grouping). 
                   let abs = Math.abs(d); 
                   if (abs >= 1000000000000) { 
                       result = this.numberWithCommas((d / 1000000000000).toFixed(precisionValue)) + 'T'; 
                   } else if (abs >= 1000000000) { 
                       result = this.numberWithCommas((d / 1000000000).toFixed(precisionValue)) + 'bn'; 
                   } else if (abs >= 1000000) { 
                       result = this.numberWithCommas((d / 1000000).toFixed(precisionValue)) + 'M'; 
                   } else if (abs >= 1000) { 
                       result = this.numberWithCommas((d / 1000).toFixed(precisionValue)) + 'K'; 
                   } else { 
                       result = this.numberWithCommas(d.toFixed(precisionValue)); 
                   } 
                   break; 
               } 
           case 1: 
               { 
                   result = this.numberWithCommas(d.toFixed(precisionValue)); 
                   break; 
               } 
           case 1000: 
               { 
                   result = this.numberWithCommas((d / 1000).toFixed(precisionValue)) + 'K'; 
                   break; 
               } 
           case 1000000: 
               { 
                   result = this.numberWithCommas((d / 1000000).toFixed(precisionValue)) + 'M'; 
                   break; 
               } 
           case 1000000000: 
               { 
                   result = this.numberWithCommas((d / 1000000000).toFixed(precisionValue)) + 'bn'; 
                   break; 
               } 
           case 1000000000000: 
               { 
                   result = this.numberWithCommas((d / 1000000000000).toFixed(precisionValue)) + 'T'; 
                   break; 
               } 
       } 
       return result; 
   } 
 
   public numberWithCommas(x) { 
       let parts = x.toString().split("."); 
       parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); 
       return parts.join("."); 
   } 
   public addSpecialCharacters(sKMBValue, title) { 
       let displayValue: string = '', specialcharacters: string = '', titlelength: number = title.length; 
       //Append characters front 
       if (isNaN(parseInt(title[0], 10))) { 
           for (let iLoop = 0; iLoop < title.length; iLoop++) { 
               if (isNaN(parseInt(title[iLoop], 10))) { 
                   specialcharacters += title[iLoop]; 
               } 
               else break; 
           } 
           displayValue = specialcharacters + sKMBValue; 
       } 
       //Append characters end 
       if (isNaN(parseInt(title[title.length - 1], 10))) { 
           let specialarray = [], index: number = 0; 
           for (let iLoop = titlelength - 1; iLoop >= 0; iLoop--) { 
               if (isNaN(parseInt(title[iLoop], 10))) { 
                   specialarray[index] = title[iLoop]; 
                   index++; 
               } 
               else break; 
           } 
           for (let iLoop = specialarray.length - 1; iLoop >= 0; iLoop--) { 
               specialcharacters += specialarray[iLoop]; 
           } 
           displayValue = sKMBValue + specialcharacters; 
       } 
 
       return displayValue.trim(); 
   } 
   private getCategoryAxisValues(enumeration: VisualObjectInstance[], series?: StackedChartGMOSeries): void { 
       if (!this.categoryAxisProperties) { 
           return; 
       } 
     //  let supportedType = axisType.both; 
       let isScalar = true; 
       let logPossible = false; 
       let scaleOptions = [axisScale.log, axisScale.linear];//until options can be update in propPane, show all options 
       if (!isScalar) { 
           if (this.categoryAxisProperties) { 
               this.categoryAxisProperties['start'] = null; 
               this.categoryAxisProperties['end'] = null; 
           } 
       } 
 
       let instance: VisualObjectInstance = { 
           selector: series && series.identity ? series.identity.getSelector() : null, 
           properties: {}, 
           objectName: 'categoryAxis', 
           validValues: { 
               axisScale: scaleOptions 
           } 
       }; 
       instance.properties['show'] = this.categoryAxisProperties && this.categoryAxisProperties['show'] != null ? this.categoryAxisProperties['show'] : true; 
       instance.properties['axisScale'] = (this.categoryAxisProperties && this.categoryAxisProperties['axisScale'] != null && logPossible) ? this.categoryAxisProperties['axisScale'] : axisScale.linear; 
       instance.properties['labelDisplayUnits'] = this.categoryAxisProperties && this.categoryAxisProperties['labelDisplayUnits'] != null ? this.categoryAxisProperties['labelDisplayUnits'] : Visual.LabelDisplayUnitsDefault; 
       instance.properties['showAxisTitle'] = this.categoryAxisProperties && this.categoryAxisProperties['showAxisTitle'] != null ? this.categoryAxisProperties['showAxisTitle'] : true; 
       instance.properties['fontSize'] = this.categoryAxisProperties && this.categoryAxisProperties['fontSize'] != null ? this.categoryAxisProperties['fontSize'] : 11; 
       enumeration.push({ 
           selector: series && series.identity ? series.identity.getSelector() : null, 
           properties: { 
               show: this.categoryAxisProperties && this.categoryAxisProperties['show'] != null ? this.categoryAxisProperties['show'] : true, 
               labelDisplayUnits: this.categoryAxisProperties && this.categoryAxisProperties['labelDisplayUnits'] != null ? this.categoryAxisProperties['labelDisplayUnits'] : Visual.LabelDisplayUnitsDefault, 
               showAxisTitle: this.categoryAxisProperties && this.categoryAxisProperties['showAxisTitle'] != null ? this.categoryAxisProperties['showAxisTitle'] : true, 
               axisStyle: this.categoryAxisProperties && this.categoryAxisProperties['axisStyle'] ? this.categoryAxisProperties['axisStyle'] : axisStyle.showTitleOnly, 
               fontSize : this.categoryAxisProperties && this.categoryAxisProperties['fontSize'] ? this.categoryAxisProperties['fontSize'] : 11, 
               labelColor: this.getCategoryAxisFill().solid.color, 
           }, 
 
           objectName: 'categoryAxis', 
           validValues: { 
               axisStyle: this.categoryAxisHasUnitType ? [axisStyle.showTitleOnly, axisStyle.showUnitOnly, axisStyle.showBoth] : [axisStyle.showTitleOnly] 
           } 
       }); 
   } 
   private getValueAxisValues(enumeration: VisualObjectInstance[], series?: StackedChartGMOSeries): void { 
    //   let scaleOptions = [axisScale.log, axisScale.linear];  //until options can be update in propPane, show all options 
       let logPossible = false; 
       enumeration.push({ 
           selector: series && series.identity ? series.identity.getSelector() : null, 
           properties: { 
               show: this.valueAxisProperties && this.valueAxisProperties['show'] != null ? this.valueAxisProperties['show'] : true, 
               axisScale: (this.valueAxisProperties && this.valueAxisProperties['axisScale'] != null && logPossible) ? this.valueAxisProperties['axisScale'] : axisScale.linear, 
               start: this.valueAxisProperties ? this.valueAxisProperties['start'] : null, 
               end: this.valueAxisProperties ? this.valueAxisProperties['end'] : null, 
               showAxisTitle: this.valueAxisProperties && this.valueAxisProperties['showAxisTitle'] != null ? this.valueAxisProperties['showAxisTitle'] : true, 
               labelDisplayUnits: this.valueAxisProperties && this.valueAxisProperties['labelDisplayUnits'] != null ? this.valueAxisProperties['labelDisplayUnits'] : Visual.LabelDisplayUnitsDefault, 
               axisStyle: this.valueAxisProperties && this.valueAxisProperties['axisStyle'] != null ? this.valueAxisProperties['axisStyle'] : axisStyle.showTitleOnly, 
               labelColor: this.getValueAxisFill().solid.color 
 
           }, 
 
           objectName: 'valueAxis', 
           validValues: { 
               axisStyle: this.valueAxisHasUnitType ? [axisStyle.showTitleOnly, axisStyle.showUnitOnly, axisStyle.showBoth] : [axisStyle.showTitleOnly] 
           }, 
       }); 
 
   } 
 
   private enumerateDataLabels(enumeration: VisualObjectInstance[]): void { 
       if (this.dataView.metadata.objects && this.dataView.metadata.objects['labels']) { 
           let data = this.data, 
               labelSettings = this.data.labelSettings, 
               seriesCount = data.series.length, 
               showLabelPerSeries = !data.hasDynamicSeries && (seriesCount > 1 || !data.categoryMetadata) && this.seriesLabelFormattingEnabled; 
           let labelsObj = this.dataView.metadata.objects ? <DataLabelObject>this.dataView.metadata.objects['labels'] : null; 
           labelSettings.precision = labelsObj ? labelsObj.labelPrecision : 0; 
           labelSettings.fontSize = labelsObj.fontSize ? labelsObj.fontSize : 12; 
           for (let i = 0; i < seriesCount; i++) { 
               let series = data.series[i], 
                   labelSettings: VisualDataLabelsSettings = (series.labelSettings) ? series.labelSettings : this.data.labelSettings; 
           } 
           enumeration.push({ 
               objectName: 'labels', 
               properties: { 
                   show: labelsObj.show, 
                   color: labelsObj.color ? labelsObj.color.solid.color : '#000', 
                   labelPrecision: labelsObj.labelPrecision ? labelsObj.labelPrecision : "", 
                   fontSize: labelsObj.fontSize ? labelsObj.fontSize : 10 
               }, 
               selector: null 
           }) 
       } 
       else { 
           enumeration.push({ 
               objectName: 'labels', 
               properties: { 
                   show: false, 
                   color: null, 
                   labelPrecision: 0, 
                   fontSize: 10 
               }, 
               selector: null 
           }) 
       } 
 
   } 
   // MAQ Code 
   // This function returns on/off status of the funnel title properties 
   private getShowTitle(dataView: DataView): boolean { 
       if (dataView && dataView.metadata && dataView.metadata.objects) { 
           if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMOColumnChartTitle')) { 
               let showTitle = dataView.metadata.objects['GMOColumnChartTitle']; 
               if (dataView.metadata.objects && showTitle.hasOwnProperty('show')) { 
                   return <boolean>showTitle['show']; 
               } 
           } else { 
               return true; 
           } 
       } 
       return true; 
   } 
 
   /* This function returns the title text given for the title in the format window */ 
   private getTitleText(dataView: DataView): string { 
       let returnTitleValues: string, returnTitleLegend: string, returnTitleDetails: string, returnTitle: string, tempTitle: string; 
       returnTitleValues = ""; 
       returnTitleLegend = ""; 
       returnTitleDetails = ""; 
       returnTitle = ""; 
       tempTitle = ""; 
       if (dataView && dataView.metadata && dataView.metadata.objects) { 
           if (dataView.metadata.objects.hasOwnProperty('GMOColumnChartTitle')) { 
               let titletext = dataView.metadata.objects['GMOColumnChartTitle']; 
               if (titletext && titletext.hasOwnProperty('titleText')) { 
                   return <string>titletext['titleText']; 
               } 
           } 
       } 
 
       if (dataView && dataView.categorical && dataView.categorical.values && dataView.categorical.values.source) { 
           returnTitleDetails = dataView.categorical.values.source.displayName; 
       } 
      // let iLength = 0; 
       if (dataView && dataView.categorical && dataView.categorical.values) { 
           for (let iLength = 0; iLength < dataView.categorical.values.length; iLength++) { 
               if (dataView.categorical.values[iLength].source && dataView.categorical.values[iLength].source.roles.hasOwnProperty('Y')) { 
                   if (dataView.categorical.values[iLength].source.displayName) { 
                       returnTitleValues = dataView.categorical.values[iLength].source.displayName; 
                       break; 
                   } 
               } 
           } 
       } 
       if (dataView && dataView.categorical && dataView.categorical.categories) { 
           returnTitleLegend = dataView.categorical.categories[0].source.displayName; 
       } 
 
       if ("" !== returnTitleValues) { 
           tempTitle = " by "; 
       } 
       if ("" !== returnTitleLegend && "" !== returnTitleDetails) { 
           tempTitle = tempTitle + returnTitleLegend + " and " + returnTitleDetails; 
       } 
       else if ("" === returnTitleLegend && "" === returnTitleDetails) { 
           tempTitle = ""; 
       } 
       else { 
           tempTitle = tempTitle + returnTitleLegend + returnTitleDetails; 
       } 
 
       returnTitle = returnTitleValues + tempTitle; 
       return <string>returnTitle; 
   } 
   // This function returns the tool tip text given for the tooltip in the format window 
   private getTooltipText(dataView: DataView): string { 
       let dvmetadata=dataView.metadata 
       let dvmobjects=dvmetadata.objects 
       if (dataView && dvmetadata&& dvmobjects) { 
           if (dvmobjects && dvmobjects.hasOwnProperty('GMOColumnChartTitle')) { 
               let tooltiptext = dvmobjects['GMOColumnChartTitle']; 
               if (tooltiptext && tooltiptext.hasOwnProperty('tooltipText')) { 
                   return <string>tooltiptext['tooltipText']; 
               } 
           } else { 
               return <string>'Your tooltip text goes here'; 
           } 
       } 
       return <string>'Your tooltip text goes here'; 
   } 
   // MAQCode 
   // This function returns the font colot selected for the title in the format window 
   private getTitleFill(dataView: DataView): Fill { 
       let dvmetadata=dataView.metadata 
       let dvmobjects=dvmetadata.objects 
       if (dataView && dvmetadata && dvmobjects) { 
           if (dvmobjects && dvmobjects.hasOwnProperty('GMOColumnChartTitle')) { 
               let FTitle = dvmobjects['GMOColumnChartTitle']; 
               if (FTitle && FTitle.hasOwnProperty('fill1')) { 
                   return <Fill>FTitle['fill1']; 
               } 
           } else { 
               return dataView && dvmetadata && dataViewObjects.getValue(dataView.metadata.objects, StackedChartGMOProps.titleFill, { solid: { color: '#333333' } }); 
           } 
       } 
       return dataView && dvmetadata && dataViewObjects.getValue(dataView.metadata.objects, StackedChartGMOProps.titleFill, { solid: { color: '#333333' } }); 
   } 
 
   // This function returns the background color selected for the title in the format window 
   private getTitleBgcolor(dataView: DataView): Fill { 
       let dvmetadata=dataView.metadata 
       let dvmobjects=dvmetadata.objects 
       if (dataView && dvmetadata && dvmobjects) { 
           if (dvmobjects && dvmobjects.hasOwnProperty('GMOColumnChartTitle')) { 
               let FTitle = dvmobjects['GMOColumnChartTitle']; 
               if (FTitle && FTitle.hasOwnProperty('backgroundColor')) { 
                   return <Fill>FTitle['backgroundColor']; 
               } 
           } else { 
               return dataView && dvmetadata && dataViewObjects.getValue(dataView.metadata.objects, StackedChartGMOProps.titleBackgroundColor, { solid: { color: 'none' } }); 
           } 
       } 
       return dataView && dvmetadata && dataViewObjects.getValue(dataView.metadata.objects, StackedChartGMOProps.titleBackgroundColor, { solid: { color: 'none' } }); 
   } 
 
   // This function returns the funnel title font size selected for the title in the format window 
   private getTitleSize(dataView: DataView) { 
       let dvmetadata=dataView.metadata 
       let dvmobjects=dvmetadata.objects 
       if (dataView && dvmetadata && dvmobjects) { 
           if (dvmobjects && dvmobjects.hasOwnProperty('GMOColumnChartTitle')) { 
               let FTitle = dvmobjects['GMOColumnChartTitle']; 
               if (FTitle && FTitle.hasOwnProperty('fontSize')) { 
                   return FTitle['fontSize']; 
               } 
           } else { 
               return 12; 
           } 
       } 
       return 12; 
   } 
   // This function returns on/off status of the legend show primary measure 
   private getShowPrimaryMeasure(dataView: DataView): boolean { 
       let dvmetadata=dataView.metadata 
       let dvmobjects=dvmetadata.objects 
       if (dataView && dvmetadata && dvmobjects) { 
           if (dvmobjects && dvmobjects.hasOwnProperty('legend')) { 
               let showTitle = dvmobjects['legend']; 
               if (dvmobjects && showTitle.hasOwnProperty('primaryMeasureOnoff')) { 
                   return <boolean>showTitle['primaryMeasureOnoff']; 
               } 
           } else { 
               return true; 
           } 
       } 
       return true; 
   } 
 
   private getLabelSettingsOptions(enumeration: any, labelSettings: VisualDataLabelsSettings, series?: StackedChartGMOSeries, showAll?: boolean): any { 
       return { 
           enumeration: enumeration, 
           dataLabelsSettings: labelSettings, 
           show: true, 
           displayUnits: !EnumExtensions.hasFlag(this.chartType, flagStacked100), 
           precision: true, 
           selector: series && series.identity ? series.identity.getSelector() : null, 
           showAll: showAll, 
           fontSize: true, 
       }; 
   } 
 
   private enumerateDataPoints(enumeration: VisualObjectInstance[]): void { 
       let data = this.data; 
       let data2 = Visual.legendInfo; 
       if (!data) 
           return; 
 
       let seriesCount = data2.dataPoints.length; 
       let color; 
       let dataPointObj; 
       if (seriesCount === 0) 
           return; 
       if (data.hasDynamicSeries || seriesCount > 1 || !data.categoryMetadata) { 
           for (let i = 0; i < seriesCount; i++) { 
 
               let series = data2.dataPoints[i]; 
               enumeration.push({ 
                   objectName: 'dataPoint', 
 
                   displayName: series.label, 
                   selector: series.identity['selector'], 
                   properties: { 
                       fill: { 
                           solid: { 
                               color: series.color 
                           } 
                       } 
                   }, 
               }); 
           } 
       } 
 
       else { 
           // For single-category, single-measure column charts, the user can color the individual bars. 
           let singleSeriesData = data.series[0].data; 
           let categoryFormatter = data.categoryFormatter; 
 
           // Add default color and show all slices 
           enumeration.push({ 
               objectName: 'dataPoint', 
               selector: null, 
               properties: { 
                   defaultColor: { solid: { color: data.defaultDataPointColor } } 
               } 
           }) 
           for (let i = 0; i < singleSeriesData.length; i++) { 
               let singleSeriesDataPoints = singleSeriesData[i], 
                   categoryValue: any = data.categories[i]; 
               enumeration.push({ 
                   objectName: 'dataPoint', 
                   displayName: categoryFormatter ? categoryFormatter.format(categoryValue) : categoryValue, 
                   selector: ColorHelper.normalizeSelector(singleSeriesDataPoints.identity['selector']), 
                   properties: { 
                       fill: { solid: { color: singleSeriesDataPoints.color } } 
                   }, 
               }); 
           } 
       } 
 
   } 
 
   public calculateAxesProperties(options: CalculateScaleAndDomainOptions): IAxisProperties[] { 
        
       let totalLabelSettings: totalLabelSettings = this.getTotalLabelSettings(this.dataViews[0]); 
       let secondaryLabelSettings: secondaryLabelSettings = this.getSecondaryLabelSettings(this.dataViews[1]); 
       let tertiaryLabelSettings: tertiaryLabelSettings = this.getTertiaryLabelSettings(this.dataViews[3]); 
       let quaternaryLabelSettings: quaternaryLabelSettings = this.getQuaternaryLabelSettings(this.dataViews[4]); 
       let FifthLabelSettings: FifthLabelSettings = this.getFifthLabelSettings(this.dataViews[5]); 
       let SixthLabelSettings: SixthLabelSettings = this.getSixthLabelSettings(this.dataViews[6]); 
 
       let data = this.data; 
       let legendPosition = parseFloat(this.root.select('.legend').attr('orientation')); 
 
       let customTitleHeight = parseFloat(this.root.select('.Title_Div_Text').style('height')); 
       if (isNaN(customTitleHeight)) { 
           customTitleHeight = 0; 
       } 
 
       let legendHeight = parseFloat(this.root.select('.legend').style('height')) - 20; 
       let legendWidth = parseFloat(this.root.select('.legend').style('width')); 
       if (isNaN(legendHeight) || isNaN(legendWidth) || 0 === legendWidth || !(0 === legendPosition || 5 === legendPosition || 1 === legendPosition || 6 === legendPosition) || !this.legendObjectProperties['show'] || !this.isLegendValue) { 
           legendHeight = 0; 
       } 
       customTitleHeight = PixelConverter.fromPointToPixel(customTitleHeight); 
 
       legendHeight = PixelConverter.fromPointToPixel(legendHeight); 
 
       this.viewport = options.viewport; 
 
       let margin = options.margin; 
 
       let origCatgSize = (data && data.categories) ? data.categories.length : 0; 
       let chartLayout: CategoryLayout = data ? this.getCategoryLayout(origCatgSize, options) : { 
           categoryCount: 0, 
           categoryThickness: CartesianChartGMO.MinOrdinalRectThickness - 50, 
           outerPaddingRatio: CartesianChartGMO.OuterPaddingRatio, 
           isScalar: false 
       }; 
 
       this.categoryAxisType = chartLayout.isScalar ? axisType.scalar : null; 
 
       if (data && !chartLayout.isScalar && !this.isScrollable && options.trimOrdinalDataOnOverflow) { 
           // trim data that doesn't fit on dashboard 
           let catgSize = Math.min(origCatgSize, chartLayout.categoryCount); 
           if (catgSize !== origCatgSize) { 
               data = Prototype.inherit(data); 
               data.series = ColumnChartGMO.sliceSeries(data.series, catgSize); 
               data.categories = data.categories.slice(0, catgSize); 
           } 
       } 
       this.columnChart.setData(data); 
 
       let preferredPlotArea = this.getPreferredPlotArea(chartLayout.isScalar, chartLayout.categoryCount, chartLayout.categoryThickness); 
 
       /* preferredPlotArea would be same as currentViewport width when there is no scrollbar. 
        In that case we want to calculate the available plot area for the shapes by subtracting the margin from available viewport */ 
 
       if ((preferredPlotArea.width === this.viewport.width) && this.legendObjectProperties && (this.legendObjectProperties['position'] === 'Left' || this.legendObjectProperties['position'] === 'LeftCenter' || this.legendObjectProperties['position'] === 'Right' || this.legendObjectProperties['position'] === 'RightCenter')) { 
           if (preferredPlotArea.width > (margin.left + margin.right + legendWidth)) { 
               preferredPlotArea.width -= (margin.left + margin.right + legendWidth); 
           } else { 
               preferredPlotArea.width = (margin.left + margin.right + legendWidth) - preferredPlotArea.width; 
           } 
 
       } 
       else if (preferredPlotArea.width === this.viewport.width) { 
           if (preferredPlotArea.width > (margin.left + margin.right)) { 
               preferredPlotArea.width -= (margin.left + margin.right); 
           } else { 
               preferredPlotArea.width = (margin.left + margin.right) - preferredPlotArea.width; 
           } 
 
       } 
 
       let numberOfMeasures = (totalLabelSettings.show ? 1 : 0) + 
           (this.dataViews[1] && this.dataViews[1].categorical && this.dataViews[1].categorical.values ? 1 : 0) + 
           (this.dataViews[3] && this.dataViews[3].categorical && this.dataViews[3].categorical.values ? 1 : 0) + 
           (this.dataViews[4] && this.dataViews[4].categorical && this.dataViews[4].categorical.values ? 1 : 0) 
           + (this.dataViews[5] && this.dataViews[5].categorical && this.dataViews[5].categorical.values ? 1 : 0) + 
           (this.dataViews[6] && this.dataViews[6].categorical && this.dataViews[6].categorical.values ? 1 : 0); 
 
       let customHeight; 
 
       switch (numberOfMeasures) { 
           case 0: customHeight = 0; 
               break; 
           case 1: customHeight = 25; 
               break; 
           case 2: customHeight = 50; 
               break; 
           case 3: customHeight = 75; 
               break; 
           case 4: customHeight = 100; 
               break; 
           case 5: customHeight = 125; 
               break; 
           case 6: customHeight = 150; 
               break; 
            
       } 
 
       if (this.legendObjectProperties && (this.legendObjectProperties['position'] === 'Left' || this.legendObjectProperties['position'] === 'LeftCenter' || this.legendObjectProperties['position'] === 'Right' || this.legendObjectProperties['position'] === 'RightCenter')) { 
           if (preferredPlotArea.height > (margin.top + margin.bottom + customTitleHeight + customHeight)) { 
               preferredPlotArea.height -= (margin.top + margin.bottom + customTitleHeight + customHeight); 
           } else { 
               preferredPlotArea.height = (margin.top + margin.bottom + customTitleHeight + customHeight) - preferredPlotArea.height; 
           } 
 
       } 
       else { 
           if (preferredPlotArea.height > (margin.top + margin.bottom + customTitleHeight + customHeight + legendHeight)) { 
               preferredPlotArea.height -= (margin.top + margin.bottom + customTitleHeight + customHeight + legendHeight); 
           } else { 
               preferredPlotArea.height = (margin.top + margin.bottom + customTitleHeight + customHeight + legendHeight) - preferredPlotArea.height; 
           } 
 
       } 
 
      // let isBarChart = EnumExtensions.hasFlag(this.chartType, flagBar); 
       let is100Pct = EnumExtensions.hasFlag(this.chartType, flagStacked100); 
 
       // When the category axis is scrollable the height of the category axis and value axis will be different 
       // The height of the value axis would be same as viewportHeight 
       let chartContext: ColumnChartContextGMO = { 
           height: preferredPlotArea.height, 
           width: preferredPlotArea.width, 
           duration: 0, 
           hostService: this.hostService, 
           mainGraphicsContext: this.mainGraphicsContext, 
           margin: this.margin, 
           layout: chartLayout, 
           animator: this.animator, 
 
           interactivityService: this.interactivityService, 
           viewportHeight: this.viewport.height, 
           viewportWidth: this.viewport.width, 
           is100Pct: is100Pct, 
           isComboChart: this.isComboChart, 
       }; 
       this.ApplyInteractivity(chartContext); 
       this.columnChart.setupVisualProps(chartContext); 
       this.xAxisProperties = this.columnChart.setXScale( 
        
           options.forcedXDomain, 
           options.categoryAxisScaleType, 
           options.categoryAxisDisplayUnits, 
           options.categoryAxisPrecision); 
 
       this.yAxisProperties = this.columnChart.setYScale( 
           is100Pct, 
           options.forcedTickCount, 
           options.forcedYDomain, 
           options.valueAxisScaleType, 
           options.valueAxisDisplayUnits, 
           options.valueAxisPrecision); 
       if (options.showCategoryAxisLabel && this.xAxisProperties.isCategoryAxis || options.showValueAxisLabel && !this.xAxisProperties.isCategoryAxis) { 
           this.xAxisProperties.axisLabel = data.axesLabels.x; 
       } 
       else { 
           this.xAxisProperties.axisLabel = null; 
       } 
       if (options.showValueAxisLabel && !this.yAxisProperties.isCategoryAxis || options.showCategoryAxisLabel && this.yAxisProperties.isCategoryAxis) { 
           this.yAxisProperties.axisLabel = data.axesLabels.y; 
       } 
       else { 
           this.yAxisProperties.axisLabel = null; 
       } 
 
       return [this.xAxisProperties, this.yAxisProperties]; 
   } 
 
   public getPreferredPlotArea(isScalar: boolean, categoryCount: number, categoryThickness: number): IViewport { 
       let viewport: IViewport = { 
           height: this.viewport.height, 
           width: this.viewport.width 
       }; 
       if (this.isScrollable && !isScalar) { 
           let preferredWidth = CartesianChartGMO.getPreferredCategorySpan(categoryCount, categoryThickness); 
           if (EnumExtensions.hasFlag(this.chartType, flagBar)) { 
               viewport.height = Math.max(preferredWidth, viewport.height); 
           } 
           else 
               viewport.width = Math.max(preferredWidth, viewport.width); 
       } 
       return viewport; 
   } 
 
   private ApplyInteractivity(chartContext: ColumnChartContextGMO): void { 
       let interactivity = this.interactivity; 
       if (interactivity) { 
           if (interactivity.dragDataPoint) { 
               (chartContext as any).onDragStart = (event: DragEvent, datum: StackedChartGMODataPoint) => { 
                   if (!datum?.identity) 
                       return; 
 
                   this.hostService.onDragStart({ 
                       event: event, 
                       data: { 
                           data: datum.identity['selector'] 
                       } 
                   }); 
               }; 
           } 
 
           if (interactivity.isInteractiveLegend) { 
               const graphicsNode = this.mainGraphicsContext.node(); 
               let dragMove = (event: MouseEvent) => { 
                   let mousePoint = d3Pointer(event, graphicsNode); 
                   let x: number = mousePoint[0]; 
                   let y: number = mousePoint[1]; 
                   let index: number = this.columnChart.getClosestColumnIndex(x, y); 
                   this.selectColumn(index); 
               }; 
 
               let ColumnChartSvg: EventTarget = ColumnChartGMO.getInteractiveColumnChartDomElement(this.element); 
 
               //set click interaction on the visual 
               this.svg.on('click', dragMove); 
               //set click interaction on the background 
               d3.select(ColumnChartSvg) 
                   .on('click', dragMove) 
                   .style('touch-action', 'none'); 
               let drag = d3Drag() 
                   .on("drag", dragMove); 
               //set drag interaction on the visual 
               this.svg.call(drag); 
               //set drag interaction on the background 
               d3.select(ColumnChartSvg).call(drag); 
           } 
       } 
   } 
 
   private selectColumn(indexOfColumnSelected: number, force: boolean = false): void { 
       if (!force && this.lastInteractiveSelectedColumnIndex === indexOfColumnSelected) return; // same column, nothing to do here 
 
       let legendData: LegendData = this.createInteractiveLegendDataPoints(indexOfColumnSelected); 
       let legendDataPoints: LegendDataPoint[] = legendData.dataPoints; 
       this.cartesianVisualHost.updateLegend(legendData); 
       if (legendDataPoints.length > 0) { 
           this.columnChart.selectColumn(indexOfColumnSelected, this.lastInteractiveSelectedColumnIndex); 
       } 
       this.lastInteractiveSelectedColumnIndex = indexOfColumnSelected; 
   } 
 
   private createInteractiveLegendDataPoints(columnIndex: number): LegendData { 
       let data = this.data; 
       if (!data || _.isEmpty(data.series)) 
           return { dataPoints: [] }; 
 
       let formatStringProp = columnChartProps.general.formatString; 
       let legendDataPoints: LegendDataPoint[] = []; 
       let category = data.categories && data.categories[columnIndex]; 
       let allSeries = data.series; 
       let dataPoints = data.legendData && data.legendData.dataPoints; 
       let converterStrategy = new ColumnChartConverterHelper(this.dataViewCat); 
 
       for (let i = 0, len = allSeries.length; i < len; i++) { 
           let measure = converterStrategy.getValueBySeriesAndCategory(i, columnIndex); 
           let valueMetadata = data.valuesMetadata[i]; 
           let formattedLabel = valueFormatter.format(measure, valueFormatter.getFormatString(valueMetadata, formatStringProp)); 
           let dataPointColor: string; 
           if (allSeries.length === 1) { 
               let series = allSeries[0]; 
               dataPointColor = series.data.length > columnIndex && series.data[columnIndex].color; 
           } else { 
               dataPointColor = dataPoints.length > i && dataPoints[i].color; 
           } 
 
           legendDataPoints.push(<any>{ 
               color: dataPointColor, 
               icon: LegendIcon.Box, 
               label: formattedLabel, 
               category: data.categoryFormatter ? data.categoryFormatter.format(category) : category, 
               measure: valueFormatter.format(measure, valueFormatter.getFormatString(valueMetadata, formatStringProp)), 
               identity: SelectionId.createNull(), 
               selected: false 
           }); 
       } 
 
       return { dataPoints: legendDataPoints }; 
   } 
 
   public calculateAxes( 
       categoryAxisProperties: DataViewObject, 
       valueAxisProperties: DataViewObject, 
       textProperties: TextProperties, 
       scrollbarVisible: boolean): IAxisProperties[] { 
           
       let visualOptions: CalculateScaleAndDomainOptions = { 
           viewport: this.viewport, 
           margin: this.margin, 
           forcedXDomain: [categoryAxisProperties ? categoryAxisProperties['start'] : null, categoryAxisProperties ? categoryAxisProperties['end'] : null], 
           forceMerge: valueAxisProperties && valueAxisProperties['secShow'] === false, 
           showCategoryAxisLabel: false, 
           showValueAxisLabel: false, 
           categoryAxisScaleType: categoryAxisProperties && categoryAxisProperties['axisScale'] != null ? <string>categoryAxisProperties['axisScale'] : null, 
           valueAxisScaleType: valueAxisProperties && valueAxisProperties['axisScale'] != null ? <string>valueAxisProperties['axisScale'] : null, 
           valueAxisDisplayUnits: valueAxisProperties && valueAxisProperties['labelDisplayUnits'] != null ? <number>valueAxisProperties['labelDisplayUnits'] : Visual.LabelDisplayUnitsDefault, 
           categoryAxisDisplayUnits: categoryAxisProperties && categoryAxisProperties['labelDisplayUnits'] != null ? <number>categoryAxisProperties['labelDisplayUnits'] : Visual.LabelDisplayUnitsDefault, 
           trimOrdinalDataOnOverflow: false 
       }; 
 
       if (valueAxisProperties) { 
           visualOptions.forcedYDomain = AxisHelper.applyCustomizedDomain([valueAxisProperties['start'], valueAxisProperties['end']], visualOptions.forcedYDomain); 
       } 
       visualOptions.showCategoryAxisLabel = (!!categoryAxisProperties && !!categoryAxisProperties['showAxisTitle']); 
 
       visualOptions.showValueAxisLabel = true; 
 
       let width = this.viewport.width - (this.margin.left + this.margin.right); 
 
       let axes = this.calculateAxesProperties(visualOptions); 
       axes[0].willLabelsFit = AxisHelper.LabelLayoutStrategy.willLabelsFit( 
           axes[0], 
           width, 
           TextMeasurementService.measureSvgTextWidth, 
           textProperties); 
 
       // If labels do not fit and we are not scrolling, try word breaking 
       axes[0].willLabelsWordBreak = (!axes[0].willLabelsFit && !scrollbarVisible) && AxisHelper.LabelLayoutStrategy.willLabelsWordBreak( 
           axes[0], this.margin, width, TextMeasurementService.measureSvgTextWidth, 
           TextMeasurementService.estimateSvgTextHeight, TextMeasurementService.getTailoredTextOrDefault, 
           textProperties); 
       return axes; 
   } 
   public render(suppressAnimations: boolean, resize: boolean): CartesianVisualRenderResultGMO { 
       let maxMarginFactor = this.getMaxMarginFactor(); 
       this.leftRightMarginLimit = this.viewport.width * maxMarginFactor; 
       let bottomMarginLimit = this.bottomMarginLimit = Math.max(25, Math.ceil(this.viewport.height * maxMarginFactor)); 
 
       // reset defaults 
       this.margin.top = 8; 
       this.margin.bottom = bottomMarginLimit; 
       this.margin.right = 0; 
 
       this.yAxisIsCategorical = this.yAxisProperties.isCategoryAxis; 
       this.hasCategoryAxis = this.yAxisIsCategorical ? this.yAxisProperties && this.yAxisProperties.values.length > 0 : this.xAxisProperties && this.xAxisProperties.values.length > 0; 
 
       let renderXAxis = this.shouldRenderAxis(this.xAxisProperties); 
       let renderY1Axis = this.shouldRenderAxis(this.yAxisProperties); 
       let mainAxisScale; 
       this.isXScrollBarVisible = false; 
       this.isYScrollBarVisible = false; 
       let tickLabelMargins; 
       let axisLabels: ChartAxesLabels; 
       let chartHasAxisLabels: boolean; 
 
       let yAxisOrientation = this.yAxisOrientation; 
       let showY1OnRight = yAxisOrientation === yAxisPosition.right; 
 
       let doneWithMargins = false, 
           maxIterations = 2, 
           numIterations = 0; 
       while (!doneWithMargins && numIterations < maxIterations) { 
           numIterations++; 
           // Modern chartutils (8.x) takes a SINGLE options object here; the
           // legacy 2018 code passed 13 positional args, which made the library
           // read `options.axes` as undefined -> "Cannot read properties of
           // undefined (reading 'x')". Rebuilt as the options object it expects.
           tickLabelMargins = AxisHelper.getTickLabelMargins({
               viewport: { width: this.viewportIn.width, height: this.viewport.height },
               yMarginLimit: this.leftRightMarginLimit,
               textWidthMeasurer: TextMeasurementService.measureSvgTextWidth,
               textHeightMeasurer: TextMeasurementService.measureSvgTextHeight,
               axes: { x: this.xAxisProperties, y1: this.yAxisProperties },
               bottomMarginLimit: this.bottomMarginLimit,
               properties: this.textProperties,
               scrollbarVisible: this.isXScrollBarVisible || this.isYScrollBarVisible,
               showOnRight: showY1OnRight,
               renderXAxis: renderXAxis,
               renderY1Axis: renderY1Axis,
               renderY2Axis: false,
           }); 
           // We look at the y axes as main and second sides, if the y axis orientation is right so the main side represents the right side 
           // NOTE: chartutils 8.x getTickLabelMargins returns { top, left, right, bottom } 
           // where `top` is the x-axis (bottom) label height, `left`/`right` are the 
           // y-axis label widths. The legacy 2018 API returned { xMax, yLeft, yRight }. 
           // Reading the old names yields `undefined` -> `undefined + 10 = NaN`, which 
           // propagated into margin.left/right and produced a NaN category-axis width 
           // ("M0,6V0HNaNV6" / "translate(NaN, y)"). Map to the 8.x property names. 
           let maxMainYaxisSide = (showY1OnRight ? tickLabelMargins.right : tickLabelMargins.left) || 0, 
               maxSecondYaxisSide = (showY1OnRight ? tickLabelMargins.left : tickLabelMargins.right) || 0, 
               xMax = tickLabelMargins.top || 0; 

           maxMainYaxisSide += 10; 
           maxSecondYaxisSide += 10; 
           xMax += 12; 
           if (showY1OnRight && renderY1Axis) { 
               maxSecondYaxisSide += 20; 
           } 
 
           if (!showY1OnRight && renderY1Axis) { 
               maxMainYaxisSide += 20; 
           } 
 
           if (this.hideAxisLabels()) { 
               this.xAxisProperties.axisLabel = null; 
               this.yAxisProperties.axisLabel = null; 
           } 
           this.addUnitTypeToAxisLabel(this.xAxisProperties, this.yAxisProperties); 
           axisLabels = { x: this.xAxisProperties.axisLabel, y: this.yAxisProperties.axisLabel, y2: null }; 
           chartHasAxisLabels = (axisLabels.x != null) || (axisLabels.y != null || axisLabels.y2 != null); 
 
           if (axisLabels.x != null) 
               xMax += 18; 
 
           if (axisLabels.y != null) 
               maxMainYaxisSide += 20; 
 
           if (axisLabels.y2 != null) 
               maxSecondYaxisSide += 20; 
 
           this.margin.left = showY1OnRight ? maxSecondYaxisSide : maxMainYaxisSide; 
           this.margin.right = showY1OnRight ? maxMainYaxisSide : maxSecondYaxisSide; 
           this.margin.bottom = xMax; 
 
           // re-calculate the axes with the new margins 
           let previousTickCountY1 = this.yAxisProperties.values.length; 
           this.calculateAxes(this.categoryAxisProperties, this.valueAxisProperties, this.textProperties, true); 
 
           // the minor padding adjustments could have affected the chosen tick values, which would then need to calculate margins again 
           // e.g. [0,2,4,6,8] vs. [0,5,10] the 10 is wider and needs more margin. 
           if (this.yAxisProperties.values.length === previousTickCountY1) 
               doneWithMargins = true; 
       } 
       let columnChartDrawInfo = this.columnChart.drawColumns(!suppressAnimations); 
 
       if (this.viewportIn.width === 0 || this.viewportIn.height === 0) { 
           return; 
       } 
 
       if (this.tooltipsEnabled) 
           this.TooltipServiceWrapper.addTooltip(columnChartDrawInfo.shapesSelection, 
               ((tooltipEvent: TooltipEventArgs<any>) => (tooltipEvent.data.tooltipInfo))); 
       //TooltipManager.addTooltip(columnChartDrawInfo.shapesSelection, (tooltipEvent: TooltipEvent) => tooltipEvent.data.tooltipInfo); 
 
       //let allDataPoints: StackedChartGMODataPoint[] = []; 
       let behaviorOptions: ColumnGMOBehaviorOptions = undefined; 
       let data = this.data; 
       this.renderChart(mainAxisScale, this.xAxisProperties, this.yAxisProperties, tickLabelMargins, chartHasAxisLabels, axisLabels, suppressAnimations); 

       this.updateAxis(); 
       if (this.data.labelSettings.show) { 
          // let selectedtext = []; 
           let dataLabelPoints = []; 
           for (let a = 0; a < columnChartDrawInfo.labelDataPoints.length; a++) { 
               //let DataLabelValue = parseFloat(columnChartDrawInfo.labelDataPoints[a].text); 
 
               dataLabelPoints.push(columnChartDrawInfo.labelDataPoints[a].text) 
 
           } 
           let j = 0; 
           let allBoxes = this.root.selectAll('.mainGraphicsContext > svg > g > rect'); 
           $('allBoxes').filter(function () { 
               return $(this).attr('opacity') == '1'; 
           }).css("fill", "red"); 
           let allBoxesLength = allBoxes[0].length - 1; 
 
           let all = 0; 
           let boxWidth = parseFloat((<SVGRectElement>allBoxes[0][0]).width.baseVal.valueAsString); 
 
           let dataLabelSvg = this.root.select('.svgScrollable > .axisGraphicsContext > .mainGraphicsContext') 
               .append('g') 
               .classed('dataLabels', true) 
 
           let objects = this.dataView.metadata.objects; 
           let labelsObj = <DataLabelObject>objects['labels']; 
 
           let precision = labelsObj.labelPrecision ? labelsObj.labelPrecision : 0; 
           let labelColor = (labelsObj.color ? labelsObj.color.solid.color : 'black'); 
           let dataLabelText; 
           let formattedDataLabelText = ""; 
 
           let vis = []; 
           for (let i = 0; i <= allBoxesLength; i++) 
               vis[i] = 0; 
           while (all < dataLabelPoints.length) { 
               let boxHeight; 
               let boxX; 
               let boxY; 
               let boxCenterX; 
               let boxCenterY; 
 
               if (dataLabelPoints[all] != 0) { 
                   let b = 0; 
 
                   while (b <= allBoxesLength) { 
                       if (allBoxes[0][b]['__data__'].originalValue == dataLabelPoints[all] && vis[b] == 0 && allBoxes[0][b]['style']['fill-opacity'] == 1) { 
                           boxHeight = parseFloat((<SVGRectElement>allBoxes[0][b]).height.baseVal.valueAsString); 
                           boxX = parseFloat((<SVGRectElement>allBoxes[0][b]).x.baseVal.valueAsString); 
                           boxY = parseFloat((<SVGRectElement>allBoxes[0][b]).y.baseVal.valueAsString); 
                           boxCenterX = boxX + boxWidth / 2; 
                           boxCenterY = boxY + boxHeight / 2; 
                           vis[b] = 1; 
                           break; 
                       } 
                       b++; 
                   } 
 
                   formattedDataLabelText = this.format(parseFloat(dataLabelPoints[all]) * 100, 1, precision, 'sample'); 
 
                   if (formattedDataLabelText == "") { 
                       dataLabelText = dataLabelSvg 
                           .append('text') 
                           .classed('dataLabel', true) 
                           .attr('x', boxCenterX) 
                           .attr('y', boxCenterY + 3) 
                           .attr('text-anchor', 'middle') 
                           .attr('font-size', this.data.labelSettings.fontSize) 
                           .text(formattedDataLabelText) 
 
                   } 
                   else { 
                       dataLabelText = dataLabelSvg 
                           .append('text') 
                           .classed('dataLabel', true) 
                           .attr('x', boxCenterX) 
                           .attr('y', boxCenterY + 3) 
                           .attr('text-anchor', 'middle') 
                           .attr('font-size', this.data.labelSettings.fontSize) 
                           .text(formattedDataLabelText + '%') 
 
                   } 
 
                   let dataLabelBBox = (dataLabelText.node() as any).getBBox(); 
                   if (boxX + boxWidth < dataLabelBBox.x + dataLabelBBox.width || boxY + boxHeight < dataLabelBBox.y + dataLabelBBox.height) { 
                       dataLabelText.text(''); 
                   } 
 
               } 
               all++; 
 
           } 
 
           dataLabelSvg.style({ 'fill': labelColor }); 
           this.root.selectAll('.dataLabel').style('fill', labelColor); 
           this.root.selectAll('.dataLabel').style('font-family', 'Segoe UI'); 
 
       } 
 
     //  let sampleFilterSettings: sampleFilterSettings = this.getSampleFilterSettings(this.dataViews[0]); 
       let measureTitlesSettings: measureTitlesSettings = this.getMeasureTitlesSettings(this.dataViews[0]); 
       let totalLabelSettings: totalLabelSettings = this.getTotalLabelSettings(this.dataViews[0]); 
       let secondaryLabelSettings: secondaryLabelSettings = this.getSecondaryLabelSettings(this.dataViews[1]); 
       let tertiaryLabelSettings: tertiaryLabelSettings = this.getTertiaryLabelSettings(this.dataViews[3]); 
       let quaternaryLabelSettings: quaternaryLabelSettings = this.getQuaternaryLabelSettings(this.dataViews[4]); 
       let FifthLabelSettings: FifthLabelSettings = this.getFifthLabelSettings(this.dataViews[5]); 
       let SixthLabelSettings: SixthLabelSettings = this.getSixthLabelSettings(this.dataViews[6]); 
 
       let dataCategories = this.data.categories; 
       let dataSeries = this.data.series; 
       let aggregatedValues = []; 
       let aggregatedSecValues = []; 
       let aggregatedTerValues = []; 
       let aggregatedQuatValues = []; 
       let aggregatedfifthValues = []; 
       let aggregatedsixthValues = []; 
       let tempAggregatedQuatValues = []; 
       let tempAggregatedfifthValues = []; 
       let tempAggregatedsixthValues = []; 
       let tempAggregatedTerValues = []; 
       let tempAggregatedSecValues = []; 
 
       let sampleSize; 
       sampleSize = -9999; 
        
       let numberOfMeasures = (totalLabelSettings.show ? 1 : 0) + 
           (this.dataViews[1] && this.dataViews[1].categorical && this.dataViews[1].categorical.values ? 1 : 0) + 
           (this.dataViews[3] && this.dataViews[3].categorical && this.dataViews[3].categorical.values ? 1 : 0) + 
           (this.dataViews[4] && this.dataViews[4].categorical && this.dataViews[4].categorical.values ? 1 : 0) 
           + (this.dataViews[5] && this.dataViews[5].categorical && this.dataViews[5].categorical.values ? 1 : 0) + 
           (this.dataViews[6] && this.dataViews[6].categorical && this.dataViews[6].categorical.values ? 1 : 0); 
 
       let measureCounter = numberOfMeasures, yAxisForLabels = 20, yAxisMultiplier = 27; 
 
       let noAxis = false; 
       if (dataCategories.length === 1 && dataCategories[0] === null) { 
           noAxis = true; 
       } 
 
       let maxLabelTextWidth = measureTitlesSettings.ellipsesStrength; 
       if (totalLabelSettings.show) { 
           if (this.dataViews[2] && this.dataViews[2].categorical && this.dataViews[2].categorical.values) { 
               for (let i = 0; i < this.dataViews[2].categorical.values[0].values.length; i++) { 
                   if (this.dataViews[2].categorical.values[0].values[i] !== null) { 
                       sampleSize = this.dataViews[2].categorical.values[0].values[i]; 
                       break; 
                   } 
               } 
           } 
           if (noAxis) { 
               let lenght=dataSeries.length 
               if (length !== 0) { 
                   let sum = 0; 
                   for (let i = 0; i < length; i++) { 
                       if (dataSeries[i].data[0]) { 
                           sum = sum + this.data.series[i].data[0].valueOriginal; 
                       } 
                   } 
                   aggregatedValues.push(sum); 
               } 
           } 
           else { 
               let dclength=dataCategories.length 
               let dslength=dataSeries.length 
               for (let k = 0; k < dclength; k++) { 
                   let sum = 0; 
                   for (let i = 0; i < dslength; i++) { 
                       for (let j = 0; j < dclength; j++) { 
                           if (dataSeries[i].data[j]) { 
                               if (dataSeries[i].data[j].categoryValue == dataCategories[k]) { 
                                   sum = sum + this.data.series[i].data[j].valueOriginal; 
                                   break; 
                               } 
                           } 
                           else { 
                               break; 
                           } 
                       } 
                   } 
                   aggregatedValues.push(sum); 
               } 
           } 
           let totalTitleTextProperties: TextProperties = { 
               text: totalLabelSettings.titleText, 
               fontFamily: "Segoe UI", 
               fontSize: '12px' 
           }; 
           let totalTitleText = TextMeasurementService.getTailoredTextOrDefault(totalTitleTextProperties, maxLabelTextWidth); 
 
           this.root.select('.cartesianChart') 
               .append('text') 
               .classed('measureLabelTitle', true) 
               .attr('x', 1) 
               .attr('y', yAxisForLabels - numberOfMeasures + (yAxisMultiplier * --measureCounter)) 
               .attr('font-size', '12px') 
               .attr('font-family', 'Segoe UI') 
               .attr('fill', '#777') 
               .text(totalTitleText) 
               .append('title') 
               .text(totalLabelSettings.titleText) 
       } 
       
       //secondary 
let  value=this.dataViews[1] && this.dataViews[1].categorical && this.dataViews[1].categorical.values 
       if (value) { 
           let dvcvalue=this.dataViews[1].categorical 
           if (noAxis) { 
               let totalValuesLength = value.length; 
               let sumSec; 
               sumSec = 0; 
               
               for (let i = 0; i < totalValuesLength; i++) { 
                   sumSec = sumSec + dvcvalue.values[i].values[0]; 
               } 
               aggregatedSecValues.push(sumSec); 
           } 
           else { 
               aggregatedSecValues = dvcvalue.values[0].values; 
           } 
 
           tempAggregatedSecValues = aggregatedSecValues.slice(0); 
           if (this.removeFlags.length > 0) { 
               this.spliceMeasures(tempAggregatedSecValues); 
           } 
 
           let secMeasuretextProperties: TextProperties = { 
               text: secondaryLabelSettings.titleText, 
               fontFamily: "Segoe UI", 
               fontSize: '12px' 
           }; 
           let secMeasuretext = TextMeasurementService.getTailoredTextOrDefault(secMeasuretextProperties, maxLabelTextWidth); 
           this.root.select('.cartesianChart') 
               .append('text') 
               .attr('x', 1) 
               .attr('y', yAxisForLabels - numberOfMeasures + (yAxisMultiplier * --measureCounter)) 
               .classed('measureLabelTitle', true) 
               .attr('font-size', '12px') 
               .attr('font-family', 'Segoe UI') 
               .attr('fill', '#777') 
               .text(secMeasuretext) 
               .append('title') 
               .text(secondaryLabelSettings.titleText) 
       } 
       //tertiary 
       let dvcvalues=this.dataViews[3] && this.dataViews[3].categorical && this.dataViews[3].categorical.values 
       if (dvcvalues) { 
           if (noAxis) { 
               let totalValuesLength = dvcvalues.length; 
               let sumTer; 
               sumTer = 0; 
               for (let i = 0; i < totalValuesLength; i++) { 
                   sumTer = sumTer + dvcvalues[i].values[0]; 
               } 
               aggregatedTerValues.push(sumTer); 
           } 
           else { 
               aggregatedTerValues = dvcvalues[0].values; 
           } 
 
           tempAggregatedTerValues = aggregatedTerValues.slice(0); 
           if (this.removeFlags.length > 0) { 
               this.spliceMeasures(tempAggregatedTerValues); 
           } 
 
           let terMeasuretextProperties: TextProperties = { 
               text: tertiaryLabelSettings.titleText, 
               fontFamily: "Segoe UI", 
               fontSize: '12px' 
           }; 
           let terMeasuretext = TextMeasurementService.getTailoredTextOrDefault(terMeasuretextProperties, maxLabelTextWidth); 
           this.root.select('.cartesianChart') 
               .append('text') 
               .attr('x', 1) 
               .attr('y', yAxisForLabels - numberOfMeasures + (yAxisMultiplier * --measureCounter)) 
               .classed('measureLabelTitle', true) 
               .attr('font-size', '12px') 
               .attr('font-family', 'Segoe UI') 
               .attr('fill', '#777') 
               .text(terMeasuretext) 
               .append('title') 
               .text(tertiaryLabelSettings.titleText) 
       } 
 
       //quarternary 
       value=this.dataViews[4] && this.dataViews[4].categorical && this.dataViews[4].categorical.values 
       if (value) { 
           if (noAxis) { 
               let totalValuesLength = value.length; 
               let sumQuat; 
               sumQuat = 0; 
               for (let i = 0; i < totalValuesLength; i++) { 
                   sumQuat = sumQuat + value[i].values[0]; 
               } 
               aggregatedQuatValues.push(sumQuat); 
               noAxis = true; 
           } 
           else { 
               aggregatedQuatValues = value[0].values; 
           } 
 
           tempAggregatedQuatValues = aggregatedQuatValues.slice(0); 
           if (this.removeFlags.length > 0) { 
               this.spliceMeasures(tempAggregatedQuatValues); 
           } 
           let textMeasurementService = TextMeasurementService; 
           let quatMeasuretextProperties: TextProperties = { 
               text: quaternaryLabelSettings.titleText, 
               fontFamily: "Segoe UI", 
               fontSize: '12px', 
                
           }; 
           let widthtext = textMeasurementService.measureSvgTextWidth(quatMeasuretextProperties); 
           let quatMeasuretext = TextMeasurementService.getTailoredTextOrDefault(quatMeasuretextProperties, maxLabelTextWidth); 
           this.root.select('.cartesianChart') 
               .append('text') 
               .attr('x', 1) 
               .attr('y', yAxisForLabels - numberOfMeasures + (yAxisMultiplier * --measureCounter)) 
               .classed('measureLabelTitle', true) 
               .attr('font-size', '12px') 
               .attr('font-family', 'Segoe UI') 
               .attr('fill', '#777') 
               .attr('width', widthtext) 
               .text(quatMeasuretext) 
               .append('title') 
               .text(quaternaryLabelSettings.titleText) 
       } 
       //fifth 
       value=this.dataViews[5] && this.dataViews[5].categorical && this.dataViews[5].categorical.values 
       if (value) { 
           if (noAxis) { 
               let totalValuesLength = value.length; 
               let sumQuat; 
               sumQuat = 0; 
               for (let i = 0; i < totalValuesLength; i++) { 
                   sumQuat = sumQuat + value[i].values[0]; 
               } 
               aggregatedfifthValues.push(sumQuat); 
               noAxis = true; 
           } 
           else { 
               aggregatedfifthValues = value[0].values; 
           } 
 
           tempAggregatedfifthValues = aggregatedfifthValues.slice(0); 
           if (this.removeFlags.length > 0) { 
               this.spliceMeasures(tempAggregatedfifthValues); 
           } 
 
           let fiveMeasuretextProperties: TextProperties = { 
               text: FifthLabelSettings.titleText, 
               fontFamily: "Segoe UI", 
               fontSize: '12px' 
           }; 
           let fiveMeasuretext = TextMeasurementService.getTailoredTextOrDefault(fiveMeasuretextProperties, maxLabelTextWidth); 
           this.root.select('.cartesianChart') 
               .append('text') 
               .attr('x', 1) 
               .attr('y', yAxisForLabels - numberOfMeasures + (yAxisMultiplier * --measureCounter)) 
               .classed('measureLabelTitle', true) 
               .attr('font-size', '12px') 
               .attr('font-family', 'Segoe UI') 
               .attr('fill', '#777') 
               .text(fiveMeasuretext) 
               .append('title') 
               .text(FifthLabelSettings.titleText) 
       } 
        
       //sixth 
       value=this.dataViews[6] && this.dataViews[6].categorical && this.dataViews[6].categorical.values 
       if (value) { 
           if (noAxis) { 
               let totalValuesLength = value.length; 
               let sumQuat; 
               sumQuat = 0; 
               for (let i = 0; i < totalValuesLength; i++) { 
                   sumQuat = sumQuat + value[i].values[0]; 
               } 
               aggregatedsixthValues.push(sumQuat); 
               noAxis = true; 
           } 
           else { 
               aggregatedsixthValues = value[0].values; 
           } 
 
           tempAggregatedsixthValues = aggregatedsixthValues.slice(0); 
           if (this.removeFlags.length > 0) { 
               this.spliceMeasures(tempAggregatedsixthValues); 
           } 
 
           let sixMeasuretextProperties: TextProperties = { 
               text: SixthLabelSettings.titleText, 
               fontFamily: "Segoe UI", 
               fontSize: '12px' 
           }; 
           let sixMeasuretext = TextMeasurementService.getTailoredTextOrDefault(sixMeasuretextProperties, maxLabelTextWidth); 
           this.root.select('.cartesianChart') 
               .append('text') 
               .attr('x', 1) 
               .attr('y', yAxisForLabels - numberOfMeasures + (yAxisMultiplier * --measureCounter)) 
               .classed('measureLabelTitle', true) 
               .attr('font-size', '12px') 
               .attr('font-family', 'Segoe UI') 
               .attr('fill', '#777') 
               .text(sixMeasuretext) 
               .append('title') 
               .text(SixthLabelSettings.titleText) 
       } 
 
       let boxes = this.root.selectAll('.mainGraphicsContext > svg'); 
       let box = <SVGRectElement>boxes[0][0]; 
 
       let xTicks = this.root.selectAll('.axisGraphicsContext > .x > .tick'); 
 
       let barWidthValue = parseInt(box.width.baseVal.valueAsString); 
 
       let len; 
       if (dataCategories.length === 1 && dataCategories[0] === null) { 
           len = 0; 
       } 
       else { 
           len = xTicks[0].length - 1; 
       } 
 
       while (len >= 0) { 
           let xAxisValue; 
           let yAxisValue = 32; 
           if (noAxis) { 
               let barXValue = parseInt(box.x.baseVal.valueAsString); 
               xAxisValue = barXValue + barWidthValue / 2; 
           } 
           else { 
               xAxisValue = (<HTMLElement>xTicks[0][len]).getAttribute('transform').match(/translate\(([^)]+)\)/)[1] ? parseInt((<HTMLElement>xTicks[0][len]).getAttribute('transform').match(/translate\(([^)]+)\)/)[1]) : 0; 
           } 
 
           //total 
            
           if (totalLabelSettings.show) { 
               let formattedTotalText = this.format(parseInt(aggregatedValues[len], 10), totalLabelSettings.displayUnits, totalLabelSettings.textPrecision, 'sample'); 
 
               if (sampleSize > aggregatedValues[len]) { 
                   formattedTotalText = formattedTotalText + '*'; 
               } 
 
               yAxisValue = yAxisValue - 27; 
 
               let DatatextProperties: TextProperties = { 
                   text: formattedTotalText, 
                   fontFamily: "Segoe UI", 
                   fontSize: totalLabelSettings.fontSize + 'px' 
               }; 
               let totalText = TextMeasurementService.getTailoredTextOrDefault(DatatextProperties, barWidthValue); 
               let totallength = totalText.length; 
               if (totalText[totallength - 1] == '%') { 
                   totalText = this.format(parseFloat(aggregatedValues[len]) * 100, 1, totalLabelSettings.textPrecision, 'sample'); 
                   totalText = totalText + '%'; 
 
               } 
               this.root.select('.svgScrollable > .axisGraphicsContext') 
                   .append('text') 
                   .classed('totalLabels', true) 
                   .attr('x', xAxisValue) 
                   .attr('y', yAxisValue) 
                   .attr('text-anchor', 'middle') 
                   .attr('font-size', totalLabelSettings.fontSize) 
                   .text(totalText) 
           } 
            
           //secondary 
           if (this.dataViews[1] && this.dataViews[1].categorical && this.dataViews[1].categorical.values) { 
               let formatString = '0'; 
               formatString = this.dataViews[1].categorical.values[0].source.format; 
               let formatter = valueFormatter.create({ format: formatString, value: secondaryLabelSettings.displayUnits, precision: secondaryLabelSettings.textPrecision }); 
               let formattedSecondaryText; 
               if (tempAggregatedSecValues[len] !== null) { 
                   formattedSecondaryText = formatter.format(tempAggregatedSecValues[len]); 
               } 
               else { 
                   formattedSecondaryText = "0" 
               } 
 
               yAxisValue = yAxisValue - 27; 
 
               let secDatatextProperties: TextProperties = { 
                   text: formattedSecondaryText, 
                   fontFamily: "Segoe UI", 
                   fontSize: secondaryLabelSettings.fontSize + 'px' 
               }; 
               let secText = TextMeasurementService.getTailoredTextOrDefault(secDatatextProperties, barWidthValue); 
               //  let secText = this.format(parseFloat(dataLabelPoints[i]) * 100, 1, precision, 'sample'); 
 
               let seclength = secText.length; 
               if (secText[seclength - 1] == '%') { 
                   secText = this.format(parseFloat(tempAggregatedSecValues[len]) * 100, 1, secondaryLabelSettings.textPrecision, 'sample'); 
                   secText = secText + '%'; 
 
               } 
               this.root.select('.svgScrollable > .axisGraphicsContext') 
                   .append('text') 
                   .classed('secLabels', true) 
                   .attr('x', xAxisValue) 
                   .attr('y', yAxisValue) 
                   .attr('text-anchor', 'middle') 
                   .attr('font-size', secondaryLabelSettings.fontSize) 
                   .text(secText); 
           } 
 
           //tertiary 
           if ( this.dataViews[3] && this.dataViews[3].categorical && this.dataViews[3].categorical.values) { 
               let formatString = '0'; 
               formatString = this.dataViews[3].categorical.values[0].source.format; 
               let formatter = valueFormatter.create({ format: formatString, value: tertiaryLabelSettings.displayUnits, precision: tertiaryLabelSettings.textPrecision }); 
               let formattedTertiaryText; 
               if (tempAggregatedTerValues[len] !== null) { 
                   formattedTertiaryText = formatter.format(tempAggregatedTerValues[len]); 
               } 
               else { 
                   formattedTertiaryText = "0" 
               } 
 
               yAxisValue = yAxisValue - 27; 
 
               let terDatatextProperties: TextProperties = { 
                   text: formattedTertiaryText, 
                   fontFamily: "Segoe UI", 
                   fontSize: tertiaryLabelSettings.fontSize + 'px' 
               }; 
               let terText = TextMeasurementService.getTailoredTextOrDefault(terDatatextProperties, barWidthValue); 
               let terlength = terText.length; 
               if (terText[terlength - 1] == '%') { 
                   terText = this.format(parseFloat(tempAggregatedTerValues[len]) * 100, 1, tertiaryLabelSettings.textPrecision, 'sample'); 
                   terText = terText + '%'; 
 
               } 
               this.root.select('.svgScrollable > .axisGraphicsContext') 
                   .append('text') 
                   .classed('terLabels', true) 
                   .attr('x', xAxisValue) 
                   .attr('y', yAxisValue) 
                   .attr('text-anchor', 'middle') 
                   .attr('font-size', tertiaryLabelSettings.fontSize) 
                   .text(terText); 
           } 
 
           //quarternary 
           value=this.dataViews[4] && this.dataViews[4].categorical && this.dataViews[4].categorical.values 
           if (value) { 
               let formatString = '0'; 
               formatString = value[0].source.format; 
               let formatter = valueFormatter.create({ format: formatString, value: quaternaryLabelSettings.displayUnits, precision: quaternaryLabelSettings.textPrecision }); 
               let formattedQuaternaryText; 
               if (tempAggregatedQuatValues[len] !== null) { 
                   formattedQuaternaryText = formatter.format(tempAggregatedQuatValues[len]); 
               } 
               else { 
                   formattedQuaternaryText = "0" 
               } 
 
               yAxisValue = yAxisValue - 27; 
 
               let quatDatatextProperties: TextProperties = { 
                   text: formattedQuaternaryText, 
                   fontFamily: "Segoe UI", 
                   fontSize: quaternaryLabelSettings.fontSize + 'px' 
               }; 
               let quatText = TextMeasurementService.getTailoredTextOrDefault(quatDatatextProperties, barWidthValue); 
               let quatlength = quatText.length; 
               if (quatText[quatlength - 1] == '%') { 
                   quatText = this.format(parseFloat(tempAggregatedQuatValues[len]) * 100, 1, quaternaryLabelSettings.textPrecision, 'sample'); 
                   quatText = quatText + '%'; 
 
               } 
               this.root.select('.svgScrollable > .axisGraphicsContext') 
                   .append('text') 
                   .classed('quatLabels', true) 
                   .attr('x', xAxisValue) 
                   .attr('y', yAxisValue) 
                   .attr('text-anchor', 'middle') 
                   .attr('font-size', quaternaryLabelSettings.fontSize) 
                   .text(quatText); 
           } 
           //fifth 
           value=this.dataViews[5] && this.dataViews[5].categorical && this.dataViews[5].categorical.values 
           if (value) { 
               let formatString = '0'; 
               formatString = value[0].source.format; 
               let formatter = valueFormatter.create({ format: formatString, value: FifthLabelSettings.displayUnits, precision: FifthLabelSettings.textPrecision }); 
               let formattedFifthText; 
               if (tempAggregatedfifthValues[len] !== null) { 
                   formattedFifthText = formatter.format(tempAggregatedfifthValues[len]); 
               } 
               else { 
                   formattedFifthText = "0" 
               } 
 
               yAxisValue = yAxisValue - 27; 
 
               let fiveDatatextProperties: TextProperties = { 
                   text: formattedFifthText, 
                   fontFamily: "Segoe UI", 
                   fontSize: FifthLabelSettings.fontSize + 'px' 
               }; 
               let fiveText = TextMeasurementService.getTailoredTextOrDefault(fiveDatatextProperties, barWidthValue); 
               let fivelength = fiveText.length; 
               if (fiveText[fivelength - 1] == '%') { 
                   fiveText = this.format(parseFloat(tempAggregatedfifthValues[len]) * 100, 1, FifthLabelSettings.textPrecision, 'sample'); 
                   fiveText = fiveText + '%'; 
 
               } 
               this.root.select('.svgScrollable > .axisGraphicsContext') 
                   .append('text') 
                   .classed('fiveLabels', true) 
                   .attr('x', xAxisValue) 
                   .attr('y', yAxisValue) 
                   .attr('text-anchor', 'middle') 
                   .attr('font-size', FifthLabelSettings.fontSize) 
                   .text(fiveText); 
           } 
            
           //sixth 
           value=this.dataViews[6] && this.dataViews[6].categorical && this.dataViews[6].categorical.values 
           if (value) { 
               let formatString = '0'; 
               formatString = value[0].source.format; 
               let formatter = valueFormatter.create({ format: formatString, value: SixthLabelSettings.displayUnits, precision: SixthLabelSettings.textPrecision }); 
               let formattedSixthText; 
               if (tempAggregatedsixthValues[len] !== null) { 
                   formattedSixthText = formatter.format(tempAggregatedsixthValues[len]); 
               } 
               else { 
                   formattedSixthText = "0" 
               } 
 
               yAxisValue = yAxisValue - 27; 
 
               let SixDatatextProperties: TextProperties = { 
                   text: formattedSixthText, 
                   fontFamily: "Segoe UI", 
                   fontSize: SixthLabelSettings.fontSize + 'px' 
               }; 
               let SixText = TextMeasurementService.getTailoredTextOrDefault(SixDatatextProperties, barWidthValue); 
               let Sixlength = SixText.length; 
               if (SixText[Sixlength - 1] == '%') { 
                   SixText = this.format(parseFloat(tempAggregatedsixthValues[len]) * 100, 1, SixthLabelSettings.textPrecision, 'sample'); 
                   SixText = SixText + '%'; 
 
               } 
               this.root.select('.svgScrollable > .axisGraphicsContext') 
                   .append('text') 
                   .classed('sixLabels', true) 
                   .attr('x', xAxisValue) 
                   .attr('y', yAxisValue) 
                   .attr('text-anchor', 'middle') 
                   .attr('font-size', SixthLabelSettings.fontSize) 
                   .text(SixText); 
           } 
           len--; 
       } 
 
       this.root.selectAll('.svgScrollable > .axisGraphicsContext > .totalLabels').style('fill', totalLabelSettings.color); 
       this.root.selectAll('.svgScrollable > .axisGraphicsContext > .secLabels').style('fill', secondaryLabelSettings.color); 
       this.root.selectAll('.svgScrollable > .axisGraphicsContext > .terLabels').style('fill', tertiaryLabelSettings.color); 
       this.root.selectAll('.svgScrollable > .axisGraphicsContext > .quatLabels').style('fill', quaternaryLabelSettings.color); 
       this.root.selectAll('.svgScrollable > .axisGraphicsContext > .fiveLabels').style('fill', FifthLabelSettings.color); 
       this.root.selectAll('.svgScrollable > .axisGraphicsContext > .sixLabels').style('fill', SixthLabelSettings.color); 
       //total, secondary, tertiary and quarternary five ,six 
 
       if (!this.data) 
           return; 
       if (this.viewportIn.width > 0 && this.viewportIn.height > 0) { 
           this.mainGraphicsContext.attr('width', this.viewportIn.width) 
               .attr('height', (this.viewportIn.height)); 
           let isBarChart = EnumExtensions.hasFlag(this.chartType, flagBar); 
           if (!resize) { 
               if (isBarChart) { 
                   //let xZeroTick = this.xAxisGraphicsContext; 
                   let xTransform = this.xAxisGraphicsContext.attr('transform'); 
                   let height: number = 0; 
                   if (isNaN((parseInt(xTransform.split(' ')[1])))) { 
                       height = (parseInt(xTransform.split(',')[1])); 
                   } 
                   else { 
                       height = (parseInt(xTransform.split(' ')[1])); 
                   } 
                   this.mainGraphicsContext 
                       .attr('height', height); 
               } 
               else { 
                   let yZeroTick = this.y1AxisGraphicsContext.selectAll('g.tick').filter((data) => data === 0); 
                   if (yZeroTick[0].length != 0) { 
                       let yTransform = yZeroTick.attr('transform'); 
                       let height: number = 0; 
                       if (isNaN((parseInt(yTransform.split(' ')[1])))) { 
                           height = (parseInt(yTransform.split(',')[1])); 
                       } 
                       else { 
                           height = (parseInt(yTransform.split(' ')[1])); 
                       } 
                       this.mainGraphicsContext 
                           .attr('height', height); 
                   } 
 
               } 
           } 
       } 
       else { 
           this.mainGraphicsContext.attr('width', 0) 
               .attr('height', 0); 
       } 
 
       let isLegendPresent = false; 
       let legendPosition = parseFloat(this.root.select('.legend').attr('orientation')); 
       let customTitleHeight = parseFloat(this.root.select('.Title_Div_Text').style('height')); 
       let isBarChart = EnumExtensions.hasFlag(this.chartType, flagBar); 
       let legendHeight1 = parseFloat(this.root.select('.legend').style('height')) - 20; 
       customTitleHeight = PixelConverter.fromPointToPixel(customTitleHeight); 
       legendHeight1 = PixelConverter.fromPointToPixel(legendHeight1); 
       if (isNaN(legendHeight1) || !(0 === legendPosition || 5 === legendPosition || 1 === legendPosition || 6 === legendPosition) || !this.legendObjectProperties['show'] || !this.isLegendValue) { 
 
           legendHeight1 = 0; 
       } 
       let dvmcolumns=this.dataViews[0].metadata.columns 
       let columnlength=dvmcolumns.length 
       for (let i = 0; i < columnlength; i++) { 
           if (dvmcolumns[i].roles.hasOwnProperty('Series')) { 
               isLegendPresent = true; 
               break; 
           } 
           else { 
               isLegendPresent = false; 
           } 
       } 
       if (this.isSecondaryMeasure && isLegendPresent) { 
           this.svg.selectAll('.mainGraphicsContext').attr('transform', 'translate(0, 40)'); 
           this.xAxisGraphicsContext 
               .attr('transform', manipulation.translate(0, this.viewportIn.height + 40)); 
           this.y1AxisGraphicsContext 
               .attr('transform', manipulation.translate(showY1OnRight ? this.viewportIn.width : 0, 40)); 
       } 
       else { 
       
           this.svg.selectAll('.mainGraphicsContext').attr('transform', 'translate(0, 20)'); 
           this.xAxisGraphicsContext 
               .attr('transform', manipulation.translate(0, this.viewportIn.height + 20)) 
               .attr('text-anchor', 'middle'); 
           this.y1AxisGraphicsContext 
               .attr('transform', manipulation.translate(showY1OnRight ? this.viewportIn.width : 0, 20)); 
 
       } 
       if (((this.isSecondaryMeasure && isLegendPresent) || (!this.isSecondaryMeasure && isLegendPresent)) && isBarChart) { 
           this.axisGraphicsContext.attr('transform', manipulation.translate(this.margin.left, -10 - customTitleHeight + 33.333 - legendHeight1 + 67 - 40)); 
       } 
       else if (((this.isSecondaryMeasure && isLegendPresent) || (!this.isSecondaryMeasure && isLegendPresent)) && !isBarChart) { 
           this.axisGraphicsContext.attr('transform', manipulation.translate(this.margin.left, -10)); 
       } 
       else if (!isLegendPresent && isBarChart) { 
           this.axisGraphicsContext.attr('transform', manipulation.translate(this.margin.left, -10 - customTitleHeight + 33.33)); 
       } 
       else { 
           this.axisGraphicsContext.attr('transform', manipulation.translate(this.margin.left, -10)); 
       } 
 
       if (this.legendObjectProperties && (this.legendObjectProperties['position'] === 'Left' || this.legendObjectProperties['position'] === 'LeftCenter' || this.legendObjectProperties['position'] === 'Right' || this.legendObjectProperties['position'] === 'RightCenter')) { 
           this.svg.selectAll('.mainGraphicsContext').attr('transform', 'translate(0, 20)'); 
           this.xAxisGraphicsContext 
               .attr('transform', manipulation.translate(0, this.viewportIn.height + 20)); 
           this.y1AxisGraphicsContext 
               .attr('transform', manipulation.translate(showY1OnRight ? this.viewportIn.width : 0, 20)); 
 
           if (((this.isSecondaryMeasure && isLegendPresent) || (!this.isSecondaryMeasure && isLegendPresent)) && isBarChart) { 
               this.axisGraphicsContext.attr('transform', manipulation.translate(this.margin.left, -10 - customTitleHeight + 33.333)); // 33.33 = initial Title Height 
           } 
           else if (((this.isSecondaryMeasure && isLegendPresent) || (!this.isSecondaryMeasure && isLegendPresent)) && !isBarChart) { 
               this.axisGraphicsContext.attr('transform', manipulation.translate(this.margin.left, -10)); 
           } 
           else { 
               this.axisGraphicsContext.attr('transform', manipulation.translate(this.margin.left, -10)); 
           } 
       } 
       let legendHeight = parseFloat(this.root.select('.legend').style('height')) - 20; 
       if (isNaN(legendHeight) || !(0 === legendPosition || 5 === legendPosition || 1 === legendPosition || 6 === legendPosition) || !this.legendObjectProperties['show'] || !this.isLegendValue) { 
           legendHeight = 0; 
           if (!this.legendObjectProperties['show']) { 
               this.root.select('.navArrow').remove(); 
           } 
           if (!this.legendObjectProperties['show']) { 
               this.root.select('.legend').style({ 'display': 'none' }); 
           } 
       } 
       if (legendPosition === 0 || legendPosition === 5) { 
           this.svg.style('margin-top', legendHeight + 'px'); 
       } 
 
       behaviorOptions = { 
           datapoints: globalallDataPoints, 
           bars: columnChartDrawInfo.shapesSelection, 
           hasHighlights: data.hasHighlights, 
           mainGraphicsContext: this.mainGraphicsContext, 
           viewport: columnChartDrawInfo.viewport, 
           axisOptions: columnChartDrawInfo.axisOptions, 
           showLabel: data.labelSettings.show 
       }; 
       this.addUnitTypeToAxisLabel(this.xAxisProperties, this.yAxisProperties); 
       (manipulation as any).flushAllD3TransitionsIfNeeded?.(this.options); 
 
       return { dataPoints: globalallDataPoints, behaviorOptions: behaviorOptions, labelDataPoints: columnChartDrawInfo.labelDataPoints, labelsAreNumeric: true }; 
   } 
 
   public spliceMeasures(measure: any[]) { 
       if (this.removeFlags.length) { 
           for (let i = 0; i < this.removeFlags.length; i++) { 
               measure.splice(this.removeFlags[i], 1); 
           } 
       } 
   } 
 
   private getMaxMarginFactor(): number { 
 
       return 0.25; 
   } 
 
   private hideAxisLabels(): boolean { 
       if (this.cartesianSmallViewPortProperties) { 
           if (this.cartesianSmallViewPortProperties.hideAxesOnSmallViewPort 
               && ((this.viewport.height) < this.cartesianSmallViewPortProperties.MinHeightAxesVisible) 
               && !this.options.interactivity.isInteractiveLegend) { 
               return true; 
           } 
       } 
       return false; 
   } 
 
   private renderBackground() { 
       this.backgroundGraphicsContext 
           .attr('width', 0) 
           .attr('height', 0); 
   } 
 
   private renderChart( 
       mainAxisScale: any, 
       xAxis: IAxisProperties, 
       yAxis: IAxisProperties, 
       tickLabelMargins: any, 
       chartHasAxisLabels: boolean, 
       axisLabels: ChartAxesLabels, 
       suppressAnimations: boolean) 
      { 
 
       // d3 v3 -> v7: axes returned by AxisHelper.createAxis are d3 v7 axis 
       // generators (axisBottom / axisLeft). The legacy render code calls 
       // `axis.orient(...)`, which existed in d3 v3 but was removed in v4+. 
       // Without this, `axis.orient is not a function` throws here and aborts 
       // the whole render -> the chart shows no bars/axes (blank visual). 
       // In d3 v7 the orientation is fixed when the axis is created, so we add 
       // a no-op `orient` that returns the axis to preserve method chaining. 
       [xAxis, yAxis].forEach((axisProps: any) => { 
           if (axisProps && axisProps.axis && typeof axisProps.axis.orient !== "function") { 
               axisProps.axis.orient = () => axisProps.axis; 
           } 
       }); 
 
       let bottomMarginLimit = this.bottomMarginLimit; 
       let xFontSize: any; 
       xFontSize = this.categoryAxisProperties['fontSize'] 
       xFontSize = PixelConverter.fromPointToPixel(xFontSize); 
       let leftRightMarginLimit = this.leftRightMarginLimit; 
       let duration = AnimatorCommon.GetAnimationDuration(this.animator, suppressAnimations); 
       this.renderBackground(); 
     //  let isBarChart = EnumExtensions.hasFlag(this.chartType, flagBar); 
       let textProps: TextProperties = { 
           fontSize: xFontSize, 
           fontFamily: 'Arial Black', 
           text: xAxis.values[0] 
       }; 
       // let maxwidth = TextMeasurementService.measureSvgTextWidth(textProps,xAxis.values[0]); 
       let width = TextMeasurementService.getTailoredTextOrDefault(textProps,500) 
       //let width12 = width.length*2 > bottomMarginLimit/Math.sin(-35) ? bottomMarginLimit/Math.sin(-35) : width.length*2 
        
       xAxis.axis.orient("bottom"); 
       if (!xAxis.willLabelsFit) 
           xAxis.axis.tickPadding(10); 
 
       let textWrapSettings: textWrapSettings = this.getTextWrapSettings(this.dataViews[0]); 
 
       if (textWrapSettings.show) { 
           xAxis.willLabelsWordBreak = true; 
       } 
       else { 
           xAxis.willLabelsWordBreak = false; 
       } 
 
       let xAxisGraphicsElement = this.xAxisGraphicsContext; 
       if (duration) { 
           xAxisGraphicsElement 
               .transition() 
               .duration(duration) 
               .call(xAxis.axis) 
               .call(this.darkenZeroLine as any); 
       } 
       else { 
           xAxisGraphicsElement 
               .call(xAxis.axis) 
               .call(this.darkenZeroLine as any); 
       } 
       xAxisGraphicsElement.selectAll('.zero-line').style('fill', 'black').style('display', 'initial'); 
       let xZeroTick = xAxisGraphicsElement.selectAll('g.tick').filter((data) => data === 0); 
       let xAllTicks = xAxisGraphicsElement.selectAll('g.tick'); 
 
       let font_size = Number(this.categoryAxisProperties['fontSize']) ? Number(this.categoryAxisProperties['fontSize']) : 11 
        
       xAllTicks.selectAll('text').style('fill', this.getCategoryAxisFill().solid.color).style('font-size',font_size); 
 
     // let isBarChart = EnumExtensions.hasFlag(this.chartType, flagBar); 
       if (xZeroTick) { 
           let xZeroColor = this.getValueAxisFill(); 
           if (xZeroColor) { 
               xZeroTick.selectAll('line').style({ 'fill': xZeroColor.solid.color }) 
               xAllTicks.selectAll('line').style({ 'fill': xZeroColor.solid.color }) 
           } 
       } 
 
       let xAxisTextNodes = xAxisGraphicsElement.selectAll('text') 
 
       if (xAxis.willLabelsWordBreak) { 
           xAxisTextNodes 
               .call(AxisHelper.LabelLayoutStrategy.wordBreak, xAxis, bottomMarginLimit); 
 
       } else { 
           let maxfinal = this.categoryAxisProperties['fontSize'] > 11 ? 50 : bottomMarginLimit 
           xAxisTextNodes 
               .call(AxisHelper.LabelLayoutStrategy.rotate, 
                   maxfinal, 
                   TextMeasurementService.getTailoredTextOrDefault, 
                   CartesianChartGMO.AxisTextProperties, 
                   !xAxis.willLabelsFit && AxisHelper.isOrdinalScale(xAxis.scale), 
                   bottomMarginLimit === tickLabelMargins.top, 
                   xAxis, 
                   this.margin, 
                   this.isXScrollBarVisible || this.isYScrollBarVisible); 
       } 
       if (!duration) { 
           xAxisGraphicsElement.selectAll('text') 
               .append('title') 
               .text((d, i) => xAxis.values[i]); 
       } 
       xAxisGraphicsElement.selectAll('g.tick').selectAll('line').style({ 'display': 'block', 'fill': 'black' }) 
 
       if (this.shouldRenderAxis(xAxis)) { 
           this.xAxisGraphicsContext.selectAll('*').style('visibility', 'visible'); 
 
       } 
       else { 
           this.xAxisGraphicsContext.selectAll('*').style('visibility', 'hidden'); 
       } 
 
       if (this.shouldRenderAxis(yAxis)) { 
           let yAxisOrientation = this.yAxisOrientation; 
           let formatPercent = d3.format(".0%"); 
 
           yAxis.axis 
               .tickSize(-this.viewportIn.width) 
               .tickPadding(10) 
               .orient(yAxisOrientation.toLowerCase()) 
               .tickFormat(formatPercent); 
 
           let y1AxisGraphicsElement = this.y1AxisGraphicsContext; 
           if (duration) { 
               y1AxisGraphicsElement 
                   .transition() 
                   .duration(duration) 
                   .call(yAxis.axis) 
                   .call(this.darkenZeroLine as any); 
           } 
           else { 
               y1AxisGraphicsElement 
                   .call(yAxis.axis) 
                   .call(this.darkenZeroLine); 
           } 
           let yZeroTick = y1AxisGraphicsElement.selectAll('g.tick').filter((data) => data === 0); 
           let yAllTicks = y1AxisGraphicsElement.selectAll('g.tick'); 
           yAllTicks.selectAll('text').style('fill', this.getValueAxisFill().solid.color).style('font-size', 10); 
 
           if (yZeroTick) { 
               yZeroTick.selectAll('line').attr('y2', 1); 
               yAllTicks.selectAll('line').style({ 'stroke': 'rgb(119, 119, 119)', 'opacity': '0.3' }) 
               yZeroTick.selectAll('line').style({ 'stroke': 'rgb(119, 119, 119)', 'opacity': '0.8' }) 
               let yZeroColor = "rgb(119, 119, 119)"; 
               if (yZeroColor) { 
                   yZeroTick.selectAll('line').style({ 'stroke': yZeroColor }) 
                   yAllTicks.selectAll('line').style({ 'stroke': yZeroColor }) 
               } 
           } 
           if (tickLabelMargins.left >= leftRightMarginLimit) { 
               y1AxisGraphicsElement.selectAll('text') 
                   .call(AxisHelper.LabelLayoutStrategy.clip, 
                       // Can't use padding space to render text, so subtract that from available space for ellipses calculations 
                       leftRightMarginLimit - 40, 
                       TextMeasurementService.svgEllipsis); 
           } 
 
       } 
       else { 
           this.y1AxisGraphicsContext.selectAll('*').remove(); 
       } 
       // Axis labels 
 
       if (chartHasAxisLabels) { 
           let hideXAxisTitle = !this.shouldRenderAxis(xAxis, "showAxisTitle"); 
           let hideYAxisTitle = !this.shouldRenderAxis(yAxis, "showAxisTitle"); 
           let hideY2AxisTitle = this.valueAxisProperties["secShowAxisTitle"] === false; 
           this.renderAxesLabels(axisLabels, this.legend.getMargins().height, hideXAxisTitle, hideYAxisTitle, hideY2AxisTitle); 
       } 
       else { 
           this.axisGraphicsContext.selectAll('.xAxisLabel').remove(); 
           this.axisGraphicsContext.selectAll('.yAxisLabel').remove(); 
       } 
   } 
   private darkenZeroLine(g: Selection<any>): void { 
       let zeroTick = g.selectAll('g.tick').filter((data) => data === 0).node(); 
       if (zeroTick) { 
           d3.select(zeroTick).select('line').classed('zero-line', true); 
       } 
   } 
   private getValueAxisFill(): Fill { 
       if (this.dataView&&this.dataView.metadata.objects) { 
           let label = this.dataView.metadata.objects['valueAxis']; 
           if (label&&label['labelColor']) 
               return <Fill>label['labelColor']; 
       } 
 
       return { solid: { color: "rgb(119, 119, 119)" } }; 
   } 
 
   private getCategoryAxisFill(): Fill { 
       if (this.dataView&&this.dataView.metadata.objects) { 
           let label = this.dataView.metadata.objects['categoryAxis']; 
           if (label&&label['labelColor']) { 
               return <Fill>label['labelColor']; 
           } 
       } 
       return { solid: { color: 'rgb(119, 119, 119)' } }; 
   } 
   private renderAxesLabels(axisLabels: ChartAxesLabels, legendMargin: number, hideXAxisTitle: boolean, hideYAxisTitle: boolean, hideY2AxisTitle: boolean): void { 
       this.axisGraphicsContext.selectAll('.xAxisLabel').remove(); 
       this.axisGraphicsContext.selectAll('.yAxisLabel').remove(); 
       let legendPosition = parseFloat(this.root.select('.legend').attr('orientation')); 
       let margin = this.margin; 
       let width = this.viewportIn.width; 
       let height = this.viewportIn.height; 
       let fontSize = Visual.AxisFontSize; 
       let yAxisOrientation = this.yAxisOrientation; 
       let showY1OnRight = yAxisOrientation === yAxisPosition.right; 
       let isBarChart = EnumExtensions.hasFlag(this.chartType, flagBar); 
       let legendHeight = parseFloat(this.root.select('.legend').style('height')) - 20; 
       let translateHeight; 
       if (isBarChart) { 
           translateHeight += 25; 
       } 
       if (!this.legendObjectProperties["show"]) { 
           translateHeight = Visual.totalHeight - 26; 
       } 
       else if (legendPosition === 1 || legendPosition == 6) { 
           translateHeight = Visual.totalHeight - 45 - legendHeight; 
           this.root.select('.legend').style({ 'padding-top': '10px' }); 
       } 
       else { 
           translateHeight = Visual.totalHeight - 26 - legendHeight; 
       } 
       if (!hideXAxisTitle) { 
           let xAxisLabel = this.axisGraphicsContext.append("text") 
               .style({ "text-anchor": "middle", "display": "block", "fill": this.getCategoryAxisFill().solid.color, "font-size": 12 }) 
               .text(axisLabels.y) 
               .call((text: Selection<any>) => { 
                   text.each(function () { 
                       let text = d3.select(this); 
                       text.attr({ 
 
                           "class": "xAxisLabel", 
                           "transform": manipulation.translate(width / 2 - 10, translateHeight) 
 
                       }); 
                   }); 
               }); 
           xAxisLabel.call(AxisHelper.LabelLayoutStrategy.clip, 
               width, 
               TextMeasurementService.svgEllipsis); 
       } 
 
       if (!hideYAxisTitle) { 
           let yAxisLabel = this.axisGraphicsContext.append("text") 
               .style({ "text-anchor": "middle", "fill": this.getValueAxisFill().solid.color, "font-size": 12 }) 
               .text(axisLabels.x) 
               .call((text: Selection<any>) => { 
                   text.each(function () { 
                       let text = d3.select(this); 
                       text.attr({ 
 
                           "class": "yAxisLabel", 
                           "transform": "rotate(-90)", 
                           "y": showY1OnRight ? width + margin.right - fontSize : -margin.left, 
                           "x": -((height - margin.top - legendMargin) / 2 + 50), 
                           "dy": "1em" 
                       }); 
 
                   }); 
               }); 
           yAxisLabel.call(AxisHelper.LabelLayoutStrategy.clip, 
               height - (margin.bottom + margin.top), 
               TextMeasurementService.svgEllipsis); 
       } 
 
       if (!hideY2AxisTitle && axisLabels.y2) { 
           let y2AxisLabel = this.axisGraphicsContext.append("text") 
               .style("text-anchor", "middle") 
               .text(axisLabels.y2) 
               .call((text: Selection<any>) => { 
                   text.each(function () { 
                       let text = d3.select(this); 
                       text.attr({ 
 
                           "class": "yAxisLabel", 
                           "transform": "rotate(-90)", 
                           "y": showY1OnRight ? -margin.left : width + margin.right - fontSize, 
                           "x": -((height - margin.top - legendMargin) / 2), 
                           "dy": "1em" 
                       }); 
 
                   }); 
               }); 
           y2AxisLabel.call(AxisHelper.LabelLayoutStrategy.clip, 
               height - (margin.bottom + margin.top), 
               TextMeasurementService.svgEllipsis); 
       } 
   } 
   private adjustMargins(): void { 
       // Adjust margins if ticks are not going to be shown on either axis 
       let xAxis = $(this.element).find('.x.axis'); 
 
       if ((AxisHelper.getRecommendedNumberOfTicksForXAxis(this.viewportIn.width) as number) === 0 
           && (AxisHelper.getRecommendedNumberOfTicksForYAxis(this.viewportIn.height) as number) === 0) { 
           this.margin = { 
               top: 0, 
               right: 0, 
               bottom: 0, 
               left: 0 
           }; 
           xAxis.hide(); 
       } else { 
           xAxis.show(); 
       } 
   } 
 
   private updateAxis(): void { 
 
       let totalLabelSettings: totalLabelSettings = this.getTotalLabelSettings(this.dataViews[0]); 

       let legendPosition = parseFloat(this.root.select('.legend').attr('orientation')); 
       let customTitleHeight = this.root.select('.Title_Div_Text') && this.root.select('.Title_Div_Text').style('height') && parseFloat(this.root.select('.Title_Div_Text').style('height')); 
       if (isNaN(customTitleHeight)) { 
           customTitleHeight = 0; 
       } 
       let legendHeight = parseFloat(this.root.select('.legend').style('height')) - 20; 
 
       let legendWidth = parseFloat(this.root.select('.legend').style('width')); 
 
       let numberOfMeasures = (totalLabelSettings.show ? 1 : 0) + 
           (this.dataViews[1] && this.dataViews[1].categorical && this.dataViews[1].categorical.values ? 1 : 0) + 
           (this.dataViews[3] && this.dataViews[3].categorical && this.dataViews[3].categorical.values ? 1 : 0) + 
           (this.dataViews[4] && this.dataViews[4].categorical && this.dataViews[4].categorical.values ? 1 : 0) 
           + (this.dataViews[5] && this.dataViews[5].categorical && this.dataViews[5].categorical.values ? 1 : 0) + 
           (this.dataViews[6] && this.dataViews[6].categorical && this.dataViews[6].categorical.values ? 1 : 0) 
 
       let customHeight; 
 
       switch (numberOfMeasures) { 
           case 0: customHeight = 0; 
               break; 
           case 1: customHeight = 25; 
               break; 
           case 2: customHeight = 50; 
               break; 
           case 3: customHeight = 75; 
               break; 
           case 4: customHeight = 100; 
               break; 
           case 5: customHeight = 125; 
               break; 
           case 6: customHeight = 150; 
               break; 
       } 
 
       if (isNaN(legendHeight) || isNaN(legendWidth) || 0 === legendWidth || !(0 === legendPosition || 5 === legendPosition || 1 === legendPosition || 6 === legendPosition) || !this.legendObjectProperties['show'] || !this.isLegendValue) { 
           legendHeight = 0; 
       } 
       customTitleHeight = PixelConverter.fromPointToPixel(customTitleHeight); 
       legendHeight = PixelConverter.fromPointToPixel(legendHeight); 
       this.adjustMargins(); 
       if (this.viewportIn.height < (customTitleHeight + legendHeight + customHeight)) { 
           this.viewportIn.height = (customTitleHeight + legendHeight + customHeight) - this.viewportIn.height; 
       } 
       else { 
           this.viewportIn.height -= (customTitleHeight + legendHeight + customHeight); 
       } 
       let yAxisOrientation = this.yAxisOrientation; 
      // let showY1OnRight = yAxisOrientation === yAxisPosition.right; 
 
       let heightDifference = this.viewport.height - legendHeight; 
       if (heightDifference < 0) { 
           heightDifference = legendHeight - this.viewport.height; 
       } 
       let widthDifference = this.viewport.width - legendWidth; 
       if (widthDifference < 0) { 
           widthDifference = -(this.viewport.width - legendWidth); 
       } 
 
       this.svg.attr({ 
           'width': this.viewport.width, 
           'height': heightDifference 
       }); 
 
       this.svgScrollable.attr({ 
           'width': this.viewport.width, 
           'height': heightDifference 
       }); 
 
       if (this.legendObjectProperties && (this.legendObjectProperties['position'] === 'Right' || this.legendObjectProperties['position'] === 'RightCenter')) { 
           this.svgScrollable.attr({ 
               'width': widthDifference, 
               'height': heightDifference 
           }); 
       } 
       this.svgScrollable.attr({ 
           'x': 0 
       }); 
       this.axisGraphicsContextScrollable.attr('transform', manipulation.translate(this.margin.left, -10 + customHeight)); 
 
       if (this.isXScrollBarVisible) { 
           this.svgScrollable.attr({ 
               'x': this.margin.left 
           }); 
           this.axisGraphicsContextScrollable.attr('transform', manipulation.translate(0, this.margin.top)); 
           this.svgScrollable.attr('width', this.viewportIn.width); 
           this.svg.attr('width', this.viewport.width) 
               .attr('height', this.viewport.height + this.ScrollBarWidth); 
       } 
       else if (this.isYScrollBarVisible) { 
           this.svgScrollable.attr('height', this.viewportIn.height + this.margin.top); 
           this.svg.attr('width', this.viewport.width + this.ScrollBarWidth) 
               .attr('height', this.viewport.height); 
       } 
   } 
 
   private getUnitType(xAxis: IAxisProperties) { 
       if (xAxis.formatter && 
           xAxis.formatter.displayUnit && 
           xAxis.formatter.displayUnit.value > 1) 
           return xAxis.formatter.displayUnit.title; 
       return null; 
   } 
 
   private addUnitTypeToAxisLabel(xAxis: IAxisProperties, yAxis: IAxisProperties): void { 
       let unitType = this.getUnitType(xAxis); 
       if (xAxis.isCategoryAxis) { 
           this.categoryAxisHasUnitType = unitType !== null; 
       } 
       else { 
           this.valueAxisHasUnitType = unitType !== null; 
       } 
 
       if (xAxis.axisLabel && unitType) { 
           if (xAxis.isCategoryAxis) { 
               xAxis.axisLabel = AxisHelper.createAxisLabel(this.categoryAxisProperties, xAxis.axisLabel, unitType); 
           } 
           else { 
               xAxis.axisLabel = AxisHelper.createAxisLabel(this.valueAxisProperties, xAxis.axisLabel, unitType); 
           } 
       } 
 
       unitType = this.getUnitType(yAxis); 
 
       if (!yAxis.isCategoryAxis) { 
           this.valueAxisHasUnitType = unitType !== null; 
       } 
       else { 
           this.categoryAxisHasUnitType = unitType !== null; 
       } 
 
       if (yAxis.axisLabel && unitType) { 
           if (!yAxis.isCategoryAxis) { 
               yAxis.axisLabel = AxisHelper.createAxisLabel(this.valueAxisProperties, yAxis.axisLabel, unitType); 
           } 
           else { 
               yAxis.axisLabel = AxisHelper.createAxisLabel(this.categoryAxisProperties, yAxis.axisLabel, unitType); 
           } 
       } 
   } 
 
   public onClearSelection(): void { 
       if (this.interactivityService) { 
           this.interactivityService.clearSelection(); 
       } 
   } 
 
   public static getLabelFill(labelColor: string, isInside: boolean, isCombo: boolean): string { 
       if (labelColor) { 
           return labelColor; 
       } 
       if (isInside && !isCombo) { 
           return NewDataLabelUtils.defaultInsideLabelColor; 
       } 
       return NewDataLabelUtils.defaultLabelColor; 
   } 
   public getLegendDispalyUnits(dataView: DataView, propertyName: string) { 
       let property: any = [], displayOption; 
       if (dataView && dataView.metadata && dataView.metadata.objects) { 
           if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('legend')) { 
               property = dataView.metadata.objects['legend']; 
               if (property && property.hasOwnProperty(propertyName)) { 
                   displayOption = property[propertyName]; 
               } 
               else if (propertyName === 'labelDisplayUnits') 
                   displayOption = 0; 
               else if (propertyName === 'position') 
                   displayOption = "top"; 
           } 
           else if (propertyName === 'labelDisplayUnits') 
               displayOption = 0; 
           else if (propertyName === 'position') 
               displayOption = "top"; 
       } else if (propertyName === 'labelDisplayUnits') 
           displayOption = 0; 
       else if (propertyName === 'position') 
           displayOption = "top"; 
       return displayOption; 
   } 
} 
 
} 

export import Visual = powerbi.extensibility.visual.Visual; 
