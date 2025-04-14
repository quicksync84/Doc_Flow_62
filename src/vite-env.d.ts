/// <reference types="vite/client" />

declare const __html__: string;

declare module '*.html' {
  const content: string;
  export default content;
}