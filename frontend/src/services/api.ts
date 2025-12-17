import axios from 'axios';
import type { Todo, LoginCredentials, RegisterCredentials } from '../types';

const API_BASE = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials: LoginCredentials) =>
    api.post<{ token: string }>('/login', credentials),
  register: (credentials: RegisterCredentials) =>
    api.post('/register', credentials),
};

export const todoAPI = {
  getTodos: (filters?: { priority?: string; status?: string; search?: string }) =>
    api.get<Todo[]>('/todos', { params: filters }),
  createTodo: (todo: Omit<Todo, 'id' | 'userId'>) =>
    api.post<Todo>('/todos', todo),
  updateTodo: (id: string, updates: Partial<Todo>) =>
    api.put<Todo>(`/todos/${id}`, updates),
  deleteTodo: (id: string) =>
    api.delete(`/todos/${id}`),
};