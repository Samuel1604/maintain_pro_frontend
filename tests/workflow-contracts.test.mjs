import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const frontendRoot = fileURLToPath(new URL("..", import.meta.url));
const source = (path) => readFileSync(resolve(frontendRoot, path), "utf8");

test("protected portal workflows are represented in the route contract", () => {
  const routes = source("src/app/router/portalRoutes.tsx");
  for (const route of ["work-orders", "service-requests", "billing", "notifications"]) {
    assert.match(routes, new RegExp(`path: ['"]${route}['"]`), `missing protected route: ${route}`);
  }
  assert.match(source("src/app/router.tsx"), /<ProtectedRoute>/);
});

test("billing UI uses the backend catalog and hosted checkout contract", () => {
  const billing = source("src/services/billingService.ts");
  assert.match(billing, /billing\/plans\?audience=/);
  assert.match(billing, /billing\/subscription\/checkout/);
  assert.doesNotMatch(billing, /cardNumber|cvv|cvc/);
});

test("portal access matrix separates organization and vendor capabilities", () => {
  const matrix = source("src/app/access.matrix.ts");
  assert.match(matrix, /ORG_MANAGERS/);
  assert.match(matrix, /VENDOR_ALL/);
  assert.match(matrix, /work-orders\/new/);
});
