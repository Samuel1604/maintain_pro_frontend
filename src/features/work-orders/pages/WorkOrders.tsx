import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, RefreshCw, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/helpers";
import { Input } from "@/components/ui/input";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/feedback/EmptyState";
import { SkeletonTable } from "@/components/feedback/Skeletons";
import { AppHeader } from "@/components/navigation/Navbar";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { usePortalPath } from "@/hooks/usePortal";
import { useWorkOrders } from "../hooks/useWorkOrders";
import type { WorkOrderFilters } from "../types/workOrder.types";
import { PageIntro } from "@/components/layout/PageIntro";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateWorkOrder } from "./CreateWorkOrder";
import { displayReference } from "@/utils/display-ids";

export function WorkOrders() {
  const navigate = useNavigate();
  const workOrdersPath = usePortalPath("work-orders");
  const newWorkOrderPath = usePortalPath("work-orders/new");
  const { canCreateWorkOrder } = useRoleAccess();
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState<WorkOrderFilters>({ page: 1, limit: 20 });
  const {
    workOrders,
    total,
    page,
    totalPages,
    isLoading,
    isRefreshing,
    error,
    setFilters: updateFilters,
    refetch,
  } = useWorkOrders(filters);

  const setFilter = (patch: Partial<WorkOrderFilters>) =>
    updateFilters((current) => ({ ...current, ...patch, page: 1 }));

  const createButton = canCreateWorkOrder ? (
    <Button
      onClick={() => setShowCreate(true)}
      className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold"
    >
      <Plus className="h-4 w-4" />
      Create Work Order
    </Button>
  ) : null;

  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader title="Work Orders" subtitle="Work Order" hideQuickCreate />
      <div className="bg-card px-8 py-5">
        <div className="flex items-center justify-between gap-4">
          <PageIntro
            title="Work Orders"
            description="Track maintenance work from assignment through completion, with clear ownership and status."
          />
          {createButton}
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-card px-8 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search ?? ""}
              onChange={(e) => setFilter({ search: e.target.value || undefined })}
              placeholder="Search work orders..."
              className="border-0 bg-muted/40 pl-9 shadow-none"
            />
          </div>

          <Select
            value={filters.status ?? "all"}
            onValueChange={(value) => setFilter({ status: value === "all" ? undefined : value })}
          >
            <SelectTrigger className="w-full border-0 bg-muted/40 shadow-none sm:w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="pending_completion">Pending completion</SelectItem>
              <SelectItem value="on_hold">On hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority ?? "all"}
            onValueChange={(value) => setFilter({ priority: value === "all" ? undefined : value })}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => void refetch()}
            disabled={isLoading || isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", (isLoading || isRefreshing) && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <main className="p-8">
        {isLoading ? (
          <div role="status" aria-live="polite">
            <span className="sr-only">Loading work orders…</span>
            <SkeletonTable rows={7} columns={7} />
          </div>
        ) : error ? (
          <div className="flex items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            <span>{error.message}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              className="border-0 bg-muted/40 shadow-none"
            >
              Try again
            </Button>
          </div>
        ) : workOrders.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No work orders found"
            description="Try changing the filters or create a new work order."
            actionLabel={canCreateWorkOrder ? "Create Work Order" : undefined}
            onAction={canCreateWorkOrder ? () => navigate(newWorkOrderPath) : undefined}
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    {[
                      "ID",
                      "Title",
                      "Origin",
                      "Priority",
                      "Status",
                      "Location",
                      "Assigned",
                      "Created",
                      "",
                    ].map((heading) => (
                      <th key={heading} className="px-5 py-3">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {workOrders.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`${workOrdersPath}/${item.id}`)}
                      className="cursor-pointer hover:bg-accent/40"
                    >
                      <td className="px-5 py-4 font-mono font-semibold">
                        {displayReference("WO", item.id)}
                      </td>
                      <td className="px-5 py-4 font-semibold">{item.title}</td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {item.sourceType === "preventive_maintenance"
                          ? "Preventive Maintenance"
                          : item.sourceType === "service_request"
                            ? "Service Request"
                            : "Manual"}
                      </td>
                      <td className="px-5 py-4">
                        <PriorityBadge priority={item.priority} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {item.locationName || "—"}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {item.assigneeName || "Unassigned"}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {item.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-3 py-4 text-muted-foreground">
                        <ChevronRight className="h-4 w-4" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="divide-y divide-border md:hidden">
              {workOrders.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(`${workOrdersPath}/${item.id}`)}
                  className="w-full p-4 text-left hover:bg-accent/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {displayReference("WO", item.id)}
                      </p>
                      <p className="mt-1 font-semibold">{item.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={item.priority} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-muted-foreground">
                      {item.sourceType === "preventive_maintenance"
                        ? "Preventive Maintenance"
                        : item.sourceType === "service_request"
                          ? "Service Request"
                          : "Manual"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.locationName || "No location"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.assigneeName || "Unassigned"}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-border p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {workOrders.length} of {total} work orders
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => updateFilters((current) => ({ ...current, page: page - 1 }))}
                >
                  Previous
                </Button>
                <span className="px-2 py-1 text-xs">
                  Page {page} of {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => updateFilters((current) => ({ ...current, page: page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="!max-w-4xl w-[calc(100vw-2rem)] !h-[calc(100dvh-2rem)] !max-h-[calc(100dvh-2rem)] overflow-hidden">
          <DialogHeader className="shrink-0 border-b border-border pb-4">
            <DialogTitle>Create Work Order</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Capture the issue, location, and execution path so the team can dispatch it correctly.
            </p>
          </DialogHeader>
          <CreateWorkOrder
            embedded
            onComplete={() => {
              setShowCreate(false);
              void refetch();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
