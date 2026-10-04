import { apiClient } from '@/api/client';
import { toSubscriptionResponse, toCheckoutResponse, planCatalogSchema, type PlanCatalogContract } from '@/api/contracts/billing.contract';

export interface CreateSubscriptionPayload {
  ownerType?: 'organization' | 'vendor';
  ownerId?: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  billingCycle?: 'monthly' | 'annual';
  provider?: 'stripe' | 'paystack' | 'flutterwave';
  providerSubscriptionId?: string;
  startsAt?: string;
  trialEndsAt?: string;
  endsAt?: string;
}

export interface SubscriptionResponseData {
  id: string;
  ownerType: 'organization' | 'vendor';
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  billingCycle?: 'monthly' | 'annual';
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
  provider?: 'stripe' | 'paystack' | 'flutterwave';
  trialEndsAt?: string;
  startsAt: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutResponseData {
  paymentId: string;
  providerCheckoutId: string;
  redirectUrl?: string;
  status: string;
}
export interface PaymentMethodData { id: string; provider: string; providerPaymentMethodId: string; brand: string; last4: string; expMonth: number; expYear: number; isDefault: boolean }

export const billingService = {
  getPlanCatalog: async (audience: 'organization' | 'vendor'): Promise<PlanCatalogContract> =>
    planCatalogSchema.parse(await apiClient.get(`/billing/plans?audience=${audience}`)),
  createSubscription: async (payload: CreateSubscriptionPayload) =>
    toSubscriptionResponse(await apiClient.post('/billing/subscription', payload)),

  getSubscription: async (subscriptionId?: string): Promise<SubscriptionResponseData | null> =>
    subscriptionId
      ? toSubscriptionResponse(await apiClient.get(`/billing/subscriptions/${subscriptionId}`))
      : toSubscriptionResponse(await apiClient.get('/billing/subscription')),

  initiateCheckout: async (provider?: 'stripe' | 'paystack' | 'flutterwave') =>
    toCheckoutResponse(await apiClient.post('/billing/subscription/checkout', { provider })),

  upgradePlan: async (plan: CreateSubscriptionPayload['plan'], billingCycle?: 'monthly' | 'annual', subscriptionId?: string) =>
    subscriptionId
      ? toSubscriptionResponse(await apiClient.patch(`/billing/subscriptions/${subscriptionId}/upgrade`, { plan, billingCycle }))
      : toSubscriptionResponse(await apiClient.patch('/billing/subscription/upgrade', { plan, billingCycle })),

  downgradePlan: async (plan: CreateSubscriptionPayload['plan'], billingCycle?: 'monthly' | 'annual', subscriptionId?: string) =>
    subscriptionId
      ? toSubscriptionResponse(await apiClient.patch(`/billing/subscriptions/${subscriptionId}/downgrade`, { plan, billingCycle }))
      : toSubscriptionResponse(await apiClient.patch('/billing/subscription/downgrade', { plan, billingCycle })),

  cancelSubscription: async (subscriptionId?: string) =>
    subscriptionId
      ? toSubscriptionResponse(await apiClient.post(`/billing/subscriptions/${subscriptionId}/cancel`))
      : toSubscriptionResponse(await apiClient.post('/billing/subscription/cancel')),
  listPaymentMethods: () => apiClient.get<PaymentMethodData[]>('/billing/payment-methods'),
  savePaymentMethod: (payload: Omit<PaymentMethodData, 'id' | 'isDefault'>) => apiClient.put<PaymentMethodData>('/billing/payment-methods', payload),
  removePaymentMethod: (id: string) => apiClient.delete<{ id: string }>(`/billing/payment-methods/${id}`),
};
