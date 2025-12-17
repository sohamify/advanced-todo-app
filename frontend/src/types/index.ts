export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'in-progress' | 'completed';

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  deadline?: string; // ISO string
  tags?: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
}