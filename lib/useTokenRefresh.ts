'use client';

import { useEffect, useRef } from 'react';
import { getRefreshToken, silentRefresh, clearAuthToken } from './api';

const REFRESH_INTERVAL_MS = 12 * 60 * 1000; // 12 minutes

/**
 * useTokenRefresh
 *
 * Automatically silently refreshes the access token every 12 minutes
 * while the user is logged in (i.e. a refresh token exists in localStorage).
 *
 * If the refresh fails (token expired / revoked), it clears all auth
 * tokens — the 401 interceptor in apiRequest will then redirect to /login.
 *
 * Mount this hook once at the top of your authenticated layout.
 */
export function useTokenRefresh() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Only run in the browser and only if the user is logged in
    if (typeof window === 'undefined') return;
    if (!getRefreshToken()) return;

    const runRefresh = async () => {
      const success = await silentRefresh();
      if (!success) {
        console.warn('[useTokenRefresh] Silent refresh failed — clearing session.');
        clearAuthToken();
        // Redirect to login; the 401 interceptor will handle future requests
        window.location.href = '/login';
      }
    };

    // Schedule the recurring refresh every 12 minutes
    intervalRef.current = setInterval(runRefresh, REFRESH_INTERVAL_MS);

    console.log('[useTokenRefresh] Auto-refresh scheduled every 12 minutes.');

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log('[useTokenRefresh] Auto-refresh cleared.');
      }
    };
  }, []);
}
