# Figma Plugin __html__ Declaration Issue Report

## Issue Description
When developing a Figma plugin using TypeScript and Webpack, we encounter a TypeScript error regarding the redeclaration of the `__html__` variable. This variable is injected by Figma's plugin runtime but causes compilation errors when using TypeScript.

## Reproduction Steps
1. Create a new Figma plugin with TypeScript and Webpack
2. Use the `figma.showUI(__html__, options)` API
3. Attempt to compile the plugin

## Error Message
```
error TS2451: Cannot redeclare block-scoped variable '__html__'.
```

## Attempted Solutions

### 1. Webpack Define Plugin
- Attempted to use DefinePlugin to provide the variable at build time
- Result: Failed - Runtime still injects the variable causing conflict

### 2. Custom HTML Loader
- Created a custom Webpack loader to handle HTML content
- Result: Failed - Runtime injection still conflicts with loader-provided variable

### 3. Proxy Module Pattern
- Implemented a proxy module to manage HTML content
- Result: Failed - Cannot intercept runtime injection

### 4. TypeScript Configuration
- Modified TypeScript configuration to ignore the variable
- Result: Failed - TypeScript still detects the redeclaration

## Minimal Reproduction Repository
We have created a minimal reproduction of the issue in the `minimal-repro` directory that demonstrates the problem with the smallest possible codebase.

## Technical Details

### Environment
- Figma Plugin API Version: 1.0.0
- TypeScript Version: 5.3.3
- Webpack Version: 5.89.0

### Key Files
1. `code.ts` - Main plugin code
2. `webpack.config.js` - Build configuration
3. `tsconfig.json` - TypeScript configuration

## Impact
This issue blocks proper TypeScript compilation and affects the development workflow of plugins that use the UI API. While runtime functionality is not affected, it creates development and type-checking issues.

## Request
We request guidance on:
1. The intended way to handle the `__html__` variable in TypeScript
2. Whether there are plans to provide TypeScript-friendly alternatives
3. Any official workarounds or best practices for this scenario

## Additional Notes
- The issue appears to be specific to the TypeScript compilation phase
- Runtime functionality remains intact despite the compilation error
- This affects both development and production builds