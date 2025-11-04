import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export async function run(cmd: string, opts: { cwd?: string } = {}) {
  const { stdout, stderr } = await execAsync(cmd, {
    cwd: opts.cwd,
    env: { ...process.env },
    maxBuffer: 10 * 1024 * 1024,
  })
  return { stdout, stderr }
}

export async function which(bin: string): Promise<string | null> {
  try {
    const cmd = process.platform === 'win32' ? `where ${bin}` : `which ${bin}`
    const { stdout } = await execAsync(cmd)
    return stdout.trim() || null
  } catch {
    return null
  }
}

