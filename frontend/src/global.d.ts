// src/global.d.ts
interface Window {
  ethereum?: {
    request: (...args: any[]) => Promise<any>;
  };
}
// TypeScript global declarations only; remove CSS and @import statements from this file.