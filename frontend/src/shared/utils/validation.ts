export const validateId = (id: string) => {
  const regex = /^[a-z0-9]{6,12}$/;
  return regex.test(id);
};

export const validatePassword = (pw: string) => {
  const regex = /^(?=.*[a-z])(?=.*[0-9])[a-z0-9]{8,}$/;
  return regex.test(pw);
};

export const validateNickname = (name: string) => {
  const regex = /^[가-힣a-zA-Z]{2,15}$/;
  return regex.test(name);
};

/**
 * 검색 키워드 유효성 검사.
 * 빈 문자열은 "검색어 없음"(최신 목록 반환)으로 간주하여 valid 처리.
 * 1자 입력만 invalid로 처리.
 */
export const validateSearchKeyword = (keyword: string) => {
  if (keyword.length > 0 && keyword.length < 2) {
    return {
      isValid: false,
      message: '검색어는 2자 이상이어야 합니다.',
    };
  }
  return {
    isValid: true,
    message: null,
  };
};
