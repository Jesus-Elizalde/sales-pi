import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReactNode } from "react";

type CalendarTabsProps = {
  activeView: "year" | "month" | "week" | "day";
  onViewChange: (view: "year" | "month" | "week" | "day") => void;
  views: {
    year: ReactNode;
    month: ReactNode;
    week: ReactNode;
    day: ReactNode;
  };
};

export default function CalendarTabs({ activeView, onViewChange, views }: CalendarTabsProps) {
  return (
    <Tabs value={activeView} onValueChange={(v: string) => onViewChange(v as "year" | "month" | "week" | "day")}>
      <div className="overflow-x-auto">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="year" className="flex-1 sm:flex-none">
            Year
          </TabsTrigger>
          <TabsTrigger value="month" className="flex-1 sm:flex-none">
            Month
          </TabsTrigger>
          <TabsTrigger value="week" className="flex-1 sm:flex-none">
            Week
          </TabsTrigger>
          <TabsTrigger value="day" className="flex-1 sm:flex-none">
            Day
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="year" className="mt-4">{views.year}</TabsContent>
      <TabsContent value="month" className="mt-4">{views.month}</TabsContent>
      <TabsContent value="week" className="mt-4">{views.week}</TabsContent>
      <TabsContent value="day" className="mt-4">{views.day}</TabsContent>
    </Tabs>
  );
}
