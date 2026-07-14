import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
declare const FormattingSettingsCard: typeof formattingSettings.SimpleCard;
declare const FormattingSettingsModel: typeof formattingSettings.Model;
type FormattingSettingsSlice = formattingSettings.Slice;
declare class LegendCardSettings extends FormattingSettingsCard {
    name: string;
    displayName: string;
    description: string;
    show: formattingSettings.ToggleSwitch;
    topLevelSlice: formattingSettings.ToggleSwitch;
    position: formattingSettings.ItemDropdown;
    showTitle: formattingSettings.ToggleSwitch;
    titleText: formattingSettings.TextInput;
    labelColor: formattingSettings.ColorPicker;
    fontSize: formattingSettings.NumUpDown;
    slices: Array<FormattingSettingsSlice>;
}
declare class CategoryAxisCardSettings extends FormattingSettingsCard {
    name: string;
    displayName: string;
    showAxisTitle: formattingSettings.ToggleSwitch;
    show: formattingSettings.ToggleSwitch;
    topLevelSlice: formattingSettings.ToggleSwitch;
    labelColor: formattingSettings.ColorPicker;
    labelDisplayUnits: formattingSettings.AutoDropdown;
    fontSize: formattingSettings.NumUpDown;
    labelPrecision: formattingSettings.NumUpDown;
    slices: Array<FormattingSettingsSlice>;
}
declare class TextWrapCardSettings extends FormattingSettingsCard {
    name: string;
    displayName: string;
    show: formattingSettings.ToggleSwitch;
    topLevelSlice: formattingSettings.ToggleSwitch;
    slices: Array<FormattingSettingsSlice>;
}
declare class MeasureTitlesCardSettings extends FormattingSettingsCard {
    name: string;
    displayName: string;
    ellipses: formattingSettings.NumUpDown;
    slices: Array<FormattingSettingsSlice>;
}
declare class ValueAxisCardSettings extends FormattingSettingsCard {
    name: string;
    displayName: string;
    show: formattingSettings.ToggleSwitch;
    topLevelSlice: formattingSettings.ToggleSwitch;
    start: formattingSettings.NumUpDown;
    end: formattingSettings.NumUpDown;
    showAxisTitle: formattingSettings.ToggleSwitch;
    intersection: formattingSettings.NumUpDown;
    labelColor: formattingSettings.ColorPicker;
    labelDisplayUnits: formattingSettings.AutoDropdown;
    labelPrecision: formattingSettings.NumUpDown;
    slices: Array<FormattingSettingsSlice>;
}
declare class DataPointCardSettings extends FormattingSettingsCard {
    name: string;
    displayName: string;
    description: string;
    defaultColor: formattingSettings.ColorPicker;
    slices: Array<FormattingSettingsSlice>;
}
declare class LabelsCardSettings extends FormattingSettingsCard {
    name: string;
    displayName: string;
    description: string;
    show: formattingSettings.ToggleSwitch;
    topLevelSlice: formattingSettings.ToggleSwitch;
    color: formattingSettings.ColorPicker;
    labelDisplayUnits: formattingSettings.AutoDropdown;
    labelPrecision: formattingSettings.NumUpDown;
    fontSize: formattingSettings.NumUpDown;
    slices: Array<FormattingSettingsSlice>;
}
declare class TotalLabelsCardSettings extends FormattingSettingsCard {
    name: string;
    displayName: string;
    description: string;
    show: formattingSettings.ToggleSwitch;
    topLevelSlice: formattingSettings.ToggleSwitch;
    titleText: formattingSettings.TextInput;
    titleColor: formattingSettings.ColorPicker;
    titleFontFamily: formattingSettings.FontPicker;
    titleFontSize: formattingSettings.NumUpDown;
    color: formattingSettings.ColorPicker;
    labelDisplayUnits: formattingSettings.AutoDropdown;
    labelPrecision: formattingSettings.NumUpDown;
    fontSize: formattingSettings.NumUpDown;
    slices: Array<FormattingSettingsSlice>;
}
declare class SecondaryLabelsCardSettings extends FormattingSettingsCard {
    name: string;
    displayName: string;
    description: string;
    titleText: formattingSettings.TextInput;
    titleColor: formattingSettings.ColorPicker;
    titleFontFamily: formattingSettings.FontPicker;
    titleFontSize: formattingSettings.NumUpDown;
    color: formattingSettings.ColorPicker;
    labelDisplayUnits: formattingSettings.AutoDropdown;
    labelPrecision: formattingSettings.NumUpDown;
    fontSize: formattingSettings.NumUpDown;
    slices: Array<FormattingSettingsSlice>;
}
declare class TertiaryLabelsCardSettings extends FormattingSettingsCard {
    name: string;
    displayName: string;
    description: string;
    titleText: formattingSettings.TextInput;
    titleColor: formattingSettings.ColorPicker;
    titleFontFamily: formattingSettings.FontPicker;
    titleFontSize: formattingSettings.NumUpDown;
    color: formattingSettings.ColorPicker;
    labelDisplayUnits: formattingSettings.AutoDropdown;
    labelPrecision: formattingSettings.NumUpDown;
    fontSize: formattingSettings.NumUpDown;
    slices: Array<FormattingSettingsSlice>;
}
declare class QuaternaryLabelsCardSettings extends FormattingSettingsCard {
    name: string;
    displayName: string;
    description: string;
    titleText: formattingSettings.TextInput;
    titleColor: formattingSettings.ColorPicker;
    titleFontFamily: formattingSettings.FontPicker;
    titleFontSize: formattingSettings.NumUpDown;
    color: formattingSettings.ColorPicker;
    labelDisplayUnits: formattingSettings.AutoDropdown;
    labelPrecision: formattingSettings.NumUpDown;
    fontSize: formattingSettings.NumUpDown;
    slices: Array<FormattingSettingsSlice>;
}
declare class FifthLabelsCardSettings extends FormattingSettingsCard {
    name: string;
    displayName: string;
    description: string;
    titleText: formattingSettings.TextInput;
    titleColor: formattingSettings.ColorPicker;
    titleFontFamily: formattingSettings.FontPicker;
    titleFontSize: formattingSettings.NumUpDown;
    color: formattingSettings.ColorPicker;
    labelDisplayUnits: formattingSettings.AutoDropdown;
    labelPrecision: formattingSettings.NumUpDown;
    fontSize: formattingSettings.NumUpDown;
    slices: Array<FormattingSettingsSlice>;
}
declare class SixthLabelsCardSettings extends FormattingSettingsCard {
    name: string;
    displayName: string;
    description: string;
    titleText: formattingSettings.TextInput;
    titleColor: formattingSettings.ColorPicker;
    titleFontFamily: formattingSettings.FontPicker;
    titleFontSize: formattingSettings.NumUpDown;
    color: formattingSettings.ColorPicker;
    labelDisplayUnits: formattingSettings.AutoDropdown;
    labelPrecision: formattingSettings.NumUpDown;
    fontSize: formattingSettings.NumUpDown;
    slices: Array<FormattingSettingsSlice>;
}
declare class GMOColumnChartTitleCardSettings extends FormattingSettingsCard {
    name: string;
    displayName: string;
    show: formattingSettings.ToggleSwitch;
    topLevelSlice: formattingSettings.ToggleSwitch;
    titleText: formattingSettings.TextInput;
    fill1: formattingSettings.ColorPicker;
    fontSize: formattingSettings.NumUpDown;
    backgroundColor: formattingSettings.ColorPicker;
    tooltipText: formattingSettings.TextInput;
    slices: Array<FormattingSettingsSlice>;
}
export declare class VisualFormattingSettingsModel extends FormattingSettingsModel {
    legendCard: LegendCardSettings;
    categoryAxisCard: CategoryAxisCardSettings;
    valueAxisCard: ValueAxisCardSettings;
    textWrapCard: TextWrapCardSettings;
    measureTitlesCard: MeasureTitlesCardSettings;
    dataPointCard: DataPointCardSettings;
    labelsCard: LabelsCardSettings;
    totalLabelsCard: TotalLabelsCardSettings;
    secondaryLabelsCard: SecondaryLabelsCardSettings;
    tertiaryLabelsCard: TertiaryLabelsCardSettings;
    quaternaryLabelsCard: QuaternaryLabelsCardSettings;
    fifthLabelsCard: FifthLabelsCardSettings;
    sixthLabelsCard: SixthLabelsCardSettings;
    gmoColumnChartTitleCard: GMOColumnChartTitleCardSettings;
    cards: (LegendCardSettings | CategoryAxisCardSettings | ValueAxisCardSettings | TextWrapCardSettings | MeasureTitlesCardSettings | DataPointCardSettings | LabelsCardSettings | TotalLabelsCardSettings | SecondaryLabelsCardSettings | TertiaryLabelsCardSettings | QuaternaryLabelsCardSettings | FifthLabelsCardSettings | SixthLabelsCardSettings | GMOColumnChartTitleCardSettings)[];
    /**
     * Replace the Data colors card slices with one color picker per legend value.
     * Each picker persists to dataPoint.fill scoped by the series selector, so the
     * chart shows one swatch per value displayed in the legend.
     */
    setDataColors(points: Array<{
        displayName: string;
        color: string;
        selector: any;
    }>): void;
}
export {};
