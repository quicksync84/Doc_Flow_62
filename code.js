console.log('Plugin starting...');

figma.showUI(__html__, {
  width: 450,
  height: 600,
  themeColors: true
});

// Send initial theme to UI
figma.ui.postMessage({ 
  type: 'theme-update', 
  theme: figma.ui.theme 
});

console.log('Plugin initialized');

// Initialize warnings state at the top level
let currentWarnings = new Map();

// Parse content from text file
function parseContent(content) {
    console.log("parseContent Started");
    if (!content || typeof content !== 'string') {
        throw new Error('Invalid content');
    }

    console.log('Parsing content...');

    const lines = content.trim().split('\n');
    const components = [];
    let currentComponent = null;
    let currentTag = null;
    let currentContent = [];

    console.log('Processing lines:', lines.length);

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Match component number [123]
        const componentMatch = trimmed.match(/^\[(\d+)\]$/);
        if (componentMatch) {
            console.log('Found component:', componentMatch[1]);

            // Save previous component's last tag if exists
            if (currentComponent && currentTag && currentContent.length > 0) {
                currentComponent.content[currentTag] = currentContent.join('\n').trim();
                currentContent = [];
            }

            // Save previous component if exists
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
            console.log('Found tag:', tagMatch[1]);

            // Save previous tag's content if exists
            if (currentTag && currentContent.length > 0) {
                currentComponent.content[currentTag] = currentContent.join('\n').trim();
                currentContent = [];
            }

            currentTag = tagMatch[1].trim();
            continue;
        }

        // Add content to current tag
        if (currentComponent && currentTag) {
            currentContent.push(trimmed);
        }
    }

    // Save last component's content
    if (currentComponent && currentTag && currentContent.length > 0) {
        currentComponent.content[currentTag] = currentContent.join('\n').trim();
    }
    if (currentComponent) {
        components.push(currentComponent);
    }

    console.log('Parsed components:', components);
    console.log("parseContent Finished");
    return components;
}

// Check for hidden text nodes with matching tags
function findHiddenTextNodes(node, contentTags) {
    console.log("findHiddenTextNodes Started");
    const hiddenNodes = [];
    if (!node) return hiddenNodes;

    if (node.type === 'TEXT' && !node.visible) {
        // Only include if the node's name matches a content tag
        if (contentTags.includes(node.name)) {
            console.log('Found hidden text node with matching tag:', node.name);
            hiddenNodes.push(node);
        }
    }

    if ('children' in node) {
        for (const child of node.children) {
            hiddenNodes.push(...findHiddenTextNodes(child, contentTags));
        }
    }
    console.log("findHiddenTextNodes Finished");
    return hiddenNodes;
}

