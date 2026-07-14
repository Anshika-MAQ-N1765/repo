import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
 
const FormattingSettingsCard = formattingSettings.SimpleCard;
const FormattingSettingsModel = formattingSettings.Model;
type FormattingSettingsSlice = formattingSettings.Slice;
 
const legendPositionItems = [
    { value: "Top", displayName: "Top" },
    { value: "Bottom", displayName: "Bottom" },
    { value: "TopCenter", displayName: "Top Center" },
    { value: "BottomCenter", displayName: "Bottom Center" }
];
 
function createToggle(name: string, displayName: string, value: boolean): formattingSettings.ToggleSwitch {
    return new formattingSettings.ToggleSwitch({ name, displayName, value });
}
 
function createTextInput(name: string, displayName: string, value: string, placeholder?: string): formattingSettings.TextInput {
    return new formattingSettings.TextInput({ name, displayName, value, placeholder });
}
 
function createNumberInput(name: string, displayName: string, value: number): formattingSettings.NumUpDown {
    return new formattingSettings.NumUpDown({ name, displayName, value });
}
 
function createColorPicker(name: string, displayName: string, value: string): formattingSettings.ColorPicker {
    return new formattingSettings.ColorPicker({ name, displayName, value: { value } });
}
 
function createFontPicker(name: string, displayName: string, value: string): formattingSettings.FontPicker {
    return new formattingSettings.FontPicker({ name, displayName, value });
}
 
function createDropdown(name: string, displayName: string, value: { value: string; displayName: string }, items: Array<{ value: string; displayName: string }>): formattingSettings.ItemDropdown {
    return new formattingSettings.ItemDropdown({ name, displayName, value, items });
}
 
function createAutoDropdown(name: string, displayName: string, value: number): formattingSettings.AutoDropdown {
    return new formattingSettings.AutoDropdown({ name, displayName, value });
}
 
class LegendCardSettings extends FormattingSettingsCard {
    name = "legend";
    displayName = "Legend";
    description = "Display legend options";
 
    // The card-header on/off toggle (shown even when the card is collapsed).
    show = createToggle("show", "Show", false);
    topLevelSlice = this.show;
 
    position = createDropdown("position", "Position", legendPositionItems[0], legendPositionItems);
    showTitle = createToggle("showTitle", "Title", false);
    titleText = createTextInput("titleText", "Legend name", "");
    labelColor = createColorPicker("labelColor", "Color", "#777777");
    fontSize = createNumberInput("fontSize", "Text size", 9);
 
    slices: Array<FormattingSettingsSlice> = [this.position, this.showTitle, this.titleText, this.labelColor, this.fontSize];
}class CategoryAxisCardSettings extends FormattingSettingsCard {
    name = "categoryAxis";
    displayName = "X Axis";
    showAxisTitle = createToggle("showAxisTitle", "Title", false);
 
    show = createToggle("show", "Show", false);
    topLevelSlice = this.show;
 
    labelColor = createColorPicker("labelColor", "Color", "#777777");
    labelDisplayUnits = createAutoDropdown("labelDisplayUnits", "Display units", 0);
    fontSize = createNumberInput("fontSize", "Text size", 11);
    labelPrecision = createNumberInput("labelPrecision", "Decimal places", 0);
 
    slices: Array<FormattingSettingsSlice> = [this.showAxisTitle, this.labelColor, this.labelDisplayUnits, this.fontSize, this.labelPrecision];
}
 
class TextWrapCardSettings extends FormattingSettingsCard {
    name = "textWrap";
    displayName = "X-Axis Text Wrap";
    show = createToggle("show", "Show", false);
    topLevelSlice = this.show;
    slices: Array<FormattingSettingsSlice> = [];
}
 
class MeasureTitlesCardSettings extends FormattingSettingsCard {
    name = "measureTitles";
    displayName = "Measure Titles";
    ellipses = createNumberInput("ellipses", "Ellipses strength", 120);
    slices: Array<FormattingSettingsSlice> = [this.ellipses];
}
 
class ValueAxisCardSettings extends FormattingSettingsCard {
    name = "valueAxis";
    displayName = "Y Axis";
    show = createToggle("show", "Show", false);
    topLevelSlice = this.show;
    start = createNumberInput("start", "Start", 0);
    end = createNumberInput("end", "End", 0);
    showAxisTitle = createToggle("showAxisTitle", "Title", false);
    intersection = createNumberInput("intersection", "Intersection", 0);
    labelColor = createColorPicker("labelColor", "Color", "#777777");
    labelDisplayUnits = createAutoDropdown("labelDisplayUnits", "Display units", 0);
    labelPrecision = createNumberInput("labelPrecision", "Decimal places", 0);
    slices: Array<FormattingSettingsSlice> = [this.start, this.end, this.showAxisTitle, this.intersection, this.labelColor, this.labelDisplayUnits, this.labelPrecision];
}
 
class DataPointCardSettings extends FormattingSettingsCard {
    name = "dataPoint";
    displayName = "Data colors";
    description = "Pick a color for each value shown in the legend";
 
