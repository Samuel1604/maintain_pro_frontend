import { useEffect, useState } from 'react'
import { Bell, Plus, Menu, Search, CircleHelp, ChevronDown, User, LogOut } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useUserNotifications } from '@/features/notifications/hooks/useUserNotifications'
import { AppSidebar as Sidebar } from '@/components/navigation/Sidebar'
import { GlobalSearchDialog } from '@/components/navigation/GlobalSearchDialog'
import { usePortal, usePortalPath } from '@/hooks/usePortal'
import { useRoleAccess } from '@/hooks/useRoleAccess'
import { useAuthStore } from '@/app/store'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { cn } from '@/utils/helpers'
import { MarqueeText } from '@/components/ui/MarqueeText'
import { PORTAL_NAV } from '@/app/navigation/portalNav.config'

interface AppHeaderProps {
  title: string
  subtitle?: string
  /** Shown after the menu button (e.g. back navigation on detail pages) */
  leading?: React.ReactNode
  actions?: React.ReactNode
  /** Hide global Create dropdown (e.g. when the page has its own primary create action) */
  hideQuickCreate?: boolean
}

export function AppHeader({
  title,
  subtitle,
  leading,
  actions,
  hideQuickCreate = false,
}: AppHeaderProps) {
  const { pathname } = useLocation()
  const portal = usePortal()
  const navigate = useNavigate()
  const [navOpen, setNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const isDashboard = /\/dashboard\/?$/.test(pathname)
  const routeParts = pathname.split('/').filter(Boolean)
  const routeSegment = routeParts.slice(2).join('/')
  const navigationItem = PORTAL_NAV[portal].primary.find((item) => routeSegment === item.segment || routeSegment.startsWith(`${item.segment}/`))
  const breadcrumbSection = navigationItem?.name ?? subtitle
  const isTopLevelNavigationPage = navigationItem ? routeSegment === navigationItem.segment : false
  const showQuickCreate = !hideQuickCreate && !isDashboard
  const newAssetPath = usePortalPath('assets/new')
  const newVendorPath = usePortalPath('vendors/new')
  const dashboardPath = usePortalPath('dashboard')
  const breadcrumbPath = usePortalPath(navigationItem?.segment ?? 'dashboard')
  const pmPath = usePortalPath('preventive-maintenance')
  const notificationsPath = usePortalPath('notifications')
  const profilePath = usePortalPath('profile')
  const loginPath = '/login'
  const signupPath = '/signup'

  const handleQuickCreate = () => {
    if (canManageAssets) return navigate(newAssetPath)
    if (canManageVendors) return navigate(newVendorPath)
    if (canManagePm) return navigate(pmPath)
  }

  const { notifications, unreadCount, markAllRead } = useUserNotifications()

  const user = useAuthStore((state) => state.user)
  const { logout } = useAuth()
  const {
    canManageAssets,
    canManageVendors,
    canManagePm,
  } = useRoleAccess()

  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const hasMobileToolbar = Boolean(actions)
  const firstName = user?.firstName || 'User'

  return (
    <>
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      <div className="sticky top-0 z-40 shrink-0 border-b border-border/80 bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <header className="flex h-14 items-center gap-3 px-4 sm:px-5 lg:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 lg:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" aria-hidden />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" showCloseButton={false} className="w-[280px] sm:w-[300px] p-0 border-none bg-card">
                <Sidebar portal={portal} onNavigate={() => setNavOpen(false)} />
              </SheetContent>
            </Sheet>

            {leading}

            <div className="min-w-0 flex-1 flex items-center gap-1.5 text-[13px]">
              <Link to={dashboardPath} className="shrink-0 font-semibold text-muted-foreground transition-colors hover:text-primary">
                {portal === 'org' ? 'Organization' : 'Vendor'}
              </Link>
              <span className="text-muted-foreground/40 shrink-0">/</span>
              {breadcrumbSection && !isTopLevelNavigationPage && (
                <>
                  <Link to={breadcrumbPath} className="hidden shrink-0 text-muted-foreground transition-colors hover:text-foreground sm:inline">
                    {breadcrumbSection}
                  </Link>
                  <span className="text-muted-foreground/40 shrink-0 hidden sm:inline">/</span>
                </>
              )}
              <MarqueeText className="font-bold tracking-tight text-foreground">{isTopLevelNavigationPage ? breadcrumbSection : title}</MarqueeText>
            </div>
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex shrink-0 items-center gap-3">
            {/* Global Interactive Search Input Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden w-[220px] items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-left text-[13px] text-muted-foreground hover:border-border hover:bg-muted/60 transition-colors lg:flex"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden />
                <span className="truncate">Search anything...</span>
              </div>
              <kbd className="h-4 items-center rounded border border-border bg-card px-1 font-mono text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Search Icon Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg border border-border text-muted-foreground hover:bg-muted/60 lg:hidden"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Help Button */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-8 w-8 rounded-lg border border-border text-muted-foreground hover:bg-muted/60 lg:inline-flex"
              aria-label="Help & Support"
              onClick={() => window.open('https://docs.maintainpro.com', '_blank')}
            >
              <CircleHelp className="h-4 w-4" />
            </Button>

            {actions ? (
              <div className="hidden max-w-[min(50vw,28rem)] items-center justify-end gap-2 lg:flex">
                {actions}
              </div>
            ) : null}

            {user && showQuickCreate ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="hidden sm:inline-flex">
                      <Plus className="mr-2 h-4 w-4" />
                      Create
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-48">
                    {canManageAssets && (
                      <DropdownMenuItem onClick={() => navigate(newAssetPath)}>Asset</DropdownMenuItem>
                    )}
                    {canManageVendors && (
                      <DropdownMenuItem onClick={() => navigate(newVendorPath)}>Vendor</DropdownMenuItem>
                    )}
                    {canManagePm && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate(pmPath)}>PM Schedule</DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  size="icon"
                  className="sm:hidden"
                  aria-label="Quick create"
                  onClick={handleQuickCreate}
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </Button>
              </>
            ) : null}

            {user ? (
              <>
                {/* Notification Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-9 w-9 rounded-lg border border-border text-muted-foreground hover:bg-muted/60"
                      aria-label={
                        unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
                      }
                    >
                      <Bell className="h-4 w-4" aria-hidden />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] max-h-96 overflow-y-auto">
                    <DropdownMenuLabel className="flex items-center justify-between">
                      Notifications
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-primary"
                        onClick={markAllRead}
                      >
                        Mark all read
                      </Button>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {notifications.length === 0 && (
                      <DropdownMenuItem disabled className="justify-center py-6 text-sm text-muted-foreground">
                        No notifications
                      </DropdownMenuItem>
                    )}
                    {notifications.slice(0, 8).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="flex flex-col items-start gap-1 py-3"
                        onClick={() => navigate(notificationsPath)}
                      >
                        <div className="flex w-full items-start justify-between gap-2">
                          <span
                            className={cn(
                              'text-sm font-medium',
                              !notification.isRead && 'text-foreground',
                            )}
                          >
                            {notification.title}
                          </span>
                          {!notification.isRead && (
                            <div className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                          )}
                        </div>
                        <span className="line-clamp-2 text-xs text-muted-foreground">
                          {notification.message}
                        </span>
                      </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="justify-center text-primary font-medium"
                      onClick={() => navigate(notificationsPath)}
                    >
                      View all notifications
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Vertical Separator */}
                <div className="h-5 w-[1px] bg-border" />

                {/* User Profile Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 gap-1.5 px-2 text-foreground hover:bg-muted/60 max-w-[150px]"
                    >
                      <MarqueeText className="text-[13px] font-medium">{firstName}</MarqueeText>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(profilePath)}>
                      <User className="mr-2 h-4 w-4" />
                      My profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(notificationsPath)}>
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open('https://docs.maintainpro.com', '_blank')}>
                      <CircleHelp className="mr-2 h-4 w-4" />
                      Help & Support
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Button variant="outline" size="sm" asChild>
                  <Link to={loginPath}>Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to={signupPath}>Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </header>

        {hasMobileToolbar ? (
          <div
            className={cn(
              'flex items-center gap-2 overflow-x-auto border-t border-border/60 px-3 py-2 lg:hidden',
              '[&_button]:shrink-0 [&_a]:shrink-0',
            )}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </>
  )
}
