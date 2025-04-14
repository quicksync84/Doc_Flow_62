import { Plugin, PluginMessage } from '../../types';

export class MenuPlugin implements Plugin {
  constructor() {
    console.log('MenuPlugin initialized');
  }

  async handleMessage(msg: PluginMessage): Promise<void> {
    console.log('MenuPlugin handling message:', msg);
    
    // Add any menu-specific message handling here
    if (msg.type === 'menu-action') {
      // Handle menu-specific actions
    }
  }
}