/**
 * Runtime proxy for handling HTML content injection in Figma plugins
 */

// Type definitions
type HTMLGetter = () => string;
type HTMLSetter = (value: string) => void;

// Runtime state
let runtimeHTML: string | undefined;
let originalGetter: HTMLGetter | undefined;
let originalSetter: HTMLSetter | undefined;

// Type guard for runtime HTML
function isHTMLInitialized(): boolean {
  return typeof runtimeHTML === 'string';
}

/**
 * Gets the current HTML content
 * @throws Error if HTML is not initialized
 */
function getHTML(): string {
  if (!isHTMLInitialized()) {
    throw new Error('HTML content accessed before initialization');
  }
  return runtimeHTML ? runtimeHTML : "";
}

/**
 * Sets the HTML content
 * @param value HTML content to set
 */
function setHTML(value: string): void {
  if (typeof value !== 'string') {
    throw new Error('Invalid HTML content type');
  }
  runtimeHTML = value;
}

/**
 * Backs up original property descriptors if they exist
 */
function backupOriginalDescriptors(): void {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, '__html__');
  if (descriptor) {
    originalGetter = descriptor.get as HTMLGetter;
    originalSetter = descriptor.set as HTMLSetter;
  }
}

/**
 * Sets up the runtime interceptor
 * @throws Error if setup fails
 */
export function setupRuntimeInterceptor(): void {
  try {
    // Backup any existing descriptors
    backupOriginalDescriptors();

    // Define the interceptor property
    Object.defineProperty(globalThis, '__html__', {
      configurable: true,
      enumerable: true,
      get(): string {
        // Try original getter first if available
        if (originalGetter) {
          try {
            const value = originalGetter();
            if (typeof value === 'string') {
              setHTML(value);
              return value;
            }
          } catch (e) {
            // Fallback to our implementation if original getter fails
          }
        }
        return getHTML();
      },
      set(value: string): void {
        // Try original setter first if available
        if (originalSetter) {
          try {
            originalSetter(value);
          } catch (e) {
            // Fallback to our implementation if original setter fails
          }
        }
        setHTML(value);
      }
    });

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[RuntimeProxy] Interceptor setup complete');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`[RuntimeProxy] Setup failed: ${message}`);
  }
}

/**
 * Gets the current runtime HTML content
 * @returns The current HTML content
 * @throws Error if HTML is not initialized
 */
export function getRuntimeHTML(): string {
  return getHTML();
}

/**
 * Initializes the runtime with HTML content
 * @param html The HTML content to initialize
 * @throws Error if HTML content is invalid
 */
export function initializeRuntime(html: string): void {
  setHTML(html);
}