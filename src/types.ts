export type Id = string;

export interface Board {
  id: string;
  title: string;
  order: number;
  color?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  boardId: string;     // liên kết với Board
  content: string;     // tên habit/task, ví dụ: "Read 20 pages"
  description?: string;// chi tiết, ví dụ: "Read psychology book"
  order: number;       // vị trí trong board
  dueDate?: string;    // YYYY-MM-DD (dùng cho Calendar view)
  frequency?: string;  // "daily" | "weekly" | "monthly"
  isCompleted: boolean;
  isDeleted: boolean;
  labels: string[];    // ["health", "study"]
  createdAt: string;
  updatedAt: string;
}