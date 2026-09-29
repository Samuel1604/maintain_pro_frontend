import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname)
const navigation = readFileSync(resolve(root, 'src/app/navigation/portalNav.config.ts'), 'utf8')
const routes = readFileSync(resolve(root, 'src/app/router/portalRoutes.tsx'), 'utf8')

const segments = [...navigation.matchAll(/segment:\s*['"]([^'"]+)['"]/g)].map((match) => match[1])
const missing = segments.filter((segment) => {
  const routeSegment = segment.split('/')[0]
  return !routes.includes(`path: '${routeSegment}'`) && !routes.includes(`path: "${routeSegment}"`)
})

if (missing.length) {
  console.error(`Portal navigation references missing route segments: ${missing.join(', ')}`)
  process.exit(1)
}

console.log(`Portal navigation route check passed (${segments.length} entries).`)
