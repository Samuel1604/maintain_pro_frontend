import type { WorkOrder } from "@/types/common.types";
import type {
  AssignmentOptionsResult,
  AssignmentSort,
  VendorAssignmentOption,
} from "../types/assignment.types";

export function getAssignmentOptions(
  _workOrder: WorkOrder,
  _sort: AssignmentSort,
): AssignmentOptionsResult {
  return { vendors: [], independents: [] };
}

export function getVendorTechniciansSorted(vendor: VendorAssignmentOption, _sort: AssignmentSort) {
  return vendor.technicians;
}
