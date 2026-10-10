import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/navigation/Navbar";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { apiClient } from "@/api/client";

export function VendorContractDetails() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isOrganizationView = location.pathname.includes("/vendors/contracts");
  const contractsPath = location.pathname.split("/").slice(0, -1).join("/");
  const [contract, setContract] = useState<{
    _id: string;
    organizationId: string;
    vendorId?: string | { _id: string; name?: string };
    status: string;
    effectiveAt?: string;
    expiresAt?: string;
    notes?: string;
    quotationId?: string;
    slaAgreementId?: string;
    organizationName?: string;
    quotation?: { currency: string; totalMinor: number; estimatedDurationHours: number };
    sla?: { responseTimeHours: number; resolutionTimeHours: number; warrantyPeriodDays: number };
  } | null>(null);
  const [workOrders, setWorkOrders] = useState<
    Array<{
      workOrderId?: string | { _id: string; title?: string };
      _id?: string;
      title?: string;
      status?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [workOrdersError, setWorkOrdersError] = useState<string | null>(null);

  useEffect(() => {
    void apiClient
      .get<
        Array<{
          _id: string;
          organizationId: string;
          vendorId?: string | { _id: string; name?: string };
          status: string;
          effectiveAt?: string;
          expiresAt?: string;
          notes?: string;
          quotationId?: string;
          slaAgreementId?: string;
          organizationName?: string;
          quotation?: { currency: string; totalMinor: number; estimatedDurationHours: number };
          sla?: {
            responseTimeHours: number;
            resolutionTimeHours: number;
            warrantyPeriodDays: number;
          };
        }>
      >(isOrganizationView ? "/contract-awards" : "/contract-awards/mine")
      .then((items) => {
        const found = items.find((item) => item._id === contractId);
        if (!found) throw new Error("Contract award not found");
        setContract(found);
        void apiClient
          .get<
            Array<{
              workOrderId?: string | { _id: string; title?: string };
              _id?: string;
              title?: string;
              status?: string;
            }>
          >(`/contract-awards/${found._id}/work-orders`)
          .then(setWorkOrders)
          .catch((error) =>
            setWorkOrdersError(
              error instanceof Error ? error.message : "Unable to load linked work orders",
            ),
          );
      })
      .catch((error) =>
        setLoadError(error instanceof Error ? error.message : "Unable to load contract"),
      )
      .finally(() => setLoading(false));
  }, [contractId, isOrganizationView]);

  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : "—");

  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader
        title={`${contractId} Detail`}
        subtitle={isOrganizationView ? "Organization contract award" : "My Service Contracts"}
        hideQuickCreate
      />

      <div className="px-4 sm:px-8 py-6 space-y-6">
        {loading && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Loading contract…
          </div>
        )}
        {loadError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {loadError}
          </div>
        )}
        {!loading && !loadError && contract && (
          <>
            {/* Top Header Title & Actions */}
            <PageHeader
              className="rounded-xl border border-border"
              title={`${contractId}: ${
                isOrganizationView ? "Vendor Contract Award" : "Client Service Agreement"
              }`}
              subtitle={
                isOrganizationView
                  ? "Review vendor obligations, commercial terms, and operational performance for this awarded contract."
                  : "Manage your vendor obligations, service delivery, and relationship with this organization client."
              }
              breadcrumbs={
                <Button variant="ghost" className="px-0" onClick={() => navigate(contractsPath)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to contracts
                </Button>
              }
              actions={
                <>
                  <StatusBadge status={contract.status} />
                </>
              }
            />

            {/* 2 Column Main Body */}
            <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Contract Specifications */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-6 sm:p-6">
                  <h3 className="text-[15px] font-bold text-card-foreground">
                    Contract Specifications
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {isOrganizationView ? "VENDOR PARTNER" : "ORGANIZATION CLIENT"}
                      </p>
                      <p className="text-[13px] font-bold text-foreground mt-1">
                        {contract.organizationName ||
                          (typeof contract.vendorId === "string"
                            ? contract.vendorId
                            : (contract.vendorId?.name ?? contract.organizationId))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        AGREED SERVICE
                      </p>
                      <p className="text-[13px] font-bold text-foreground mt-1">
                        {contract.notes || "Service scope is recorded on the linked work order."}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        SLA COMMITMENT
                      </p>
                      <p className="text-[13px] font-bold text-foreground mt-1">
                        {contract.sla
                          ? `${contract.sla.responseTimeHours}h response · ${contract.sla.resolutionTimeHours}h resolution · ${contract.sla.warrantyPeriodDays}d warranty`
                          : contract.slaAgreementId
                            ? "SLA agreement linked; detailed terms are not included in this response."
                            : "No SLA agreement is linked to this contract."}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        CONTRACT PERIOD
                      </p>
                      <p className="text-[13px] font-bold text-foreground mt-1">
                        {formatDate(contract.effectiveAt)} – {formatDate(contract.expiresAt)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/60 space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      MONETARY TERMS & AUTHORIZATION
                    </p>
                    <p className="text-2xl font-extrabold text-amber-500">
                      {contract.quotation
                        ? `${contract.quotation.currency} ${(contract.quotation.totalMinor / 100).toFixed(2)}`
                        : contract.quotationId
                          ? "Quotation linked; financial terms are not included in this response."
                          : "No quotation is linked to this contract."}
                    </p>
                    <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground pt-1">
                      <span className="text-muted-foreground">
                        Payment is authorized through the linked work-order and procurement
                        workflow.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Linked Active Work Orders */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4 sm:p-6">
                  <h3 className="text-[15px] font-bold text-card-foreground">
                    Linked Active Work Orders
                  </h3>

                  <div className="overflow-x-auto">
                    {workOrdersError && (
                      <p className="text-sm text-destructive">{workOrdersError}</p>
                    )}
                    {!workOrdersError && workOrders.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        {contract.notes || "No linked work orders are available for this contract."}
                      </p>
                    )}
                    <table
                      className={`${
                        workOrders.length ? "" : "hidden"
                      } w-full min-w-[620px] text-left text-[13px]`}
                    >
                      <thead>
                        <tr className="border-b border-border bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          <th className="px-4 py-3">WO Number</th>
                          <th className="px-4 py-3">Description</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">SLA Deadline</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {workOrders.map((workOrder) => (
                          <tr
                            key={
                              typeof workOrder.workOrderId === "string"
                                ? workOrder.workOrderId
                                : workOrder.workOrderId?._id || workOrder._id
                            }
                            className="hover:bg-muted/20"
                          >
                            <td className="px-4 py-3.5 font-bold text-amber-500 font-mono">
                              {typeof workOrder.workOrderId === "string"
                                ? workOrder.workOrderId
                                : (workOrder.workOrderId?.title ?? workOrder.workOrderId?._id) ||
                                  workOrder._id}
                            </td>
                            <td className="px-4 py-3.5 text-foreground font-medium">
                              {workOrder.title || "Linked work order"}
                            </td>
                            <td className="px-4 py-3.5">
                              <StatusBadge status={workOrder.status || "open"} />
                            </td>
                            <td className="px-4 py-3.5 text-right text-muted-foreground">—</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column Timeline (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4 sm:p-6">
                  <h3 className="text-[15px] font-bold text-card-foreground">
                    Service Level Agreement
                  </h3>
                  {contract.sla ? (
                    <p className="text-sm text-muted-foreground">
                      {contract.sla.responseTimeHours}h response ·{" "}
                      {contract.sla.resolutionTimeHours}h resolution ·{" "}
                      {contract.sla.warrantyPeriodDays}d warranty
                    </p>
                  ) : contract.slaAgreementId ? (
                    <p className="text-sm text-muted-foreground">
                      An SLA agreement is linked, but its detailed terms are not included in this
                      response.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No SLA agreement is linked to this contract.
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
                  <h3 className="text-[15px] font-bold text-card-foreground">
                    Contract History & Timeline
                  </h3>

                  <div className="space-y-6 text-[13px] relative before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    <div className="relative pl-6 space-y-0.5">
                      <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-card" />
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-foreground">Current contract status</p>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {formatDate(contract.effectiveAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Status: {contract.status.replaceAll("_", " ")}
                      </p>
                    </div>

                    <div className="relative pl-6 space-y-0.5">
                      <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-muted-foreground/40 ring-4 ring-card" />
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-foreground">Contract expiry</p>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {formatDate(contract.expiresAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Renewal and amendment history are not included in this response.
                      </p>
                    </div>

                    <div className="relative pl-6 space-y-0.5">
                      <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-muted-foreground/40 ring-4 ring-card" />
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-foreground">Contract notes</p>
                        <span className="text-[11px] text-muted-foreground font-mono">Current</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {contract.notes || "No contract notes provided."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
