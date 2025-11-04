import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  dts: false,
  splitting: false,
  sourcemap: true,
  minify: false,
  treeshake: true,
})

