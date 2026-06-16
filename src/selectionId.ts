/// <reference types="powerbi-visuals-api" />
import "./legacyUtils";
type Selector = any;
type DataViewScopeIdentity = any;
type DataViewCategoryColumn = any;
type DataViewValueColumns = any;
type DataViewValueColumn = any;
type DataViewValueColumnGroup = any;
type ISelectionIdBuilder = any;

// namespace powerbi.extensibility.visual {
//     import Selector = powerbi.data.Selector;
//     // import SelectorsByColumn = powerbi.SelectorsByColumn;
//     // import SelectorForColumn = powerbi.SelectorForColumn;
//     // import DataViewScopeIdentity = powerbi.DataViewScopeIdentity;
  
//     /**
//      * A combination of identifiers used to uniquely identify
//      * data points and their bound geometry.
//      */
//     export class SelectionId implements ISelectionId {
//         public selector: Selector;
//         // This is a new data structure to support drilling -- in the long term it should replace the 'selector' field
//         private selectorsByColumn: SelectorsByColumn;
//         private key: string;
//         private keyWithoutHighlight: string;

//         public highlight: boolean;

//         constructor(selector: Selector, highlight: boolean) {
//             this.selector = selector;
//             this.highlight = highlight;
//             this.key = JSON.stringify({ selector: selector ? Selector.getKey(selector) : null, highlight: highlight });
//             this.keyWithoutHighlight = JSON.stringify({ selector: selector ? Selector.getKey(selector) : null });
//         }

//         public equals(other: SelectionId): boolean {
//             if (!this.selector || !other.selector) {
//                 return (!this.selector === !other.selector) && this.highlight === other.highlight;
//             }
//             return this.highlight === other.highlight &&  Selector.equals(this.selector, other.selector);
//         }

//         public static isEqual(one: SelectionId, other: SelectionId): boolean {
//             if (one === other)
//                 return true;
//             if (one == null || other == null)
//                 return false;
//             return one.equals(other);
//         }

//         /**
//          * Checks equality against other for all identifiers existing in this.
//          */
//         public includes(other: SelectionId, ignoreHighlight: boolean = false): boolean {
//             let thisSelector = this.selector;
//             let otherSelector = other.selector;
//             if (!thisSelector || !otherSelector) {
//                 return false;
//             }
//             let thisData = thisSelector.data;
//             let otherData = otherSelector.data;
//             if (!thisData && (thisSelector.metadata && thisSelector.metadata !== otherSelector.metadata))
//                 return false;
//             if (!ignoreHighlight && this.highlight !== other.highlight)
//                 return false;
//             if (thisData) {
//                 if (!otherData)
//                     return false;
//                 if (thisData.length > 0) {
//                     for (let i = 0, ilen = thisData.length; i < ilen; i++) {
//                         var thisValue = <DataViewScopeIdentity>thisData[i];
//                         if (!otherData.some((otherValue: DataViewScopeIdentity) => DataViewScopeIdentity.equals(thisValue, otherValue)))
//                             return false;
//                     }
//                 }
//             }
//             return true;
//         }

//         public getKey(): string {
//             return this.key;
//         }

//         public getKeyWithoutHighlight(): string {
//             return this.keyWithoutHighlight;
//         }
        
//         public hasIdentity(): boolean {
//             return (this.selector && !!this.selector.data);
//         }

//         public getSelector(): Selector {
//             return this.selector;
//         }

//         public getSelectorsByColumn(): Selector {
//             return this.selectorsByColumn;
//         }

//         public static createNull(highlight: boolean = false): SelectionId {
//             return new SelectionId(null, highlight);
//         }

//         public static createWithId(id: DataViewScopeIdentity, highlight: boolean = false): SelectionId {
//             let selector: Selector = null;
//             if (id) {
//                 selector = {
//                     data: [id]
//                 };
//             }
//             return new SelectionId(selector, highlight);
//         }

//         public static createWithMeasure(measureId: string, highlight: boolean = false): SelectionId {
           
//             let selector: Selector = {
//                 metadata: measureId
//             };

//             let selectionId = new SelectionId(selector, highlight);
//             selectionId.selectorsByColumn = { metadata: measureId };
//             return selectionId;
//         }

//         public static createWithIdAndMeasure(id: DataViewScopeIdentity, measureId: string, highlight: boolean = false): SelectionId {
//             let selector: powerbi.data.Selector = {};
//             if (id) {
//                 selector.data = [id];
//             }
//             if (measureId)
//                 selector.metadata = measureId;
//             if (!id && !measureId)
//                 selector = null;

//             let selectionId = new SelectionId(selector, highlight);

//             return selectionId;
//         }

//         public static createWithIdAndMeasureAndCategory(id: DataViewScopeIdentity, measureId: string, queryName: string, highlight: boolean = false): SelectionId {
//             let selectionId = this.createWithIdAndMeasure(id, measureId, highlight);

//             if (selectionId.selector) {
//                 selectionId.selectorsByColumn = {};
//                 if (id && queryName) {
//                     selectionId.selectorsByColumn.dataMap = {};
//                     selectionId.selectorsByColumn.dataMap[queryName] = id;
//                 }
//                 if (measureId)
//                     selectionId.selectorsByColumn.metadata = measureId;
//             }

