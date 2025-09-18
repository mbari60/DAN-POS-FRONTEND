// Cookie-based token handling (server and client compatible)
export const setToken = (token, expires) => {
  if (typeof window !== 'undefined') {
    const expiresDate = new Date(expires);
    // Secure cookie with HttpOnly flag would be ideal but can't be set from client-side JS
    document.cookie = `authToken=${token}; expires=${expiresDate.toUTCString()}; path=/; Secure; SameSite=Strict`;
  }
};

export const getToken = () => {
  // For server-side, we need to handle this differently
  if (typeof window === 'undefined') {
    return null;
  }
  
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
  if (typeof window !== 'undefined') {
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
};

// Server-side token extraction for middleware
export const getTokenFromRequest = (request) => {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'authToken') {
      return value;
    }
  }
  return null;
};