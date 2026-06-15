declare namespace powerbi.extensibility.utils.type {
    
    namespace PixelConverter {
        /**
         * Appends 'px' to the end of number value for use as pixel string in styles
         */
        function toString(px: number): string;
        /**
         * Converts point value (pt) to pixels
         * Returns a string for font-size property
         * e.g. fromPoint(8) => '24px'
         */
        function fromPoint(pt: number): string;
        /**
         * Converts point value (pt) to pixels
         * Returns a number for font-size property
         * e.g. fromPoint(8) => 24px
         */
        function fromPointToPixel(pt: number): number;
        /**
         * Converts pixel value (px) to pt
         * e.g. toPoint(24) => 8
         */
        function toPoint(px: number): number;
    }
}

declare namespace powerbi.extensibility.utils {
    /**
     * Extensions to String class.
     */
    namespace StringExtensions {
        /**
         * Checks if a string ends with a sub-string.
         */
        function endsWith(str: string, suffix: string): boolean;
    }
}
declare namespace powerbi.extensibility.utils.type {
    namespace LogicExtensions {
        function XOR(a: boolean, b: boolean): boolean;
    }
}
declare namespace powerbi.extensibility.utils.type {
    namespace JsonComparer {
        /**
         * Performs JSON-style comparison of two objects.
         */
        function equals<T>(x: T, y: T): boolean;
    }
}
declare namespace powerbi.extensibility.utils.type {
    /**
     * Values are in terms of 'pt'
     * Convert to pixels using PixelConverter.fromPoint
     */
    namespace TextSizeDefaults {
        /**
         * Stored in terms of 'pt'
         * Convert to pixels using PixelConverter.fromPoint
         */
       // const TextSizeMin: number;
        /**
         * Stored in terms of 'pt'
         * Convert to pixels using PixelConverter.fromPoint
         */
       // const TextSizeMax: number;
        /**
         * Returns the percentage of this value relative to the TextSizeMax
         * @param textSize - should be given in terms of 'pt'
         */
        function getScale(textSize: number): number;
    }
}