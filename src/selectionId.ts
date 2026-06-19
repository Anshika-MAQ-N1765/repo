/// <reference types="powerbi-visuals-api" />
import "./legacyUtils";
type Selector = any;
type DataViewScopeIdentity = any;
type DataViewCategoryColumn = any;
type DataViewValueColumns = any;
type DataViewValueColumn = any;
type DataViewValueColumnGroup = any;
type ISelectionIdBuilder = any;

namespace powerbi.extensibility.visual {
    
    /**
     * A combination of identifiers used to uniquely identify
     * data points and their bound geometry.
     */
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
        }

        public getKey(): string {
            return this.key;
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

    /**
     * This class is designed to simplify the creation of SelectionId objects
     * It allows chaining to build up an object before calling 'create' to build a SelectionId
     */
    export class SelectionIdBuilder implements ISelectionIdBuilder {
        private dataMap: Selector;
        private measure: string;

        public static builder(): SelectionIdBuilder {
            return new SelectionIdBuilder();
        }

        public withCategory(categoryColumn: DataViewCategoryColumn, index: number): this{
            if (categoryColumn && categoryColumn.source && categoryColumn.source.queryName && categoryColumn.identity)
                this.ensureDataMap()[categoryColumn.source.queryName] = categoryColumn.identity[index];
            
            return this;
        }

        public withSeries(seriesColumn: DataViewValueColumns, valueColumn: DataViewValueColumn | DataViewValueColumnGroup): this {
            if (seriesColumn && seriesColumn.source && seriesColumn.source.queryName && valueColumn)
                this.ensureDataMap()[seriesColumn.source.queryName] = valueColumn.identity;

            return this;
        }

        public withMeasure(measureId: string): this {
            this.measure = measureId;

            return this;
        }

        public createSelectionId(): SelectionId {
            return SelectionId.createWithSelectorForColumnAndMeasure(this.ensureDataMap(), this.measure);
        }

        private ensureDataMap(): Selector {
            if (!this.dataMap)
                this.dataMap = {};

            return this.dataMap;
        }
    }
}
 
/* ===== Publish legacy namespaces onto the shared global `powerbi` =====
* Copies this module's local `powerbi.extensibility.visual` members (SelectionId,
* SelectionIdBuilder) onto the single shared `globalThis.powerbi` object that
* visual.ts reads from at runtime. */
{
    const g: any = globalThis as any;
    g.powerbi = g.powerbi || {};
    g.powerbi.extensibility = g.powerbi.extensibility || {};
    g.powerbi.extensibility.visual = g.powerbi.extensibility.visual || {};
    if (typeof powerbi !== "undefined" && powerbi.extensibility && powerbi.extensibility.visual) {
        Object.assign(g.powerbi.extensibility.visual, powerbi.extensibility.visual);
    }
}
 