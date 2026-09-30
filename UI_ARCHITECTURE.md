# MaintainPro UI Architecture Decisions

This document records the frontend architecture that is currently implemented. It describes decisions and their rationale; it is not an implementation instruction list.

## Decision 1: One application tree

The frontend mounts one `RouterProvider` inside the shared provider tree. `ThemeProvider`, `QueryProvider`, `AuthInitializer`, `RealtimeProvider`, and `ErrorBoundary` each participate in that single tree. This establishes one application lifecycle and one source of rendered route state.

## Decision 2: One implementation per public page

The root route is implemented by `features/public/pages/LandingPage.tsx`. Public navigation treats the landing page as the single home experience.

The remaining public routes are distinct page decisions: Features, Pricing, Checkout, About, Contact, Privacy Policy, and Terms of Service.

## Production folder structure

The frontend repository is the `MaintainPro` repository. The application source currently lives under `frontend/src/` in this workspace and is organized by ownership:

```text
src/
├── main.tsx, AppLayout.tsx       Application entry and shell composition
├── app/                          Providers, router, navigation, portal state
├── api/                          Shared HTTP client and cross-feature contracts
├── components/                   Reusable brand, layout, feedback, navigation, and UI primitives
├── config/                       Runtime configuration only
├── features/<domain>/             Domain-owned pages, components, hooks, api, services, types
├── hooks/                        Cross-domain React hooks
├── lib/                          Framework-neutral helpers and error/query infrastructure
├── realtime/                     Socket connection and realtime provider
├── services/                     Transitional shared adapters; new domain services belong in features
├── styles/                       Global and design-token styles
├── types/                        Cross-domain types only
└── utils/                        Small cross-domain pure utilities
```

### Ownership decisions

- A feature owns its API adapters, contracts, hooks, services, pages, and domain types whenever those pieces are not shared.
- `api/` owns only transport primitives and contracts shared across multiple domains.
- `components/` contains reusable presentation and interaction primitives; business rules remain in features.
- `services/` is a compatibility boundary for shared adapters that serve more than one feature. New domain services belong in their owning feature.
- `types/` is for genuinely cross-domain types. Feature-only types belong in that feature's `types/` directory.
- `app/` owns bootstrapping and routing, while pages remain in feature folders.

### Normalization decisions

- Reports now follow the standard feature shape with `reports/api/` and `reports/hooks/`.
- Inventory uses the canonical `inventory/services/inventory.service.ts` service boundary.
- Shared adapters under `services/` remain a compatibility boundary for cross-feature consumers. New domain services belong in their owning feature.

## Reference implementations

| Concern                          | Reference                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------- |
| Organization dashboard           | `src/features/dashboard/views/AdminDashboard.tsx`                                |
| Facility dashboard               | `src/features/dashboard/views/FacilityManagerDashboard.tsx`                      |
| Technician dashboard             | `src/features/dashboard/views/TechnicianDashboard.tsx`                           |
| Vendor dashboard                 | `src/features/dashboard/views/VendorDashboard.tsx`                               |
| Work-order list/detail           | `src/features/work-orders/pages/WorkOrders.tsx`, `WorkOrderDetails.tsx`          |
| Forms                            | `src/features/work-orders/components/EditWorkOrderDialog.tsx`, settings forms    |
| Settings                         | `src/features/settings/pages/Settings.tsx`, `UserProfile.tsx`                    |
| Tables and pagination            | work-order, asset, inventory, and vendor pages                                   |
| Confirmation/destructive actions | `src/components/feedback/ConfirmDialog.tsx`                                      |
| Public/authentication            | `src/features/public`, `src/features/auth`                                       |
| Reports and charts               | `src/features/reports`, `src/features/dashboard/components/DashboardWidgets.tsx` |

The newest implementation is not automatically authoritative. The selected reference is the one with the clearest states, accessibility, responsive behavior, and backend integration.

## UI decisions

### Typography and spacing

