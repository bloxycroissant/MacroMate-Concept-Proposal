import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  return context || { user: null, recovery: false, finishRecovery: () => {} };
}