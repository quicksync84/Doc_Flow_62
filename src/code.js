"use strict";
/// <reference types="@figma/plugin-typings" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fastLevenshtein = require('fast-levenshtein');
// Initialize warnings state at the top level
let currentWarnings = new Map();
figma.showUI(__html__, {
    width: 450,
    height: 600,
    themeColors: true,
    title: "Doc Flow"
});
// Parse content from text file
function parseContent(content) {
    if (!content || typeof content !== 'string') {
        throw new Error('Invalid content');
    }
    const lines = content.trim().split('\n');
    const components = [];
    let currentComponent = null;
    let currentTag = null;
    let currentContent = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        // Match component number [123]
        const componentMatch = trimmed.match(/^\[(\d+)\]$/);
        if (componentMatch) {
            if (currentComponent && currentTag && currentContent.length > 0) {
                currentComponent.content[currentTag] = currentContent.join('\n').trim();
                currentContent = [];
            }
            if (currentComponent) {
                components.push(currentComponent);
            }
            currentComponent = {
                number: componentMatch[1],
                content: {}
            };
            currentTag = null;
            continue;
        }
        // Match content tag [Tag Name]
        const tagMatch = trimmed.match(/^\[(.*?)\]$/);
        if (tagMatch && currentComponent) {
            if (currentTag && currentContent.length > 0) {
                currentComponent.content[currentTag] = currentContent.join('\n').trim();
                currentContent = [];
            }
            currentTag = tagMatch[1].trim();
            continue;
        }
        if (currentComponent && currentTag) {
            currentContent.push(trimmed);
        }
    }
    if (currentComponent && currentTag && currentContent.length > 0) {
        currentComponent.content[currentTag] = currentContent.join('\n').trim();
    }
    if (currentComponent) {
        components.push(currentComponent);
    }
    return components;
}
// Check for hidden text nodes with matching tags
function findHiddenTextNodes(node, contentTags) {
    const hiddenNodes = [];
    if (!node)
        return [];
    if (node.type === 'TEXT' && !node.visible) {
        if (contentTags.includes(node.name)) {
            hiddenNodes.push(node);
        }
    }
    if ('children' in node) {
        for (const child of node.children) {
            if ('findAll' in child) {
                hiddenNodes.push(...findHiddenTextNodes(child, contentTags));
            }
        }
    }
    return hiddenNodes;
}
// Handle messages from UI
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (msg.type === 'analyze-content') {
        try {
            if (!msg.content) {
                throw new Error('No content provided');
            }
            currentWarnings = new Map();
            const components = parseContent(msg.content);
            const analysis = [];
            for (const component of components) {
                const instance = figma.currentPage.findOne(node => node && node.type === 'INSTANCE' && node.name === component.number);
                const result = {
                    name: component.number,
                    tags: Object.keys(component.content),
                    errors: [],
                    warnings: []
                };
                if (!instance) {
                    result.errors.push('Component not found');
                }
                else {
                    const contentTags = Object.keys(component.content).filter(tag => tag !== 'Image' && tag !== 'Logo');
                    const hiddenNodes = findHiddenTextNodes(instance, contentTags);
                    if (hiddenNodes.length > 0) {
                        hiddenNodes.forEach((node) => {
                            const key = `${component.number}:${node.name}`;
                            currentWarnings.set(key, {
                                instance,
                                node,
                                originalState: node.visible,
                                resolved: false
                            });
                            result.warnings.push({
                                type: 'hidden',
                                tag: node.name,
                                message: 'Hidden Layer'
                            });
                        });
                    }
                    for (const tag of contentTags) {
                        const textNode = instance.findOne(node => node && node.type === 'TEXT' && node.name === tag);
                        if (!textNode) {
                            const allTextNodes = instance.findAll(node => node && node.type === 'TEXT');
                            let closestMatch = null;
                            let minimumDistance = Infinity;
                            for (const node of allTextNodes) {
                                const distance = fastLevenshtein.get(tag.toLowerCase(), node.name.toLowerCase());
                                if (distance < minimumDistance) {
                                    minimumDistance = distance;
                                    closestMatch = node;
                                }
                            }
                            if (closestMatch && minimumDistance <= 3 && msg.enableFuzzyMatch) {
                                result.warnings.push({
                                    type: 'fuzzy-match',
                                    tag: tag,
                                    matchedTag: closestMatch.name,
                                    distance: minimumDistance,
                                    message: `Fuzzy match found: "${tag}" -> "${closestMatch.name}" (distance: ${minimumDistance})`
                                });
                            }
                            else {
                                result.errors.push(`Missing "${tag}"`);
                            }
                        }
                    }
                }
                analysis.push(result);
            }
            figma.ui.postMessage({
                type: 'analysis-complete',
                components: analysis
            });
        }
        catch (error) {
            figma.ui.postMessage({
                type: 'error',
                error: error.message
            });
        }
    }
    if (msg.type === 'process-content') {
        try {
            if (!msg.content || !msg.selectedComponents) {
                throw new Error('Missing content or component selection');
            }
            const components = parseContent(msg.content);
            const processed = [];
            const errors = [];
            for (const component of components) {
                if (!msg.selectedComponents.includes(component.number)) {
                    continue;
                }
                const instance = figma.currentPage.findOne(node => node && node.type === 'INSTANCE' && node.name === component.number);
                if (!instance) {
                    errors.push(`Component "${component.number}" not found`);
                    continue;
                }
                // Update text nodes
                for (const [tag, content] of Object.entries(component.content)) {
                    if (tag === 'Image' || tag === 'Logo')
                        continue;
                    const textNode = instance.findOne(node => node.type === 'TEXT' && node.name === tag);
                    if (!textNode) {
                        errors.push(`Text node "${tag}" not found in component "${component.number}"`);
                        continue;
                    }
                    try {
                        if (textNode.fontName !== figma.mixed) {
                            yield figma.loadFontAsync(textNode.fontName);
                        }
                        textNode.characters = content;
                        processed.push(component.number);
                    }
                    catch (error) {
                        errors.push(`Failed to update "${tag}" in component "${component.number}": ${error.message}`);
                    }
                }
            }
            figma.ui.postMessage({
                type: 'process-complete',
                report: {
                    processed: processed.length,
                    errors
                }
            });
        }
        catch (error) {
            figma.ui.postMessage({
                type: 'error',
                error: error.message
            });
        }
    }
});
