import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AppHeader } from "@/components/navigation/Navbar";
import { PageIntro } from "@/components/layout/PageIntro";
import { SkeletonTable } from "@/components/feedback/Skeletons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserNotifications } from "../hooks/useUserNotifications";
import type { Notification, NotificationType } from "@/types/common.types";
import { NOTIFICATION_TYPE_CONFIG } from "../config/notificationConfig";
import { realtimeClient, type RealtimeState } from "@/realtime/realtime.client";

function relativeTime(date: Date) {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function Icon({ type }: { type: NotificationType }) {
  const config = NOTIFICATION_TYPE_CONFIG[type];
  const Component = config.icon;
  return <Component className="h-4 w-4" />;
}

export function NotificationCenter() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    isLoading,
    error,
    retry,
    notificationTypes,
    pageSubtitle,
  } = useUserNotifications();
  const [activeTab, setActiveTab] = useState<string>("All");
  const [realtimeState, setRealtimeState] = useState<RealtimeState>(realtimeClient.getState());
  useEffect(() => realtimeClient.subscribe(setRealtimeState), []);
  const categoryTabs = ["All", "Unread", ...notificationTypes];
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "All") return true;
    if (activeTab === "Unread") return !item.isRead;
    return item.type === activeTab;
  });

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Unable to mark all notifications as read");
    }
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader title="Notification Center" subtitle="User Settings" hideQuickCreate />
      <div className="space-y-6 px-8 py-6">
        <div className="flex items-center justify-between">
          <PageIntro title="Notification Center" description={pageSubtitle} />
          <Button
            variant="outline"
            onClick={() => void handleMarkAllRead()}
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {categoryTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg border px-3 py-1.5 text-[13px] font-semibold transition-colors ${activeTab === tab ? "border-primary/30 bg-primary/15 text-primary" : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
            >
              {tab === "All" || tab === "Unread"
                ? tab
                : (NOTIFICATION_TYPE_CONFIG[tab as NotificationType]?.label ?? tab)}
              {tab === "Unread" && unreadCount > 0 && (
                <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 p-3 text-[12px] text-primary">
          <span>
            {realtimeState === "connected"
              ? "Live notification updates are connected."
              : "Live notification updates are unavailable; refresh to check for new alerts."}
          </span>
        </div>
        {isLoading ? (
          <div role="status" aria-live="polite">
            <span className="sr-only">Loading notifications…</span>
            <SkeletonTable rows={6} columns={1} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive">
            <p className="text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void retry()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((item: Notification) => (
              <div
                key={item.id}
                onClick={() => {
                  if (!item.isRead) void markRead(item.id);
                  if (item.actionUrl) navigate(item.actionUrl);
                }}
                className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 shadow-sm transition-colors ${!item.isRead ? "border-primary/30 bg-card hover:bg-muted/20" : "border-border bg-card/60 hover:bg-card"}`}
              >
                <div className="pt-2">
                  <span
                    className={`block h-2 w-2 rounded-full ${!item.isRead ? "bg-primary" : "bg-transparent"}`}
                  />
                </div>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${NOTIFICATION_TYPE_CONFIG[item.type].color}`}
                >
                  <Icon type={item.type} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[13px] font-bold">{item.title}</h4>
                    {item.priority === "high" && (
                      <Badge
                        variant="outline"
                        className="border-destructive/30 bg-destructive/15 text-[9px] font-bold text-destructive"
                      >
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                    <span>{relativeTime(item.createdAt)}</span>
                    {item.actionUrl && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-primary hover:underline">
                          View details →
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredNotifications.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-sm font-semibold">No notifications found</p>
              </div>
            )}
          </div>
        )}
        <div className="border-t border-border pt-4 text-[12px] text-muted-foreground">
          <p>
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </p>
        </div>
      </div>
    </div>
  );
}
