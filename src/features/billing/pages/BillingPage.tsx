import { useEffect, useState } from 'react'

import { SkeletonCard } from '@/components/feedback/Skeletons'
import { AppHeader } from '@/components/navigation/Navbar'
import { PageIntro } from '@/components/layout/PageIntro'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import type { CreateSubscriptionPayload } from '@/services/billingService'

import { useBillingMutations, useSubscription } from '../hooks/useBilling'

const plans: CreateSubscriptionPayload['plan'][] = ['free', 'starter', 'professional', 'enterprise']
const providers: NonNullable<CreateSubscriptionPayload['provider']>[] = ['stripe', 'paystack', 'flutterwave']

export function BillingPage() {
  const { data: subscription, isLoading, isError, error } = useSubscription()
  const user = useCurrentUser()
  const mutations = useBillingMutations()
  const [plan, setPlan] = useState<CreateSubscriptionPayload['plan']>('starter')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [provider, setProvider] = useState<NonNullable<CreateSubscriptionPayload['provider']>>('paystack')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (subscription?.plan) setPlan(subscription.plan)
  }, [subscription?.plan])

  const canManage = user.data?.role === 'admin' || user.data?.role === 'vendor_lead'

  async function beginCheckout() {
    if (!canManage) return
    setMessage('')
    try {
      if (!subscription) {
        await mutations.create.mutateAsync({ plan, billingCycle, provider })
      } else if (subscription.plan !== plan) {
        const order = plans.indexOf(plan) > plans.indexOf(subscription.plan) ? mutations.upgrade : mutations.downgrade
        await order.mutateAsync({ plan, billingCycle })
      }
      const result = await mutations.checkout.mutateAsync(provider)
      if (result.redirectUrl?.startsWith('http')) window.location.assign(result.redirectUrl)
      else setMessage('Checkout initialized. Subscription status will update after provider confirmation.')
    } catch (err) {
      setMessage((err as Error).message)
    }
  }

  if (isLoading) {
    return <div className="max-w-3xl space-y-6 p-6"><SkeletonCard /><SkeletonCard /></div>
  }

  return (
    <>
      <AppHeader title="Billing" hideQuickCreate />
      <div className="px-6 pt-6"><PageIntro title="Billing" description="Manage your subscription, plan limits, and organization billing details." /></div>
      <main className="max-w-3xl space-y-6 p-6">

      {isError && <p className="rounded border border-warning/30 bg-warning/10 p-3 text-warning">Unable to load subscription details. {(error as Error).message}</p>}

      {subscription && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="text-xl font-semibold capitalize text-foreground">{subscription.plan}</p>
            <p className="capitalize text-muted-foreground">{subscription.status} · {subscription.billingCycle}</p>
          </CardContent>
        </Card>
      )}

      {canManage && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="font-semibold text-foreground">Choose a subscription</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="billing-plan">Plan</Label>
                <Select value={plan} onValueChange={(value) => setPlan(value as typeof plan)}>
                  <SelectTrigger id="billing-plan" className="w-full"><SelectValue placeholder="Select a plan" /></SelectTrigger>
                  <SelectContent>{plans.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-cycle">Billing cycle</Label>
                <Select value={billingCycle} onValueChange={(value) => setBillingCycle(value as typeof billingCycle)}>
                  <SelectTrigger id="billing-cycle" className="w-full"><SelectValue placeholder="Select a billing cycle" /></SelectTrigger>
                  <SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="annual">Annual</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-provider">Provider</Label>
                <Select value={provider} onValueChange={(value) => setProvider(value as typeof provider)}>
                  <SelectTrigger id="billing-provider" className="w-full"><SelectValue placeholder="Select a provider" /></SelectTrigger>
                  <SelectContent>{providers.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={beginCheckout} disabled={mutations.create.isPending || mutations.checkout.isPending}>Continue to checkout</Button>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </CardContent>
        </Card>
      )}

      {!canManage && <p className="text-sm text-muted-foreground">Subscription management is restricted to the account owner.</p>}
      </main>
    </>
  )
}
