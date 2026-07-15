import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
 
const FormattingSettingsCard = formattingSettings.SimpleCard;
const FormattingSettingsCompositeCard = formattingSettings.CompositeCard;
const FormattingSettingsGroup = formattingSettings.Group;
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
 
// Native Power BI typography control (Font family + size shown together, like
// built-in visuals). It binds the existing fontFamily/fontSize properties, so
// no capabilities change is required.
function createFontControl(name: string, fontFamily: formattingSettings.FontPicker, fontSize: formattingSettings.NumUpDown): formattingSettings.FontControl {
    return new formattingSettings.FontControl({ name, displayName: "Font", fontFamily, fontSize });
}
 
function createDropdown(name: string, displayName: string, value: { value: string; displayName: string }, items: Array<{ value: string; displayName: string }>): formattingSettings.ItemDropdown {
    return new formattingSettings.ItemDropdown({ name, displayName, value, items });
}
 
function createAutoDropdown(name: string, displayName: string, value: number): formattingSettings.AutoDropdown {
    return new formattingSettings.AutoDropdown({ name, displayName, value });
}
 
// Small helper to build a collapsible group inside a composite card. All groups
// in a composite card bind their slices to the card's object name, so grouping
// is purely a presentation concern and preserves the existing capabilities.
function createGroup(name: string, displayName: string, slices: Array<FormattingSettingsSlice>): formattingSettings.Group {
    const group = new FormattingSettingsGroup({ name, displayName, slices });
    group.collapsible = true;
    return group;
}
 
class LegendCardSettings extends FormattingSettingsCompositeCard {
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
    fontFamily = createFontPicker("fontFamily", "Font", "Segoe UI");
    fontSize = createNumberInput("fontSize", "Text size", 9);
    font = createFontControl("legendFont", this.fontFamily, this.fontSize);
 
    valuesGroup = createGroup("legendValues", "Values", [this.labelColor, this.font]);
    titleGroup = createGroup("legendTitle", "Title", [this.showTitle, this.titleText]);
    layoutGroup = createGroup("legendLayout", "Layout", [this.position]);
 
    groups = [this.valuesGroup, this.titleGroup, this.layoutGroup];
}
 
class CategoryAxisCardSettings extends FormattingSettingsCompositeCard {
    name = "categoryAxis";
    displayName = "X Axis";
 
    show = createToggle("show", "Show", false);
    topLevelSlice = this.show;
 
    showAxisTitle = createToggle("showAxisTitle", "Title", false);
    labelColor = createColorPicker("labelColor", "Color", "#777777");
    labelDisplayUnits = createAutoDropdown("labelDisplayUnits", "Display units", 0);
    fontFamily = createFontPicker("fontFamily", "Font", "Segoe UI");
    fontSize = createNumberInput("fontSize", "Text size", 11);
    labelPrecision = createNumberInput("labelPrecision", "Decimal places", 0);
    font = createFontControl("categoryAxisFont", this.fontFamily, this.fontSize);
 
    valuesGroup = createGroup("categoryAxisValues", "Values", [this.labelColor, this.font, this.labelDisplayUnits, this.labelPrecision]);
    titleGroup = createGroup("categoryAxisTitle", "Title", [this.showAxisTitle]);
 
    groups = [this.valuesGroup, this.titleGroup];
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
 
class ValueAxisCardSettings extends FormattingSettingsCompositeCard {
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
    fontFamily = createFontPicker("fontFamily", "Font", "Segoe UI");
    labelPrecision = createNumberInput("labelPrecision", "Decimal places", 0);
 
    valuesGroup = createGroup("valueAxisValues", "Values", [this.labelColor, this.fontFamily, this.labelDisplayUnits, this.labelPrecision]);
    titleGroup = createGroup("valueAxisTitle", "Title", [this.showAxisTitle]);
    layoutGroup = createGroup("valueAxisLayout", "Layout", [this.start, this.end, this.intersection]);
 
    groups = [this.valuesGroup, this.titleGroup, this.layoutGroup];
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
 
class LabelsCardSettings extends FormattingSettingsCompositeCard {
    name = "labels";
    displayName = "Data labels";
    description = "Display data label options";
 
    show = createToggle("show", "Show", false);
    topLevelSlice = this.show;
 
    color = createColorPicker("color", "Color", "#777777");
    labelDisplayUnits = createAutoDropdown("labelDisplayUnits", "Display units", 0);
    labelPrecision = createNumberInput("labelPrecision", "Decimal places", 0);
    fontSize = createNumberInput("fontSize", "Text size", 10);
 
    valuesGroup = createGroup("labelsValues", "Values", [this.color, this.fontSize, this.labelDisplayUnits, this.labelPrecision]);
 
