// packages/auth/src/types.ts

export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export type AuthMessageResponse = {
  message: string;
};

export type AuthErrorResponse = {
  error: string;
};
