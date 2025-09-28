"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface UseAutoLogoutProps {
  timeout?: number; // in milliseconds
  onLogout?: () => void;
}

export default function useAutoLogout({ timeout = 30 * 60 * 1000, onLogout }: UseAutoLogoutProps = {}) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    
    if (onLogout) {
      onLogout();
    } else {
      router.push("/login");
    }
  }, [router, onLogout]);

  const resetTimeout = useCallback(() => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Show warning 5 minutes before logout
    warningTimeoutRef.current = setTimeout(() => {
      const shouldStay = window.confirm(
        "Your session will expire in 5 minutes due to inactivity. Click OK to stay logged in."
      );
      
      if (shouldStay) {
        resetTimeout(); // Reset timer if user wants to stay
      }
    }, timeout - 5 * 60 * 1000); // 5 minutes before actual timeout

    // Set actual logout timeout
    timeoutRef.current = setTimeout(() => {
      logout();
    }, timeout);
  }, [timeout, logout]);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) return;

    // Events that should reset the timeout
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Set initial timeout
    resetTimeout();

    // Add event listeners
    const resetTimeoutHandler = () => resetTimeout();
    events.forEach(event => {
      document.addEventListener(event, resetTimeoutHandler, true);
    });

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      
      events.forEach(event => {
        document.removeEventListener(event, resetTimeoutHandler, true);
      });
    };
  }, [resetTimeout]);

  return { resetTimeout };
}