import { Link } from 'react-router-dom'
import { CheckCircle2, LogOut, User } from 'lucide-react'

import { useAuthStore } from '@/app/store'
import { useLogout } from '@/features/auth/hooks/useAuthQueries'
import { usePortalPath } from '@/hooks/usePortal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function UserNav() {
  const user = useAuthStore((state) => state.user)
  const logoutMutation = useLogout()
  const profilePath = usePortalPath('profile')

  if (!user) {
    return null
  }

  const initials =
    [user.firstName, user.lastName]
      .map((name) => name?.[0] ?? '')
      .join('')
      .toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt="User avatar" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium leading-none">
                {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'User'}
              </p>
              {user.isVerified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-label="Verified account" />
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={profilePath} className="cursor-pointer"><User className="mr-2 h-4 w-4" /><span>Profile</span></Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="cursor-pointer"><LogOut className="mr-2 h-4 w-4" /><span>Log out</span></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}