// Handle messages from UI
figma.ui.onmessage = async msg => {
    console.log('Received message:', msg.type, msg);
    console.log('figma.ui.onmessage Started', { messageType: msg.type });

    if (msg.type === 'analyze-content') {
        console.log('analyze-content Started');
        try {
            if (!msg.content) {
                throw new Error('No content provided');
            }

            // Reset warnings state for new analysis
            currentWarnings = new Map();
            console.log('Warnings state reset for new analysis');

            const components = parseContent(msg.content);
            const analysis = [];

            for (const component of components) {
                console.log('Analyzing component:', component.number);

                const instance = figma.currentPage.findOne(node =>
                    node.type === 'INSTANCE' && node.name === component.number
                );

                const result = {
                    name: component.number,
                    tags: Object.keys(component.content),
                    errors: [],
                    warnings: []
                };

                if (!instance) {
                    result.errors.push('Component not found');
                } else {
                    // Get content tags for this component
                    const contentTags = Object.keys(component.content).filter(tag =>
                        tag !== 'Image' && tag !== 'Logo'
                    );
                    console.log('Content tags:', contentTags);

                    // Find hidden text nodes that have matching content tags
                    const hiddenNodes = findHiddenTextNodes(instance, contentTags);
                    if (hiddenNodes.length > 0) {
                        console.log('Found hidden text nodes with content:', hiddenNodes);
                        hiddenNodes.forEach(node => {
                            // Store warning with original visibility state
                            const key = `${component.number}:${node.name}`;
                            currentWarnings.set(key, {
                                instance,
                                node,
                                originalState: node.visible,
                                resolved: false
                            });
                            console.log('Stored warning state:', key, { visible: node.visible });

                            result.warnings.push({
                                type: 'hidden',
                                tag: node.name,
                                message: 'Hidden Layer'
                            });
                        });
                    }

                    // Check text nodes
                    for (const tag of contentTags) {
                        const textNode = instance.findOne(node =>
                            node.type === 'TEXT' && node.name === tag
                        );

                        if (!textNode) {
                            result.errors.push(`Missing "${tag}"`);
                        }
                    }
                }

                console.log('Component analysis:', result);
                analysis.push(result);
            }

            console.log('Analysis complete:', analysis);

            figma.ui.postMessage({
                type: 'analysis-complete',
                components: analysis
            });

        } catch (error) {
            console.error('Analysis error:', error);
            figma.ui.postMessage({
                type: 'error',
                error: error.message
            });
        }
    }

    if (msg.type === 'process-content') {
        console.log('process-content Started', msg);
        try {
            if (!msg.content || !msg.selectedComponents) {
                throw new Error('Missing content or component selection');
            }

            const components = parseContent(msg.content);
            const processed = [];
            const errors = [];

            for (const component of components) {
                // Skip if component is not selected
                if (!msg.selectedComponents.includes(component.number)) {
                    console.log('Skipping unselected component:', component.number);
                    continue;
                }

                console.log('Processing component:', component.number);

                const instance = figma.currentPage.findOne(node =>
                    node.type === 'INSTANCE' && node.name === component.number
                );

                if (!instance) {
                    errors.push(`Component "${component.number}" not found`);
                    continue;
                }

                // Update text nodes
                for (const [tag, content] of Object.entries(component.content)) {
                    if (tag === 'Image' || tag === 'Logo') continue;

                    const textNode = instance.findOne(node =>
                        node.type === 'TEXT' && node.name === tag
                    );

                    if (!textNode) {
                        errors.push(`Text node "${tag}" not found in component "${component.number}"`);
                        continue;
                    }

                    try {
                        await figma.loadFontAsync(textNode.fontName);
                        textNode.characters = content;
                        processed.push(component.number);
                    } catch (error) {
                        errors.push(`Failed to update "${tag}" in component "${component.number}": ${error.message}`);
                    }
                }
            }

            console.log('Processing complete:', {
                processed,
                errors
            });

            figma.ui.postMessage({
                type: 'process-complete',
                report: {
                    processed: processed.length,
                    errors
                }
            });

        } catch (error) {
            console.error('Processing error:', error);
            figma.ui.postMessage({
                type: 'error',
                error: error.message
            });
        }
    }

    if (msg.type === 'resolve-warning') {
        console.log('Handling resolve warning:', msg);
        try {
            const { componentName, tag, undo } = msg;
            
            if (!componentName || !tag) {
                throw new Error('Missing component name or tag');
            }

            const key = `${componentName}:${tag}`;
            console.log('Looking up warning with key:', key);
            
            const warning = currentWarnings.get(key);
            if (!warning) {
                throw new Error(`Warning not found for ${componentName}/${tag}`);
            }

            const { instance, node } = warning;
            if (!instance || !node) {
                throw new Error('Invalid warning data');
            }

            // Update node visibility
            node.visible = !undo;
            console.log('Node visibility updated in resolve-warning:', { nodeName: node.name, visible: node.visible });
            console.log('Updated node visibility:', { node: node.name, visible: node.visible });

            // Update warning state
            warning.resolved = !undo;
            currentWarnings.set(key, warning);

            figma.ui.postMessage({
                type: 'warning-resolved',
                componentName,
                tag,
                resolved: !undo
            });

        } catch (error) {
            console.error('Error resolving warning:', error);
            figma.ui.postMessage({
                type: 'error',
                error: error.message
            });
        }
    }

    if (msg.type === 'resolve-all-warnings') {
        console.log('Received resolve-all-warnings message:', msg);
        console.log('resolve-all-warnings handler called:', msg.resolve);
        console.log('Starting resolve-all-warnings handler');
        console.log('Current warnings map size:', currentWarnings.size);
        console.log('Current warnings keys:', Array.from(currentWarnings.keys()));

        try {
            const resolvedWarnings = [];
            const errors = [];

            console.log('Current warnings map size before loop:', currentWarnings.size);

            // Log initial state of warnings
            for (const [key, warning] of currentWarnings) {
                console.log('Processing warning in first loop:', key);
                console.log('Warning state before processing:', {
                    key,
                    nodeVisible: warning.node ? warning.node.visible : undefined,
                    resolved: warning.resolved,
                    hasInstance: !!warning.instance,
                    hasNode: !!warning.node
                });
            }

            for (const [key, warning] of currentWarnings) {
                console.log('Processing warning in second loop:', key);
                try {
                    const { instance, node } = warning;
                    if (!instance || !node) {
                        console.error('Invalid warning data for key:', key, {
                            hasInstance: !!instance,
                            hasNode: !!node
                        });
                        throw new Error('Invalid warning data');
                    }

                    // Update node visibility
                    console.log('Updating node visibility:', {
                        key,
                        nodeName: node.name,
                        beforeVisible: node.visible
                    });

                    node.visible = true;
                    console.log('Node visibility updated in resolve-all-warnings:', { nodeName: node.name, visible: node.visible });
                    warning.resolved = true;
                    currentWarnings.set(key, warning);

                    console.log('Node visibility updated:', {
                        key,
                        nodeName: node.name,
                        afterVisible: node.visible,
                        resolved: warning.resolved
                    });

                    const [componentName, tag] = key.split(':');
                    resolvedWarnings.push({ componentName, tag });
                    
                    console.log('Warning resolved successfully:', {
                        componentName,
                        tag,
                        key,
                        nodeVisible: node.visible,
                        warningResolved: warning.resolved
                    });
                } catch (error) {
                    console.error('Error resolving warning:', error);
                    console.error('Warning data:', {
                        key,
                        warning: currentWarnings.get(key)
                    });
                    errors.push(`Failed to resolve warning: ${error.message}`);
                }
            }

            console.log('Resolve all warnings complete:', {
                resolvedCount: resolvedWarnings.length,
                errorCount: errors.length,
                remainingWarnings: currentWarnings.size
            });

            // Log final state of all warnings
            for (const [key, warning] of currentWarnings) {
                console.log('Warning state after processing:', {
                    key,
                    nodeVisible: warning.node ? warning.node.visible : undefined,
                    resolved: warning.resolved
                });
            }

            figma.ui.postMessage({
                type: 'all-warnings-resolved',
                warnings: resolvedWarnings,
                errors
            });

        } catch (error) {
            console.error('Error resolving all warnings:', error);
            figma.ui.postMessage({
                type: 'error',
                error: error.message
            });
        }
    }
}