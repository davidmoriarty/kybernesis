// packages/db/src/contracts.ts
export type UpdateUserProfileInput = Partial<{
  name: string;
  email: string;
  nickname: string | null;
  timezone: string | null;
  location: string | null;
  avatar: string | null;
}>;
