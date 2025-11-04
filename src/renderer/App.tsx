import React, { useEffect, useMemo, useState } from 'react'
import type { PlaygroundWithStatus } from '../common/types'

type TError = string | null

export default function App() {
  const [list, setList] = useState<PlaygroundWithStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<TError>(null)
  const [formGit, setFormGit] = useState({ repoUrl: '', runCommand: '', port: '' })
  const [formDocker, setFormDocker] = useState({ image: '', port: '', extraArgs: '' })
  const [dockerInstalled, setDockerInstalled] = useState<boolean | null>(null)
  const [openLogId, setOpenLogId] = useState<string | null>(null)
  const [running, setRunning] = useState<Record<string, boolean>>({})
  const [logs, setLogs] = useState<Record<string, string>>({})

  const refresh = async () => {
    setLoading(true)
    setErr(null)
    try {
      const data = await window.api.listPlaygrounds()
      setList(data)
    } catch (e: any) {
      setErr(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    window.api.dockerInstalled().then(setDockerInstalled).catch(() => setDockerInstalled(false))
    const unlog = window.api.onDevLog(({ id, chunk }) => {
      setLogs((prev) => ({ ...prev, [id]: ((prev[id] || '') + chunk).slice(-20000) }))
      setRunning((prev) => ({ ...prev, [id]: true }))
    })
    const unexit = window.api.onDevExit(({ id }) => {
      setRunning((prev) => ({ ...prev, [id]: false }))
    })
    return () => {
      unlog()
      unexit()
    }
  }, [])

  async function onCreateGithub(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    try {
      const port = formGit.port ? Number(formGit.port) : undefined
      await window.api.createGithub({ repoUrl: formGit.repoUrl, runCommand: formGit.runCommand || undefined, port })
      setFormGit({ repoUrl: '', runCommand: '', port: '' })
      await refresh()
    } catch (e: any) {
      setErr(e?.message || String(e))
    }
  }

  async function onCreateDocker(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    try {
      const port = formDocker.port ? Number(formDocker.port) : undefined
      await window.api.createDocker({ image: formDocker.image, port, extraArgs: formDocker.extraArgs || undefined })
      setFormDocker({ image: '', port: '', extraArgs: '' })
      await refresh()
    } catch (e: any) {
      setErr(e?.message || String(e))
    }
  }

  const githubItems = useMemo(() => list.filter((x) => x.type === 'github'), [list])
  const dockerItems = useMemo(() => list.filter((x) => x.type === 'docker'), [list])

  return (
    <div className="container">
      <h1>Playgrounds</h1>
      <p className="muted small">Quickly clone GitHub repos and run Docker images. Base dir: ~/.playgrounds</p>
      {err && <p style={{ color: 'tomato' }}>Error: {err}</p>}

      <div className="row">
        <div className="card">
          <h3>New GitHub playground</h3>
          <form onSubmit={onCreateGithub}>
            <div>
              <label>GitHub URL</label>
              <input
                placeholder="https://github.com/user/repo"
                value={formGit.repoUrl}
                onChange={(e) => setFormGit({ ...formGit, repoUrl: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Run command (optional)</label>
              <input
                placeholder="npm install && npm run dev"
                value={formGit.runCommand}
                onChange={(e) => setFormGit({ ...formGit, runCommand: e.target.value })}
              />
            </div>
            <div>
              <label>Port (optional)</label>
              <input
                type="number"
                placeholder="3000"
                value={formGit.port}
                onChange={(e) => setFormGit({ ...formGit, port: e.target.value })}
              />
            </div>
            <button className="btn primary" type="submit" disabled={loading}>Create</button>
          </form>
        </div>

        <div className="card">
          <h3>New Docker playground</h3>
          {dockerInstalled === false && (
            <p className="small" style={{ color: 'tomato' }}>Docker not detected in PATH</p>
          )}
          <form onSubmit={onCreateDocker}>
            <div>
              <label>Image</label>
              <input
                placeholder="redis:latest"
                value={formDocker.image}
                onChange={(e) => setFormDocker({ ...formDocker, image: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Port (optional)</label>
              <input
                type="number"
                placeholder="6379"
                value={formDocker.port}
                onChange={(e) => setFormDocker({ ...formDocker, port: e.target.value })}
              />
            </div>
            <div>
              <label>Extra args (optional)</label>
              <input
                placeholder="--name my-redis"
                value={formDocker.extraArgs}
                onChange={(e) => setFormDocker({ ...formDocker, extraArgs: e.target.value })}
              />
            </div>
            <button className="btn primary" type="submit" disabled={loading || dockerInstalled === false}>Run</button>
          </form>
        </div>
      </div>

      <div className="row">
        <div className="card" style={{ flex: 1 }}>
          <h3>GitHub playgrounds</h3>
          <div className="list">
            {githubItems.map((item) => (
              <>
                <div className="item grid" key={item.id}>
                  <div>
                    <div><strong>{item.id}</strong></div>
                    <div className="small muted">{item.repoUrl}</div>
                    <div className="small muted">{(item as any).path}</div>
                  </div>
                  <div style={{display:'flex', gap:8}}>
                    <button className="btn" onClick={() => window.api.openEditor(item.id)}>Open in editor</button>
                    <button className="btn" onClick={() => window.api.openTerminal(item.id)}>Open terminal</button>
                  </div>
                  <div style={{display:'flex', gap:8}}>
                    {running[item.id] ? (
                      <button className="btn" onClick={async () => { await window.api.stopDev(item.id) }}>Stop dev</button>
                    ) : (
                      <button className="btn" onClick={async () => {
                        setErr(null)
                        try {
                          const { running: wasRunning, log } = await window.api.getDevLog(item.id)
                          if (log) setLogs((prev) => ({ ...prev, [item.id]: log }))
                          setRunning((prev) => ({ ...prev, [item.id]: wasRunning }))
                          await window.api.startDev({ id: item.id })
                          setOpenLogId(item.id)
                        } catch(e:any){ setErr(e?.message || String(e)) }
                      }}>Run dev</button>
                    )}
                    <button className="btn" onClick={async () => {
                      const res = await window.api.getDevLog(item.id)
                      setLogs((prev) => ({ ...prev, [item.id]: res.log }))
                      setOpenLogId((cur) => cur === item.id ? null : item.id)
                    }}>{openLogId === item.id ? 'Hide logs' : 'Show logs'}</button>
                    <button className="btn danger" onClick={async () => { await window.api.deletePlayground(item.id); refresh() }}>Delete</button>
                  </div>
                </div>
                {openLogId === item.id && (
                  <div className="item" style={{ display:'block' }}>
                    <div className="small muted" style={{marginBottom:8}}>Live logs {running[item.id] ? '(running)' : '(stopped)'}</div>
                    <pre style={{maxHeight:240, overflow:'auto', margin:0, whiteSpace:'pre-wrap'}}>{logs[item.id] || ''}</pre>
                  </div>
                )}
              </>
            ))}
            {githubItems.length === 0 && <p className="muted">No GitHub playgrounds yet.</p>}
          </div>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h3>Docker playgrounds</h3>
          <div className="list">
            {dockerItems.map((item) => (
              <div className="item grid" key={item.id}>
                <div>
                  <div><strong>{item.id}</strong> <span className="small muted">{item.status || 'Unknown'}</span></div>
                  <div className="small muted">{(item as any).image} {item.status === 'Running' && (item as any).port ? `: ${(item as any).port}` : ''}</div>
                  <div className="small muted">Container: {(item as any).containerId}</div>
                </div>
                {item.status === 'Running' ? (
                  <button className="btn" onClick={async () => { await window.api.dockerStop((item as any).containerId); refresh() }}>Stop</button>
                ) : (
                  <span />
                )}
                <span />
                <button className="btn danger" onClick={async () => { await window.api.deletePlayground(item.id); refresh() }}>Delete</button>
              </div>
            ))}
            {dockerItems.length === 0 && <p className="muted">No Docker playgrounds yet.</p>}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn" onClick={refresh} disabled={loading}>Refresh</button>
      </div>
    </div>
  )
}
