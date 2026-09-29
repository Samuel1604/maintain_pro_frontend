import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/navigation/Navbar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function VendorDetails() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [showDispute, setShowDispute] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [message, setMessage] = useState("");
  const [disputeReason, setDisputeReason] = useState("");

  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader
        title="Vendor Profile & Record"
        subtitle={
          "Organization vendor management"
        }
        hideQuickCreate
      />

      <div className="px-8 py-6 space-y-6">
        {(
          <div
            role="status"
            className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning"
          >
            <p className="font-semibold">
              Vendor relationship details are not available yet.
            </p>
            <p className="mt-1 text-muted-foreground">
              The vendor profile endpoint does not expose these relationships,
              so unavailable fields are shown without demo values.
            </p>
          </div>
        )}
        <PageHeader
          className="rounded-xl border border-border"
          title="Vendor Profile & Record"
          subtitle={
            "Organization vendor management"
          }
          breadcrumbs={
            <span className="rounded bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-500">
              ACTIVE PARTNER
            </span>
          }
          actions={
            <>
              <Button
                variant="outline"
                onClick={() => setShowDispute(true)}
                className="border-destructive/30 text-destructive hover:bg-destructive/10 text-[13px] font-semibold"
              >
                Raise Dispute
              </Button>
              <Button
                onClick={() => setShowMsg(true)}
                variant="outline"
                className="text-[13px] font-semibold"
              >
                Message Partner
              </Button>
            </>
          }
        />

        {/* ── 2 Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Vendor Profile Card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
              <h3 className="text-[15px] font-bold text-card-foreground">
                Vendor Profile
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Service Categories
                  </p>
                  <p className="text-[13px] font-semibold text-foreground mt-1">
                    "Not provided by live API"
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Facility Coverage
                  </p>
                  <p className="text-[13px] font-semibold text-foreground mt-1">
                    "Not provided by live API"
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Primary Contact
                  </p>
                  <p className="text-[13px] font-semibold text-foreground mt-1">
                    "Not provided by live API"
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Dispatch Line
                  </p>
                  <p className="text-[13px] font-semibold text-foreground mt-1">
                    "Not provided by live API"
                  </p>
                </div>
              </div>
            </div>

            {/* SLA & Performance Metrics */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-[15px] font-bold text-card-foreground">
                SLA & Performance Metrics
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    SLA Compliance
                  </p>
                  <p className="text-3xl font-extrabold text-emerald-500 mt-2">
                    "—"
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Target commitment &gt; 98.0%
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Avg Response
                  </p>
                  <p className="text-3xl font-extrabold text-foreground mt-2">
                    "—"
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Emergency target: 15.0 min
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Completed Orders
                  </p>
                  <p className="text-3xl font-extrabold text-amber-500 mt-2">
                    42 tickets
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Total lifetime compliance runs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Linked Contract Awards */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
              <h3 className="text-[14px] font-bold text-card-foreground">
                Linked Contract Awards
              </h3>
              <div className="space-y-3">
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 flex justify-between items-center">
                  <div>
                    <p className="text-[13px] font-bold text-foreground">
                      24/7 Elevator Preventive Maint.
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      CON-1192
                    </p>
                  </div>
                  <span className="text-[13px] font-extrabold text-amber-500">
                    $3,800/mo
                  </span>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 flex justify-between items-center">
                  <div>
                    <p className="text-[13px] font-bold text-foreground">
                      ASME Regulatory Annual Inspection
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      CON-4029
                    </p>
                  </div>
                  <span className="text-[13px] font-extrabold text-amber-500">
                    $12,400/yr
                  </span>
                </div>
              </div>
            </div>

            {/* Relationship Timeline */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
              <h3 className="text-[14px] font-bold text-card-foreground">
                Relationship Timeline
              </h3>
              <div className="space-y-4 text-[13px]">
                <div className="relative pl-4 border-l-2 border-amber-500 space-y-0.5">
                  <p className="font-semibold text-foreground">
                    Vendor updated response plan for WO-4112
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    By: Marcus Vance • 1h ago
                  </p>
                </div>
                <div className="relative pl-4 border-l-2 border-border space-y-0.5">
                  <p className="font-semibold text-foreground">
                    New contract CON-1192 signed and active
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    By: Samuel Dane • 1d ago
                  </p>
                </div>
                <div className="relative pl-4 border-l-2 border-border space-y-0.5">
                  <p className="font-semibold text-foreground">
                    First application bid submitted for ASME inspections
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    By: System • 2w ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Dialog */}
      <Dialog open={showMsg} onOpenChange={setShowMsg}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground">
          <DialogHeader>
            <DialogTitle>Message Partner</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs">Direct Note to Marcus Vance</Label>
            <Textarea
              rows={4}
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMsg(false)}>
              Cancel
            </Button>
            <Button
              disabled
              title="Partner messaging is not available for this workspace"
            >
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={showDispute} onOpenChange={setShowDispute}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground">
          <DialogHeader>
            <DialogTitle>Raise Operational Dispute</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs">Reason / SLA Breach Details</Label>
            <Textarea
              rows={4}
              placeholder="Describe contract or SLA breach issue..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDispute(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled
              title="Vendor disputes are managed through contracts and invoices"
            >
              Log Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
