import type { Task, User } from '../types';

// API client for the backend server
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://prepstech-task-manager.onrender.com'; // Default to production backend
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

  try {
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
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Network error: Unable to connect to server. Please check if the server is running.');
    }
    throw error;
  }
};

/**
 * Signs up a new user.
 * @param email The user's email address.
 * @param password The user's password.
 * @returns The signed-up user and authentication token.
 */
export const signUp = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Store the token in localStorage
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token: response.token, user: response.user }));

  return response;
};

/**
 * Signs in a user.
 * @param email The user's email address.
 * @param password The user's password.
 * @returns The signed-in user and authentication token.
 */
export const signIn = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Store the token in localStorage
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token: response.token, user: response.user }));

  return response;
};

/**
 * Signs out the current user.
 */
export const logout = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

/**
 * Gets the current user from the session.
 * @returns The current user or null if not authenticated.
 */
export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session).user : null;
};

/**
 * Fetches all tasks for the current user.
 * @returns An array of tasks.
 */
export const fetchTasks = async (): Promise<Task[]> => {
  return await apiFetch('/tasks');
};

/**
 * Creates a new task.
 * @param title The task title.
 * @param description The task description.
 * @param status The task status.
 * @param priority The task priority.
 * @param dueDate The task due date.
 * @param tags The task tags.
 * @param extras Additional task data.
 * @returns The created task.
 */
export const createTask = async (
  title: string,
  description: string,
  status: string,
  priority: string,
  dueDate: string | null,
  tags: string[],
  extras: Record<string, any> = {}
): Promise<Task> => {
  return await apiFetch('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, description, status, priority, dueDate, tags, extras }),
  });
};

/**
 * Updates an existing task.
 * @param id The task ID.
 * @param updates The fields to update.
 * @returns The updated task.
 */
export const updateTask = async (
  id: string,
  updates: Partial<{
    title: string;
    description: string;
    status: string;
    extras: Record<string, any>;
  }>
): Promise<Task> => {
  return await apiFetch(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

/**
 * Deletes a task.
 * @param id The task ID.
 */
export const deleteTask = async (id: string): Promise<void> => {
  await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
};

/**
 * Generates AI insights for tasks.
 * @param tasks The tasks to analyze.
 * @returns AI-generated insights.
 */
export const generateInsights = async (tasks: Task[]): Promise<string> => {
  const response = await apiFetch('/tasks/insights', {
    method: 'POST',
    body: JSON.stringify({ tasks }),
  });
  return response.insight;
};
