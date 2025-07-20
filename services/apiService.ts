import type { Task, User } from '../types';

// API client for the backend server
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://prepstech-task-manager.onrender.com';
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

  const headers = new Headers(options.headers);
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

    // If the response is not OK, we expect a JSON error body from the backend.
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (jsonError) {
        // If the body isn't valid JSON, create a standard error object.
        throw new Error(`Request failed with status: ${response.status}. Could not parse error response.`);
      }
      // Throw an error with the message from the backend, or a fallback.
      throw new Error(errorData?.error?.message || `An API error occurred with status: ${response.status}`);
    }

    // Handle 'No Content' responses.
    if (response.status === 204) {
      return null;
    }

    // If the response is OK, return the JSON body.
    return response.json();

  } catch (error) {
    // Re-throw the specific error we created above, or handle network errors.
    if (error instanceof Error) {
        // If it's a TypeError, it's likely a network failure.
        if (error.name === 'TypeError') {
            throw new Error('Network error: Unable to connect to the server.');
        }
        // Otherwise, it's an API error we've already processed.
        throw error;
    }
    // Catch any other unexpected errors.
    throw new Error('An unexpected error occurred.');
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
  extras: {
    priority?: string;
    dueDate?: string;
    tags?: string[];
    [key: string]: any;
  } = {}
): Promise<Task> => {
  return await apiFetch('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, description, status, extras }),
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