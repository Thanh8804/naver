import React, { useState, useEffect } from 'react';
import type { Card, Board } from '../types';
// Import CardFormModal để sử dụng cho chức năng edit
import CardFormModal from '../components/CardFormModal';

interface TaskListViewProps {
  cards: Card[];
  boards: Board[];
  onUpdateCard: (id: string, data: Partial<Card>) => Promise<void>;
  onDeleteCard: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  loading: boolean;
}

type GroupedCards = {
  [boardId: string]: Card[];
};

const TaskListView: React.FC<TaskListViewProps> = ({ 
  cards, 
  boards, 
  onUpdateCard, 
  onDeleteCard, 
  refreshData,
  loading
}) => {
  const [sortField, setSortField] = useState<keyof Card>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({});
  // Thêm state cho modal edit và card đang được edit
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  // Setup expanded state for boards
  useEffect(() => {
    if (boards.length > 0) {
      const initialExpandedState = boards.reduce((acc, board) => {
        acc[board.id] = true;
        return acc;
      }, {} as {[key: string]: boolean});
      
      setExpandedGroups(prev => ({
        ...prev,
        ...initialExpandedState
      }));
    }
  }, [boards]);

  const handleSort = (field: keyof Card) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Group cards by board - with unassigned handling fix
  const groupCardsByBoard = (): GroupedCards => {
    const groups: GroupedCards = {};
    
    // Initialize with all boards
    boards.forEach(board => {
      groups[board.id] = [];
    });
    
    // Check if we have any unassigned cards
    const unassignedCards = cards.filter(card => !card.boardId);
    if (unassignedCards.length > 0) {
      groups['Unassigned'] = [];
    }
    
    // Distribute cards
    cards.forEach(card => {
      const boardId = card.boardId || 'Unassigned';
      if (groups[boardId]) {
        groups[boardId].push(card);
      } else {
        groups[boardId] = [card];
      }
    });
    
    return groups;
  };

  const groupedCards = groupCardsByBoard();
  
  const toggleGroup = (boardId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [boardId]: !prev[boardId]
    }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleCompleteTask = async (card: Card) => {
    try {
      await onUpdateCard(card.id, { isCompleted: !card.isCompleted });
    } catch (error) {
      console.error('Error updating card status:', error);
    }
  };
  
  // Thêm handler cho nút Edit
  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setEditModalOpen(true);
  };

  // Handle update từ modal
  const handleUpdateCardFromModal = async (updatedData: Partial<Card>) => {
    if (editingCard) {
      try {
        await onUpdateCard(editingCard.id, updatedData);
        setEditModalOpen(false);
        setEditingCard(null);
      } catch (error) {
        console.error('Error updating card:', error);
      }
    }
  };
  
  // Get board name and color
  const getBoardName = (boardId: string): string => {
    if (boardId === 'Unassigned') return 'Unassigned';
    const board = boards.find(b => b.id === boardId);
    return board ? board.title : boardId;
  };
  
  const getBoardColor = (boardId: string): string => {
    if (boardId === 'Unassigned') return '#44CB75';
    const board = boards.find(b => b.id === boardId);
    return board?.color || '#44CB75';
  };

  if (loading) {
    return <div className="text-center p-4 text-white">Loading...</div>;
  }

  return (
    <div className="w-full overflow-auto bg-[#1F1D29] text-white">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-[#2D2B35] border-b border-gray-700">
            <th className="p-3 w-8"></th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-[#3D3B45]" 
              onClick={() => handleSort('content')}
            >
              <div className="flex items-center">
                Name {sortField === 'content' && (sortDirection === 'asc' ? '↑' : '↓')}
              </div>
            </th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-[#3D3B45]" 
              onClick={() => handleSort('dueDate')}
            >
              <div className="flex items-center">
                Due date {sortField === 'dueDate' && (sortDirection === 'asc' ? '↑' : '↓')}
              </div>
            </th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-[#3D3B45]" 
              onClick={() => handleSort('updatedAt')}
            >
              <div className="flex items-center">
                Last modified on {sortField === 'updatedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
              </div>
            </th>
            <th className="p-3 text-left">Projects</th>
            <th className="p-3 text-left">Task visibility</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedCards).map(([boardId, boardCards]) => (
            <React.Fragment key={boardId}>
              <tr className="group-header bg-[#2A2835] hover:bg-[#343240]">
                <td colSpan={7} className="px-3 py-2">
                  <button 
                    className="flex items-center w-full text-left font-medium"
                    style={{ color: getBoardColor(boardId) }}
                    onClick={() => toggleGroup(boardId)}
                  >
                    <span className="mr-2 transform transition-transform" style={{
                      display: 'inline-block',
                      transform: expandedGroups[boardId] ? 'rotate(90deg)' : 'rotate(0deg)'
                    }}>
                      ▶
                    </span>
                    {getBoardName(boardId)} ({boardCards.length})
                  </button>
                </td>
              </tr>
              {expandedGroups[boardId] && boardCards.map((card) => (
                <tr key={card.id} className={`border-b border-gray-700 hover:bg-[#2D2B35] ${card.isCompleted ? 'opacity-50' : ''}`}>
                  <td className="p-3 text-center">
                    <div 
                      onClick={() => handleCompleteTask(card)}
                      className="w-5 h-5 rounded border border-gray-500 flex items-center justify-center cursor-pointer hover:bg-gray-700"
                    >
                      {card.isCompleted && (
                        <div className="w-4 h-4 rounded-full bg-[#44CB75] flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-medium">{card.content}</td>
                  <td className="p-3">
                    {card.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(card.dueDate)}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-gray-400 text-sm">{formatDate(card.updatedAt)}</td>
                  <td className="p-3 text-gray-400">{getBoardName(card.boardId || '')}</td>
                  <td className="p-3">
                    <div className="flex items-center text-sm text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Only me
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button 
                        className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                        onClick={() => handleEditCard(card)}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-xs bg-red-900 hover:bg-red-800 text-white px-2 py-1 rounded"
                        onClick={() => onDeleteCard(card.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {expandedGroups[boardId] && boardCards.length === 0 && (
                <tr className="border-b border-gray-700">
                  <td colSpan={7} className="p-3 text-gray-400 italic text-center">
                    No cards in this board
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Thêm CardFormModal để edit card */}
      {editModalOpen && editingCard && (
        <CardFormModal
          onClose={() => {
            setEditModalOpen(false);
            setEditingCard(null);
          }}
          onSubmit={handleUpdateCardFromModal}
          initialData={{
            content: editingCard.content,
            description: editingCard.description || '',
            dueDate: editingCard.dueDate || '',
            boardId: editingCard.boardId || '',
            isCompleted: editingCard.isCompleted || false,
          }}
          boards={boards}
          isEditing={true}
        />
      )}
    </div>
  );
};

export default TaskListView;