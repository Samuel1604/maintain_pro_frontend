import { useEffect } from 'react'

/**
 * TODO(launch): replace with the real production domain before deploy.
 * Used to build absolute canonical/OG URLs — this is the one place to change it.
 */
const SITE_URL = 'https://maintainpro.com'
const SITE_NAME = 'MaintainPro'

/**
 * TODO(launch): replace with a real 1200x630 social-share image.
 * A favicon is a placeholder — most link unfurlers will crop/scale it badly.
 */
const DEFAULT_OG_IMAGE = '/favicon-512.png'

interface PageSeoOptions {
  /** Page-specific title. Site name is appended automatically. */
  title: string
  description: string
  /** Route path, e.g. '/features'. Used for canonical + og:url. */
  path: string
  image?: string
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Sets document title, meta description, canonical link, and Open
 * Graph / Twitter Card tags for the current page. Call once per public page.
 *
 * Known limitation: this runs client-side after React mounts. Google's
 * crawler executes JS and will see these tags, but most social-preview
 * scrapers (Slack, iMessage, older LinkedIn/Facebook bots) fetch the raw
 * HTML and do not run JS — they'll only ever see the static fallback tags
 * in index.html. A real fix for link-preview quality requires prerendering
 * or SSR for the public routes; this hook fixes search-engine indexing and
 * browser-tab titles, not social-card previews, until that's in place.
 */
export function usePageSeo({ title, description, path, image = DEFAULT_OG_IMAGE }: PageSeoOptions) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`
    const url = `${SITE_URL}${path}`
    const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image}`

    document.title = fullTitle
    setMetaTag('name', 'description', description)
    setCanonical(url)

    setMetaTag('property', 'og:title', fullTitle)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:type', 'website')
    setMetaTag('property', 'og:url', url)
    setMetaTag('property', 'og:image', absoluteImage)
    setMetaTag('property', 'og:site_name', SITE_NAME)

    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', fullTitle)
    setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:image', absoluteImage)
  }, [title, description, path, image])
}

/**
 * Injects/updates a JSON-LD structured-data script tag identified by `id`.
 * Safe to call from multiple pages with different ids without collisions.
 */
export function useJsonLd(id: string, data: Record<string, unknown>) {
  const serialized = JSON.stringify(data)

  useEffect(() => {
    let el = document.getElementById(id) as HTMLScriptElement | null
    if (!el) {
      el = document.createElement('script')
      el.id = id
      el.type = 'application/ld+json'
      document.head.appendChild(el)
    }
    el.textContent = serialized
  }, [id, serialized])
}

export { SITE_URL, SITE_NAME }
