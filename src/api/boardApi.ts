import type { Board } from "../types";

const STORAGE_KEY = "boards";

function getBoardsFromStorage(): Board[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveBoardsToStorage(boards: Board[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
}

export async function fetchBoards(): Promise<Board[]> {
  try {
    const boards = getBoardsFromStorage();
    // chỉ lấy board chưa xóa
    return boards.filter((b) => !b.isDeleted);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return [];
  }
}

export async function createBoard(data: Partial<Board>): Promise<Board> {
  try {
    const boards = getBoardsFromStorage();
    const now = new Date().toISOString();

    const newBoard: Board = {
      id: crypto.randomUUID(), // hoặc Date.now().toString()
      title: data.title ?? "Untitled",
      order: data.order ?? boards.length,
      color: data.color ?? "#ffffff",
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };

    boards.push(newBoard);
    saveBoardsToStorage(boards);

    return newBoard;
  } catch (err) {
    console.error("Error creating board:", err);
    throw err;
  }
}

export async function updateBoard(
  id: string,
  data: { title: string; order: number; color?: string }
): Promise<Board> {
  try {
    let boards = getBoardsFromStorage();
    const index = boards.findIndex((b) => b.id === id);
    if (index === -1) throw new Error("Board not found");

    boards[index] = {
      ...boards[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    saveBoardsToStorage(boards);

    return boards[index];
  } catch (err) {
    console.error("Error updating board:", err);
    throw err;
  }
}

export async function deleteBoard(id: string): Promise<void> {
  try {
    let boards = getBoardsFromStorage();
    const index = boards.findIndex((b) => b.id === id);
    if (index === -1) throw new Error("Board not found");

    boards[index].isDeleted = true;
    boards[index].updatedAt = new Date().toISOString();

    saveBoardsToStorage(boards);
  } catch (err) {
    console.error("Error deleting board:", err);
    throw err;
  }
}
