import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Preloads the two fonts the first paint needs (headline + body, Latin subset) so they are
 * requested while the HTML is still parsing instead of after the CSS is discovered. Asset
 * names are hashed, so they are looked up in the bundle rather than hard-coded.
 */
function preloadCriticalFonts(): Plugin {
  const critical = /(bricolage-grotesque-latin-standard-normal|geist-latin-wght-normal)-[\w-]+\.woff2$/
  return {
    name: 'preload-critical-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        return Object.keys(ctx.bundle ?? {})
          .filter((file) => critical.test(file))
          .map((file) => ({
            tag: 'link',
            injectTo: 'head' as const,
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: `/${file}` },
          }))
      },
    },
  }
}

// nurbijoy.github.io is a user site, so it is served from the domain root.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), preloadCriticalFonts()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      // Two pages: the home page, and the standalone Showcase at /showcase/.
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        showcase: fileURLToPath(new URL('./showcase/index.html', import.meta.url)),
      },
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
