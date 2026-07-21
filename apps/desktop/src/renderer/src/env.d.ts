/// <reference types="vite/client" />

declare module "*.png" {
  const src: string;
  export default src;
}

interface Window {
  panshot?: {
    platform: NodeJS.Platform;
  };
}
