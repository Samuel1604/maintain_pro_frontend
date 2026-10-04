import { httpClient } from '@/api/httpClient';
import { ENDPOINTS } from '@/api/endpoints';

export interface InventoryItemRecord { id: string; _id?: string; facilityId: string; locationId: string; sku: string; name: string; description?: string; categoryId?: string; unitOfMeasure: string; status: string; quantity?: number; minimumStockLevel: number; reorderLevel: number; maximumStockLevel?: number; preferredVendorId?: string; createdAt: string; updatedAt: string }
export interface InventoryBalance { itemId: string; stockLocationId: string; quantity: number; reservedQuantity: number; availableQuantity: number; updatedAt: string }
export interface InventoryHistoryRecord { id: string; itemId: string; stockLocationId: string; type: string; quantity: number; unitOfMeasure: string; reference?: string; reason?: string; createdAt: string }
export interface InventoryCategory { id: string; name: string; description?: string; status?: string }
export interface InventoryOverview { totalItems: number; lowStockItems: number; reservedItems: number; pendingTransfers: number; categoriesCount: number; lowStockAlerts: Array<{ id: string; name: string; sku: string; category: string; onHand: number; minimumLevel: number; stockLocation: string }>; stockByCategory: Array<{ category: string; itemCount: number; percentage: number; color: string }> }
export interface StockLocation { id: string; name: string; code?: string; status?: string }
export interface InventoryTransactionInput { itemId: string; stockLocationId: string; quantity: number; workOrderId?: string; reservationId?: string; sourceTransactionId?: string; reference?: string; notes?: string; reason?: string; idempotencyKey?: string }

export const inventoryService = {
  listItems: (params?: { search?: string; categoryId?: string; status?: string; page?: number; limit?: number }) => httpClient.get<InventoryItemRecord[]>(ENDPOINTS.INVENTORY.ITEMS, { params }),
  overview: () => httpClient.get<InventoryOverview>(ENDPOINTS.INVENTORY.OVERVIEW),
  balances: (params?: { itemId?: string; stockLocationId?: string }) => httpClient.get<InventoryBalance[]>(ENDPOINTS.INVENTORY.BALANCES, { params }),
  categories: () => httpClient.get<InventoryCategory[]>(ENDPOINTS.INVENTORY.CATEGORIES),
  createCategory: (payload: { name: string; description?: string }) => httpClient.post<InventoryCategory>(ENDPOINTS.INVENTORY.CATEGORIES, payload),
  createItem: (payload: Record<string, unknown>) => httpClient.post<InventoryItemRecord>(ENDPOINTS.INVENTORY.ITEMS, payload),
  updateItem: (id: string, payload: Record<string, unknown>) => httpClient.patch<InventoryItemRecord>(`${ENDPOINTS.INVENTORY.ITEMS}/${id}`, payload),
  deactivateItem: (id: string) => httpClient.post<void>(`${ENDPOINTS.INVENTORY.ITEMS}/${id}/deactivate`, {}),
  history: (params?: Record<string, string | number>) => httpClient.get<InventoryHistoryRecord[]>(ENDPOINTS.INVENTORY.HISTORY, { params }),
  listLocations: () => httpClient.get<StockLocation[]>(ENDPOINTS.INVENTORY.LOCATIONS),
  receive: (payload: InventoryTransactionInput) => httpClient.post<InventoryBalance>(ENDPOINTS.INVENTORY.RECEIVE, payload),
  reserve: (payload: InventoryTransactionInput) => httpClient.post<unknown>(ENDPOINTS.INVENTORY.RESERVE, payload),
  release: (reservationId: string) => httpClient.post<unknown>(ENDPOINTS.INVENTORY.RELEASE, { reservationId }),
  issue: (payload: InventoryTransactionInput) => httpClient.post<InventoryBalance>(ENDPOINTS.INVENTORY.ISSUE, payload),
  consume: (payload: InventoryTransactionInput) => httpClient.post<InventoryBalance>(ENDPOINTS.INVENTORY.CONSUME, payload),
  adjust: (payload: Pick<InventoryTransactionInput, 'itemId' | 'stockLocationId' | 'quantity' | 'reason'>) => httpClient.post<InventoryBalance>(ENDPOINTS.INVENTORY.ADJUST, payload),
  transfer: (payload: Omit<InventoryTransactionInput, 'stockLocationId'> & { sourceLocationId: string; destinationLocationId: string }) => httpClient.post<unknown>(ENDPOINTS.INVENTORY.TRANSFER, payload),
  returnStock: (payload: { originalTransactionId: string; quantity: number; reason?: string; idempotencyKey?: string }) => httpClient.post<InventoryBalance>(ENDPOINTS.INVENTORY.RETURN, payload),
};
