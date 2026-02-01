export const INPUT_BAR_IN_SIGNUP = [
  {
    ID: 'id',
    HINT_TEXT: '아이디',
    TYPE: 'text',
    PLACEHOLDER: '아이디를 입력해주세요',
  },
  {
    ID: 'password',
    HINT_TEXT: '비밀번호',
    TYPE: 'password',
    PLACEHOLDER: '영문 숫자 조합 8자 이상으로 설정해주세요',
  },
  {
    ID: 'passwordCheck',
    HINT_TEXT: '비밀번호 확인',
    TYPE: 'password',
    PLACEHOLDER: '설정하신 비밀번호를 입력해주세요',
  },
  {
    ID: 'nickname',
    HINT_TEXT: '사용자 이름',
    TYPE: 'text',
    PLACEHOLDER: '네러틱스에서 사용하고 싶은 이름을 설정해주세요',
  },
] as const;

export const SUB_TITLE = '회원가입' as const;