//             return selectionId;
//         }

//         public static createWithIds(id1: DataViewScopeIdentity, id2: DataViewScopeIdentity, highlight: boolean = false): SelectionId {
//             let selector: Selector = null;
//             let selectorData = SelectionId.idArray(id1, id2);
//             if (selectorData)
//                 selector = { data: selectorData };
            
//             return new SelectionId(selector, highlight);
//         }

//         public static createWithIdsAndMeasure(id1: DataViewScopeIdentity, id2: DataViewScopeIdentity, measureId: string, highlight: boolean = false): SelectionId {
//             let selector: Selector = {};
//             let selectorData = SelectionId.idArray(id1, id2);
//             if (selectorData)
//                 selector.data = selectorData;

//             if (measureId)
//                 selector.metadata = measureId;
//             if (!id1 && !id2 && !measureId)
//                 selector = null;
//             return new SelectionId(selector, highlight);
//         }

//         public static createWithSelectorForColumnAndMeasure(dataMap: SelectorForColumn, measureId: string, highlight: boolean = false): SelectionId {
//             let selectionId: visual.SelectionId;
//             let keys = Object.keys(dataMap);
//             if (keys.length === 2) {
//                 selectionId = this.createWithIdsAndMeasure(<DataViewScopeIdentity>dataMap[keys[0]], <DataViewScopeIdentity>dataMap[keys[1]], measureId, highlight);
//             } else if (keys.length === 1) {
//                 selectionId = this.createWithIdsAndMeasure(<DataViewScopeIdentity>dataMap[keys[0]], null, measureId, highlight);
//             } else {
//                 selectionId = this.createWithIdsAndMeasure(null, null, measureId, highlight);
//             }

//             let selectorsByColumn: SelectorsByColumn = {};
//             if (!_.isEmpty(dataMap))
//                 selectorsByColumn.dataMap = dataMap;
//             if (measureId)
//                 selectorsByColumn.metadata = measureId;
//             if (!dataMap && !measureId)
//                 selectorsByColumn = null;

//             selectionId.selectorsByColumn = selectorsByColumn;

//             return selectionId;
//         }

//         public static createWithHighlight(original: SelectionId): SelectionId {
          
//             let newId = new SelectionId(original.getSelector(), /*highlight*/ true);
//             newId.selectorsByColumn = original.selectorsByColumn;

//             return newId;
//         }

//         private static idArray(id1: DataViewScopeIdentity, id2: DataViewScopeIdentity): DataViewScopeIdentity[] {
//             if (id1 || id2) {
//                 let data = [];
//                 if (id1)
//                     data.push(id1);
//                 if (id2 && id2 !== id1)
//                     data.push(id2);
//                 return data;
//             }
//         }
//     }

//     /**
//      * This class is designed to simplify the creation of SelectionId objects
//      * It allows chaining to build up an object before calling 'create' to build a SelectionId
//      */
//     export class SelectionIdBuilder implements ISelectionIdBuilder {
//         private dataMap: SelectorForColumn;
//         private measure: string;

//         public static builder(): SelectionIdBuilder {
//             return new SelectionIdBuilder();
//         }

//         public withCategoryIdentity(categoryColumn: DataViewCategoryColumn, identity: DataViewScopeIdentity): this{
//             if (categoryColumn && categoryColumn.source && categoryColumn.source.queryName)
//                 this.ensureDataMap()[categoryColumn.source.queryName] = identity;
            
//             return this;
//         }

//         public withCategory(categoryColumn: DataViewCategoryColumn, index: number): this{
//             if (categoryColumn && categoryColumn.source && categoryColumn.source.queryName && categoryColumn.identity)
//                 this.ensureDataMap()[categoryColumn.source.queryName] = categoryColumn.identity[index];
            
//             return this;
//         }

//         public withSeries(seriesColumn: DataViewValueColumns, valueColumn: DataViewValueColumn | DataViewValueColumnGroup): this {
//             if (seriesColumn && seriesColumn.source && seriesColumn.source.queryName && valueColumn)
//                 this.ensureDataMap()[seriesColumn.source.queryName] = valueColumn.identity;

//             return this;
//         }

//         public withMeasure(measureId: string): this {
//             this.measure = measureId;

//             return this;
//         }

//         public createSelectionId(): SelectionId {
//             return SelectionId.createWithSelectorForColumnAndMeasure(this.ensureDataMap(), this.measure);
//         }

//         private ensureDataMap(): SelectorForColumn {
//             if (!this.dataMap)
//                 this.dataMap = {};

//             return this.dataMap;
//         }
//     }
// }

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
            let selector: Selector = {};
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

        public withCategoryIdentity(categoryColumn: DataViewCategoryColumn, identity: DataViewScopeIdentity): this{
            if (categoryColumn && categoryColumn.source && categoryColumn.source.queryName)
                this.ensureDataMap()[categoryColumn.source.queryName] = identity;
            
            return this;
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
 