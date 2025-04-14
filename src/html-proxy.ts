// Create a proxy module to handle HTML content
let htmlContent: string | null = null;

export function setHTML(content: string) {
  htmlContent = content;
}

export function getHTML(): string {
  if (htmlContent === null) {
    throw new Error('HTML content not set');
  }
  return htmlContent;
}