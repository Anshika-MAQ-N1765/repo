/// <reference types="powerbi-visuals-api" />
import "./legacyUtils";
import powerbiApi from "powerbi-visuals-api";

type DataViewMetadata = powerbiApi.DataViewMetadata;
type DataViewObject = powerbiApi.DataViewObject;
type DataViewMetadataColumn = powerbiApi.DataViewMetadataColumn;
type DataViewPropertyValue = powerbiApi.DataViewPropertyValue;
type DataViewCategorical = powerbiApi.DataViewCategorical;
import { axis as AxisHelper } from "powerbi-visuals-utils-chartutils";
import { dataRoleHelper as DataRoleHelper } from "powerbi-visuals-utils-dataviewutils";
import { valueType } from "powerbi-visuals-utils-typeutils";
import ValueType = valueType.ValueType;

/* ================= AXIS TYPES ================= */

namespace powerbi.extensibility.visual.axisType {
    export const scalar: string = "Scalar";
    export const categorical: string = "Categorical";
    export const both: string = "Both";
}

namespace powerbi.extensibility.visual.yAxisPosition {
    export const left: string = "Left";
    export const right: string = "Right";
}

/* ================= CARTESIAN HELPER ================= */

namespace powerbi.extensibility.utils.CartesianHelper {

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

    export interface CartesianData {
        series: CartesianSeries[];
        categories: any[];
        categoryMetadata: DataViewMetadataColumn;
        hasHighlights?: boolean;
    }

    /* ==== AXIS PROPERTY READERS ==== */

    export function getCategoryAxisProperties(
        metadata: DataViewMetadata,
        axisTitleOnByDefault?: boolean
    ): DataViewObject {

        const objects = metadata?.objects;
        const axisObj = objects?.categoryAxis;

        return {
            show: axisObj?.show ?? true,
            axisScale: axisObj?.axisScale,
            start: axisObj?.start,
            end: axisObj?.end,
            showAxisTitle: axisObj?.showAxisTitle ?? axisTitleOnByDefault,
            labelColor: axisObj?.labelColor,
            labelDisplayUnits: axisObj?.labelDisplayUnits,
            labelPrecision: axisObj?.labelPrecision,
            fontSize: axisObj?.fontSize ?? 12
        };
    }

    export function getValueAxisProperties(
        metadata: DataViewMetadata,
        axisTitleOnByDefault?: boolean
    ): DataViewObject {

        const objects = metadata?.objects;
        const axisObj = objects?.valueAxis;

        return {
            show: axisObj?.show ?? true,
            start: axisObj?.start,
            end: axisObj?.end,
            showAxisTitle: axisObj?.showAxisTitle ?? axisTitleOnByDefault,
            labelColor: axisObj?.labelColor,
            labelDisplayUnits: axisObj?.labelDisplayUnits,
            labelPrecision: axisObj?.labelPrecision
        };
    }

    /* ==== HELPERS ==== */

    export function isScalar(
        supportsScalar: boolean,
        xAxisProps: DataViewObject
    ): boolean {
        if (!supportsScalar) return false;
        return xAxisProps?.["axisType"]
            ? xAxisProps["axisType"] === powerbi.extensibility.visual.axisType.scalar
            : true;
    }

    export function getPrecision(precision: DataViewPropertyValue): number {
        if (precision == null) return null;
        const numericPrecision = <number>precision;
        return numericPrecision < 0 ? 0 : numericPrecision;
    }

    export function lookupXValue(
        data: CartesianData,
        index: number,
        type: ValueType,
        isScalar: boolean
    ): any {

        const isDateTime = AxisHelper.isDateTime(type);

        if (isScalar) {
            return isDateTime ? new Date(index) : index;
        }

        if (type.text) {
            return data.categories[index];
        }

        const series = data?.series?.[0];
        const point = series?.data?.[data.hasHighlights ? index * 2 : index];

        if (point) {
            if (isDateTime && point.categoryValue != null) {
                return new Date(point.categoryValue);
            }
            return point.categoryValue;
        }

        return index;
    }

    export function findMaxCategoryIndex(series: CartesianSeries[]): number {
        if (!series?.length) return 0;

        return Math.max(
            ...series.map(s => s.data?.[s.data.length - 1]?.categoryIndex || 0)
        );
    }
}

/* ================= ROLE UTIL ================= */

namespace powerbi.extensibility.visual.roleUtils {

    /**
     * Generic helper for any measure role
     */
    export function getMeasureIndexByRole(
        dataViewCategorical: DataViewCategorical,
        roleName: string
    ): number {

        if (dataViewCategorical?.values?.grouped) {
            return DataRoleHelper.getMeasureIndexOfRole(
                dataViewCategorical.values.grouped(),
                roleName
            );
        }

        return -1;
    }

    export function hasRole(
        dataViewCategorical: DataViewCategorical,
        roleName: string
    ): boolean {
        return getMeasureIndexByRole(dataViewCategorical, roleName) >= 0;
    }
}
 
/* ===== Publish legacy namespaces onto the shared global `powerbi` =====
* In the ES-module build, every file's `namespace powerbi {}` compiles to a
* file-LOCAL `powerbi` object. visual.ts has its own local `powerbi`, so it
* cannot see the members defined here. We copy them onto the single shared
* `globalThis.powerbi` object that visual.ts reads from at runtime. */
{
    const g: any = globalThis as any;
    g.powerbi = g.powerbi || {};
    g.powerbi.extensibility = g.powerbi.extensibility || {};
    g.powerbi.extensibility.visual = g.powerbi.extensibility.visual || {};
    g.powerbi.extensibility.utils = g.powerbi.extensibility.utils || {};
    if (typeof powerbi !== "undefined" && powerbi.extensibility) {
        if (powerbi.extensibility.visual) {
            Object.assign(g.powerbi.extensibility.visual, powerbi.extensibility.visual);
        }
        if (powerbi.extensibility.utils) {
            Object.assign(g.powerbi.extensibility.utils, powerbi.extensibility.utils);
        }
    }
}
 