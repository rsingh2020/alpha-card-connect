import { useEffect, useCallback, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE_LOGOUT = 60 * 1000; // 1 minute warning

export function useInactivityLogout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimeouts = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const handleLogout = useCallback(async () => {
    clearAllTimeouts();
    setShowWarning(false);
    await signOut();
    navigate('/auth');
  }, [signOut, navigate, clearAllTimeouts]);

  const startCountdown = useCallback(() => {
    setSecondsRemaining(60);
    countdownRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const resetTimer = useCallback(() => {
    clearAllTimeouts();
    setShowWarning(false);
    setSecondsRemaining(60);

    if (!user) return;

    // Set warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
      
      // Set final logout timeout
      timeoutRef.current = setTimeout(() => {
        handleLogout();
      }, WARNING_BEFORE_LOGOUT);
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE_LOGOUT);
  }, [user, clearAllTimeouts, handleLogout, startCountdown]);

  const stayLoggedIn = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!user) {
      clearAllTimeouts();
      return;
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (!showWarning) {
        resetTimer();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearAllTimeouts();
    };
  }, [user, showWarning, resetTimer, clearAllTimeouts]);

  return {
    showWarning,
    secondsRemaining,
    stayLoggedIn,
    logout: handleLogout,
  };
}
