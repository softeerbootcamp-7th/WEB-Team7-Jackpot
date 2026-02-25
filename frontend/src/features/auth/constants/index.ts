export const AUTH_FORM = {
  // 공통 레이아웃 관련
  REQUIRED_MARK: '*',
  TITLES: {
    LOGIN: '경험을 기록하는 가장 가벼운 시작',
    SIGNUP: '회원가입',
  },

  // 입력 폼 (용도별 분리)
  INPUTS: {
    LOGIN: [
      {
        ID: 'userId',
        TYPE: 'text',
        PLACEHOLDER: '아이디를 입력해주세요',
        MAX_LENGTH: 12,
      },
      {
        ID: 'password',
        TYPE: 'password',
        PLACEHOLDER: '비밀번호를 입력해주세요',
        MAX_LENGTH: 20,
      },
    ],
    SIGNUP: [
      {
        ID: 'userId',
        LABEL: '아이디',
        TYPE: 'text',
        PLACEHOLDER: '아이디를 입력해주세요',
        MAX_LENGTH: 12,
      },
      {
        ID: 'password',
        LABEL: '비밀번호',
        TYPE: 'password',
        PLACEHOLDER: '영문 숫자 조합 8자 이상으로 설정해주세요',
        MAX_LENGTH: 20,
      },
      {
        ID: 'passwordConfirm',
        LABEL: '비밀번호 확인',
        TYPE: 'password',
        PLACEHOLDER: '설정하신 비밀번호를 입력해주세요',
        MAX_LENGTH: 20,
      },
      {
        ID: 'nickname',
        LABEL: '사용자 이름',
        TYPE: 'text',
        PLACEHOLDER: '네러틱스에서 사용하고 싶은 이름을 설정해주세요',
        MAX_LENGTH: 20,
      },
    ],
  },

  LABELS: {
    CHECK_DUPLICATE: '중복확인',
    LOGIN_ACTION: '로그인',
    SIGN_UP_ACTION: '회원가입',
  },

  FIELDS: {
    USER_ID: 'userId',
    PASSWORD: 'password',
    PASSWORD_CONFIRM: 'passwordConfirm',
    NICKNAME: 'nickname',
  },

  VALIDATION_RULES: {
    ID: { MIN: 6, MAX: 12 },
    NICKNAME: { MIN: 2, MAX: 15 },
    PASSWORD: { MIN: 8 },
  },

  COMPLETE: {
    TITLE: '회원가입이 완료되었어요!',
    SUB_TITLE_FIRST: '자기소개서 저장부터',
    SUB_TITLE_SECOND: '손쉬운 작성까지 빠르게 경험해보세요!',
    BUTTON_TEXT: '자료 업로드하러 가기',
  },
} as const;

export const AUTH_MESSAGES = {
  LOGIN: {
    SUCCESS: '로그인 되었습니다.',
    FAILURE: '로그인에 실패했습니다.',
    PENDING: '로그인 중입니다.',
    INVALID: '아이디, 비밀번호를 확인해 주세요.',
  },
  SIGNUP: {
    PENDING: '회원가입 중입니다.',
    SUCCESS_ALL: '회원가입 및 로그인이 완료되었습니다.',
    ERROR: '회원가입 또는 로그인 중 오류가 발생했습니다.',
  },
  VALIDATION: {
    ID_AVAILABLE: '사용 가능한 아이디입니다.',
    ID_DUPLICATED: '이미 사용 중인 아이디입니다.',
    ID_CHECK_REQUIRED: '아이디 중복 확인을 해주세요.',
    ID_FORMAT: `${AUTH_FORM.VALIDATION_RULES.ID.MIN}~${AUTH_FORM.VALIDATION_RULES.ID.MAX}자의 영문 소문자, 숫자만 사용 가능합니다.`,

    PW_FORMAT: `비밀번호 형식이 올바르지 않습니다. (영문, 숫자 조합 ${AUTH_FORM.VALIDATION_RULES.PASSWORD.MIN}자 이상)`,
    PW_MATCH: '비밀번호가 일치합니다.',
    PW_MISMATCH: '비밀번호가 일치하지 않습니다.',

    NICKNAME_MIN: `${AUTH_FORM.VALIDATION_RULES.NICKNAME.MIN}자 이상 입력해주세요`,
    NICKNAME_MAX: `${AUTH_FORM.VALIDATION_RULES.NICKNAME.MAX}자 이하로 입력해주세요`,
    NICKNAME_FORMAT:
      '형식이 올바르지 않습니다 (자/모음, 숫자, 특수문자, 공백 입력 불가)',
  },
  LOGOUT: {
    SUCCESS: '로그아웃 되었습니다.',
  },
} as const;

export const AUTH_API = {
  ENDPOINTS: {
    CHECK_ID: '/auth/checkid',
    SIGNUP: '/auth/join',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  STATUS_CODE: {
    UNAUTHORIZED: '401',
  },
} as const;

export const AUTH_STORAGE = {
  KEYS: {
    IS_LOGGED_IN: 'isLoggedIn',
  },
  VALUES: {
    TRUE: 'true',
  },
} as const;

export const AUTH_QUERY = {
  KEYS: {
    USERINFO: 'userInfo',
    NICKNAME: 'nickname',
  },
};
