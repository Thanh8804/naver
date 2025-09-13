import { useState, useEffect } from 'react';
import KanbanBoard from './pages/KanbanBoard';
import TaskListView from './pages/ListView';
import CalendarView from './pages/CalendarView';
import ViewSwitcher from './pages/ViewSwitcher';
import { fetchCards, updateCard as apiUpdateCard, deleteCard as apiDeleteCard, createCard as apiCreateCard } from './api/cardApi';
import { fetchBoards, createBoard as apiCreateBoard, deleteBoard as apiDeleteBoard, updateBoard as apiUpdateBoard } from './api/boardApi';
import type { Card, Board } from './types';
import './App.css';

function App() {
  const [view, setView] = useState<string>('board');
  const [cards, setCards] = useState<Card[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch all data
  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedCards, fetchedBoards] = await Promise.all([
        fetchCards(),
        fetchBoards()
      ]);
      setCards(fetchedCards);
      setBoards(fetchedBoards);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  // Card CRUD operations
  const handleCreateCard = async (cardData: Partial<Card>) => {
    try {
      await apiCreateCard(cardData);
      await loadData(); // Reload all data to ensure consistency
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  const handleUpdateCard = async (id: string, cardData: Partial<Card>) => {
    try {
      await apiUpdateCard(id, cardData);
      await loadData();
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      await apiDeleteCard(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  // Board CRUD operations
  const handleCreateBoard = async (boardData: Partial<Board>) => {
    try {
      await apiCreateBoard(boardData);
      await loadData();
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const handleUpdateBoard = async (id: string, boardData: Partial<Board>) => {
    try {
      // Find the existing board to fill missing required fields
      const existingBoard = boards.find(board => board.id === id);
      if (!existingBoard) {
        throw new Error('Board not found');
      }
      const updatePayload = {
        title: boardData.title ?? existingBoard.title,
        order: boardData.order ?? existingBoard.order,
        color: boardData.color ?? existingBoard.color,
      };
      await apiUpdateBoard(id, updatePayload);
      await loadData();
    } catch (error) {
      console.error('Error updating board:', error);
    }
  };

  const handleDeleteBoard = async (id: string) => {
    try {
      await apiDeleteBoard(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  // Common props for all views
  const commonProps = {
    cards,
    boards,
    onCreateCard: handleCreateCard,
    onUpdateCard: handleUpdateCard,
    onDeleteCard: handleDeleteCard,
    onCreateBoard: handleCreateBoard,
    onUpdateBoard: handleUpdateBoard,
    onDeleteBoard: handleDeleteBoard,
    refreshData: loadData,
    loading
  };

  const renderView = () => {
    switch (view) {
      case 'list':
        return <TaskListView {...commonProps} />;
      case 'calendar':
        return <CalendarView {...commonProps} />;
      case 'board':
      default:
        return <KanbanBoard {...commonProps} />;
    }
  };

  return (
    <div className="App">
      <ViewSwitcher currentView={view} onViewChange={setView} />
      {loading ? <div className="loading-indicator">Loading...</div> : renderView()}
    </div>
  );
}

export default App;