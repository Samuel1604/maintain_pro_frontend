# Preventive Maintenance API Boundary

Implemented backend-backed operations:

- `GET /preventive-maintenance`
- `POST /preventive-maintenance`
- `POST /preventive-maintenance/:id/approve`
- `POST /preventive-maintenance/:id/reject`
- `GET /preventive-maintenance/:id`
- `PATCH /preventive-maintenance/:id` (pending records; cancellation supported)
- `DELETE /preventive-maintenance/:id` (archive/cancel where permitted)

List queries support pagination, status, occurrence status, asset, facility, location, date range, search, and sorting.

The existing PM screen remains unchanged and still contains legacy presentation/demo actions. Those actions must not be connected to the API until the backend exposes contracts for:

- maintenance detail
- update/edit
- cancellation/archive
- schedule/calendar filtering
- occurrence history
- assignment/vendor fields
- checklist execution state
- notifications and approval history

Generated Work Orders are represented by `workOrderId` on the PM response. Work Order execution remains a separate domain experience.
