// yes the correct code

export const initialState = {
  token: null,
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,
  error: null
};

export const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_INIT':
      return {
        ...state,
        isLoading: true,
        isInitialized: false
      };
    case 'AUTH_READY':
      return {
        ...state,
        isLoading: false,
        isInitialized: true
      };
    case 'LOGIN_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        isInitialized: true,
        token: action.payload.token,
        user: action.payload.user,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        isInitialized: true,
        token: null,
        user: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        isInitialized: true,
        token: null,
        user: null,
        error: null
      };
    default:
      return state;
  }
};
