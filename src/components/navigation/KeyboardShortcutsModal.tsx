import { useState, useEffect } from 'react'
import { Command, Search, Bell, LayoutGrid, Wrench, MessageSquare, HelpCircle, X } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface KeyboardShortcutsModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function KeyboardShortcutsModal({ open: externalOpen, onOpenChange }: KeyboardShortcutsModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = externalOpen !== undefined
  const open = isControlled ? externalOpen : internalOpen

  const setOpen = (value: boolean) => {
    if (onOpenChange) onOpenChange(value)
    if (!isControlled) setInternalOpen(value)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return
      }

      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        setOpen(!open)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const shortcuts = [
    {
      category: 'Navigation & Search',
      items: [
        { keys: ['⌘', 'K'], label: 'Global Search', icon: Search },
        { keys: ['Shift', '?'], label: 'Keyboard Shortcuts Cheatsheet', icon: HelpCircle },
        { keys: ['Esc'], label: 'Close Active Modal / Clear Search', icon: X },
      ],
    },
    {
      category: 'Quick Views',
      items: [
        { keys: ['Shift', 'D'], label: 'Go to Dashboard', icon: LayoutGrid },
        { keys: ['Shift', 'W'], label: 'Go to Work Orders', icon: Wrench },
        { keys: ['Shift', 'S'], label: 'Go to Service Requests', icon: MessageSquare },
        { keys: ['Shift', 'N'], label: 'Open Notification Center', icon: Bell },
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false} className="!max-w-xl p-0 gap-0 overflow-hidden rounded-2xl border border-border shadow-2xl bg-card">
        <DialogHeader className="p-5 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Command className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Keyboard Shortcuts</DialogTitle>
              <p className="text-xs text-muted-foreground">Speed up your workflow with system-wide hotkeys</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="p-5 space-y-6 max-h-[420px] overflow-y-auto">
          {shortcuts.map((group) => (
            <div key={group.category} className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                {group.category}
              </span>
              <div className="grid gap-2">
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-background/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {item.keys.map((key) => (
                          <kbd
                            key={key}
                            className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-xs font-semibold shadow-xs"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border bg-muted/20 px-5 py-3 text-center text-xs text-muted-foreground">
          Press <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">?</kbd> anywhere to toggle this menu.
        </div>
      </DialogContent>
    </Dialog>
  )
}
