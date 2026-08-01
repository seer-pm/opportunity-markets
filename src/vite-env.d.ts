/// <reference types="vite/client" />

// Fallback so the IDE resolves these modules when using moduleResolution: "bundler"
declare module '@tanstack/react-query';
declare module 'connectkit';
declare module 'wagmi';

interface ImportMetaEnv {
  readonly VITE_REOWN_PROJECT_ID?: string;
  readonly VITE_GNOSIS_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
