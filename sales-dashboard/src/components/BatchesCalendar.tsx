import { useState } from "react";
import { inventoryData } from "@/libs/inventory-data";
import { YearView } from "./calendar/YearView";
import { MonthView } from "./calendar/MonthView";
import { WeekView } from "./calendar/WeekView";
import { DayView } from "./calendar/DayView";
import CalendarHeader from "./calendar/CalendarHeader";
import CalendarTabs from "./calendar/CalendarTabs";
import EntryDetailsDialog from "./dialogs/EntryDetailsDialog";
import type { InventoryEntry } from "@/types/entry";


type ViewType = "year" | "month" | "week" | "day";

export function BatchesCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2025, 0, 1));
  const [activeView, setActiveView] = useState<ViewType>("month");
  const [selectedEntry, setSelectedEntry] = useState<InventoryEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [entries, setEntries] = useState<InventoryEntry[]>(inventoryData);

  const handleEntryClick = (entry: InventoryEntry) => {
    setSelectedEntry(entry);
    setIsDialogOpen(true);
  };

  const handleUpdateEntry = (updated: InventoryEntry) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === updated.id ? { ...updated } : entry))
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      setSelectedDate(date);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <CalendarHeader
          currentDate={currentDate}
          activeView={activeView}
          onNavigate={setCurrentDate}
          onViewChange={setActiveView}
          onDateSelect={handleDateSelect}
        />
        <CalendarTabs
          activeView={activeView}
          onViewChange={setActiveView}
          views={{
            year: (
              <YearView
                currentDate={currentDate}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                entries={entries}
                onEntryClick={handleEntryClick}
              />
            ),
            month: (
              <MonthView
                currentDate={currentDate}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                entries={entries}
                onEntryClick={handleEntryClick}
              />
            ),
            week: (
              <WeekView
                currentDate={currentDate}
                entries={entries}
                onEntryClick={handleEntryClick}
              />
            ),
            day: (
              <DayView
                currentDate={currentDate}
                entries={entries}
                onUpdateEntry={handleUpdateEntry}
              />
            ),
          }}
        />
      </div>
      {selectedEntry && (
        <EntryDetailsDialog
          entry={selectedEntry}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </>
  );
}
