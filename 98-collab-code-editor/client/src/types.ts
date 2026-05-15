export interface User {
  id: string;
  userId: string;
  username: string;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface Document {
  content: string;
  language: string;
}

export interface Room {
  id: string;
  users: User[];
  document: Document;
}