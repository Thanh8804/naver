import { useState } from "react";
import OptionIcon from "../icons/OptionIcon";
import EditIcon from "../icons/EditIcon";
import TrashIcon from "../icons/TrashIcon";
import type { Board } from "../types";
import BoardFormModal from "./BoardFormModal"; // Thêm import này nếu chưa có

interface Props {
  board: Board;
  deleteBoard: (id: string) => Promise<void>;
  setEditMode: (editMode: boolean) => void;
  updateBoard?: (id: string, data: { title: string; order: number }) => Promise<void>; // Thêm prop này
}

function BoardOptionsIcon({ board, deleteBoard, setEditMode, updateBoard }: Props) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false); // Thêm state để kiểm soát modal

  return (
    <>
      <div className="relative">
        <button
          className="text-white hover:bg-white/10 p-1 rounded"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <OptionIcon />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-[#2B2B39] z-10 border border-[#3A3A48]">
            <div className="py-1">
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white hover:bg-[#3A3A48]"
                onClick={() => {
                  setShowDropdown(false);
                  setShowBoardModal(true); // Mở modal edit board
                }}
              >
                <EditIcon /> Edit Board
              </button>
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-[#3A3A48]"
                onClick={() => {
                  setShowDropdown(false);
                  if (confirm("Are you sure you want to delete this board?")) {
                    deleteBoard(board.id);
                  }
                }}
              >
                <TrashIcon /> Delete Board
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add BoardFormModal for editing the board */}
      <BoardFormModal
        isOpen={showBoardModal}
        onClose={() => setShowBoardModal(false)}
        onSubmit={async (data) => {
          if (updateBoard) { // Kiểm tra updateBoard có tồn tại không
            await updateBoard(board.id, {
              title: data.title || board.title,
              order: board.order,
              ...(data.color && { color: data.color })
            });
            setShowBoardModal(false);
          } else {
            console.error("updateBoard function is not provided");
          }
        }}
        defaultValues={{
          title: board.title,
          color: board.color,
        }}
      />
    </>
  );
}

export default BoardOptionsIcon;