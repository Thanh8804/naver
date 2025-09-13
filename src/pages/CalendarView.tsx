import React, { useState, useEffect } from 'react';
import type { Card } from '../types';

interface CalendarViewProps {
  cards: Card[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ cards }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<Date[]>([]);
  
  useEffect(() => {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
    
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const days: Date[] = [];
    
    // Add days from previous month to fill calendar
    const prevMonthDays = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    ).getDate();
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          prevMonthDays - i
        )
      );
    }
    
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      );
    }
    
    // Add days from next month to fill calendar
    const remainingDays = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i)
      );
    }
    
    setDays(days);
  }, [currentDate]);
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const getCardsForDate = (date: Date) => {
    return cards.filter(card => {
      if (!card.dueDate) return false;
      const cardDate = new Date(card.dueDate);
      return (
        cardDate.getFullYear() === date.getFullYear() &&
        cardDate.getMonth() === date.getMonth() &&
        cardDate.getDate() === date.getDate()
      );
    });
  };
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  return (
    <div className="bg-[#2B2B39] text-white p-4 rounded-lg w-full">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={previousMonth}
          className="bg-gray-800 hover:bg-gray-700 p-2 rounded"
        >
          &lt; Prev
        </button>
        <h2 className="text-xl font-bold">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button 
          onClick={nextMonth}
          className="bg-gray-800 hover:bg-gray-700 p-2 rounded"
        >
          Next &gt;
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-medium text-gray-400 p-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dateCards = getCardsForDate(date);
          
          return (
            <div
              key={index}
              className={`min-h-[100px] border border-gray-700 p-2 ${
                isCurrentMonth(date)
                  ? 'bg-[#1F1D29]'
                  : 'bg-[#1A1925] text-gray-500'
              } ${isToday(date) ? 'border-blue-500 border-2' : ''}`}
            >
              <div className="text-right mb-1">
                {date.getDate()}
              </div>
              <div className="overflow-auto max-h-[80px]">
                {dateCards.map((card) => (
                  <div
                    key={card.id}
                    className={`text-xs mb-1 p-1 rounded truncate ${
                      card.isCompleted ? 'bg-gray-700' : 'bg-[#8038F0]'
                    }`}
                    title={card.content}
                  >
                    {card.content}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;