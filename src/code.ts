import * as fastLevenshtein from 'fast-levenshtein';

figma.showUI(__html__, {
  width: 300,
  height: 200,
  themeColors: true
});

figma.ui.onmessage = async msg => {
  console.log('Message received:', msg);
  
  if (msg.type === 'log') {
    console.log('UI Message:', msg.message);
  } else if (msg.type === 'analyze-content') {
    try {
      if (!msg.content) {
        throw new Error('No content provided');
      }

      const textNode = figma.currentPage.findOne(node =>
        node.type === 'TEXT' && node.name === msg.tag
      );

      if (!textNode) {
        // Find all text nodes in the instance
        const allTextNodes = figma.currentPage.findAll(node => node.type === 'TEXT');
        
        // Calculate Levenshtein distance for each text node
        let closestMatch = null;
        let minimumDistance = Infinity;
        
        for (const node of allTextNodes) {
          const distance = fastLevenshtein.get(msg.tag.toLowerCase(), node.name.toLowerCase());
          if (distance < minimumDistance) {
            minimumDistance = distance;
            closestMatch = node;
          }
        }
        
        // If we found a close match (distance <= 3) and fuzzy matching is enabled, add a warning
        if (closestMatch && minimumDistance <= 3 && msg.enableFuzzyMatch) {
          figma.ui.postMessage({
            type: 'warning',
            warning: {
              type: 'fuzzy-match',
              tag: msg.tag,
              matchedTag: closestMatch.name,
              distance: minimumDistance,
              message: `Fuzzy match found: "${msg.tag}" -> "${closestMatch.name}" (distance: ${minimumDistance})`
            }
          });
        } else {
          figma.ui.postMessage({
            type: 'error',
            error: `Missing "${msg.tag}"`
          });
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      figma.ui.postMessage({
        type: 'error',
        error: error.message
      });
    }
  }
};