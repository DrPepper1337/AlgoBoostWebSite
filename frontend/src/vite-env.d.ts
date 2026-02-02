/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GCAL_ID: string;
  readonly VITE_GCAL_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
