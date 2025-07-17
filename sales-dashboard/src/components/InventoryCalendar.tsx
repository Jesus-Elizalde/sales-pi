import { useEffect, useState } from "react";
import CalendarHeader from "./calendar/CalendarHeader";
import CalendarTabs from "./calendar/CalendarTabs";
import type { InventoryEntry } from "@/types/inventory";
import { InventoryYearView } from "./calendar/InventoryYearView";
import { InventoryMonthView } from "./calendar/InventoryMonthView";
import { InventoryWeekView } from "./calendar/InventoryWeekView";
import { InventoryDayView } from "./calendar/InventoryDayView";
// import mockInventory250 from "@/lib/data";
import InventoryEntryDetailsDialog from "./dialogs/InventoryEntryDetailsDialog";
import { useInventory } from "@/hooks/useInventory";
import Spinner, { ErrorBanner } from "./Spinner";
import { format } from "date-fns";
import { dateFromYMD } from "@/lib/helpers";


export type ViewType = "year" | "month" | "week" | "day";

const STORAGE_KEY = 'inv.currentDate';

const STORAGE_KEY_VIEW = 'inv.activeView';

export function InventoryCalendar() {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? dateFromYMD(raw) : new Date();      // default = today
  });

   useEffect(() => {
    localStorage.setItem(STORAGE_KEY, format(currentDate, 'yyyy-MM-dd'));
  }, [currentDate]);


  const [activeView, setActiveView] = useState<ViewType>(() => {
    const raw = localStorage.getItem(STORAGE_KEY_VIEW);
    return (raw as ViewType) || "month"; // default view is month
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VIEW, activeView);
  }, [activeView]);

  const [selectedEntry, setSelectedEntry] = useState<InventoryEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  const { data: entries = [], isLoading, error } = useInventory(activeView, currentDate);
  console.log("🚀 ~ InventoryCalendar ~ entries:", entries)

  const handleEntryClick = (entry: InventoryEntry) => {
    setSelectedEntry(entry);
    setIsDialogOpen(true);
  };

    const handleDateSelect = (d: Date | undefined) => {
    if (d) setCurrentDate(d);
  };


  // const handleUpdateEntry = (updated: InventoryEntry) => {
  //   setEntries((prev) =>
  //     prev.map((entry) => (entry.id === updated.id ? { ...updated } : entry))
  //   );
  // };

  // const handleDateSelect = (date: Date | undefined) => {
  //   if (date) {
  //     setCurrentDate(date);
  //     setSelectedDate(date);
  //   }
  // };

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

         {isLoading && <Spinner />}
         {error && <ErrorBanner message={String(error)} />}
          {!isLoading && !error && (
        <CalendarTabs
          activeView={activeView}
          onViewChange={setActiveView}
          views={{
            year: (
              <InventoryYearView
                currentDate={currentDate}
                selectedDate={currentDate}
                onSelectDate={setCurrentDate}
                entries={entries}
                onEntryClick={handleEntryClick}
              />
            ),
            month: (
              <InventoryMonthView
                currentDate={currentDate}
                selectedDate={currentDate}
                onSelectDate={setCurrentDate}
                entries={entries}
                onEntryClick={handleEntryClick}
              />
            ),
            week: (
              <InventoryWeekView
                currentDate={currentDate}
                entries={entries}
                onEntryClick={handleEntryClick}
              />
            ),
            day: (
              <InventoryDayView
                currentDate={currentDate}
                entries={entries}
                // replace local setter with mutation—see below
              />
            ),
          }}
        />
      )}
      </div>
      {selectedEntry && (
        <InventoryEntryDetailsDialog
          entry={selectedEntry}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </>
  );
}
