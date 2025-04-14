export function postMessageToPlugin(message: any) {
  parent.postMessage({ 
    pluginMessage: message
  }, '*');
}

export function handlePluginMessage(callback: (message: any) => void) {
  window.onmessage = (event) => {
    const message = event.data.pluginMessage;
    if (message) {
      callback(message);
    }
  };
}