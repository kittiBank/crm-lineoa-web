import { useEffect, useState } from 'react';

/**
 * Hook to detect if component has mounted on client side
 * Useful for avoiding hydration mismatches
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
