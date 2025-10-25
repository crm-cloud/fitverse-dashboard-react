import { useEffect, useCallback, useState } from 'react';

export function useTabVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [lastFocusedAt, setLastFocusedAt] = useState<Date | null>(null);

  const handleVisibilityChange = useCallback(() => {
    const isNowVisible = !document.hidden;
    setIsVisible(isNowVisible);
    
    if (isNowVisible) {
      setLastFocusedAt(new Date());
    }
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange, false);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return { isVisible, lastFocusedAt };
}
