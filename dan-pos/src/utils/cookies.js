export const setToken = (token, expires) => {
  const expiresDate = new Date(expires);
  document.cookie = `authToken=${token}; expires=${expiresDate.toUTCString()}; path=/; Secure; SameSite=Strict`;
};

export const getToken = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'authToken') {
      return value;
    }
  }
  return null;
};

export const removeToken = () => {
  document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};