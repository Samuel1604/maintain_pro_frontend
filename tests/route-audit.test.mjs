import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const frontendRoot = fileURLToPath(new URL('..', import.meta.url))

test('portal navigation routes remain internally consistent', () => {
  const navigation = readFileSync(resolve(frontendRoot, 'src/app/navigation/portalNav.config.ts'), 'utf8')
  const routes = readFileSync(resolve(frontendRoot, 'src/app/router/portalRoutes.tsx'), 'utf8')
  const segments = [...navigation.matchAll(/segment:\s*['"]([^'"]+)['"]/g)].map((match) => match[1])
  const missing = segments.filter((segment) => {
    const routeSegment = segment.split('/')[0]
    return !routes.includes(`path: '${routeSegment}'`) && !routes.includes(`path: "${routeSegment}"`)
  })

  assert.deepEqual(missing, [])
})
