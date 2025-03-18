"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setHTML = setHTML;
exports.getHTML = getHTML;
// Create a proxy module to handle HTML content
let htmlContent = null;
function setHTML(content) {
    htmlContent = content;
}
function getHTML() {
    if (htmlContent === null) {
        throw new Error('HTML content not set');
    }
    return htmlContent;
}
