/// <reference types="vite/client" />

declare module 'vite/client' {
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string
    readonly VITE_APPWRITE_PROJECT_ID: string
    readonly VITE_APPWRITE_ENDPOINT: string
    readonly VITE_APPWRITE_DATABASE_ID: string
    readonly VITE_APPWRITE_TASKS_COLLECTION_ID: string
    readonly VITE_GOOGLE_CLIENT_ID: string
    readonly VITE_GOOGLE_CLIENT_SECRET: string
    readonly VITE_DODO_PUBLIC_KEY: string
    readonly VITE_DODO_PRO_PLAN_ID: string
    readonly VITE_DODO_ENTERPRISE_PLAN_ID: string
  }
}
