import { httpClient } from '@/api/httpClient'
import { ENDPOINTS } from '@/api/endpoints'

export type InvoiceStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid' | 'disputed'

export interface TrackedInvoice {
  _id: string
  organizationId: string
  vendorId: string
  workOrderId?: string
  contractId?: string
  invoiceNumber: string
  amount: number
  currency: string
  status: InvoiceStatus
  submittedAt: string
  dueDate?: string
  notes?: string
  rejectionReason?: string
  approvedBy?: string
  approvedAt?: string
  paidAt?: string
  externalPaymentReference?: string
}

export const invoicesService = {
  list: () => httpClient.get<TrackedInvoice[]>(ENDPOINTS.INVOICES.LIST),
  review: (id: string, input: { rejectionReason?: string; externalPaymentReference?: string }) => httpClient.patch<TrackedInvoice>(ENDPOINTS.INVOICES.REVIEW(id), input),
  recordExternalPayment: (id: string, externalPaymentReference: string) =>
    httpClient.patch<TrackedInvoice>(ENDPOINTS.INVOICES.MARK_PAID(id), { externalPaymentReference }),
  dispute: (id: string, reason: string) =>
    httpClient.patch<TrackedInvoice>(ENDPOINTS.INVOICES.DISPUTE(id), { reason }),
}
