import { Plugin, PluginMessage, Component, Warning, AnalysisResult } from '../../types';
import * as fastLevenshtein from 'fast-levenshtein';

export class UpflowPlugin implements Plugin {
  private warnings: Map<string, Warning>;

  constructor() {
    this.warnings = new Map();
  }

  async handleMessage(msg: PluginMessage): Promise<void> {
    if (msg.type === 'analyze-content') {
      await this.handleAnalyzeContent(msg);
    } else if (msg.type === 'process-content') {
      await this.handleProcessContent(msg);
    }
  }

  private async handleAnalyzeContent(msg: PluginMessage): Promise<void> {
    try {
      if (!msg.content) {
        throw new Error('No content provided');
      }

      this.warnings.clear();
      const components = this.parseContent(msg.content);
      const analysis = await this.analyzeComponents(components);

      figma.ui.postMessage({
        type: 'analysis-complete',
        components: analysis
      });
    } catch (error) {
      figma.ui.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  private async handleProcessContent(msg: PluginMessage): Promise<void> {
    try {
      if (!msg.content || !msg.selectedComponents) {
        throw new Error('Missing content or component selection');
      }

      await this.processContent(msg.content, msg.selectedComponents);
    } catch (error) {
      figma.ui.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  private parseContent(content: string): Component[] {
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content');
    }

    const lines = content.trim().split('\n');
    const components: Component[] = [];
    let currentComponent: Component | null = null;
    let currentTag: string | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

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

  private async analyzeComponents(components: Component[]): Promise<AnalysisResult[]> {
    const analysis: AnalysisResult[] = [];

    for (const component of components) {
      const instance = figma.currentPage.findOne(node =>
        node.type === 'INSTANCE' && node.name === component.number
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

        for (const tag of contentTags) {
          const textNode = instance.findOne(node =>
            node.type === 'TEXT' && node.name === tag
          ) as TextNode | null;

          if (!textNode) {
            const allTextNodes = instance.findAll(node =>
              node.type === 'TEXT'
            ) as TextNode[];

            let closestMatch: TextNode | null = null;
            let minimumDistance = Infinity;

            for (const node of allTextNodes) {
              const distance = fastLevenshtein.get(tag.toLowerCase(), node.name.toLowerCase());
              if (distance < minimumDistance) {
                minimumDistance = distance;
                closestMatch = node;
              }
            }

            if (closestMatch && minimumDistance <= 3) {
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

    return analysis;
  }

  private async processContent(content: string, selectedComponents: string[]): Promise<void> {
    try {
      if (!content || !selectedComponents?.length) {
        throw new Error('Missing content or component selection');
      }

      const components = this.parseContent(content);
      const processed: string[] = [];
      const errors: string[] = [];

      for (const component of components) {
        if (!selectedComponents.includes(component.number)) {
          continue;
        }

        const instance = figma.currentPage.findOne(node =>
          node.type === 'INSTANCE' && node.name === component.number
        ) as InstanceNode | null;

        if (!instance) {
          errors.push(`Component "${component.number}" not found`);
          continue;
        }

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
            errors.push(`Failed to update "${tag}" in component "${component.number}": ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
}