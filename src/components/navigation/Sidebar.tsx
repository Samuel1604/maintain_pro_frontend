import { Link, useLocation } from "react-router-dom";

import { buildPortalPath, buildUserPortalPath, PORTALS, type Portal } from "@/app/portal.config";
import { PORTAL_NAV } from "@/app/navigation/portalNav.config";
import { filterNavItemsByRole } from "@/app/navigation/routeAccess";
import { cn } from "@/utils/helpers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/app/store";
import { useOrganization } from "@/features/organization/hooks/useOrganization";
import { useVendorProfile } from "@/features/vendors/hooks/useVendorProfile";
import { MarqueeText } from "@/components/ui/MarqueeText";
import { useUserNotifications } from "@/features/notifications/hooks/useUserNotifications";

interface AppSidebarProps {
  portal: Portal;
  /** Close mobile nav sheet after navigation */
  onNavigate?: () => void;
}

export function AppSidebar({ portal, onNavigate }: AppSidebarProps) {
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const organizationFromStore = useAuthStore((state) => state.organization);

  const isVendorRole = Boolean(
    user?.role && ["vendor_lead", "vendor_manager", "vendor_technician"].includes(user.role),
  );
  // Fetch only the profile relevant to this portal; previously every portal
  // issued a second, unauthorized branding request during navigation.
  const { organization: orgData } = useOrganization(!isVendorRole);
  const { data: vendorData } = useVendorProfile(isVendorRole);

  const navConfig = PORTAL_NAV[portal];
  const { unreadCount } = useUserNotifications();

  // Derive vendor / organization branding dynamically from backend data
  const vendorName =
    vendorData?.name || (user as typeof user & { vendorName?: string })?.vendorName || "";
  const brandingReady = isVendorRole
    ? Boolean(vendorName)
    : Boolean(orgData?.name || organizationFromStore?.name);
  const brandingLoading = !brandingReady;
  const orgName = isVendorRole ? vendorName : orgData?.name || organizationFromStore?.name || "";

  // Branding is strictly tenant-scoped. A user's avatar must never be a logo fallback.
  const orgLogo = isVendorRole ? vendorData?.logo : orgData?.logo || organizationFromStore?.logo;

  const orgInitials =
    orgName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word: string) => word[0])
      .join("")
      .toUpperCase() || (isVendorRole ? "VE" : "OG");

  const primaryItems = filterNavItemsByRole(navConfig.primary, user?.role, portal);

  // Finance portal: show Dashboard + all finance-specific items in correct order
  const financeNavOrder = [
    "dashboard",
    "approvals",
    "quotations",
    "contracts",
    "invoices",
    "reports",
  ];
  const displayItems =
    user?.role === "finance"
      ? (financeNavOrder
          .map((seg) => primaryItems.find((i) => i.segment === seg))
          .filter(Boolean) as typeof primaryItems)
      : primaryItems;

  const secondaryItems = filterNavItemsByRole(navConfig.secondary, user?.role, portal);

  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "User"
    : "User";
  const roleLabel = user ? user.role.replace(/_/g, " ") : "";
  const initials = user
    ? [user.firstName, user.lastName]
        .map((n) => n?.[0] ?? "")
        .join("")
        .toUpperCase() || "U"
    : "U";

  const badgeForSegment = (segment: string) => {
    return segment === "notifications" ? unreadCount : undefined;
  };

  const orgGroups = [
    {
      label: "Operations",
      segments: [
        "facilities",
        "locations",
        "assets",
        "service-requests",
        "work-orders",
        "preventive-maintenance",
        "inventory",
      ],
    },
    {
      label: "Marketplace",
      segments: ["vendors", "vendors/marketplace", "vendors/quotations", "vendors/contracts"],
    },
    { label: "Finance", segments: ["approvals", "invoices", "billing"] },
    { label: "Admin", segments: ["reports", "settings", "notifications"] },
  ];
  const groupedItems =
    portal === PORTALS.ORG
      ? orgGroups
          .map((group) => ({
            ...group,
            items: group.segments
              .map((segment) => displayItems.find((item) => item.segment === segment))
              .filter(Boolean) as typeof displayItems,
          }))
          .filter((group) => group.items.length > 0)
      : [];
  const vendorGroups = [
    { label: "Operations", segments: ["work-orders"] },
    { label: "Commercial", segments: ["opportunities", "applications", "contracts", "slas"] },
    { label: "Lead", segments: ["reports", "notifications", "settings"] },
  ]
    .map((group) => ({
      ...group,
      items: group.segments
        .map((segment) => displayItems.find((item) => item.segment === segment))
        .filter(Boolean) as typeof displayItems,
    }))
    .filter((group) => group.items.length > 0);

  const hrefFor = (segment: string) =>
    user ? buildUserPortalPath(user, `/${segment}`) : buildPortalPath(portal, `/${segment}`);

  const profilePath = hrefFor("profile");

  const navItemClass = (isActive: boolean) =>
    cn(
      "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150",
      isActive
        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-border/60"
        : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    );

  const renderNavItem = (item: (typeof navConfig.primary)[number]) => {
    const href = hrefFor(item.segment);
    // Multi-segment items (e.g. 'vendors/marketplace') get exact + sub-page matching.
    // Single-segment items (e.g. 'vendors') are only active when the pathname is exactly
    // that page or a direct child — not when a deeper multi-segment sibling is active.
    const isMultiSegment = item.segment.includes("/");
    const multiSegmentPrefixes = displayItems
      .filter((i) => i.segment.includes("/") && i.segment.startsWith(item.segment + "/"))
      .map((i) => hrefFor(i.segment));
    const isActive = isMultiSegment
      ? pathname === href || pathname.startsWith(`${href}/`)
      : (pathname === href || pathname.startsWith(`${href}/`)) &&
        !multiSegmentPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    const badge = item.badge ?? badgeForSegment(item.segment);
    const isInventoryAlert = item.segment === "inventory" && badge && badge > 0;

    return (
      <Link key={item.name} to={href} onClick={onNavigate} className={navItemClass(isActive)}>
        {/* Active indicator bar */}
        <span
          className={cn(
            "absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-opacity duration-150",
            isActive ? "opacity-100" : "opacity-0",
          )}
          aria-hidden
        />
        <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
        <MarqueeText className="flex-1 text-[13px]">{item.name}</MarqueeText>
        {badge ? (
          <Badge
            variant={isInventoryAlert ? "destructive" : "secondary"}
            className={cn(
              "h-5 min-w-5 justify-center text-xs font-mono shrink-0",
              !isInventoryAlert && "bg-primary/20 text-primary",
            )}
          >
            {badge}
          </Badge>
        ) : null}
      </Link>
    );
  };

  return (
    <aside className="flex h-full min-h-0 w-full lg:w-(--sidebar-width-compact) xl:w-(--sidebar-width) flex-col border-r border-sidebar-border bg-gradient-to-b from-sidebar-accent/10 via-sidebar/95 to-sidebar px-3 py-5 transition-all duration-200">
      {/* Organization Logo Avatar + Name */}
      <div className="mb-2 flex items-center gap-2.5 rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/30 px-2.5 py-3.5">
        {brandingLoading ? (
          <>
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-xl bg-sidebar-foreground/10" />
            <div className="h-4 w-32 animate-pulse rounded bg-sidebar-foreground/10" />
          </>
        ) : (
          <>
            <Avatar className="h-8 w-8 shrink-0 rounded-xl">
              <AvatarImage src={orgLogo} alt={orgName} />
              <AvatarFallback className="rounded-xl bg-sidebar-primary text-sidebar-primary-foreground text-[12px] font-bold">
                {orgInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <MarqueeText className="text-[15px] font-bold leading-tight text-sidebar-foreground">
                {orgName}
              </MarqueeText>
            </div>
          </>
        )}
      </div>

      {/* Nav items container with hidden scrollbar */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-0.5 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {portal === PORTALS.ORG ? (
          <div className="space-y-4">
            {displayItems.some((item) => item.segment === "dashboard") ? (
              <nav className="space-y-0.5">
                {displayItems.filter((item) => item.segment === "dashboard").map(renderNavItem)}
              </nav>
            ) : null}
            {groupedItems.map((group) => (
              <section key={group.label} aria-label={group.label}>
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/40">
                  {group.label}
                </p>
                <nav className="space-y-0.5">{group.items.map(renderNavItem)}</nav>
              </section>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displayItems.some((item) => item.segment === "dashboard") ? (
              <nav className="space-y-0.5">
                {displayItems.filter((item) => item.segment === "dashboard").map(renderNavItem)}
              </nav>
            ) : null}
            {vendorGroups.map((group) => (
              <section key={group.label} aria-label={group.label}>
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/40">
                  {group.label}
                </p>
                <nav className="space-y-0.5">{group.items.map(renderNavItem)}</nav>
              </section>
            ))}
          </div>
        )}

        {secondaryItems.length > 0 && (
          <div className="mt-5 border-t border-sidebar-border pt-3">
            <nav className="space-y-0.5">
              {secondaryItems.map((item) => {
                const href = hrefFor(item.segment);
                const isActive = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={item.name}
                    to={href}
                    onClick={onNavigate}
                    className={navItemClass(isActive)}
                  >
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-opacity duration-150",
                        isActive ? "opacity-100" : "opacity-0",
                      )}
                      aria-hidden
                    />
                    <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                    <MarqueeText className="flex-1 text-[13px]">{item.name}</MarqueeText>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Profile Link Card */}
      <div className="mt-4 border-t border-sidebar-border pt-4 px-1">
        <Link
          to={profilePath}
          onClick={onNavigate}
          className="group/profile flex w-full items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-sidebar-accent"
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <MarqueeText className="text-[13px] font-semibold text-sidebar-foreground leading-tight">
              {fullName}
            </MarqueeText>
            <MarqueeText className="text-[11px] uppercase tracking-wide text-sidebar-foreground/45 leading-tight">
              {roleLabel}
            </MarqueeText>
          </div>
        </Link>
      </div>
    </aside>
  );
}
