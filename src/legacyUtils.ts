import powerbi from "powerbi-visuals-api";
import * as d3 from "d3";
import { drag as d3Drag } from "d3-drag";
import { pointer as d3Pointer, select as d3Select, selection as d3Selection } from "d3-selection";
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
 
// IMPORTANT: copy d3's exports into a FRESH, writable plain object.
// `import * as d3` yields an ES-module namespace whose exports are read-only
// getters. Mutating it directly (e.g. `d3.mouse = ...`) throws in the real
// webpack/Power BI bundle: "Cannot set property select of #<Object> which has
// only a getter". Spreading into a new object gives us a mutable copy we can
// safely extend with the legacy d3 v3 surface (mouse/behavior/scale).
const legacyD3: any = { ...(d3 as any) };

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

legacyD3.select = d3Select;
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
// Restore d3 v3 transform parsing for legacy `.translate[1]` access.
legacyD3.transform = (transformStr: string) => {
    const result = { translate: [0, 0] as [number, number], rotate: 0, scale: [1, 1] as [number, number], skew: 0 };
    if (!transformStr) {
        return result;
    }
    const translateMatch = /translate\(\s*([-\d.eE]+)[ ,]*([-\d.eE]+)?\s*\)/.exec(transformStr);
    if (translateMatch) {
        result.translate = [parseFloat(translateMatch[1]) || 0, parseFloat(translateMatch[2]) || 0];
    }
    const rotateMatch = /rotate\(\s*([-\d.eE]+)/.exec(transformStr);
    if (rotateMatch) {
        result.rotate = parseFloat(rotateMatch[1]) || 0;
    }
    const scaleMatch = /scale\(\s*([-\d.eE]+)[ ,]*([-\d.eE]+)?\s*\)/.exec(transformStr);
    if (scaleMatch) {
        const sx = parseFloat(scaleMatch[1]) || 1;
        const sy = scaleMatch[2] != null ? (parseFloat(scaleMatch[2]) || sx) : sx;
        result.scale = [sx, sy];
    }
    return result;
};
 
// ---------------------------------------------------------------------------
// d3 v3 -> v7 compatibility shim.
// Restore legacy object-form attr/style support for old code.
// ---------------------------------------------------------------------------
(function patchSelectionPrototype(): void {
    const selectionProto: any = (d3Selection as any).prototype;
    if (!selectionProto || selectionProto.__legacyObjectFormPatched) {
        return;
    }
    selectionProto.__legacyObjectFormPatched = true;
 
    const patchObjectForm = (methodName: "attr" | "style"): void => {
        const original = selectionProto[methodName];
        selectionProto[methodName] = function (name: any, value?: any, priority?: any) {
            // Object form: apply each pair.
            if (name && typeof name === "object") {
                for (const key of Object.keys(name)) {
                    original.call(this, key, name[key]);
                }
                return this;
            }
            // Otherwise delegate to native d3.
            return original.apply(this, arguments as any);
        };
    };
 
    patchObjectForm("attr");
    patchObjectForm("style");

    // Restore d3 v3 `selection[0]` access for legacy indexing.
    if (!Object.prototype.hasOwnProperty.call(selectionProto, "0")) {
        Object.defineProperty(selectionProto, "0", {
            configurable: true,
            get(this: any) {
                return this._groups ? this._groups[0] : undefined;
            },
        });
    }
})();
 
// Publish patched global d3 before visual code runs.
(globalThis as typeof globalThis & { d3?: typeof legacyD3 }).d3 = legacyD3;
 
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

// LegendBehavior (and its dimmedLegendColor static) are already wired into
// `legacyUtilsRoot.chart.legend` above. Reference THAT object — never the
// imported `powerbi` namespace: in the real Power BI/webpack bundle the imported
// `powerbi` is a different (read-only) object than the host global we populate,
// so `powerbi.extensibility.utils.chart...` would throw at load.
LegendBehaviorImpl.dimmedLegendColor = "#bfbfbf";
if (legacyUtilsRoot.chart && legacyUtilsRoot.chart.legend) {
    legacyUtilsRoot.chart.legend.LegendBehavior = LegendBehaviorImpl;
}

// ---------------------------------------------------------------------------
// Provide minimal global $/_ shims for legacy code.
// ---------------------------------------------------------------------------
type JQLike = {
    length: number;
    [index: number]: any;
    children(selector?: string): JQLike;
    find(selector: string): JQLike;
    filter(fn: (index: number, el: any) => boolean): JQLike;
    each(fn: (index: number, el: any) => void): JQLike;
    attr(name: string, value?: any): any;
    css(name: string, value?: any): any;
    hide(): JQLike;
    show(): JQLike;
    remove(): JQLike;
    empty(): JQLike;
    addClass(name: string): JQLike;
    removeClass(name: string): JQLike;
    on(type: string, handler: any): JQLike;
    parent(): JQLike;
    first(): JQLike;
    width(): number;
    height(): number;
    get(index?: number): any;
};

function makeJQ(nodes: any[]): JQLike {
    const wrapper: any = Object.create(jqProto);
    wrapper.length = nodes.length;
    for (let i = 0; i < nodes.length; i++) {
        wrapper[i] = nodes[i];
    }
    wrapper._nodes = nodes;
    return wrapper as JQLike;
}

const jqProto: any = {
    children(selector?: string): JQLike {
        const out: any[] = [];
        for (const node of this._nodes) {
            if (!node || !node.children) continue;
            for (const child of Array.from(node.children) as any[]) {
                if (!selector || (child.matches && child.matches(selector))) {
                    out.push(child);
                }
            }
        }
        return makeJQ(out);
    },
    find(selector: string): JQLike {
        const out: any[] = [];
        for (const node of this._nodes) {
            if (!node || !node.querySelectorAll) continue;
            try {
                out.push(...(Array.from(node.querySelectorAll(selector)) as any[]));
            } catch (ignored) { /* invalid selector -> no matches */ }
        }
        return makeJQ(out);
    },
    filter(fn: (index: number, el: any) => boolean): JQLike {
        const out: any[] = [];
        this._nodes.forEach((node: any, i: number) => {
            try {
                if (fn.call(node, i, node)) {
                    out.push(node);
                }
            } catch (ignored) { /* ignore predicate errors */ }
        });
        return makeJQ(out);
    },
    each(fn: (index: number, el: any) => void): JQLike {
        this._nodes.forEach((node: any, i: number) => fn.call(node, i, node));
        return this;
    },
    attr(name: string, value?: any): any {
        if (value === undefined) {
            const first = this._nodes[0];
            return first && first.getAttribute ? first.getAttribute(name) : undefined;
        }
        for (const node of this._nodes) {
            if (node && node.setAttribute) node.setAttribute(name, value);
        }
        return this;
    },
    css(name: string, value?: any): any {
        if (value === undefined) {
            const first = this._nodes[0];
            return first && first.style ? first.style[name] : undefined;
        }
        for (const node of this._nodes) {
            if (node && node.style) node.style[name] = value;
        }
        return this;
    },
    hide(): JQLike {
        for (const node of this._nodes) {
            if (node && node.style) node.style.display = "none";
        }
        return this;
    },
    show(): JQLike {
        for (const node of this._nodes) {
            if (node && node.style) node.style.display = "";
        }
        return this;
    },
    remove(): JQLike {
        for (const node of this._nodes) {
            if (node && node.parentNode) node.parentNode.removeChild(node);
        }
        return this;
    },
    empty(): JQLike {
        for (const node of this._nodes) {
            while (node && node.firstChild) node.removeChild(node.firstChild);
        }
        return this;
    },
    addClass(name: string): JQLike {
        for (const node of this._nodes) {
            if (node && node.classList) node.classList.add(name);
        }
        return this;
    },
    removeClass(name: string): JQLike {
        for (const node of this._nodes) {
            if (node && node.classList) node.classList.remove(name);
        }
        return this;
    },
    on(type: string, handler: any): JQLike {
        for (const node of this._nodes) {
            if (node && node.addEventListener) node.addEventListener(type, handler);
        }
        return this;
    },
    parent(): JQLike {
        const out: any[] = [];
        for (const node of this._nodes) {
            if (node && node.parentNode) out.push(node.parentNode);
        }
        return makeJQ(out);
    },
    first(): JQLike {
        return makeJQ(this._nodes.slice(0, 1));
    },
    width(): number {
        const first = this._nodes[0];
        return first && first.getBoundingClientRect ? first.getBoundingClientRect().width : 0;
    },
    height(): number {
        const first = this._nodes[0];
        return first && first.getBoundingClientRect ? first.getBoundingClientRect().height : 0;
    },
    get(index?: number): any {
        if (index === undefined) return this._nodes.slice();
        return this._nodes[index < 0 ? this._nodes.length + index : index];
    },
};

function legacyJQuery(arg: any): JQLike {
    let nodes: any[] = [];
    if (arg == null) {
        nodes = [];
    } else if (typeof arg === "string") {
        const str = arg.trim();
        if (str.charAt(0) === "<") {
            nodes = []; // HTML-string creation is not used in render paths
        } else if (typeof document !== "undefined") {
            try {
                nodes = Array.from(document.querySelectorAll(str)) as any[];
            } catch (ignored) {
                nodes = [];
            }
        }
    } else if (arg.nodeType || arg === (globalThis as any).window || arg === (globalThis as any).document) {
        nodes = [arg];
    } else if (arg && (arg as any)._nodes) {
        nodes = (arg as any)._nodes.slice();
    } else if (typeof arg === "object" && typeof arg.length === "number") {
        nodes = Array.prototype.slice.call(arg);
    } else {
        nodes = [arg];
    }
    return makeJQ(nodes);
}

(legacyJQuery as any).extend = function extend(...args: any[]): any {
    let deep = false;
    if (typeof args[0] === "boolean") {
        deep = args.shift();
    }
    const target = args[0] || {};
    for (let i = 1; i < args.length; i++) {
        const src = args[i];
        if (!src) continue;
        for (const key of Object.keys(src)) {
            const val = src[key];
            if (deep && val && typeof val === "object" && !Array.isArray(val)) {
                target[key] = extend(true, target[key] && typeof target[key] === "object" ? target[key] : {}, val);
            } else {
                target[key] = val;
            }
        }
    }
    return target;
};
(legacyJQuery as any).isEmptyObject = (obj: any) => !obj || Object.keys(obj).length === 0;

const legacyLodash = {
    isEmpty(value: any): boolean {
        if (value == null) return true;
        if (Array.isArray(value) || typeof value === "string") return value.length === 0;
        if (value instanceof Map || value instanceof Set) return value.size === 0;
        if (typeof value === "object") return Object.keys(value).length === 0;
        return true;
    },
    filter(collection: any, predicate: any): any[] {
        if (!collection) return [];
        const arr: any[] = Array.isArray(collection) ? collection : Object.values(collection);
        const fn = typeof predicate === "function" ? predicate : (x: any) => x && x[predicate];
        return arr.filter(fn);
    },
    map(collection: any, iteratee: any): any[] {
        if (!collection) return [];
        const arr: any[] = Array.isArray(collection) ? collection : Object.values(collection);
        const fn = typeof iteratee === "function" ? iteratee : (x: any) => x && x[iteratee];
        return arr.map(fn);
    },
    forEach(collection: any, iteratee: (value: any, key: any) => void): any {
        if (!collection) return collection;
        if (Array.isArray(collection)) {
            collection.forEach(iteratee);
        } else {
            for (const key of Object.keys(collection)) iteratee(collection[key], key);
        }
        return collection;
    },
    find(collection: any, predicate: any): any {
        if (!collection) return undefined;
        const arr: any[] = Array.isArray(collection) ? collection : Object.values(collection);
        const fn = typeof predicate === "function" ? predicate : (x: any) => x && x[predicate];
        return arr.find(fn);
    },
    isArray: Array.isArray,
    keys: (obj: any) => (obj ? Object.keys(obj) : []),
    values: (obj: any) => (obj ? Object.values(obj) : []),
};
(legacyLodash as any).each = legacyLodash.forEach;

(globalThis as any).$ = (globalThis as any).$ || legacyJQuery;
(globalThis as any).jQuery = (globalThis as any).jQuery || legacyJQuery;
(globalThis as any)._ = (globalThis as any)._ || legacyLodash;

// NOTE: do NOT re-export Visual from here. A `export { Visual } from "./visual"`
// would pull visual.ts into this module's dependency graph and force it (and the
// layout/Columnutil/selectionId publish footers) to evaluate BEFORE this file's
// body runs — so visual.ts would read globalThis.powerbi before it is populated.
// index.ts is the single place that exports Visual, AFTER importing this module.
 