import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge, StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { AppHeader } from "@/components/navigation/Navbar";
import { usePortalPath } from "@/hooks/usePortal";
import { workOrdersService } from "@/features/work-orders/services/workOrders.service";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageError } from "@/components/feedback/PageError";
import { PageHeader } from "@/components/ui/page-header";

export interface VendorWorkOrderRow {
  id: string;
  facility: string;
  location: string;
  assetTask: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  slaDeadline: string;
  slaUrgent?: boolean;
  slaOverdue?: boolean;
  assignedTech: string;
  status:
    | "IN PROGRESS"
    | "SCHEDULED"
    | "COMPLETED"
    | "ON HOLD"
    | "PENDING COMPLETION";
}

export function VendorWorkOrders() {
  const navigate = useNavigate();
  const workOrdersPath = usePortalPath("work-orders");

  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [facilityFilter, setFacilityFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [techFilter, setTechFilter] = useState("all");
  const [apiRows, setApiRows] = useState<VendorWorkOrderRow[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const loadVendorWorkOrders = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const result = await workOrdersService.listForVendor({ limit: 100 });
      setApiRows(
        result.data.map((item) => ({
          id: item.id,
          facility: item.locationName || "—",
          location: item.locationName || "—",
          assetTask: item.title,
          priority:
            item.priority.toUpperCase() as VendorWorkOrderRow["priority"],
          slaDeadline: "—",
          assignedTech: item.assigneeName || "Unassigned",
          status:
            item.status === "completed"
              ? "COMPLETED"
              : item.status === "in_progress"
              ? "IN PROGRESS"
              : item.status === "on_hold"
              ? "ON HOLD"
              : item.status === "pending_completion"
              ? "PENDING COMPLETION"
              : "SCHEDULED",
        })),
      );
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Unable to load work orders",
      );
    } finally {
      setApiLoading(false);
    }
  };
  useEffect(() => {
    void loadVendorWorkOrders();
  }, []);
  const filtered = useMemo(() => {
    return apiRows.filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.assetTask.toLowerCase().includes(search.toLowerCase()) ||
        item.facility.toLowerCase().includes(search.toLowerCase());
      const matchFacility =
        facilityFilter === "all" || item.facility === facilityFilter;
      const matchPriority =
        priorityFilter === "all" ||
        item.priority.toLowerCase() === priorityFilter.toLowerCase();
      const matchStatus =
        statusFilter === "all" ||
        item.status.toLowerCase().replace(/\s+/g, "") ===
          statusFilter.toLowerCase().replace(/\s+/g, "");
      const matchTech =
        techFilter === "all" || item.assignedTech === techFilter;

      return (
        matchSearch &&
        matchFacility &&
        matchPriority &&
        matchStatus &&
        matchTech
      );
    });
  }, [
    apiRows,
    search,
    facilityFilter,
    priorityFilter,
    statusFilter,
    techFilter,
  ]);

  if (apiLoading) return <PageLoader label="Loading vendor work orders..." />;
  if (apiError)
    return (
      <PageError
        title="Work orders unavailable"
        message={apiError}
        onRetry={() => void loadVendorWorkOrders()}
      />
    );

  return (
    <div className="flex flex-col bg-background min-h-full text-foreground">
      <AppHeader title="Work Orders" hideQuickCreate />

      <div className="p-6 max-w-[1400px] w-full mx-auto space-y-5">
        {/* Top Control Bar & Header */}
        <PageHeader
          className="rounded-xl border border-border"
          title="Work Orders"
          subtitle="Assigned maintenance tasks for your team, including dispatch status, technician ownership, and SLA deadlines."
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Use list view for detailed records or Kanban to see dispatch flow
              at a glance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* List / Kanban Switcher */}
            <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`rounded-lg px-3.5 py-1.5 text-[12px] font-bold transition-all ${
                  viewMode === "list"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                List View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`rounded-lg px-3.5 py-1.5 text-[12px] font-bold transition-all ${
                  viewMode === "kanban"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Kanban
              </button>
            </div>

            <Button
              onClick={() => navigate("../team")}
              className="font-bold text-[13px] px-4 py-2 flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Dispatch Tech
            </Button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-3 bg-card p-3 rounded-2xl border border-border shadow-sm">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search work orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-[13px] rounded-xl border-border bg-background"
            />
          </div>

          <Select value={facilityFilter} onValueChange={setFacilityFilter}>
            <SelectTrigger className="h-9 min-w-[180px] rounded-xl border-border text-[13px] bg-card">
              <SelectValue placeholder="Facility: All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Facility: All Locations</SelectItem>
              <SelectItem value="Main HQ Office">Main HQ Office</SelectItem>
              <SelectItem value="West Campus Shaft">
                West Campus Shaft
              </SelectItem>
              <SelectItem value="North Logistics">North Logistics</SelectItem>
              <SelectItem value="East Warehouses">East Warehouses</SelectItem>
              <SelectItem value="Silicon Valley Lab">
                Silicon Valley Lab
              </SelectItem>
              <SelectItem value="HQ Office Tower">HQ Office Tower</SelectItem>
              <SelectItem value="West Campus Lobby">
                West Campus Lobby
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 min-w-[190px] rounded-xl border-border text-[13px] bg-card">
              <SelectValue placeholder="Priority: Critical & High" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Priority: All</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 min-w-[170px] rounded-xl border-border text-[13px] bg-card">
              <SelectValue placeholder="Status: In Progress" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status: All</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="on hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={techFilter} onValueChange={setTechFilter}>
            <SelectTrigger className="h-9 min-w-[160px] rounded-xl border-border text-[13px] bg-card">
              <SelectValue placeholder="Tech: All Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tech: All Team</SelectItem>
              <SelectItem value="Mike Ross">Mike Ross</SelectItem>
              <SelectItem value="John Doe">John Doe</SelectItem>
              <SelectItem value="Sarah Jenkins">Sarah Jenkins</SelectItem>
              <SelectItem value="Dave Miller">Dave Miller</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Table View */}
        {viewMode === "list" ? (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3.5 px-5">WO #</th>
                    <th className="py-3.5 px-5">Facility / Location</th>
                    <th className="py-3.5 px-5">
                      Asset &amp; Task Description
                    </th>
                    <th className="py-3.5 px-5">Priority</th>
                    <th className="py-3.5 px-5">SLA Deadline</th>
                    <th className="py-3.5 px-5">Assigned Tech</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center">
                        <p className="font-semibold text-foreground">
                          No assigned work orders
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Work orders dispatched to your vendor team will appear
                          here.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-muted/20 transition-colors group cursor-pointer"
                        onClick={() => navigate(`${workOrdersPath}/${item.id}`)}
                      >
                        <td className="py-4 px-5 font-bold text-indigo-500">
                          {item.id}
                        </td>
                        <td className="py-4 px-5 font-bold text-foreground">
                          {item.facility}
                        </td>
                        <td className="py-4 px-5 text-muted-foreground">
                          {item.assetTask}
                        </td>
                        <td className="py-4 px-5">
                          <PriorityBadge priority={item.priority} />
                        </td>
                        <td className="py-4 px-5 font-bold text-[13px]">
                          {item.slaOverdue ? (
                            <span className="text-red-500">Overdue</span>
                          ) : item.slaUrgent ? (
                            <span className="text-foreground">
                              {item.slaDeadline}
                            </span>
                          ) : item.status === "COMPLETED" ? (
                            <span className="text-emerald-500 font-semibold">
                              {item.slaDeadline}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {item.slaDeadline}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-foreground font-medium">
                          {item.assignedTech}
                        </td>
                        <td className="py-4 px-5">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-4 px-5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`${workOrdersPath}/${item.id}`);
                            }}
                            className="text-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10 font-bold text-[12px] h-8 px-3 rounded-lg"
                          >
                            Manage
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-border px-5 py-3.5 text-[13px] text-muted-foreground">
              Showing{" "}
              <span className="font-bold text-foreground">
                {filtered.length}
              </span>{" "}
              work orders
            </div>
          </div>
        ) : (
          /* Kanban Board View */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {["SCHEDULED", "IN PROGRESS", "ON HOLD", "COMPLETED"].map(
              (columnStatus) => {
                const colItems = filtered.filter(
                  (item) => item.status === columnStatus,
                );
                return (
                  <div
                    key={columnStatus}
                    className="bg-card rounded-2xl border border-border p-4 flex flex-col gap-3 min-h-[500px]"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <h3 className="font-bold text-[13px] text-foreground">
                        {columnStatus}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="rounded-full text-[11px] font-bold"
                      >
                        {colItems.length}
                      </Badge>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {colItems.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                          No work orders in this stage.
                        </p>
                      ) : (
                        colItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() =>
                              navigate(`${workOrdersPath}/${item.id}`)
                            }
                            className="p-4 rounded-xl border border-border bg-background hover:bg-muted/30 hover:shadow-md transition-all cursor-pointer space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-indigo-500 text-[12px]">
                                {item.id}
                              </span>
                              <span className="text-[11px] font-semibold text-muted-foreground">
                                {item.priority}
                              </span>
                            </div>
                            <p className="font-bold text-[13px] text-foreground">
                              {item.assetTask}
                            </p>
                            <p className="text-[12px] text-muted-foreground">
                              {item.facility}
                            </p>
                            <div className="pt-2 flex items-center justify-between border-t border-border/60 text-[11px] text-muted-foreground">
                              <span>{item.assignedTech}</span>
                              <span className="font-bold text-foreground">
                                {item.slaDeadline}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>
    </div>
  );
}
