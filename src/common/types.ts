export type PlaygroundType = 'github' | 'docker'

export interface BasePlaygroundMeta {
  id: string
  type: PlaygroundType
  createdAt: string // ISO string
}

export interface GithubPlaygroundMeta extends BasePlaygroundMeta {
  type: 'github'
  repoUrl: string
  path: string
  runCommand?: string
  port?: number
}

export interface DockerPlaygroundMeta extends BasePlaygroundMeta {
  type: 'docker'
  image: string
  containerId: string
  port?: number
}

export type PlaygroundMeta = GithubPlaygroundMeta | DockerPlaygroundMeta

export interface PlaygroundWithStatus extends PlaygroundMeta {
  status?: 'Running' | 'Stopped' | 'Unknown'
}

