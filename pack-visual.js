const fs = require("fs");

const file = "src/visual.ts";

let text = fs.readFileSync(file, "utf8");

const replace = (regex, replacement, description) => {
    const before = text;
    text = text.replace(regex, replacement);

    if (before === text) {
        console.log(`✗ ${description} (no match)`);
    } else {
        console.log(`✓ ${description}`);
    }
};

// -----------------------------------------------------------------------------
// 1. Add font styling for labels
// -----------------------------------------------------------------------------

replace(
/(                   \.attr\('font-size', (\w+)\.fontSize\)\r?\n)/g,
`$1                   .attr('font-family', $2.fontFamily || 'Segoe UI')
                   .attr('fill', $2.color)
                   .attr('font-weight', $2.fontBold ? 'bold' : 'normal')
                   .attr('font-style', $2.fontItalic ? 'italic' : 'normal')
                   .style('text-decoration', $2.fontUnderline ? 'underline' : 'none')
`,
"Label font styling"
);

// -----------------------------------------------------------------------------
// 2. Add title font styling
// -----------------------------------------------------------------------------

replace(
/(               \.attr\('font-family', (\w+)\.titleFontFamily\)\r?\n)/g,
`$1               .attr('font-weight', $2.titleBold ? 'bold' : 'normal')
               .attr('font-style', $2.titleItalic ? 'italic' : 'normal')
               .style('text-decoration', $2.titleUnderline ? 'underline' : 'none')
`,
"Title font styling"
);

// -----------------------------------------------------------------------------
// 3. Add property identifiers
// -----------------------------------------------------------------------------

replace(
/       fontSize: <DataViewObjectPropertyIdentifier>\{ objectName: '(\w+)', propertyName: 'fontSize' \},\s*\r?\n\s*\},/g,
`       fontSize: <DataViewObjectPropertyIdentifier>{ objectName: '$1', propertyName: 'fontSize' },
       fontFamily: <DataViewObjectPropertyIdentifier>{ objectName: '$1', propertyName: 'fontFamily' },
       fontBold: <DataViewObjectPropertyIdentifier>{ objectName: '$1', propertyName: 'fontBold' },
       fontItalic: <DataViewObjectPropertyIdentifier>{ objectName: '$1', propertyName: 'fontItalic' },
       fontUnderline: <DataViewObjectPropertyIdentifier>{ objectName: '$1', propertyName: 'fontUnderline' },
   },`,
"Font property identifiers"
);

// -----------------------------------------------------------------------------
// 4. Add title property identifiers
// -----------------------------------------------------------------------------

replace(
/(       titleFontSize: <DataViewObjectPropertyIdentifier>\{ objectName: '(\w+)', propertyName: 'titleFontSize' \},)/g,
`$1
       titleBold: <DataViewObjectPropertyIdentifier>{ objectName: '$2', propertyName: 'titleBold' },
       titleItalic: <DataViewObjectPropertyIdentifier>{ objectName: '$2', propertyName: 'titleItalic' },
       titleUnderline: <DataViewObjectPropertyIdentifier>{ objectName: '$2', propertyName: 'titleUnderline' },`,
"Title property identifiers"
);

// -----------------------------------------------------------------------------
// 5. Extend interface
// -----------------------------------------------------------------------------

replace(
/   titleFontSize: number;\r?\n   color: string; \r?\n   displayUnits: number; \r?\n   textPrecision: number; \r?\n   fontSize: number; \r?\n\};/g,
`   titleFontSize: number;
   titleBold: boolean;
   titleItalic: boolean;
   titleUnderline: boolean;
   color: string;
   displayUnits: number;
   textPrecision: number;
   fontSize: number;
   fontFamily: string;
   fontBold: boolean;
   fontItalic: boolean;
   fontUnderline: boolean;
};`,
"Interface extension"
);

// -----------------------------------------------------------------------------
// Save file
// -----------------------------------------------------------------------------

fs.writeFileSync(file, text, "utf8");

console.log("\nFinished patching src/visual.ts");