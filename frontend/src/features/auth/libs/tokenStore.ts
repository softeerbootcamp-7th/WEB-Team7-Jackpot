let ACCESS_TOKEN: string = '';

export const getAccessToken = () => ACCESS_TOKEN;

export const setAccessToken = (token: string) => {
  ACCESS_TOKEN = token;
};

export const removeAccessToken = () => {
  ACCESS_TOKEN = '';
};
