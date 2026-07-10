import { Visual } from "../../src/index";
import powerbiVisualsApi from "powerbi-visuals-api";
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import DialogConstructorOptions = powerbiVisualsApi.extensibility.visual.DialogConstructorOptions;
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];
var PBI_CV_CDA74AB7_05E6_46FA_BEC9_92D47E483FFD_2_DEBUG: IVisualPlugin = {
    name: 'PBI_CV_CDA74AB7_05E6_46FA_BEC9_92D47E483FFD_2_DEBUG',
    displayName: '100per-Stackchart',
    class: 'Visual',
    apiVersion: '5.3.0',
    create: (options?: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }
        throw 'Visual instance not found';
    },
    createModalDialog: (dialogId: string, options: DialogConstructorOptions, initialState: object) => {
        const dialogRegistry = (<any>globalThis).dialogRegistry;
        if (dialogId in dialogRegistry) {
            new dialogRegistry[dialogId](options, initialState);
        }
    },
    custom: true
};
if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["PBI_CV_CDA74AB7_05E6_46FA_BEC9_92D47E483FFD_2_DEBUG"] = PBI_CV_CDA74AB7_05E6_46FA_BEC9_92D47E483FFD_2_DEBUG;
}
export default PBI_CV_CDA74AB7_05E6_46FA_BEC9_92D47E483FFD_2_DEBUG;