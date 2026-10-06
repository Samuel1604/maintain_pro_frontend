import { apiClient } from "./client";

export interface CreateTempInvitationPayload {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  facilityId?: string;
}

export interface TempInvitationResult {
  email: string;
  expiresInMinutes: number;
  emailSent: boolean;
}

export const invitationApi = {
  createTempInvitation: (payload: CreateTempInvitationPayload) =>
    apiClient.post<TempInvitationResult>("/invitations/temp", payload),
};
