import type { Card } from "../types";

const STORAGE_KEY = "cards";

function getCardsFromStorage(): Card[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveCardsToStorage(cards: Card[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export async function fetchCards(): Promise<Card[]> {
  try {
    const cards = getCardsFromStorage();
    return cards.filter((c) => !c.isDeleted);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return [];
  }
}

export async function createCard(data: Partial<Card>): Promise<Card> {
  try {
    const cards = getCardsFromStorage();
    const now = new Date().toISOString();

    const newCard: Card = {
      id: crypto.randomUUID(),
      boardId: data.boardId!,
      content: data.content ?? "",
      description: data.description ?? "",
      order: data.order ?? cards.length,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      isArchived: false,
      labels: data.labels ?? [],
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    cards.push(newCard);
    saveCardsToStorage(cards);

    return newCard;
  } catch (err) {
    console.error("Error creating card:", err);
    throw err;
  }
}

export async function updateCard(id: string, data: Partial<Card>): Promise<Card> {
  try {
    let cards = getCardsFromStorage();
    const index = cards.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Card not found");

    cards[index] = {
      ...cards[index],
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : cards[index].dueDate,
      updatedAt: new Date().toISOString(),
    };

    saveCardsToStorage(cards);

    return cards[index];
  } catch (err) {
    console.error("Error updating card:", err);
    throw err;
  }
}

export async function deleteCard(id: string): Promise<void> {
  try {
    let cards = getCardsFromStorage();
    const index = cards.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Card not found");

    cards[index].isDeleted = true;
    cards[index].updatedAt = new Date().toISOString();

    saveCardsToStorage(cards);
  } catch (err) {
    console.error("Error deleting card:", err);
    throw err;
  }
}
