import type { InventoryEntry } from "@/types/inventory";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";

type MonthViewProps = {
  currentDate: Date;
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  entries: InventoryEntry[];
  onEntryClick: (entry: InventoryEntry) => void;
};

export function InventoryMonthView({ currentDate, selectedDate, onSelectDate, entries, onEntryClick }: MonthViewProps) {
  const getEntryForDate = (date: Date) =>
    entries.find((entry) => isSameDay(new Date(entry.date), date));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-7 border-b">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <div
            key={day + index}
            className="p-2 sm:p-3 text-center font-semibold text-xs sm:text-sm border-r last:border-r-0"
          >
            <span className="hidden sm:inline">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index]}</span>
            <span className="sm:hidden">{day}</span>
          </div>
        ))}
      </div>
      {/* Days Grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const entry = getEntryForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border-r border-b last:border-r-0 cursor-pointer hover:bg-gray-50 ${
                !isCurrentMonth ? "text-gray-400 bg-gray-50" : ""
              } ${isToday ? "bg-blue-50" : ""} ${isSelected ? "bg-blue-100" : ""}`}
              onClick={() => onSelectDate(day)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs sm:text-sm font-medium ${isToday ? "font-bold text-blue-600" : ""}`}>
                  {day.getDate()}
                </span>
              </div>
              {entry && (
                <div
                  className="space-y-1 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEntryClick(entry);
                  }}
                >
                  <div className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded">
                    <div className="hidden sm:block">Entry #{entry.id}</div>
                    <div className="sm:hidden">#{entry.id}</div>
                  </div>
                  <div className="text-xs space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">{entry.items.length}</span>
                    </div>
                   
                    <div className="flex justify-between border-t pt-0.5">
                      <span className="font-semibold">Total:</span>
                      <span className="font-semibold">${entry.total.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}