    // Fallback swatch used only when there are no dynamic series yet. The real
    // per-series color pickers are injected at runtime via setDataColors().
    defaultColor = createColorPicker("defaultColor", "Default color", "#01B8AA");
 
    slices: Array<FormattingSettingsSlice> = [this.defaultColor];
}
 
class LabelsCardSettings extends FormattingSettingsCard {
    name = "labels";
    displayName = "Data labels";
    description = "Display data label options";
 
    show = createToggle("show", "Show", false);
    topLevelSlice = this.show;
 
    color = createColorPicker("color", "Color", "#777777");
    labelDisplayUnits = createAutoDropdown("labelDisplayUnits", "Display units", 0);
    labelPrecision = createNumberInput("labelPrecision", "Decimal places", 0);
    fontSize = createNumberInput("fontSize", "Text size", 10);
 
    slices: Array<FormattingSettingsSlice> = [this.color, this.labelDisplayUnits, this.labelPrecision, this.fontSize];
}
 
class TotalLabelsCardSettings extends FormattingSettingsCard {
    name = "totalLabels";
    displayName = "Total Labels";
    description = "Display total label options";
 
    show = createToggle("show", "Show", true);
    topLevelSlice = this.show;
 
    titleText = createTextInput("titleText", "Title text", "Total");
    titleColor = createColorPicker("titleColor", "Title color", "#777777");
    titleFontFamily = createFontPicker("titleFontFamily", "Title font", "Segoe UI");
    titleFontSize = createNumberInput("titleFontSize", "Title text size", 12);
    color = createColorPicker("color", "Color", "#777777");
    labelDisplayUnits = createAutoDropdown("labelDisplayUnits", "Display units", 0);
    labelPrecision = createNumberInput("labelPrecision", "Decimal places", 0);
    fontSize = createNumberInput("fontSize", "Text size", 9);
    slices: Array<FormattingSettingsSlice> = [this.titleText, this.titleColor, this.titleFontFamily, this.titleFontSize, this.color, this.labelDisplayUnits, this.labelPrecision, this.fontSize];
}class SecondaryLabelsCardSettings extends FormattingSettingsCard {
    name = "secondaryLabels";
    displayName = "Secondary Labels";
    description = "Display secondary label options";
    titleText = createTextInput("titleText", "Title text", "");
    titleColor = createColorPicker("titleColor", "Title color", "#777777");
    titleFontFamily = createFontPicker("titleFontFamily", "Title font", "Segoe UI");
    titleFontSize = createNumberInput("titleFontSize", "Title text size", 12);
    color = createColorPicker("color", "Color", "#777777");
    labelDisplayUnits = createAutoDropdown("labelDisplayUnits", "Display units", 0);
    labelPrecision = createNumberInput("labelPrecision", "Decimal places", 0);
    fontSize = createNumberInput("fontSize", "Text size", 9);
    slices: Array<FormattingSettingsSlice> = [this.titleText, this.titleColor, this.titleFontFamily, this.titleFontSize, this.color, this.labelDisplayUnits, this.labelPrecision, this.fontSize];
}
 
class TertiaryLabelsCardSettings extends FormattingSettingsCard {
    name = "tertiaryLabels";
    displayName = "Tertiary Labels";
    description = "Display tertiary label options";
    titleText = createTextInput("titleText", "Title text", "");
    titleColor = createColorPicker("titleColor", "Title color", "#777777");
    titleFontFamily = createFontPicker("titleFontFamily", "Title font", "Segoe UI");
    titleFontSize = createNumberInput("titleFontSize", "Title text size", 12);
    color = createColorPicker("color", "Color", "#777777");
    labelDisplayUnits = createAutoDropdown("labelDisplayUnits", "Display units", 0);
    labelPrecision = createNumberInput("labelPrecision", "Decimal places", 0);
    fontSize = createNumberInput("fontSize", "Text size", 9);
    slices: Array<FormattingSettingsSlice> = [this.titleText, this.titleColor, this.titleFontFamily, this.titleFontSize, this.color, this.labelDisplayUnits, this.labelPrecision, this.fontSize];
}
 
class QuaternaryLabelsCardSettings extends FormattingSettingsCard {
    name = "quaternaryLabels";
    displayName = "Quaternary Labels";
    description = "Display quaternary label options";
    titleText = createTextInput("titleText", "Title text", "");
    titleColor = createColorPicker("titleColor", "Title color", "#777777");
    titleFontFamily = createFontPicker("titleFontFamily", "Title font", "Segoe UI");
    titleFontSize = createNumberInput("titleFontSize", "Title text size", 12);
    color = createColorPicker("color", "Color", "#777777");
    labelDisplayUnits = createAutoDropdown("labelDisplayUnits", "Display units", 0);
    labelPrecision = createNumberInput("labelPrecision", "Decimal places", 0);
    fontSize = createNumberInput("fontSize", "Text size", 9);
    slices: Array<FormattingSettingsSlice> = [this.titleText, this.titleColor, this.titleFontFamily, this.titleFontSize, this.color, this.labelDisplayUnits, this.labelPrecision, this.fontSize];
}
 
