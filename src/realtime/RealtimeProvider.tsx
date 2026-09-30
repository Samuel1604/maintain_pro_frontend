import { useEffect } from "react";
import { useAuthStore } from "@/app/store";
import { realtimeClient } from "./realtime.client";

export function RealtimeProvider(): null {
  const userId = useAuthStore((state) => state.user?.id);
  useEffect(() => {
    if (userId) realtimeClient.connect();
    else realtimeClient.disconnect();
    return () => realtimeClient.disconnect();
  }, [userId]);
  return null;
}
