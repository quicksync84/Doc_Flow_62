console.log('Plugin starting...');

// Load bundle from dist directory with increased delay and document check
setTimeout(() => {
  if (document && document.head) {
    console.log('Document ready, adding bundle script');
    const bundleScript = document.createElement('script');
    bundleScript.src = 'dist/bundle.js';
    document.head.appendChild(bundleScript);
    console.log('Bundle script added to document');
  } else {
    console.error('Document not ready for script injection');
  }
}, 300);

figma.showUI(__html__, {
  width: 450,
  height: 600,
  themeColors: true
});

// Parse content from text file
function parseContent(content) {
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
  return components;
}

// Check for hidden text nodes with matching tags
function findHiddenTextNodes(node, contentTags) {
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

  return hiddenNodes;
}

// Handle messages from UI
figma.ui.onmessage = async msg => {
  console.log('Received message:', msg.type, msg);

  if (msg.type === 'analyze-content') {
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

  if (msg.type === 'resolve-warning') {
    try {
      console.log('Resolving warning:', msg);
      const { componentName, tag, undo } = msg;

      const instance = figma.currentPage.findOne(node => 
        node.type === 'INSTANCE' && node.name === componentName
      );

      if (!instance) {
        throw new Error('Component not found');
      }

      const textNode = instance.findOne(node => 
        node.type === 'TEXT' && node.name === tag
      );

      if (!textNode) {
        throw new Error('Text layer not found');
      }

      // Toggle visibility based on undo flag
      textNode.visible = !undo;

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
    try {
      console.log('Resolving all warnings');
      const undo = msg.undo || false;
      const resolvedWarnings = [];
      const errors = [];

      console.log('Processing warnings:', {
        totalWarnings: currentWarnings.size,
        undo
      });

      for (const [key, warning] of currentWarnings.entries()) {
        const { instance, node, originalState } = warning;

        try {
          // Set visibility based on undo flag and original state
          const newVisibility = undo ? originalState : true;
          node.visible = newVisibility;
          warning.resolved = !undo;

          console.log('Updated warning visibility:', {
            key,
            originalState,
            newVisibility,
            resolved: warning.resolved
          });

          resolvedWarnings.push({
            componentName: instance.name,
            tag: node.name,
            resolved: warning.resolved
          });
        } catch (error) {
          errors.push(`Failed to resolve warning in "${instance.name}/${node.name}": ${error.message}`);
        }
      }

      console.log('Warning resolution complete:', {
        resolved: resolvedWarnings.length,
        errors: errors.length
      });
      
      if (errors.length > 0) {
        console.error('Errors during resolution:', errors);
      }

      figma.ui.postMessage({
        type: 'all-warnings-resolved',
        warnings: resolvedWarnings,
        errors,
        reverted: undo
      });

    } catch (error) {
      console.error('Error resolving all warnings:', error);
      figma.ui.postMessage({
        type: 'error',
        error: error.message
      });
    }
  }

  if (msg.type === 'process-content') {
    try {
      console.log('Processing content:', {
        selectedComponents: msg.selectedComponents,
        hasContent: !!msg.content
      });

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
};

// Send initial theme to UI
figma.ui.postMessage({ 
  type: 'theme-update', 
  theme: figma.ui.theme 
});

console.log('Plugin initialized');

// Initialize warnings state