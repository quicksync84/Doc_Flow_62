/// <reference types="@figma/plugin-typings" />

// This will cause the redeclaration error
declare const __html__: string;

console.log('Plugin starting...');

figma.showUI(__html__, {
  width: 300,
  height: 200
});