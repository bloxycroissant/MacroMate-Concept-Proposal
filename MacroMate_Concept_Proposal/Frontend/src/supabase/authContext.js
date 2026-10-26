import { createContext, useContext } from 'react';
export const AuthContext = createContext({ user: null, loading: false, recovery: false });
export const useAuth = () => useContext(AuthContext);