    groups = [this.valuesGroup];
}
 
class TotalLabelsCardSettings extends FormattingSettingsCompositeCard {
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
    titleFont = createFontControl("totalTitleFont", this.titleFontFamily, this.titleFontSize);
 
    titleGroup = createGroup("totalLabelsTitle", "Title", [this.titleText, this.titleColor, this.titleFont]);
    valuesGroup = createGroup("totalLabelsValues", "Values", [this.color, this.fontSize, this.labelDisplayUnits, this.labelPrecision]);
 
    groups = [this.titleGroup, this.valuesGroup];
}
 
class SecondaryLabelsCardSettings extends FormattingSettingsCompositeCard {
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
    titleFont = createFontControl("secondaryTitleFont", this.titleFontFamily, this.titleFontSize);
 
    titleGroup = createGroup("secondaryLabelsTitle", "Title", [this.titleText, this.titleColor, this.titleFont]);
    valuesGroup = createGroup("secondaryLabelsValues", "Values", [this.color, this.fontSize, this.labelDisplayUnits, this.labelPrecision]);
 
    groups = [this.titleGroup, this.valuesGroup];
}
 
class TertiaryLabelsCardSettings extends FormattingSettingsCompositeCard {
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
    titleFont = createFontControl("tertiaryTitleFont", this.titleFontFamily, this.titleFontSize);
 
    titleGroup = createGroup("tertiaryLabelsTitle", "Title", [this.titleText, this.titleColor, this.titleFont]);
    valuesGroup = createGroup("tertiaryLabelsValues", "Values", [this.color, this.fontSize, this.labelDisplayUnits, this.labelPrecision]);
 
    groups = [this.titleGroup, this.valuesGroup];
}
 
class QuaternaryLabelsCardSettings extends FormattingSettingsCompositeCard {
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
    titleFont = createFontControl("quaternaryTitleFont", this.titleFontFamily, this.titleFontSize);
 
    titleGroup = createGroup("quaternaryLabelsTitle", "Title", [this.titleText, this.titleColor, this.titleFont]);
    valuesGroup = createGroup("quaternaryLabelsValues", "Values", [this.color, this.fontSize, this.labelDisplayUnits, this.labelPrecision]);
 
    groups = [this.titleGroup, this.valuesGroup];
}
 
class FifthLabelsCardSettings extends FormattingSettingsCompositeCard {
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
    titleFont = createFontControl("fifthTitleFont", this.titleFontFamily, this.titleFontSize);
 
    titleGroup = createGroup("FifthLabelsTitle", "Title", [this.titleText, this.titleColor, this.titleFont]);
    valuesGroup = createGroup("FifthLabelsValues", "Values", [this.color, this.fontSize, this.labelDisplayUnits, this.labelPrecision]);
 
    groups = [this.titleGroup, this.valuesGroup];
}
 
class SixthLabelsCardSettings extends FormattingSettingsCompositeCard {
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
    titleFont = createFontControl("sixthTitleFont", this.titleFontFamily, this.titleFontSize);
 
    titleGroup = createGroup("SixthLabelsTitle", "Title", [this.titleText, this.titleColor, this.titleFont]);
    valuesGroup = createGroup("SixthLabelsValues", "Values", [this.color, this.fontSize, this.labelDisplayUnits, this.labelPrecision]);
 
    groups = [this.titleGroup, this.valuesGroup];
}
 
class GMOColumnChartTitleCardSettings extends FormattingSettingsCompositeCard {
    name = "GMOColumnChartTitle";
    displayName = "Stacked Chart Title";
 
    show = createToggle("show", "Show", true);
    topLevelSlice = this.show;
 
    titleText = createTextInput("titleText", "Title text", "");
    fill1 = createColorPicker("fill1", "Font color", "#000000");
    fontFamily = createFontPicker("fontFamily", "Font", "Segoe UI");
    fontSize = createNumberInput("fontSize", "Text size", 12);
    backgroundColor = createColorPicker("backgroundColor", "Background color", "#ffffff");
    tooltipText = createTextInput("tooltipText", "Tooltip text", "");
    font = createFontControl("titleFont", this.fontFamily, this.fontSize);
 
    titleGroup = createGroup("GMOColumnChartTitleTitle", "Title", [this.titleText, this.fill1, this.font]);
    appearanceGroup = createGroup("GMOColumnChartTitleAppearance", "Appearance", [this.backgroundColor]);
    tooltipGroup = createGroup("GMOColumnChartTitleTooltip", "Tooltip", [this.tooltipText]);
 
    groups = [this.titleGroup, this.appearanceGroup, this.tooltipGroup];
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
 