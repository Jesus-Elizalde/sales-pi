import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { format, startOfToday, startOfWeek, endOfWeek } from "date-fns";

type CalendarHeaderProps = {
  currentDate: Date;
  activeView: "year" | "month" | "week" | "day";
  onNavigate: (date: Date) => void;
  onViewChange: (view: "year" | "month" | "week" | "day") => void;
  onDateSelect: (date: Date) => void;
};

export default function CalendarHeader({
  currentDate,
  activeView,
  onNavigate,
  onDateSelect,
}: CalendarHeaderProps) {
  const getViewTitle = () => {
    switch (activeView) {
      case "year":
        return format(currentDate, "yyyy");
      case "month":
        return format(currentDate, "MMMM yyyy");
      case "week": {
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      }
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      default:
        return "";
    }
  };

  const navigatePrevious = () => {
    switch (activeView) {
      case "year":
        onNavigate(new Date(currentDate.getFullYear() - 1, 0, 1));
        break;
      case "month":
        onNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        break;
      case "week":
        onNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
        break;
      case "day":
        onNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (activeView) {
      case "year":
        onNavigate(new Date(currentDate.getFullYear() + 1, 0, 1));
        break;
      case "month":
        onNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        break;
      case "week":
        onNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
        break;
      case "day":
        onNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1));
        break;
    }
  };

  const jumpToToday = () => {
    onNavigate(startOfToday());
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={navigatePrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-auto">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {activeView === "year" && "Select Year"}
              {activeView === "month" && "Select Month"}
              {activeView === "week" && "Select Week"}
              {activeView === "day" && "Select Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              required={true}
              selected={currentDate}
              onSelect={onDateSelect}
              autoFocus
            />
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="sm" onClick={navigateNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={jumpToToday} className="ml-2">
          Today
        </Button>
      </div>
      <h2 className="text-base sm:text-lg font-semibold truncate">{getViewTitle()}</h2>
    </div>
  );
}
