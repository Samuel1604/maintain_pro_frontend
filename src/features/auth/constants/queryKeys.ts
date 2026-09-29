export const authKeys = {
  all: ["auth"] as const,
  me: ["auth", "me"],

  sessions: ["auth", "sessions"],

  invitation: (token: string) => ["auth", "invitation", token],
};
