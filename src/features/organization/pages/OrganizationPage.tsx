import { useOrganization } from '../hooks/useOrganization';
import { SkeletonCard } from '@/components/feedback/Skeletons';
import { AppHeader } from '@/components/navigation/Navbar';
import { PageIntro } from '@/components/layout/PageIntro';
export function OrganizationPage() {
  const { data, isLoading, isError, error } = useOrganization();
  if (isLoading) return <><AppHeader title="Organization" hideQuickCreate /><main className="space-y-6 p-6"><PageIntro title="Organization" description="View your organization profile and operating details." /><div className="h-8 w-48 animate-pulse rounded bg-muted/40" /><div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div></main></>;
  if (isError) return <><AppHeader title="Organization" hideQuickCreate /><main className="space-y-6 p-6"><PageIntro title="Organization" description="View your organization profile and operating details." /><div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-destructive">Unable to load organization: {(error as Error).message}</div></main></>;
  if (!data) return <><AppHeader title="Organization" hideQuickCreate /><main className="space-y-6 p-6"><PageIntro title="Organization" description="View your organization profile and operating details." /><div className="rounded-2xl border border-border bg-card p-8 text-muted-foreground">Organization details are not available yet.</div></main></>;
  const fields = [['Industry', data.industry], ['Status', data.status], ['Email', data.email], ['Phone', data.phone], ['Website', data.website || 'Not provided'], ['Address', Object.values(data.address).filter(Boolean).join(', ') || 'Not provided']];
  return <><AppHeader title="Organization" hideQuickCreate /><main className="space-y-6 p-6"><PageIntro title="Organization" description="View your organization profile and operating details." /><section className="grid gap-4 md:grid-cols-2">{fields.map(([label, value]) => <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-1 font-medium text-foreground">{value}</dd></div>)}</section></main></>;
}
