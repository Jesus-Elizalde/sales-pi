import { parseLocalDate } from "@/libs/utils";
import type { InventoryEntry } from "@/types/inventory";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  format,
} from "date-fns";

type WeekViewProps = {
  currentDate: Date;
  entries: InventoryEntry[];
  onEntryClick: (entry: InventoryEntry) => void;
};

export function InventoryWeekView({ currentDate, entries, onEntryClick }: WeekViewProps) {
   const getEntryForDate = (date: Date) =>
    entries.find((entry) => isSameDay(parseLocalDate(entry.date), date));

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
      {weekDays.map((day) => {
        const entry = getEntryForDate(day);
        const isToday = isSameDay(day, new Date());

        return (
          <div
            key={day.toISOString()}
            className={`border rounded-lg p-4 min-h-[150px] sm:min-h-[200px] ${
              isToday ? "border-blue-500 bg-blue-50" : "border-gray-200"
            } ${entry ? "cursor-pointer hover:shadow-md" : ""}`}
            onClick={() => entry && onEntryClick(entry)}
          >
            <div className="text-center mb-3">
              <div className="font-semibold text-sm">{format(day, "EEE")}</div>
              <div className={`text-lg ${isToday ? "text-blue-600 font-bold" : ""}`}>{day.getDate()}</div>
            </div>
            {entry ? (
              <div className="space-y-2">
                <div className="text-center">
                  <div className="text-xs text-gray-600">Entry #{entry.id}</div>
                </div>
                <div className="bg-white rounded p-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{entry.items.length}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm font-semibold border-t pt-1">
                    <span>Total:</span>
                    <span>${entry.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm mt-8">No entry</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