class FifthLabelsCardSettings extends FormattingSettingsCard {
    name = "FifthLabels";
    displayName = "Fifth Labels";
    description = "Display fifth label options";
    titleText = createTextInput("titleText", "Title text", "");
    titleColor = createColorPicker("titleColor", "Title color", "#777777");
    titleFontFamily = createFontPicker("titleFontFamily", "Title font", "Segoe UI");
    titleFontSize = createNumberInput("titleFontSize", "Title text size", 12);
    color = createColorPicker("color", "Color", "#777777");
    labelDisplayUnits = createAutoDropdown("labelDisplayUnits", "Display units", 0);
    labelPrecision = createNumberInput("labelPrecision", "Decimal places", 0);
    fontSize = createNumberInput("fontSize", "Text size", 9);
    slices: Array<FormattingSettingsSlice> = [this.titleText, this.titleColor, this.titleFontFamily, this.titleFontSize, this.color, this.labelDisplayUnits, this.labelPrecision, this.fontSize];
}
 
class SixthLabelsCardSettings extends FormattingSettingsCard {
    name = "SixthLabels";
    displayName = "Sixth Labels";
    description = "Display sixth label options";
    titleText = createTextInput("titleText", "Title text", "");
    titleColor = createColorPicker("titleColor", "Title color", "#777777");
    titleFontFamily = createFontPicker("titleFontFamily", "Title font", "Segoe UI");
    titleFontSize = createNumberInput("titleFontSize", "Title text size", 12);
    color = createColorPicker("color", "Color", "#777777");
    labelDisplayUnits = createAutoDropdown("labelDisplayUnits", "Display units", 0);
    labelPrecision = createNumberInput("labelPrecision", "Decimal places", 0);
    fontSize = createNumberInput("fontSize", "Text size", 9);
    slices: Array<FormattingSettingsSlice> = [this.titleText, this.titleColor, this.titleFontFamily, this.titleFontSize, this.color, this.labelDisplayUnits, this.labelPrecision, this.fontSize];
}
 
class GMOColumnChartTitleCardSettings extends FormattingSettingsCard {
    name = "GMOColumnChartTitle";
    displayName = "Stacked Chart Title";
 
    show = createToggle("show", "Show", true);
    topLevelSlice = this.show;
 
    titleText = createTextInput("titleText", "Title text", "");
    fill1 = createColorPicker("fill1", "Font color", "#000000");
    fontSize = createNumberInput("fontSize", "Text size", 12);
    backgroundColor = createColorPicker("backgroundColor", "Background color", "#ffffff");
    tooltipText = createTextInput("tooltipText", "Tooltip text", "");
 
    slices: Array<FormattingSettingsSlice> = [this.titleText, this.fill1, this.fontSize, this.backgroundColor, this.tooltipText];
}
 
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    legendCard = new LegendCardSettings();
    categoryAxisCard = new CategoryAxisCardSettings();
    valueAxisCard = new ValueAxisCardSettings();
    textWrapCard = new TextWrapCardSettings();
    measureTitlesCard = new MeasureTitlesCardSettings();
    dataPointCard = new DataPointCardSettings();
    labelsCard = new LabelsCardSettings();
    totalLabelsCard = new TotalLabelsCardSettings();
    secondaryLabelsCard = new SecondaryLabelsCardSettings();
    tertiaryLabelsCard = new TertiaryLabelsCardSettings();
    quaternaryLabelsCard = new QuaternaryLabelsCardSettings();
    fifthLabelsCard = new FifthLabelsCardSettings();
    sixthLabelsCard = new SixthLabelsCardSettings();
    gmoColumnChartTitleCard = new GMOColumnChartTitleCardSettings();
 
    cards = [
        this.legendCard,
        this.categoryAxisCard,
        this.valueAxisCard,
        this.textWrapCard,
        this.measureTitlesCard,
        this.dataPointCard,
        this.labelsCard,
        this.totalLabelsCard,
        this.secondaryLabelsCard,
        this.tertiaryLabelsCard,
        this.quaternaryLabelsCard,
        this.fifthLabelsCard,
        this.sixthLabelsCard,
        this.gmoColumnChartTitleCard
    ];
 
    /**
     * Replace the Data colors card slices with one color picker per legend value.
     * Each picker persists to dataPoint.fill scoped by the series selector, so the
     * chart shows one swatch per value displayed in the legend.
     */
    public setDataColors(points: Array<{ displayName: string; color: string; selector: any }>): void {
        if (!points || points.length === 0) {
            this.dataPointCard.slices = [this.dataPointCard.defaultColor];
            return;
        }
        this.dataPointCard.slices = points.map(p => new formattingSettings.ColorPicker({
            name: "fill",
            displayName: p.displayName,
            value: { value: p.color },
            selector: p.selector
        }));
    }
}