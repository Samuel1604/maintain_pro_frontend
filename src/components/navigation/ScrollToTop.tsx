import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Resets scroll position when navigating to a new route. */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)

    document.querySelectorAll('[data-scroll-container]').forEach((el) => {
      el.scrollTop = 0
    })
  }, [pathname])

  return null
}
