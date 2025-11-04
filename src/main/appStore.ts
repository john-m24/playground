import type { AppCatalogEntry } from '../common/types'

const APP_CATALOG: AppCatalogEntry[] = [
  {
    id: 'onyx',
    name: 'Onyx',
    description: 'Open Source AI Platform - AI Chat with advanced features that works with every LLM',
    repoUrl: 'https://github.com/onyx-dot-app/onyx',
    // defaultRunCommand will be detected from package.json if not provided
    // defaultPort is optional
  },
]

export function getAppCatalog(): AppCatalogEntry[] {
  return APP_CATALOG
}

export function getAppById(id: string): AppCatalogEntry | undefined {
  return APP_CATALOG.find((app) => app.id === id)
}

