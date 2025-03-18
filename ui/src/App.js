"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function App() {
    let fileContent = "";
    const [enableFuzzyMatch, setEnableFuzzyMatch] = (0, react_1.useState)(false);
    const handleFuzzyMatchChange = (event) => {
        const enabled = event.target.checked;
        setEnableFuzzyMatch(enabled);
        // Send updated setting to plugin code
        parent.postMessage({
            pluginMessage: {
                type: 'analyze-content',
                content: fileContent,
                enableFuzzyMatch: enabled
            }
        }, '*');
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "app", children: [(0, jsx_runtime_1.jsx)("h1", { children: "Doc Flow" }), (0, jsx_runtime_1.jsxs)("div", { className: "toggle-group", children: [(0, jsx_runtime_1.jsxs)("label", { className: "switch", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: enableFuzzyMatch, onChange: handleFuzzyMatchChange }), (0, jsx_runtime_1.jsx)("span", { className: "slider" })] }), (0, jsx_runtime_1.jsx)("span", { className: "toggle-label", children: "Enable Fuzzy Matching" })] })] }));
}
exports.default = App;
