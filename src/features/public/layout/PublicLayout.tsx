import { Outlet } from 'react-router-dom'

import '@/features/public/styles/public-theme.css'

export function PublicLayout() {
  return (
    <div className="public-site scroll-smooth">
      <Outlet />
    </div>
  )
}
