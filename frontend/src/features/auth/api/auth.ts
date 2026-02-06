import type {
  AuthResponse,
  CheckIdRequest,
  JoinRequest,
  LoginRequest,
} from '@/features/auth/types/authApi';

// 환경 변수 속의 요청 주소 불러오기
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 액세스 토큰의 인메모리 저장 방식 채택
// [윤종근] - TODO: 최종 배포 이전에 인메모리 방식으로 변경
// let ACCESS_TOKEN = '';

export const authClient = {
  // 아이디 중복확인을 위한 메서드
  checkId: async (userData: CheckIdRequest): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/checkid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const text = await response.text();

      return text ? JSON.parse(text) : ({} as AuthResponse);
    } catch (error) {
      console.error('CheckId Failed:', error);
      throw error;
    }
  },
  // 회원가입을 위한 메서드
  signUp: async (userData: JoinRequest): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const text = await response.text();

      return text ? JSON.parse(text) : ({} as AuthResponse);
    } catch (error) {
      console.error('SignUp Failed:', error);
      throw error;
    }
  },

  // 로그인을 위한 메서드
  login: async (userData: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data: AuthResponse = await response.json();

      if (data.accessToken) {
        // ACCESS_TOKEN = data.accessToken;
        localStorage.setItem('accessToken', data.accessToken);
      }

      return data;
    } catch (error) {
      console.error(`Login Failed: ${error}`);
      throw error;
    }
  },

  // 토큰 조회 메서드
  getToken: () => {
    // return ACCESS_TOKEN;
    return localStorage.getItem('accessToken');
  },
  setToken: (token: string) => {
    localStorage.setItem('accessToken', token);
  },

  // [윤종근] - TODO: 추후에 로그아웃 구현 시 엑세스 토큰 비우는 메서드 추가 필요
};
