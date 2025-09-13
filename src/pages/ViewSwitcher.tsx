import type { FC } from 'react';

interface ViewSwitcherProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const ViewSwitcher: FC<ViewSwitcherProps> = ({ currentView, onViewChange }) => {
  const views = [
    { id: 'list', label: 'List' },
    { id: 'board', label: 'Board' },
    { id: 'calendar', label: 'Calendar' },
  ];

  return (
    <div className="flex border-b border-gray-600">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`px-4 py-2 text-sm font-medium ${
            currentView === view.id 
              ? 'text-white border-b-2 border-[#8038F0]' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
};

export default ViewSwitcher;