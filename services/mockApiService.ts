import type { Task, User } from '../types';

// NOTE: This service has been refactored to be an API client for a real backend.
// It uses fetch() to make network requests to API endpoints.

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || ''; // Use environment variable or relative path
const SESSION_KEY = 'task_manager_session';

/**
 * A helper function to make authenticated API requests.
 * It automatically adds the JWT from localStorage to the Authorization header.
 * @param endpoint The API endpoint to call (e.g., '/tasks').
 * @param options The options for the fetch request.
 * @returns The JSON response from the API.
 */
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const session = localStorage.getItem(SESSION_KEY);
  const token = session ? JSON.parse(session).token : null;

  // Use the Headers object for type safety and proper handling of HeadersInit.
  const headers = new Headers(options.headers);

  // Set a default Content-Type if one isn't already present.
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Request failed with status: ${response.status}` }));
    throw new Error(errorData.message || 'An unknown API error occurred.');
  }

  if (response.status === 204) { // No Content
    return null;
  }

  return response.json();
};

/**
 * Signs up a new user.
 * @returns A User object.
 */
export const signUp = async (email: string, password: string): Promise<User> => {
  const { user, token } = await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user, token }));
  return user;
};

/**
 * Logs in a user.
 * @returns A User object.
 */
export const login = async (email: string, password: string): Promise<User> => {
  const { user, token } = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user, token }));
  return user;
};

/**
 * Logs out the current user by clearing the session from localStorage.
 */
export const logout = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

/**
 * Retrieves the current user from the local session.
 * @returns The current User object or null if not logged in.
 */
export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  return JSON.parse(session).user;
};

/**
 * Fetches all tasks for the authenticated user.
 */
export const getTasks = (): Promise<Task[]> => {
  return apiFetch('/tasks');
};

/**
 * Adds a new task for the authenticated user.
 */
export const addTask = (taskData: Omit<Task, 'id' | 'userId'>): Promise<Task> => {
  return apiFetch('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
};

/**
 * Updates an existing task.
 */
export const updateTask = (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId'>>): Promise<Task> => {
  return apiFetch(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

/**
 * Deletes a task.
 */
export const deleteTask = (taskId: string): Promise<void> => {
  return apiFetch(`/tasks/${taskId}`, {
    method: 'DELETE',
  });
};

/**
 * Fetches productivity insights from the backend.
 * The backend is expected to call the Gemini API.
 * @param tasks The list of tasks to analyze.
 * @returns A string containing the markdown-formatted insight.
 */
export const getTaskInsights = async (tasks: Task[]): Promise<string> => {
    // This function now calls the backend to get insights from Gemini
    const response = await apiFetch('/tasks/insights', {
      method: 'POST',
      body: JSON.stringify({ tasks }),
    });
    // The backend is expected to return a JSON object like { "insight": "..." }
    return response.insight;
};