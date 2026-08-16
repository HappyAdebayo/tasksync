const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─── Token / User Storage ────────────────────────────────────────────────────

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tasksync_token');
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('tasksync_token', token);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tasksync_refresh_token');
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('tasksync_refresh_token', token);
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('tasksync_token');
  localStorage.removeItem('tasksync_refresh_token');
  localStorage.removeItem('tasksync_user');
}

export function getStoredUser(): { name?: string; email?: string } | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('tasksync_user');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredUser(user: { name?: string; email?: string }): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('tasksync_user', JSON.stringify(user));
}

// ─── Silent Token Refresh ─────────────────────────────────────────────────────

/**
 * Calls POST /users/refresh with the stored refresh token.
 * Saves the new access + refresh tokens.
 * Returns true on success, false if the refresh token is invalid/expired.
 */
export async function silentRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/users/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.warn('[Token Refresh] Refresh token rejected by server — logging out.');
      return false;
    }

    const data = await response.json();
    if (data.access_token) {
      setAuthToken(data.access_token);
      console.log('[Token Refresh] Access token refreshed successfully.');
    }
    if (data.refresh_token) {
      setRefreshToken(data.refresh_token);
    }
    return true;
  } catch (err: any) {
    console.error('[Token Refresh] Network error during refresh:', err?.message);
    return false;
  }
}

/**
 * Force logout: clears all tokens and redirects to /login.
 */
function forceLogout(): void {
  console.warn('[Auth] Session expired. Redirecting to login...');
  clearAuthToken();
  if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
    window.location.href = '/login';
  }
}

// ─── Core API Request ────────────────────────────────────────────────────────

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const method = options.method || 'GET';

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    const errorMsg = netErr?.message || 'Network error: Unable to reach server';
    console.error(`[API Network Error] ${method} ${endpoint}:`, errorMsg);
    throw new Error(errorMsg);
  }

  // ── 401 Handling: attempt silent refresh then retry once (ignore for auth endpoints) ──
  const isAuthEndpoint =
    endpoint === '/users/login' ||
    endpoint === '/users' ||
    endpoint === '/users/refresh' ||
    endpoint.startsWith('/auth');

  if (response.status === 401 && !isRetry && !isAuthEndpoint) {
    console.warn(`[API] 401 on ${method} ${endpoint} — attempting token refresh...`);
    const refreshed = await silentRefresh();
    if (refreshed) {
      // Retry the original request with the new access token
      return apiRequest<T>(endpoint, options, true);
    } else {
      forceLogout();
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: An error occurred`;
    try {
      const errorData = await response.json();
      if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(', ');
      } else if (typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Fallback message used
    }
    console.error(`[API Error] ${method} ${endpoint} (${response.status}):`, errorMessage);
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    
    return response.json() as Promise<T>;
  }

  return {} as T;
}

// ─── Auth APIs ────────────────────────────────────────────────────────────────

export async function signupApi(data: { name: string; email: string; password: string }) {
  return apiRequest<{ id: string; name: string; email: string }>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function loginApi(data: { email: string; password: string }) {
  const res = await apiRequest<{
    access_token: string;
    refresh_token?: string;
    user?: { name: string; email: string };
  }>('/users/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (res.access_token) {
    setAuthToken(res.access_token);
    console.log('[Auth] Access token stored.');
  }
  if (res.refresh_token) {
    setRefreshToken(res.refresh_token);
    console.log('[Auth] Refresh token stored.');
  }
  if (res.user) {
    setStoredUser(res.user);
  } else {
    setStoredUser({ email: data.email, name: data.email.split('@')[0] });
  }

  return res;
}

// ─── Workspace APIs ───────────────────────────────────────────────────────────

export async function fetchWorkspacesApi() {
  return apiRequest<Array<{ id: string; name: string; boardCount?: number; userId?: string }>>('/workspaces');
}

export async function createWorkspaceApi(data: { name: string }) {
  return apiRequest<{ id: string; name: string }>('/workspaces', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteWorkspaceApi(id: string) {
  return apiRequest<{ message: string }>(`/workspaces/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchWorkspaceBoardsApi(workspaceId: string) {
  return apiRequest<Array<{ id: string; name: string; color: string; description?: string; workspaceId: string }>>(`/workspaces/${workspaceId}`);
}

// ─── Board APIs ───────────────────────────────────────────────────────────────

export async function fetchBoardsApi() {
  return apiRequest<Array<{ id: string; name: string; color: string; description?: string; workspaceId: string }>>('/boards');
}

export async function createBoardApi(data: { name: string; color: string; description?: string; workspaceId: string }) {
  return apiRequest<{ id: string; name: string; color: string; description?: string; workspaceId: string }>('/boards', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchBoardDetailsApi(boardId: string) {
  return apiRequest<Array<{ id: string; name: string; color?: string; boardId: string }>>(`/boards/${boardId}`);
}

export async function deleteBoardApi(id: string) {
  return apiRequest<{ message: string }>(`/boards/${id}`, {
    method: 'DELETE',
  });
}

// ─── Board List APIs ──────────────────────────────────────────────────────────

export async function createBoardListApi(data: { name: string; color: string; boardId: string }) {
  return apiRequest<{ id: string; name: string; color: string; boardId: string }>('/board-list', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBoardListApi(id: string, data: { name?: string }) {
  return apiRequest<{ id: string; name: string }>(`/board-list/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteBoardListApi(id: string) {
  return apiRequest<{ message: string }>(`/board-list/${id}`, {
    method: 'DELETE',
  });
}

// ─── Task APIs ────────────────────────────────────────────────────────────────

export async function createTaskApi(data: { name: string; boardListId: string; position?: number }) {
  return apiRequest<{ id: string; name: string; boardListId: string; position: number }>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTaskApi(id: string, data: { name?: string; boardListId?: string; position?: number }) {
  return apiRequest<{ id: string; name?: string; boardListId?: string; position?: number }>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTaskApi(id: string) {
  return apiRequest<{ message: string }>(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

// ─── Search API ───────────────────────────────────────────────────────────────

export async function searchApi(query: string) {
  return apiRequest<{
    boards: Array<{ id: string; name: string; color?: string; workspaceId?: string }>;
    tasks: Array<{ id: string; name: string; boardListId?: string }>;
    people: Array<{ id: string; name: string; email?: string }>;
  }>(`/search?q=${encodeURIComponent(query)}`);
}

// ─── Invitations API ──────────────────────────────────────────────────────────

export async function sendInvitationApi(data: { email: string; workspaceId: string; role?: string }) {
  return apiRequest<{ id?: string; token?: string }>('/invitations', {
    method: 'POST',
    body: JSON.stringify({
      email: data.email,
      workspaceId: data.workspaceId,
      role: data.role || 'editor',
    }),
  });
}

export async function acceptInvitationApi(token: string) {
  return apiRequest<{ message?: string }>(`/invitations/${token}/accept`, {
    method: 'POST',
  });
}

export async function declineInvitationApi(token: string) {
  return apiRequest<{ message?: string }>(`/invitations/${token}/decline`, {
    method: 'POST',
  });
}

// ─── Notifications API ────────────────────────────────────────────────────────

export async function fetchNotificationsApi() {
  const raw = await apiRequest<Array<{
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    invitation: {
      id: string;
      token: string;
      status: 'pending' | 'accepted' | 'rejected' | 'expired';
      workspaceId: string;
    } | null;
  }>>('/notifications');
  return raw;
}
