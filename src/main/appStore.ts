import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import type { AppCatalogEntry } from '../common/types'

// Get directory path - works in both dev and production
// When compiled to CommonJS, __dirname is available
const APPS_DIR = path.join(__dirname, 'apps')

let cachedCatalog: AppCatalogEntry[] | null = null

async function loadAppCatalog(): Promise<AppCatalogEntry[]> {
  // Return cached catalog if available
  if (cachedCatalog !== null) {
    return cachedCatalog
  }

  const catalog: AppCatalogEntry[] = []

  try {
    // Check if apps directory exists
    if (!fs.existsSync(APPS_DIR)) {
      console.warn(`Apps directory not found: ${APPS_DIR}`)
      cachedCatalog = [] // Cache empty result to avoid repeated file system checks
      return []
    }

    // Read all files in apps directory
    const files = await fsp.readdir(APPS_DIR)

    // Filter for JSON files
    const jsonFiles = files.filter((file) => file.endsWith('.json'))

    // Load each JSON file
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(APPS_DIR, file)
        const content = await fsp.readFile(filePath, 'utf-8')
        const appConfig = JSON.parse(content) as AppCatalogEntry

        // Validate required fields
        if (!appConfig.id || !appConfig.name || !appConfig.description || !appConfig.repoUrl) {
          console.warn(`Invalid app config in ${file}: missing required fields`)
          continue
        }

        // Ensure id matches filename (without .json extension)
        const expectedId = file.replace(/\.json$/, '')
        if (appConfig.id !== expectedId) {
          console.warn(`App id mismatch in ${file}: expected ${expectedId}, got ${appConfig.id}`)
          appConfig.id = expectedId // Use filename as id
        }

        catalog.push(appConfig)
      } catch (error) {
        console.error(`Error loading app config from ${file}:`, error)
        // Continue with other files
      }
    }

    // Cache the catalog
    cachedCatalog = catalog
    return catalog
  } catch (error) {
    console.error('Error loading app catalog:', error)
    return []
  }
}

export async function getAppCatalog(): Promise<AppCatalogEntry[]> {
  return loadAppCatalog()
}

export async function getAppById(id: string): Promise<AppCatalogEntry | undefined> {
  const catalog = await getAppCatalog()
  return catalog.find((app) => app.id === id)
}

