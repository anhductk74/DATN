import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export const useSessionSync = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      // Store tokens in localStorage when session is available
      localStorage.setItem('accessToken', session.accessToken);
      if (session.refreshToken) {
        localStorage.setItem('refreshToken', session.refreshToken);
      }
    } else if (status === 'unauthenticated') {
      // Clear tokens when session is not available
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }, [session, status]);

  return { session, status };
};