module.exports = function(source) {
  // Store the HTML content in a module-scoped variable
  const html = source;
  
  // Return a module that exports a function to get the HTML
  return `
    let __html__ = ${JSON.stringify(html)};
    export function getHTML() { return __html__; }
  `;
}