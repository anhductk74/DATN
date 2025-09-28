'use client';

import { useEffect } from 'react';

export default function ClearLegacyStorage() {
  useEffect(() => {
    // Clear any legacy localStorage tokens and user data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isLoggedIn'); 
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPhoto');
    }
  }, []);

  return null;
}