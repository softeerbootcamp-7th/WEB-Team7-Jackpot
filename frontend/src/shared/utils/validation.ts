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
