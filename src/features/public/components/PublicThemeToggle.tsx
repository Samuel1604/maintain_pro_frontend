import { useThemeStore } from '@/app/theme.store'
import { MaterialIcon } from '@/features/public/components/MaterialIcon'

export function PublicThemeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <MaterialIcon name={isDark ? 'light_mode' : 'dark_mode'} className="text-xl" />
    </button>
  )
}