- The existing font family and Tailwind typography utilities are the canonical type system.
- The existing page-title, section-title, label, body, metadata, and helper-text patterns are the canonical type scale.
- The established `p-*`, `gap-*`, and `space-y-*` rhythm is the canonical spacing language.
- Page headers, cards, tables, dialogs, and drawers inherit spacing from their nearest approved reference implementation.

### Containers and surfaces

- `AppHeader`, `MainLayout`, and portal layouts define the page shell and content gutters.
- Cards use the existing border, surface/background tokens, radius, and restrained shadow hierarchy.
- Dividers use theme border tokens; one-off gray values are outside the design system.
- Buttons, inputs, badges, dialogs, and cards share the existing radius hierarchy.

### Theme

Light and dark mode are supported by every shared component. Semantic tokens (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, status tokens, and chart tokens) are the color source of truth. Interactive states are represented in both themes.

### Responsive behavior

- Desktop: 1440–1024px uses the full portal shell and multi-column grids.
- Tablet: 1024–768px reduces columns, keeps actions usable, and allows horizontal table treatment where necessary.
- Mobile: 768–360px stacks content, converts dense tables into cards/lists, moves navigation into the existing mobile drawer, and makes modal actions full-width or sheet-like where appropriate.
- Responsive behavior is evaluated by task completion, not only by overflow prevention.

## Page archetypes

### Dashboard

Page header → contextual actions → role-specific KPIs → primary operational content → supporting analytics → alerts/activity.

Role dashboards contain only metrics that represent that role's responsibilities.

### List/table

Page header → context → primary action → search/filter/sort → populated table/list → pagination.

Backend-backed lists expose loading, empty, error, unauthorized, and populated states. Mobile list views use cards or lists where a dense desktop table would reduce usability.

### Detail

Breadcrumb/back → entity header/status/actions → overview → entity-specific information → related records → activity/history → attachments/comments where applicable.

Tabs are appropriate only when the content is substantial and independently navigable.

### Create/edit and review

The interaction boundary is modal for small operations, drawer for contextual inspection or secondary editing, and page for complex workflows. Approval actions expose current state, next state, consequences, and confirmation requirements.

### Settings

Keep user-scoped, organization-scoped, and vendor-scoped settings separate. Reuse the existing settings navigation and save/error/toast patterns.

## Reuse decisions

Shared primitives are extended when behavior is genuinely shared. Domain-specific variants remain separate when their states or interactions differ. This avoids both accidental duplication and over-generalized components.

Existing shared primitives include:

- `src/components/ui/*`
- `src/components/feedback/*`
- `src/components/navigation/*`
- `src/components/layout/*`
- feature-level chart, table, and form components where behavior is domain-specific

## Data and workflow rules

- Screens use the actual backend contract, domain states, permissions, and API service.
- Fake operational records, fake metrics, and localStorage as a second database are not part of the production data model.
- Loading uses the existing skeleton/loading patterns; empty states explain what is missing and provide a next action; errors show a safe constructed message; success uses the existing toast/notification system.
- Unauthorized and not-found cases use the existing route and feedback patterns.
- Missing backend contracts are recorded as dependencies; the UI does not fabricate operational state.

## Modal and drawer policy

Prefer the existing modal/drawer patterns for create, edit, delete confirmation, assignment, status changes, and quick inspection. Use a page only for complex workflows, dashboards, reports, and substantial entity details. Destructive actions must use `ConfirmDialog` and clearly state what will be removed.

## Decision record for future changes

New frontend work is evaluated against the nearest page archetype, existing shared primitives, backend contract, permission model, domain states, responsive behavior, theme behavior, and component ownership. These are review criteria, not a procedural checklist.

## Known follow-up work

- Pages with literal colors or bespoke spacing are migration candidates when they are next changed.
- Report/dashboard fixture data remains a temporary compatibility state until the corresponding report API contract is connected.
- Repeated table/card layouts remain separate unless their state and interaction requirements become genuinely shared.
