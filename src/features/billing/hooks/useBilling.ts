import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  billingService,
  type CreateSubscriptionPayload,
  type PaymentMethodData,
  type SubscriptionResponseData,
} from "@/services/billingService";

export const billingKeys = { subscription: ["billing", "subscription"] as const };
export const paymentMethodKeys = { list: ["billing", "payment-methods"] as const };

export function useSubscription() {
  return useQuery<SubscriptionResponseData | null>({
    queryKey: billingKeys.subscription,
    queryFn: () => billingService.getSubscription(),
    retry: false,
  });
}
export function usePaymentMethods() {
  return useQuery<PaymentMethodData[]>({
    queryKey: paymentMethodKeys.list,
    queryFn: () => billingService.listPaymentMethods(),
    retry: false,
  });
}
export function usePaymentMethodMutations() {
  const client = useQueryClient();
  const current = () => client.getQueryData<PaymentMethodData[]>(paymentMethodKeys.list) ?? [];
  return {
    save: useMutation({
      mutationFn: (payload: Omit<PaymentMethodData, "id" | "isDefault">) =>
        billingService.savePaymentMethod(payload),
      onSuccess: (method: PaymentMethodData) =>
        client.setQueryData(paymentMethodKeys.list, [method]),
    }),
    remove: useMutation({
      mutationFn: (id: string) => billingService.removePaymentMethod(id),
      onSuccess: (_data: unknown, id: string) =>
        client.setQueryData(
          paymentMethodKeys.list,
          current().filter((item) => item.id !== id),
        ),
    }),
  };
}
export function useBillingMutations() {
  const client = useQueryClient();
  const refresh = () => {
    void client.invalidateQueries({ queryKey: billingKeys.subscription });
  };
  return {
    create: useMutation({
      mutationFn: (payload: CreateSubscriptionPayload) =>
        billingService.createSubscription(payload),
      onSuccess: refresh,
    }),
    checkout: useMutation<
      { paymentId: string; providerCheckoutId: string; status: string; redirectUrl?: string },
      Error,
      CreateSubscriptionPayload["provider"]
    >({ mutationFn: (provider) => billingService.initiateCheckout(provider), onSuccess: refresh }),
    upgrade: useMutation({
      mutationFn: (input: {
        plan: CreateSubscriptionPayload["plan"];
        billingCycle: "monthly" | "annual";
      }) => billingService.upgradePlan(input.plan, input.billingCycle),
      onSuccess: refresh,
    }),
    downgrade: useMutation({
      mutationFn: (input: {
        plan: CreateSubscriptionPayload["plan"];
        billingCycle: "monthly" | "annual";
      }) => billingService.downgradePlan(input.plan, input.billingCycle),
      onSuccess: refresh,
    }),
    cancel: useMutation({
      mutationFn: () => billingService.cancelSubscription(),
      onSuccess: refresh,
    }),
  };
}
