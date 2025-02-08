import { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload.user,
        token: action.payload.token,
        error: null 
      };
    case 'LOGOUT':
      return { 
        ...state, 
        user: null, 
        token: null,
        error: null 
      };
    default:
      return state;
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Function to get user data based on token
  const getUser = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${state.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      dispatch({ type: 'SET_USER', payload: { user: data.user, token: state.token } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (formData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      dispatch({ type: 'SET_USER', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      dispatch({ type: 'SET_USER', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  // Run the getUser function when the component mounts if a token exists
  useEffect(() => {
    if (state.token&& state.token != -1) {
      getUser();
    }
  }, [state.token]);

  return (
    <AuthContext.Provider value={{
      ...state,
      register,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
