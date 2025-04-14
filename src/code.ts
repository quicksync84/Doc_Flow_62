/// <reference types="@figma/plugin-typings" />
import { MenuPlugin } from './features/menu/MenuPlugin';
import { UpflowPlugin } from './features/upflow/UpflowPlugin';

declare const __html__: string;

// Debug logging function
function debugLog(message: string, data?: any) {
  console.log(`[DocFlow Debug] ${message}`, data || '');
  try {
    figma.ui.postMessage({
      type: 'debug',
      message,
      data
    });
  } catch (error) {
    console.error('[DocFlow Error] Failed to send debug message:', error);
  }
}

// Error reporting function
function reportError(error: Error | string, context: string) {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorDetails = error instanceof Error ? error.stack : '';
  
  console.error(`[DocFlow Error] ${context}:`, errorMessage);
  if (errorDetails) console.error('Stack trace:', errorDetails);

  try {
    figma.ui.postMessage({
      type: 'error',
      context,
      message: errorMessage,
      details: errorDetails
    });
  } catch (err) {
    console.error('[DocFlow Error] Failed to send error message:', err);
  }
}

// Initialize plugins
debugLog('Initializing plugins');
const menuPlugin = new MenuPlugin();
const upflowPlugin = new UpflowPlugin();

// Track current plugin state
let currentPlugin = menuPlugin;

// Show main menu UI first
debugLog('Showing initial UI');
try {
  // Show the UI with menu dimensions
  figma.showUI(__html__, {
    width: 450,
    height: 550,
    themeColors: true,
    title: "Doc Flow"
  });
  
  debugLog('Initial UI shown successfully');
} catch (error) {
  reportError(error, 'Failed to show initial UI');
}

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  debugLog('Received message from UI', msg);

  try {
    if (msg.type === 'close') {
      debugLog('Closing plugin');
      figma.closePlugin();
      return;
    }

    if (msg.type === 'navigate') {
      debugLog('Navigation requested', { feature: msg.feature });
      
      switch (msg.feature) {
        case 'upflow':
          debugLog('Switching to UpFlow');
          currentPlugin = upflowPlugin;
          // Load UpFlow UI
          figma.showUI(__html__, {
            width: 450,
            height: 600,
            themeColors: true,
            title: "UpFlow"
          });
          break;

        case 'menu':
          debugLog('Switching to main menu');
          currentPlugin = menuPlugin;
          // Load Menu UI
          figma.showUI(__html__, {
            width: 450,
            height: 550,
            themeColors: true,
            title: "Doc Flow"
          });
          break;

        default:
          throw new Error(`Unknown feature: ${msg.feature}`);
      }
    } else {
      debugLog('Handling message with current plugin', { 
        plugin: currentPlugin.constructor.name,
        messageType: msg.type 
      });
      await currentPlugin.handleMessage(msg);
    }
  } catch (error) {
    reportError(error, 'Message handling error');
  }
};

// Listen for UI events
figma.on('close', () => {
  debugLog('Plugin closing');
});

debugLog('Plugin initialization complete');