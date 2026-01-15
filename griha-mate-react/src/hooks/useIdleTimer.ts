import { useEffect, useRef } from 'react';

/**
 * Hook to detect user idle state and trigger a callback.
 * @param onIdle Callback function to execute when user is idle.
 * @param timeout Timeout in milliseconds (default: 30 mins).
 */
export const useIdleTimer = (onIdle: () => void, timeout: number = 1800000) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset timer on any user activity
    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Only set a new timer if we are supposed to be watching
      timerRef.current = setTimeout(onIdle, timeout);
    };

    // Events to listen for
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [onIdle, timeout]);
};
