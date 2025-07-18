import { useQuery } from "@tanstack/react-query";
import { api } from "@/libs/api";
import type { InventoryEntry } from "@/types/inventory";
import type { ViewType } from "@/components/InventoryCalendar";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format
} from "date-fns";

/* ---------- helpers ---------- */
function calcRange(view: ViewType, anchor: Date): [string, string] {
  switch (view) {
    case "year":
      return [`${anchor.getFullYear()}-01-01`, `${anchor.getFullYear()}-12-31`];

    case "month":
      return [
        format(startOfMonth(anchor), "yyyy-MM-dd"),
        format(endOfMonth(anchor), "yyyy-MM-dd")
      ];

    case "week":
      return [
        format(startOfWeek(anchor), "yyyy-MM-dd"),
        format(endOfWeek(anchor), "yyyy-MM-dd")
      ];

    case "day":
    default: {
      const d = format(anchor, "yyyy-MM-dd");
      return [d, d];
    }
  }
}

/* ---------- hook ---------- */
export function useInventory(view: ViewType, anchor: Date) {
  const [start, end] = calcRange(view, anchor);

  return useQuery({
    queryKey: ["inventory", start, end],
    queryFn: () =>
      api<InventoryEntry[]>(`/api/inventory?start=${start}&end=${end}`),
    staleTime: 60_000 // 1-minute fresh window
  });
}
