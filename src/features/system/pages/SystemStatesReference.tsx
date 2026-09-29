import { useState } from 'react'
import { AppHeader } from '@/components/navigation/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AlertTriangle, Lock, ShieldAlert, CheckCircle2, RotateCcw, Box, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function SystemStatesReference() {
  const navigate = useNavigate()
  const [contractVal, setContractVal] = useState('$9,999,999.00')

  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader title="System States Reference" subtitle="Development Tools" hideQuickCreate />

      <div className="px-8 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">System States Reference</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            A standardized reference catalogue representing systemic user interface flows, exception boundaries, and transaction results.
          </p>
        </div>

        {/* 3x3 Grid of UI States */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. LOADING STATE */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-8 flex flex-col justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">LOADING</p>
            <div className="text-center space-y-3 py-6">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
              <p className="text-[13px] font-bold text-foreground">Loading data systems...</p>
            </div>
            <div />
          </div>

          {/* 2. EMPTY STATE */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6 flex flex-col justify-between text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-left">EMPTY STATE</p>
            <div className="space-y-3 py-2">
              <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center mx-auto">
                <Box className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-foreground">No assets discovered</h4>
                <p className="text-[12px] text-muted-foreground mt-0.5">Deploy your first asset tag to start logging telemetry.</p>
              </div>
              <Button onClick={() => navigate('/assets')} className="text-[12px] font-semibold">
                Register Asset
              </Button>
            </div>
            <div />
          </div>

          {/* 3. ERROR STATE */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6 flex flex-col justify-between text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-left">ERROR STATE</p>
            <div className="space-y-3 py-2">
              <div className="h-12 w-12 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-foreground">Something went wrong</h4>
                <p className="text-[12px] text-muted-foreground mt-0.5">The server returned an unexpected network payload error.</p>
              </div>
              <Button variant="outline" onClick={() => toast.info('Retrying connection...')} className="text-[12px] font-semibold">
                Retry Connection
              </Button>
            </div>
            <div />
          </div>

          {/* 4. UNAUTHORIZED */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6 flex flex-col justify-between text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-left">UNAUTHORIZED</p>
            <div className="space-y-3 py-2">
              <div className="h-12 w-12 rounded-xl bg-warning/15 text-warning flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-foreground">Access Denied</h4>
                <p className="text-[12px] text-muted-foreground mt-0.5">You do not have active security clearances to view billing accounts.</p>
              </div>
              <Button variant="outline" onClick={() => navigate(-1)} className="text-[12px] font-semibold">
                Go Back
              </Button>
            </div>
            <div />
          </div>

          {/* 5. FORBIDDEN */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6 flex flex-col justify-between text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-left">FORBIDDEN</p>
            <div className="space-y-3 py-2">
              <div className="h-12 w-12 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center mx-auto">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-foreground">Restricted Area</h4>
                <p className="text-[12px] text-muted-foreground mt-0.5">This segment requires system root privileges. Contact administration.</p>
              </div>
            </div>
            <div />
          </div>

          {/* 6. VALIDATION ERROR */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">VALIDATION ERROR</p>
            <div className="space-y-2 text-left">
              <label className="text-[12px] font-bold text-foreground">Contract Value</label>
              <Input
                value={contractVal}
                onChange={(e) => setContractVal(e.target.value)}
                className="border-destructive text-destructive font-bold bg-destructive/5 text-[13px]"
              />
              <p className="text-[11px] font-semibold text-destructive">Contract amount exceeds budget authorization limits for your role ($10,000).</p>
            </div>
          </div>

          {/* 7. SUCCESS */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6 flex flex-col justify-between text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-left">SUCCESS</p>
            <div className="space-y-2 py-2">
              <div className="h-10 w-10 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="text-[14px] font-bold text-foreground">Changes saved successfully</h4>
              <p className="text-[12px] text-muted-foreground">Configuration published across 8 active facilities.</p>
            </div>
            <div />
          </div>

          {/* 8. PARTIAL FAILURE */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">PARTIAL FAILURE</p>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-warning font-bold text-[13px]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Batch process: 2 items could not compile</span>
              </div>
              <ul className="text-[11px] text-muted-foreground space-y-1 list-disc pl-5">
                <li>Asset AST-104 is locked by system audit lock</li>
                <li>Asset AST-902 validation hash mismatched</li>
              </ul>
            </div>
          </div>

          {/* 9. RECONNECTING */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6 flex flex-col justify-between text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-left">RECONNECTING</p>
            <div className="space-y-3 py-2">
              <div className="flex justify-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce delay-150" />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce delay-300" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-foreground">Telemetry link interrupted</h4>
                <p className="text-[12px] text-muted-foreground mt-0.5">Attempting automatic socket reconnection (1/5)...</p>
              </div>
            </div>
            <div />
          </div>
        </div>
      </div>
    </div>
  )
}
