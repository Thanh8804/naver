import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "../types";
import CardOptionsIcon from "./CardOptionsIcon";

interface Props {
  card: Card;
  deleteCard: (id: string) => Promise<void>;
  onEdit: (card: Card) => void;
  toggleComplete?: (id: string, isComplete: boolean) => Promise<void>;
}

function TaskCard({ card, deleteCard, onEdit, toggleComplete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(card.id) });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 9999 : "auto",
    pointerEvents: isDragging ? "none" : "auto",
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(
      "Toggling completion for card:",
      card.id,
      "Current state:",
      card.isCompleted
    );
    if (toggleComplete) {
      await toggleComplete(card.id, !card.isCompleted);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group bg-[#1F1D29] p-2.5 w-full min-h-[120px] flex flex-col justify-between space-y-1 rounded-xl shadow-sm hover:shadow-[0_0_12px_rgba(0,0,0,0.3)] transition-shadow duration-200 relative cursor-pointer`}
    >
      <div className="flex justify-between items-center">
        {/* Checkbox + Text */}
        <div className="flex items-center gap-2">
            <div 
            onClick={(e) => {
              e.stopPropagation();   // 👈 chặn dnd-kit nuốt sự kiện
              if (toggleComplete) {  // Thêm kiểm tra để tránh lỗi undefined
                toggleComplete(card.id, !card.isCompleted); // Thêm tham số thứ 2
              }
            }}
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

          <p
            className={`text-lg font-bold ${
              card.isCompleted ? "line-through text-gray-400" : "text-white"
            }`}
          >
            {card.content}
          </p>
        </div>

        {/* Options menu */}
        <CardOptionsIcon card={card} onEdit={onEdit} deleteCard={deleteCard} />
      </div>

      <div className="flex flex-col space-y-2 mt-1">
        {card.description && (
          <div
            className={`text-sm max-h-[60px] overflow-y-auto ${
              card.isCompleted ? "line-through text-gray-500" : "text-gray-300"
            }`}
          >
            <p className="line-clamp-3 break-words">{card.description}</p>
          </div>
        )}

        {card.dueDate && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{card.dueDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskCard;