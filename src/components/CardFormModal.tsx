import { useEffect, useState } from "react";
import type { Card, Board } from "../types";

interface Props {
  isOpen?: boolean;  // Thêm '?' để cho phép không truyền prop này
  onClose: () => void;
  onSave?: (data: Partial<Card>) => Promise<void>;  // Thêm onSave với '?'
  onSubmit?: (data: Partial<Card>) => Promise<void>; // Thêm onSubmit để tương thích
  defaultValues?: Partial<Card>;
  initialData?: Partial<Card>; // Thêm initialData để tương thích
  isEditMode?: boolean;
  isEditing?: boolean; // Thêm isEditing để tương thích
  boards?: Board[]; // Thêm boards để tương thích
}

function CardFormModal({
  isOpen = true, // Mặc định true nếu không được truyền
  onClose,
  onSave,
  onSubmit,
  defaultValues = {},
  initialData,
  isEditMode = false,
  isEditing = false,
  boards = [],
}: Props) {
  const [formData, setFormData] = useState<Partial<Card>>({
    content: "",
    description: "",
    dueDate: "",
    boardId: "", // Thêm boardId
  });

  // Xử lý tính tương thích giữa defaultValues và initialData
  const effectiveDefaultValues = initialData || defaultValues;
  
  // Sử dụng effectiveDefaultValues trong useEffect
  useEffect(() => {
    if (effectiveDefaultValues) {
      setFormData((prevData) => {
        const newData = {
          content: effectiveDefaultValues.content || "",
          description: effectiveDefaultValues.description || "",
          dueDate: effectiveDefaultValues.dueDate || "",
          boardId: effectiveDefaultValues.boardId || "",
        };

        const isSame =
          prevData.content === newData.content &&
          prevData.description === newData.description &&
          prevData.dueDate === newData.dueDate &&
          prevData.boardId === newData.boardId;

        if (!isSame) return newData;
        return prevData; 
      });
    }
  }, [
    effectiveDefaultValues?.content,
    effectiveDefaultValues?.description,
    effectiveDefaultValues?.dueDate,
    effectiveDefaultValues?.boardId,
  ]);

  const handleSubmit = async () => {
    if (!formData.content?.trim()) return;
    // Gọi onSubmit nếu được cung cấp, ngược lại gọi onSave
    if (onSubmit) {
      await onSubmit(formData);
    } else if (onSave) {
      await onSave(formData);
    }
    onClose();
    setFormData({ content: "", description: "", dueDate: "", boardId: "" });
  };

  // Dùng cả isEditMode và isEditing
  const isEdit = isEditMode || isEditing;
  
  // Bỏ điều kiện isOpen nếu không muốn sử dụng
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 flex justify-center items-center z-50">
      <div className="bg-[#2B2B39] p-6 rounded-xl shadow-lg w-[90%] max-w-md space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-left text-white mb-4">
            {isEdit ? "Edit Task" : "Add New Task"}
          </h2>
          <hr className="mt-2 border-gray-500" />
        </div>

        <div className="space-y-4">
          {/* Các trường nhập liệu hiện tại */}
          <div>
            <label className="text-sm text-gray-300">Task name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Enter task name"
              className="w-full p-2 border rounded bg-[#1F1D29] text-white mt-2"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Description (optional)</label>
            <textarea
              placeholder="Add more details..."
              className="w-full p-2 border rounded bg-[#1F1D29] text-white mt-2 min-h-[80px]"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Thêm trường chọn board */}
          {boards && boards.length > 0 && (
            <div>
              <label className="text-sm text-gray-300">Board</label>
              <select
                className="w-full p-2 border rounded bg-[#1F1D29] text-white mt-2"
                value={formData.boardId}
                onChange={(e) =>
                  setFormData({ ...formData, boardId: e.target.value })
                }
              >
                <option value="">Select a board</option>
                {boards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-300 flex items-center gap-2">
              <span>Due date (optional)</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full p-2 border rounded bg-[#1F1D29] text-white mt-2"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/4 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-10">
          <button
            className="px-4 py-2 border border-gray-500 bg-[#3A374A] rounded hover:bg-gray-400 text-white"
            onClick={() => {
              setFormData({ content: "", description: "", dueDate: "", boardId: "" });
              onClose();
            }}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 border border-gray-500 bg-[#238636] text-white rounded hover:bg-[#55B37A]"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardFormModal;