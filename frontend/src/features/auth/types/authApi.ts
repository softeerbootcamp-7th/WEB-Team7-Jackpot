// 아이디 중복 체크용 타입 선언
export interface CheckIdRequest {
  userId: string;
}

// 회원가입용 타입 선언
export interface JoinRequest {
  userId: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
}

// 로그인용 타입 선언
export interface LoginRequest {
  userId: string;
  password: string;
}

// 응답 타입 선언
export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken?: string;
}
