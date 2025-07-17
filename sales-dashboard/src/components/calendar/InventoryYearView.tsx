import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { parseLocalDate } from "@/lib/utils";
import type { InventoryEntry } from "@/types/inventory";
import { eachMonthOfInterval, startOfYear, endOfYear, format, isSameDay } from "date-fns";


type YearViewProps = {
  currentDate: Date;
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  entries: InventoryEntry[];
  onEntryClick: (entry: InventoryEntry) => void;
};

export function InventoryYearView({ currentDate, selectedDate, onSelectDate, entries, onEntryClick }: YearViewProps) {
 const getEntryForDate = (date: Date) =>
  entries.find((entry) => isSameDay(parseLocalDate(entry.date), date));

  const months = eachMonthOfInterval({
    start: startOfYear(currentDate),
    end: endOfYear(currentDate),
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {months.map((month) => (
        <div key={month.toISOString()} className="border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2 text-center">{format(month, "MMMM")}</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onSelectDate}
            defaultMonth={month}
            className="w-full"
            showOutsideDays={false}
            required={true}
            components={{
              DayButton: ({ children, modifiers, day, ...props }) => {
                const entry = getEntryForDate(day.date);
                return (
                  // <div className="relative w-full h-full flex flex-col items-center justify-center p-1">
                  //   <span className="text-xs font-medium">{day.date.getDate()}</span>
                  //   {entry && (
                  //     <div
                  //       className="text-xs text-blue-600 font-semibold cursor-pointer hover:text-blue-800 mt-0.5"
                  //       onClick={(e) => {
                  //         e.stopPropagation();
                  //         onEntryClick(entry);
                  //       }}
                  //     >
                  //       ${entry.total.toFixed(0)}
                  //     </div>
                  //   )}
                  // </div>
                  <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                    {children}
                    {!modifiers.outside && <span> <div
                      className="text-xs text-blue-600 font-semibold cursor-pointer hover:text-blue-800 mt-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (entry) {
                          onEntryClick(entry);
                        }
                      }}
                    >
                      {entry ? `$${entry.total.toFixed(0)}` : ""}
                    </div></span>}
                  </CalendarDayButton>
                );
              },
            }}
          />
        </div>
      ))}
    </div>
  );
}