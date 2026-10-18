import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource-variable/geist/wght.css'
import '@fontsource-variable/geist-mono/wght.css'
import '@/index.css'
import { ShowcasePage } from '@/components/showcase/ShowcasePage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ShowcasePage />
  </StrictMode>,
)
