console.log('Plugin starting...');

figma.showUI(__html__, {
  width: 300,
  height: 200,
  themeColors: true
});

figma.ui.onmessage = msg => {
  console.log('Message received:', msg);
  
  if (msg.type === 'log') {
    console.log('UI Message:', msg.message);
  }
};