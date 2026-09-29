import { io, type Socket } from "socket.io-client";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/app/store";
import { appendNotification } from "@/features/notifications/services/notificationEvents";
import { toast } from "sonner";

export type RealtimeState = "disconnected" | "connecting" | "connected" | "reconnecting" | "authentication_failed";
export interface RealtimeEvent { version: 1; eventId: string; name: string; occurredAt: string; aggregate?: { type: string; id: string }; payload: Record<string, string>; }

type Listener = (state: RealtimeState) => void;
const listeners = new Set<Listener>();
let socket: Socket | undefined;
let state: RealtimeState = "disconnected";

function setState(next: RealtimeState): void { state = next; listeners.forEach((listener) => listener(next)); }

/** The sole browser Socket.IO connection. Components consume API queries; events only invalidate them. */
export const realtimeClient = {
  connect(): void {
    if (socket || !useAuthStore.getState().user) return;
    setState("connecting");
    socket = io(import.meta.env.VITE_REALTIME_URL || window.location.origin, { path: "/socket.io", withCredentials: true, autoConnect: true, reconnection: true, reconnectionAttempts: 8, timeout: 10_000 });
    socket.on("connect", () => {
      setState("connected");
      // On reconnect, broadly invalidate all active dashboard and reference data to ensure consistency
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["facilities"] });
      void queryClient.invalidateQueries({ queryKey: ["locations"] });
    });
    socket.on("reconnect_attempt", () => setState("reconnecting"));
    socket.on("disconnect", () => setState("disconnected"));
    socket.on("connect_error", (error) => { setState(error.message === "AUTHENTICATION_FAILED" ? "authentication_failed" : "disconnected"); });
    socket.on("domain.event", onDomainEvent);
    socket.on("work_order.status_changed", (data: { id: string; status: string }) => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "work-orders"] });
      toast.info(`⚡ Real-time Update: Work Order ${data.id} status changed to ${data.status}`);
    });
    socket.on("work_order.updated", (data: { id: string; title?: string }) => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "work-orders"] });
      toast.info(`⚡ Real-time Update: Work Order ${data.id} updated`);
    });
  },
  disconnect(): void { socket?.removeAllListeners(); socket?.disconnect(); socket = undefined; setState("disconnected"); },
  getState: (): RealtimeState => state,
  subscribe(listener: Listener): () => void { listeners.add(listener); listener(state); return () => listeners.delete(listener); },
};

function onDomainEvent(event: RealtimeEvent): void {
  if (!event || event.version !== 1 || typeof event.name !== "string") return;

  // Selectively invalidate scoped queries matching the domain event type
  if (event.name.startsWith("WorkOrder")) {
    void queryClient.invalidateQueries({ queryKey: ["dashboard", "work-orders"] });
    const woId = event.aggregate?.id || event.payload?.workOrderId || "WO";
    const status = event.payload?.status || "updated";
    toast.info(`⚡ Real-time Update: Work Order ${woId} is now ${status}`);
  } else if (event.name.startsWith("PreventiveMaintenance")) {
    void queryClient.invalidateQueries({ queryKey: ["preventive-maintenance"] });
  } else if (event.name.startsWith("Inventory") || event.name.startsWith("Stock")) {
    void queryClient.invalidateQueries({ queryKey: ["inventory"] });
  } else if (event.name.startsWith("VendorApplication") || event.name.startsWith("VendorOpportunity")) {
    void queryClient.invalidateQueries({ queryKey: ["dashboard", "vendor-opportunities"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard", "vendor-applications"] });
  } else if (event.name.startsWith("ServiceRequest")) {
    void queryClient.invalidateQueries({ queryKey: ["dashboard", "staff-service-requests"] });
  } else {
    // Fallback for other domain events
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  if (event.name === "NotificationCreated") {
    const user = useAuthStore.getState().user;
    if (user) appendNotification(user.id, user.role, { type: "system", title: "New notification", message: "Refresh notification data" });
  }
}
