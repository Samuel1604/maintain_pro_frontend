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
  temporaryPassword: string;
  expiresInMinutes: number;
}

export const invitationApi = {
  createTempInvitation: (payload: CreateTempInvitationPayload) =>
    apiClient.post<TempInvitationResult>("/invitations/temp", payload),
};
