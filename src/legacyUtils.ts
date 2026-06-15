// @ts-nocheck
import powerbi from "powerbi-visuals-api";
import * as d3 from "d3";
import { drag as d3Drag } from "d3-drag";
import { pointer as d3Pointer, select as d3Select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import * as chartUtils from "powerbi-visuals-utils-chartutils";
import * as colorUtils from "powerbi-visuals-utils-colorutils";
import * as dataviewUtils from "powerbi-visuals-utils-dataviewutils";
import * as formattingUtils from "powerbi-visuals-utils-formattingutils";
import * as interactivityLegacy from "powerbi-visuals-utils-interactivityutils/lib/interactivityService";
import * as svgUtils from "powerbi-visuals-utils-svgutils";
import * as typeUtils from "powerbi-visuals-utils-typeutils";
import * as tooltipUtils from "powerbi-visuals-utils-tooltiputils";

class LegendBehaviorImpl implements interactivityLegacy.IInteractiveBehavior {
    public static dimmedLegendColor = "#bfbfbf";
    private options: powerbi.extensibility.utils.chart.legend.LegendBehaviorOptions;

    public bindEvents(
        options: powerbi.extensibility.utils.chart.legend.LegendBehaviorOptions,
        selectionHandler: interactivityLegacy.ISelectionHandler
    ): void {
        this.options = options;
        options.legendItems.on("click", (event: MouseEvent, d: interactivityLegacy.SelectableDataPoint) => {
            selectionHandler.handleSelection(d, event.ctrlKey);
            event.stopPropagation();
        });
        options.clearCatcher.on("click", () => {
            selectionHandler.handleClearSelection();
        });
    }

    public renderSelection(hasSelection: boolean): void {
        if (!this.options?.legendItems) {
            return;
        }
        this.options.legendItems.style("opacity", (d: interactivityLegacy.SelectableDataPoint) =>
            (hasSelection && !d.selected) ? 0.2 : 0.8);
    }
}

const legacyD3 = d3 as typeof d3 & {
    mouse: (container: any) => [number, number];
    behavior: { drag: () => ReturnType<typeof d3Drag> };
    scale: { Linear: typeof scaleLinear };
};

let lastPointerEvent: MouseEvent | TouchEvent | PointerEvent | null = null;
if (typeof document !== "undefined") {
    const trackPointer = (event: MouseEvent | TouchEvent | PointerEvent) => {
        lastPointerEvent = event;
    };
    document.addEventListener("mousemove", trackPointer, true);
    document.addEventListener("mousedown", trackPointer, true);
    document.addEventListener("touchstart", trackPointer, true);
    document.addEventListener("touchmove", trackPointer, true);
    document.addEventListener("pointermove", trackPointer, true);
}

(legacyD3 as any).select = d3Select;
legacyD3.mouse = (container: any) => {
    if (lastPointerEvent) {
        return d3Pointer(lastPointerEvent, container) as [number, number];
    }
    return [0, 0];
};
legacyD3.behavior = {
    drag: () => d3Drag(),
};
legacyD3.scale = {
    Linear: scaleLinear,
};

const legacyPowerbi = (globalThis as typeof globalThis & { powerbi?: typeof powerbi }).powerbi ??= powerbi;
legacyPowerbi.extensibility ??= {} as any;
legacyPowerbi.extensibility.utils ??= {} as any;

const legacyUtilsRoot = legacyPowerbi.extensibility.utils as Record<string, any>;

legacyUtilsRoot.dataview = {
    converterHelper: dataviewUtils.converterHelper,
    DataViewObjects: dataviewUtils.dataViewObjects,
    DataViewObject: dataviewUtils.dataViewObject,
};
legacyUtilsRoot.tooltip = tooltipUtils;
legacyUtilsRoot.type = {
    ValueType: typeUtils.valueType.ValueType,
    Double: typeUtils.double,
    Prototype: typeUtils.prototype,
    EnumExtensions: typeUtils.enumExtensions,
    PixelConverter: typeUtils.pixelConverter,
};
legacyUtilsRoot.formatting = formattingUtils;
legacyUtilsRoot.interactivity = interactivityLegacy;
legacyUtilsRoot.color = colorUtils;
legacyUtilsRoot.svg = {
    ...svgUtils,
    translate: svgUtils.manipulation.translate,
    createArrow: svgUtils.manipulation.createArrow,
    shapes: {
        ...svgUtils.shapes,
        Rect: svgUtils.Rect,
    },
};


legacyUtilsRoot.CartesianHelper = {
    getCategoryAxisProperties(metadata: any) {
        return metadata?.objects?.categoryAxis ?? metadata?.objects?.xAxis ?? {};
    },
    getValueAxisProperties(metadata: any) {
        return metadata?.objects?.valueAxis ?? metadata?.objects?.yAxis ?? {};
    },
    isScalar(isScalar: boolean, xAxisCardProperties: any) {
        if (typeof isScalar === "boolean") {
            return isScalar;
        }

        return !!xAxisCardProperties?.axisType || !!xAxisCardProperties?.isScalar;
    },
    getPrecision(precision: any) {
        return precision == null ? null : precision;
    },
    lookupXValue(data: any, index: number, type: any, isScalar: boolean) {
        if (!data) {
            return undefined;
        }

        if (isScalar) {
            return data.categories?.[index]?.value ?? data.categories?.[index];
        }

        return index;
    },
};
legacyUtilsRoot.chart = {
    axis: Object.assign({}, chartUtils.axis, {
        scale: chartUtils.axisScale,
        style: chartUtils.axisStyle,
    }),
    dataLabel: {
        VisualDataLabelsSettings: chartUtils.dataLabelInterfaces,
        IDataLabelSettings: chartUtils.dataLabelInterfaces,
        DataLabelObject: chartUtils.dataLabelInterfaces,
        LabelEnabledDataPoint: chartUtils.dataLabelInterfaces,
        utils: chartUtils.dataLabelUtils,
    },
    legend: Object.assign({}, chartUtils.legend, {
        LegendPosition: chartUtils.legendInterfaces.LegendPosition,
        LegendData: chartUtils.legendInterfaces,
        LegendDataPoint: chartUtils.legendInterfaces,
        legendProps: chartUtils.legendInterfaces.legendProps,
        position: chartUtils.legendPosition,
        SVGLegend: chartUtils.svgLegend.SVGLegend,
        LegendBehavior: LegendBehaviorImpl,
    }),
};

(powerbi.extensibility.utils.chart.legend as any).LegendBehavior = LegendBehaviorImpl;
(powerbi.extensibility.utils.chart.legend as any).LegendBehavior.dimmedLegendColor = "#bfbfbf";

export { Visual } from "./visual";
