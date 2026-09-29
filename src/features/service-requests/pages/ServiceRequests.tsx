import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, RefreshCw, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/helpers";
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
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePortalPath } from "@/hooks/usePortal";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { displayReference } from "@/utils/display-ids";
import { displayLabel } from "@/utils/display-ids";
import { useServiceRequests } from "../hooks/useServiceRequests";
import type { ServiceRequestRecord } from "../services/serviceRequests.service";
import { PageIntro } from "@/components/layout/PageIntro";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateServiceRequest } from "./CreateServiceRequest";

export function ServiceRequests() {
  const navigate = useNavigate();
  const path = usePortalPath("service-requests");
  const { canSubmitServiceRequest } = useRoleAccess();
  const [showCreate, setShowCreate] = useState(false);
  const [status, setStatus] = useState<ServiceRequestRecord["status"]>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, total, totalPages, isLoading, isRefreshing, error, refetch } =
    useServiceRequests({
      page,
      limit: 20,
      status,
    });

  const rows = data.filter(
    (item) =>
      !search ||
      `${item.id} ${item.title} ${item.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const createButton = canSubmitServiceRequest ? (
    <Button
      onClick={() => setShowCreate(true)}
      className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold"
    >
      <Plus className="h-4 w-4" />
      Create Request
    </Button>
  ) : null;

  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader title="Service Requests" subtitle="Service Request" hideQuickCreate />
      <div className="bg-card px-8 py-5">
        <div className="flex items-center justify-between gap-4">
          <PageIntro title="Service Requests" description="Capture maintenance needs, follow review progress, and connect approved requests to work orders." />
          {createButton}
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-card px-8 py-3">
        <div className="flex flex-wrap gap-3">
          <div className="w-full sm:w-72">
            <SearchInput
              className="border-0 bg-muted/40 shadow-none"
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select
            value={status ?? "all"}
            onValueChange={(value) => {
              setStatus(
                value === "all"
                  ? undefined
                  : (value as ServiceRequestRecord["status"]),
              );
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full border-0 bg-muted/40 shadow-none sm:w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => void refetch()}
            disabled={isRefreshing}
            className="gap-2 border-0 bg-muted/40 shadow-none"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <main className="p-8">
        {isLoading ? (
          <div role="status" aria-live="polite">
            <span className="sr-only">Loading service requests…</span>
            <SkeletonTable rows={5} columns={7} />
          </div>
        ) : error ? (
          <div className="flex items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            <span>{error.message}</span>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No service requests found"
            description="Try changing the filters or submit a new request."
            actionLabel={canSubmitServiceRequest ? "Create Request" : undefined}
            onAction={
              canSubmitServiceRequest
                ? () => navigate(`${path}/new`)
                : undefined
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    {[
                      "ID",
                      "Request",
                      "Category",
                      "Priority",
                      "Status",
                      "Created",
                      "Work Order",
                      "",
                    ].map((heading) => (
                      <TableHead key={heading}>{heading}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((item) => (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`${path}/${item.id}`)}
                    >
                      <TableCell className="font-mono font-semibold">
                        {displayReference('SR', item.id)}
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {displayLabel(item.serviceCategory)}
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={item.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {item.workOrderId ? displayReference('WO', item.workOrderId) : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <ChevronRight className="h-4 w-4" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile card list */}
            <div className="divide-y divide-border md:hidden">
              {rows.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => navigate(`${path}/${item.id}`)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {displayReference('SR', item.id)}
                      </p>
                      <p className="mt-1 font-semibold">{item.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={item.priority} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-muted-foreground">
                      {displayLabel(item.serviceCategory)}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            <footer className="flex flex-col gap-3 border-t border-border p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {rows.length} of {total} requests
              </span>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </footer>
          </div>
        )}
      </main>
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="!max-w-4xl w-[calc(100vw-2rem)] !h-[calc(100dvh-2rem)] !max-h-[calc(100dvh-2rem)] overflow-y-auto bg-card border-border p-6">
          <DialogHeader className="shrink-0 border-b border-border pb-4">
            <DialogTitle>Create Service Request</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Describe the issue clearly so facilities can triage and assign the
              right response.
            </p>
          </DialogHeader>
          <CreateServiceRequest
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

export default ServiceRequests;
