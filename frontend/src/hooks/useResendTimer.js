import { useState, useEffect } from 'react';

export default function useResendTimer(key = 'passwordResetTimer', initialSeconds = 60) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    // On mount, check if there's a stored expiry time
    const storedExpiry = localStorage.getItem(key);
    if (storedExpiry) {
      const remaining = Math.floor((parseInt(storedExpiry, 10) - Date.now()) / 1000);
      if (remaining > 0) {
        setSecondsLeft(remaining);
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [key]);

  useEffect(() => {
    let interval = null;
    if (secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            localStorage.removeItem(key);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [secondsLeft, key]);

  const startTimer = () => {
    const expiry = Date.now() + initialSeconds * 1000;
    localStorage.setItem(key, expiry.toString());
    setSecondsLeft(initialSeconds);
  };

  return { secondsLeft, startTimer, isTimerActive: secondsLeft > 0 };
}
