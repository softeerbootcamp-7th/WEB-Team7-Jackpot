export interface AuthFormData {
  userId: string;
  password: string;
  passwordConfirm?: string;
  nickname?: string;
}

export type AuthInputKey = keyof AuthFormData;
