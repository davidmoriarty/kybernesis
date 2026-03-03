// packages/auth/src/types.ts

export type AuthMessageResponse = {
  message: string;
};

export type AuthErrorResponse = {
  error: string;
};

// --- Login ---

export type LoginInput = {
  tenantId: string;
  email: string;
  password: string;
};

// --- Tenant Signup (creates tenant + owner user + default workspace + session) ---

export type TenantSignupInput = {
  tenantName: string;
  name: string;
  email: string;
  password: string;
  defaultWorkspaceName?: string; // optional
};

// --- User Signup (creates user within tenant + session) ---
export type UserSignupInput = {
  tenantId?: string;
  name: string;
  email: string;
  password: string;

  // optional: if you want to enroll them into a workspace at signup time
  workspaceId?: string | null;
};
