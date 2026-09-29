import { z } from 'zod';

export const subscriptionResponseSchema = z.object({
  id: z.string(),
  ownerType: z.enum(['organization', 'vendor']),
  plan: z.enum(['free', 'starter', 'professional', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual']).optional(),
  status: z.enum(['trial', 'active', 'past_due', 'cancelled', 'expired']),
  provider: z.enum(['stripe', 'paystack', 'flutterwave']).optional(),
  trialEndsAt: z.string().optional(),
  startsAt: z.string(),
  endsAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const checkoutResponseSchema = z.object({
  paymentId: z.string(),
  providerCheckoutId: z.string(),
  redirectUrl: z.string().optional(),
  status: z.string(),
});

export const planCatalogSchema = z.object({
  audience: z.enum(['organization', 'vendor']),
  currency: z.string(),
  annualDiscountPercent: z.number(),
  plans: z.array(z.object({
    id: z.enum(['free', 'starter', 'professional', 'enterprise']),
    monthlyPrice: z.number(),
    annualPrice: z.number(),
    trialDays: z.number(),
  })),
});

export type SubscriptionResponseContract = z.infer<typeof subscriptionResponseSchema>;
export type CheckoutResponseContract = z.infer<typeof checkoutResponseSchema>;
export type PlanCatalogContract = z.infer<typeof planCatalogSchema>;

export function toSubscriptionResponse(value: unknown): SubscriptionResponseContract | null {
  return value == null ? null : subscriptionResponseSchema.parse(value);
}

export function toCheckoutResponse(value: unknown): CheckoutResponseContract {
  return checkoutResponseSchema.parse(value);
}
