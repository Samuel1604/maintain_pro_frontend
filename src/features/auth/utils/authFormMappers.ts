import type {
  RegisterOrganizationRequest,
  RegisterVendorRequest,
} from "@/features/auth/types/auth.types";
import { registerOrganizationRequestSchema, registerVendorRequestSchema } from '@/api/contracts/auth.contract';

interface AddressFields {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrganizationSignupForm extends AddressFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
  industry: string;
  phone: string;
}

export interface VendorSignupForm extends AddressFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  vendorName: string;
  companyRegistrationNumber: string;
  phone: string;
}

function toAddress(fields: AddressFields): RegisterOrganizationRequest["address"] {
  return {
    street: fields.street.trim() || undefined,
    city: fields.city.trim() || undefined,
    state: fields.state.trim() || undefined,
    postalCode: fields.postalCode.trim() || undefined,
    country: fields.country.trim() || undefined,
  };
}

export function toRegisterOrganizationRequest(
  form: OrganizationSignupForm
): RegisterOrganizationRequest {
  const candidate = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    password: form.password,
    confirmPassword: form.confirmPassword,
    organizationName: form.organizationName.trim(),
    industry: form.industry.trim(),
    phone: form.phone.trim(),
    address: toAddress(form),
  } as unknown;

  registerOrganizationRequestSchema.parse(candidate);

  return candidate as RegisterOrganizationRequest;
}

export function toRegisterVendorRequest(form: VendorSignupForm): RegisterVendorRequest {
  const candidate = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    password: form.password,
    confirmPassword: form.confirmPassword,
    vendorName: form.vendorName.trim(),
    companyRegistrationNumber: form.companyRegistrationNumber.trim() || undefined,
    phone: form.phone.trim(),
    address: toAddress(form),
  } as unknown;

  registerVendorRequestSchema.parse(candidate);

  return candidate as RegisterVendorRequest;
}
