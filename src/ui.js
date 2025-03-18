"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const client_1 = require("react-dom/client");
require("./styles.css");
const App = () => {
    console.log('Initializing React App component');
    const [parentTags, setParentTags] = (0, react_1.useState)('');
    const [fileContent, setFileContent] = (0, react_1.useState)('');
    const [status, setStatus] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const [isProcessing, setIsProcessing] = (0, react_1.useState)(false);
    const handleFileUpload = (0, react_1.useCallback)((event) => {
        console.log('File upload triggered');
        try {
            if (!(event === null || event === void 0 ? void 0 : event.target)) {
                throw new Error('Invalid event object');
            }
            const fileInput = event.target;
            if (!(fileInput === null || fileInput === void 0 ? void 0 : fileInput.files)) {
                throw new Error('File input is not available');
            }
            const file = fileInput.files[0];
            if (!file) {
                throw new Error('Please select a valid file');
            }
            if (file.type !== 'text/plain') {
                throw new Error('Please upload a text file (.txt)');
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                var _a;
                try {
                    console.log('File read completed');
                    const result = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
                    if (!result || typeof result !== 'string') {
                        throw new Error('Failed to read file content');
                    }
                    setFileContent(result);
                    setStatus('File uploaded successfully');
                    setError('');
                }
                catch (err) {
                    console.error('Error in file reader onload:', err);
                    setError('Error reading file: ' + (err instanceof Error ? err.message : 'Unknown error'));
                    setFileContent('');
                }
            };
            reader.onerror = () => {
                console.error('FileReader error occurred');
                setError('Error reading file');
                setFileContent('');
            };
            reader.readAsText(file);
        }
        catch (err) {
            console.error('Error in handleFileUpload:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred during file upload');
            setFileContent('');
        }
    }, []);
    const handleProcess = (0, react_1.useCallback)(() => {
        console.log('Process button clicked');
        try {
            if (!(parentTags === null || parentTags === void 0 ? void 0 : parentTags.trim())) {
                throw new Error('Please enter parent tags');
            }
            if (!(fileContent === null || fileContent === void 0 ? void 0 : fileContent.trim())) {
                throw new Error('Please upload a copy document');
            }
            setIsProcessing(true);
            setError('');
            setStatus('Processing...');
            const tags = parentTags.split(',')
                .map(tag => tag === null || tag === void 0 ? void 0 : tag.trim())
                .filter(tag => tag && tag.length > 0);
            if (tags.length === 0) {
                throw new Error('Please enter valid parent tags');
            }
            console.log('Sending message to plugin code');
            parent.postMessage({
                pluginMessage: {
                    type: 'parse-content',
                    content: fileContent,
                    parentTags: tags
                }
            }, '*');
        }
        catch (err) {
            console.error('Error in handleProcess:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred during processing');
            setIsProcessing(false);
        }
    }, [parentTags, fileContent]);
    (0, react_1.useEffect)(() => {
        console.log('Setting up message listener');
        try {
            const handleMessage = (event) => {
                var _a, _b;
                console.log('Received message from plugin:', (_a = event.data) === null || _a === void 0 ? void 0 : _a.pluginMessage);
                if (!((_b = event === null || event === void 0 ? void 0 : event.data) === null || _b === void 0 ? void 0 : _b.pluginMessage)) {
                    return;
                }
                const message = event.data.pluginMessage;
                setIsProcessing(false);
                if (message.type === 'process-complete') {
                    setStatus('Content population complete!');
                    setError('');
                }
                else if (message.type === 'error' && message.error) {
                    setError(message.error);
                    setStatus('');
                }
            };
            window.addEventListener('message', handleMessage);
            return () => window.removeEventListener('message', handleMessage);
        }
        catch (err) {
            console.error('Error in message listener setup:', err);
            setError('Failed to set up message handling');
        }
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "container", children: [(0, jsx_runtime_1.jsx)("h2", { className: "title", children: "Content Population Plugin" }), (0, jsx_runtime_1.jsxs)("div", { className: "info-box", children: [(0, jsx_runtime_1.jsx)("p", { children: "This plugin requires that all fonts used in your text layers are available in Figma." }), (0, jsx_runtime_1.jsx)("p", { children: "Format your text file with tags like:" }), (0, jsx_runtime_1.jsx)("pre", { children: `{{ParentName}}
  {{ChildTag}}Your content here{{/ChildTag}}
{{/ParentName}}` })] }), (0, jsx_runtime_1.jsx)("div", { className: "section", children: (0, jsx_runtime_1.jsxs)("label", { htmlFor: "parentTags", children: ["Parent Tags (comma-separated):", (0, jsx_runtime_1.jsx)("input", { id: "parentTags", type: "text", value: parentTags, onChange: (e) => { var _a, _b; return setParentTags((_b = (_a = e === null || e === void 0 ? void 0 : e.target) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : ''); }, placeholder: "e.g., Asset 01, Asset 02", className: "input", disabled: isProcessing })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "section", children: (0, jsx_runtime_1.jsxs)("label", { htmlFor: "fileUpload", children: ["Upload Copy Document:", (0, jsx_runtime_1.jsx)("input", { id: "fileUpload", type: "file", accept: ".txt", onChange: handleFileUpload, className: "file-input", disabled: isProcessing })] }) }), (0, jsx_runtime_1.jsx)("button", { onClick: handleProcess, className: "button", disabled: isProcessing || !fileContent || !(parentTags === null || parentTags === void 0 ? void 0 : parentTags.trim()), children: isProcessing ? 'Processing...' : 'Process Content' }), status && (0, jsx_runtime_1.jsx)("div", { className: "status success", children: status }), error && (0, jsx_runtime_1.jsx)("div", { className: "status error", children: error })] }));
};
const mount = () => {
    console.log('Mounting React app');
    try {
        const container = document.getElementById('react-page');
        if (!container) {
            throw new Error('Failed to find root element');
        }
        const root = (0, client_1.createRoot)(container);
        root.render((0, jsx_runtime_1.jsx)(react_1.default.StrictMode, { children: (0, jsx_runtime_1.jsx)(App, {}) }));
        console.log('React app mounted successfully');
    }
    catch (error) {
        console.error('Failed to mount React app:', error);
    }
};
// Ensure the DOM is fully loaded before mounting
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
}
else {
    mount();
}
