import { Plugin } from 'vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export function menuUiPlugin(): Plugin {
  const virtualModuleId = 'virtual:menu-ui';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'vite-plugin-menu-ui',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const menuUiPath = resolve(__dirname, 'src/features/menu/MenuUI.html');
        const content = readFileSync(menuUiPath, 'utf-8');
        return `export default ${JSON.stringify(content)}`;
      }
    }
  };
}