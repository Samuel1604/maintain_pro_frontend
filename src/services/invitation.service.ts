import { ENDPOINTS } from "@/api/endpoints";
import { apiClient } from "@/api/client";

export interface SendInvitationPayload {
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  facilityId?: string;
}

export interface SendTempInvitationPayload {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

/** Full invitation response — all fields the backend now returns */
export interface InvitationResponse {
  _id: string;
  email: string;
  role: string;
  invitationType: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  /** Raw 32-byte hex token (only on create/resend, single use) */
  invitationToken?: string;
  /** Full accept URL with token already embedded */
  invitationUrl?: string;
  /** On-screen temp password — present when emailSent === false */
  temporaryPassword?: string;
  /** TTL of the invitation in minutes (always 15) */
  expiresInMinutes?: number;
  /** True if an email provider sent the invitation email */
  emailSent?: boolean;
}

export interface TempInvitationResponse {
  email: string;
  temporaryPassword: string;
  expiresInMinutes: number;
}

export const invitationService = {
  async sendInvitation(payload: SendInvitationPayload): Promise<InvitationResponse> {
    return apiClient.post<InvitationResponse>(ENDPOINTS.INVITATIONS.CREATE, payload);
  },

  async sendTempInvitation(payload: SendTempInvitationPayload): Promise<TempInvitationResponse> {
    return apiClient.post<TempInvitationResponse>("/invitations/temp", payload);
  },

  async listInvitations(params?: { status?: string; role?: string; page?: number; limit?: number }) {
    return apiClient.get<InvitationResponse[]>(ENDPOINTS.INVITATIONS.LIST, { params });
  },

  /**
   * Re-sends an existing pending invitation.
   * Backend issues a fresh 15-min token, new temp password, and returns the
   * same credentials payload as sendInvitation (invitationUrl, temporaryPassword, emailSent).
   */
  async resendInvitation(id: string): Promise<InvitationResponse> {
    return apiClient.post<InvitationResponse>(ENDPOINTS.INVITATIONS.RESEND(id), {});
  },

  async revokeInvitation(id: string): Promise<InvitationResponse> {
    return apiClient.post<InvitationResponse>(ENDPOINTS.INVITATIONS.REVOKE(id), {});
  },
};
