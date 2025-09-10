// src/global.d.ts
interface Window {
  ethereum?: {
    request: (...args: any[]) => Promise<any>;
  };
}
