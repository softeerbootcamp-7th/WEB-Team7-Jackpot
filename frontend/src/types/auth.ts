export interface AuthFormData {
  id: string;
  password: string;
  passwordCheck?: string;
  nickname?: string;
}

export type AuthInputKey = keyof AuthFormData;