import { useState } from "react";
import type { Board, Card } from "../types";
import BoardFormModal from "../components/BoardFormModal";
import CardFormModal from "../components/CardFormModal"; // Thêm import
import DragAndDropWrapper from "../components/DragAndDropWrapper";
import AddBoardButton from "../components/AddBoardButton";

import { type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

interface KanbanBoardProps {
  boards: Board[];
  cards: Card[];
  onCreateBoard: (data: Partial<Board>) => Promise<void>;
  onUpdateBoard: (id: string, data: Partial<Board>) => Promise<void>;
  onDeleteBoard: (id: string) => Promise<void>;
  onCreateCard: (data: Partial<Card>) => Promise<void>;
  onUpdateCard: (id: string, data: Partial<Card>) => Promise<void>;
  onDeleteCard: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  loading: boolean;
}

function KanbanBoard({
  boards,
  cards,
  onCreateBoard,
  onUpdateBoard,
  onDeleteBoard,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  refreshData,
  loading
}: KanbanBoardProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [projectTitle, setProjectTitle] = useState("My Tasks");
  const [isEditingProjectTitle, setIsEditingProjectTitle] = useState(false);
  
  // Thêm state cho CardFormModal - mặc định là false để không tự mở
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");

  const handleAddBoard = () => {
    setEditingBoard(null);
    setIsBoardModalOpen(true);
  };
  
  // Thêm hàm để mở modal thêm card mới khi người dùng bấm vào nút Add
  const handleAddCard = (boardId: string) => {
    setEditingCard(null);
    setSelectedBoardId(boardId);
    setIsCardModalOpen(true);
  };
  
  // Thêm hàm để mở modal sửa card CHỈ KHI người dùng bấm vào nút Edit
  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setSelectedBoardId(card.boardId || "");
    setIsCardModalOpen(true);
  };

  const handleSubmitBoard = async (data: Partial<Board>) => {
    if (editingBoard) {
      await onUpdateBoard(editingBoard.id, data);
    } else {
      await onCreateBoard({ ...data, order: boards.length + 1 });
    }
    await refreshData();
    setIsBoardModalOpen(false);
    setEditingBoard(null);
  };
  
  // Thêm hàm xử lý submit card
  const handleSubmitCard = async (data: Partial<Card>) => {
    if (editingCard) {
      await onUpdateCard(editingCard.id, data);
    } else {
      await onCreateCard({
        ...data,
        boardId: selectedBoardId,
        order: getCardsByBoard(selectedBoardId).length + 1
      });
    }
    await refreshData();
    setIsCardModalOpen(false);
    setEditingCard(null);
  };

  const getCardsByBoard = (boardId: string) =>
    cards.filter((card) => card.boardId === boardId).sort((a, b) => a.order - b.order);

  const maxCardsPerBoard = Math.max(
    ...boards.map((board) => getCardsByBoard(board.id).length),
    0
  );
  // Thêm hàm xử lý khi người dùng đánh dấu hoàn thành công việc
  const handleCompleteTask = async (id: string, isComplete: boolean) => {
    try {
      console.log("Updating card:", id, "to isCompleted:", isComplete);
      
      // Sửa thành
      await onUpdateCard(id, { isCompleted: isComplete });
      console.log("Card updated, refreshing data...");
      await refreshData();
      console.log("Data refreshed");
    } catch (error) {
      console.error('Error updating card status:', error);
    }
  };

  async function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const overId = String(event.over?.id);
    if (!overId || activeId === overId) return;

    const activeCardData = cards.find((c) => c.id === activeId);
    const overCardData = cards.find((c) => c.id === overId);
    const activeBoardData = boards.find((b) => b.id === activeId);
    const overBoardData = boards.find((b) => b.id === overId);

    // === CARD DRAG ===
    if (activeCardData) {
      const activeBoardId = activeCardData.boardId;

      if (overCardData) {
        const overBoardId = overCardData.boardId;

        if (activeBoardId === overBoardId) {
          // Same board reorder
          const boardCards = getCardsByBoard(activeBoardId);
          const oldIndex = boardCards.findIndex((c) => c.id === activeId);
          const newIndex = boardCards.findIndex((c) => c.id === overId);
          const newCards = arrayMove(boardCards, oldIndex, newIndex);

          // Update order
          for (let i = 0; i < newCards.length; i++) {
            await onUpdateCard(newCards[i].id, { order: i + 1 });
          }
        } else {
          // Move card to another board
          const overBoardCards = getCardsByBoard(overBoardId);
          const newIndex = overBoardCards.findIndex((c) => c.id === overId);

          await onUpdateCard(activeId, {
            boardId: overBoardId,
            order: newIndex + 1,
          });
        }
      } else if (overBoardData) {
        // Drop directly on a board (empty space)
        await onUpdateCard(activeId, {
          boardId: overBoardData.id,
          order: getCardsByBoard(overBoardData.id).length + 1,
        });
      }
    }

    // === BOARD DRAG ===
    else if (activeBoardData && overBoardData) {
      const oldIndex = boards.findIndex((b) => b.id === activeBoardData.id);
      const newIndex = boards.findIndex((b) => b.id === overBoardData.id);

      const newBoards = arrayMove([...boards], oldIndex, newIndex);

      for (let i = 0; i < newBoards.length; i++) {
        await onUpdateBoard(newBoards[i].id, { order: i + 1 });
      }
    }

    setActiveCard(null);
    await refreshData();
  }

  return (
    <div className="flex flex-col gap-8 w-full bg-[#1F1D29] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-6 bg-[#2B2B39] h-[110px] border-b border-[#2F2F3C] shadow-xl">
        {isEditingProjectTitle ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsEditingProjectTitle(false);
            }}
            className="flex items-center gap-2"
          >
            <input
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="bg-black border border-gray-600 rounded px-2 py-1 text-white text-2xl font-bold"
              autoFocus
            />
            <button type="submit" className="text-sm bg-blue-600 px-2 py-1 rounded text-white">
              Save
            </button>
          </form>
        ) : (
          <h1 className="text-3xl font-bold text-white">{projectTitle}</h1>
        )}
        <div className="rounded-xl p-2 font-bold bg-[#8038F0]">
          <AddBoardButton onClick={handleAddBoard} showLabel={true} className="text-md">
            Add new board
          </AddBoardButton>
        </div>
      </div>

      {/* Content */}
      <div className="px-6">
        <DragAndDropWrapper
          boards={boards}
          cards={cards}
          activeCard={activeCard}
          setActiveCard={setActiveCard}
          getCardsByBoard={getCardsByBoard}
          handleDragEnd={handleDragEnd}
          handleAddBoard={handleAddBoard}
          deleteBoard={onDeleteBoard}
          updateBoard={onUpdateBoard}
          createCard={async (boardId, card) => {
            await onCreateCard({ ...card, boardId });
            await refreshData();
          }}
          deleteCard={onDeleteCard}
          updateCard={onUpdateCard}
          fetchCards={refreshData}
          maxCards={maxCardsPerBoard}
          // Thêm các props để xử lý thêm/sửa card
          onAddCard={handleAddCard}
          onEditCard={handleEditCard}
          toggleComplete={handleCompleteTask}
        />
      </div>

      {/* Board Modal */}
      <BoardFormModal
        isOpen={isBoardModalOpen}
        onClose={() => {
          setIsBoardModalOpen(false);
          setEditingBoard(null);
        }}
        onSubmit={handleSubmitBoard}
        defaultValues={editingBoard || undefined}
      />
      
      {/* Card Modal - CHỈ hiển thị khi isCardModalOpen = true */}
      {isCardModalOpen && (
        <CardFormModal
          onClose={() => {
            setIsCardModalOpen(false);
            setEditingCard(null);
          }}
          onSubmit={handleSubmitCard}
          initialData={editingCard || {
            content: "",
            description: "",
            dueDate: "",
            boardId: selectedBoardId,
            isCompleted: false
          }}
          boards={boards}
          isEditing={!!editingCard}
        />
      )}
    </div>
  );
}

export default KanbanBoard;