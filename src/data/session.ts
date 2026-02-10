let authToken: string | null = null;

export const getAuthToken = () => authToken;

export const setAuthToken = (token: string) => {
  authToken = token;
};

export const clearAuthToken = () => {
  authToken = null;
};
