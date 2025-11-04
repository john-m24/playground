export type PlaygroundType = 'github' | 'docker'

export interface BasePlaygroundMeta {
  id: string
  type: PlaygroundType
  createdAt: string // ISO string
}

export interface AppCatalogEntry {
  id: string
  name: string
  description: string
  repoUrl: string
  defaultRunCommand?: string
  defaultPort?: number
  setupInstructions?: string
  requirements?: string[]
  deleteCommand?: string
}

export interface GithubPlaygroundMeta extends BasePlaygroundMeta {
  type: 'github'
  repoUrl: string
  path: string
  runCommand?: string
  port?: number
  appStoreId?: string
}

export interface DockerPlaygroundMeta extends BasePlaygroundMeta {
  type: 'docker'
  image: string
  containerId: string
  port?: number
}

export type PlaygroundMeta = GithubPlaygroundMeta | DockerPlaygroundMeta

export type PlaygroundWithStatus = PlaygroundMeta & {
  status?: 'Running' | 'Stopped' | 'Unknown'
}

