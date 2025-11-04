export {}

declare global {
  interface Window {
    api: {
      listPlaygrounds: () => Promise<any>
      createGithub: (args: { repoUrl: string; runCommand?: string; port?: number }) => Promise<any>
      createDocker: (args: { image: string; port?: number; extraArgs?: string }) => Promise<any>
      deletePlayground: (id: string) => Promise<void>
      openEditor: (id: string) => Promise<void>
      openTerminal: (id: string) => Promise<void>
      dockerInstalled: () => Promise<boolean>
      dockerStop: (containerId: string) => Promise<void>
      dockerRemove: (containerId: string) => Promise<void>
      startDev: (args: { id: string; command?: string }) => Promise<{ started: boolean; pid?: number; command: string }>
      stopDev: (id: string) => Promise<void>
      getDevLog: (id: string) => Promise<{ running: boolean; log: string }>
      onDevLog: (cb: (payload: { id: string; chunk: string }) => void) => () => void
      onDevExit: (cb: (payload: { id: string; code: number | null; signal: NodeJS.Signals | null }) => void) => () => void
      getAppCatalog: () => Promise<any[]>
      installApp: (appId: string) => Promise<any>
    }
  }
}
