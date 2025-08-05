import { useAuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const { token, setToken } = useAuthContext();

  const isLoggedIn = !!token;

  const logout = () => {
    setToken(null);
  };

  return { token, setToken, isLoggedIn, logout };
};

