/// <reference types="@figma/plugin-typings" />

const fastLevenshtein = require('fast-levenshtein');

interface Warning {
  instance: InstanceNode;
  node: TextNode;
  originalState: boolean;
  resolved: boolean;
}

interface ComponentContent {
  [key: string]: string;
}

interface Component {
  number: string;
  content: ComponentContent;
}

interface AnalysisResult {
  name: string;
  tags: string[];
  errors: string[];
  warnings: {
    type: string;
    tag: string;
    message: string;
    matchedTag?: string;
    distance?: number;
  }[];
}

// Initialize warnings state at the top level
let currentWarnings = new Map<string, Warning>();

figma.showUI(__html__, {
  width: 450,
  height: 600,
  themeColors: true,
  title: "Doc Flow"
});

// Parse content from text file
function parseContent(content: string): Component[] {
  if (!content || typeof content !== 'string') {
    throw new Error('Invalid content');
  }

  const lines = content.trim().split('\n');
  const components: Component[] = [];
  let currentComponent: Component | null = null;
  let currentTag = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

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
        content: {} as ComponentContent
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
function findHiddenTextNodes(node: SceneNode, contentTags: string[]): TextNode[] {
  const hiddenNodes: TextNode[] = [];
  if (!node) return [];

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
figma.ui.onmessage = async msg => {
  if (msg.type === 'analyze-content') {
    try {
      if (!msg.content) {
        throw new Error('No content provided');
      }

      currentWarnings = new Map();
      const components = parseContent(msg.content);
      const analysis: AnalysisResult[] = [];

      for (const component of components) {
        const instance = figma.currentPage.findOne(node =>
          node && node.type === 'INSTANCE' && node.name === component.number
        ) as InstanceNode | null;

        const result: AnalysisResult = {
          name: component.number,
          tags: Object.keys(component.content),
          errors: [],
          warnings: []
        };

        if (!instance) {
          result.errors.push('Component not found');
        } else {
          const contentTags = Object.keys(component.content).filter(tag =>
            tag !== 'Image' && tag !== 'Logo'
          );

          const hiddenNodes = findHiddenTextNodes(instance, contentTags);
          if (hiddenNodes.length > 0) {
            hiddenNodes.forEach((node: TextNode) => {
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
            const textNode = instance.findOne(node =>
              node && node.type === 'TEXT' && node.name === tag
            ) as TextNode | null;

            if (!textNode) {
              const allTextNodes = instance.findAll(node => node && node.type === 'TEXT') as TextNode[];
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
              } else {
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

    } catch (error) {
      figma.ui.postMessage({
        type: 'error',
        error: (error as Error).message
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

        const instance = figma.currentPage.findOne(node =>
          node && node.type === 'INSTANCE' && node.name === component.number) as InstanceNode | null;

        if (!instance) {
          errors.push(`Component "${component.number}" not found`);
          continue;
        }

        // Update text nodes
        for (const [tag, content] of Object.entries(component.content)) {
          if (tag === 'Image' || tag === 'Logo') continue;

          const textNode = instance.findOne(node =>
            node.type === 'TEXT' && node.name === tag
          ) as TextNode | null;

          if (!textNode) {
            errors.push(`Text node "${tag}" not found in component "${component.number}"`);
            continue;
          }

          try {
            if (textNode.fontName !== figma.mixed) {
              await figma.loadFontAsync(textNode.fontName);
            }
            textNode.characters = content;
            processed.push(component.number);
          } catch (error) {
            errors.push(`Failed to update "${tag}" in component "${component.number}": ${(error as Error).message}`);
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

    } catch (error) {
      figma.ui.postMessage({
        type: 'error',
        error: (error as Error).message
      });
    }
  }
};