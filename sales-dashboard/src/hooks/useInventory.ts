import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/fetcher';
import type { InventoryEntry } from '@/types/inventory';
import type { ViewType } from '@/components/InventoryCalendar';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, format,
} from 'date-fns';

function calcRange(view: ViewType, anchor: Date): [string, string] {
  switch (view) {
    case 'year':
      return [`${anchor.getFullYear()}-01-01`, `${anchor.getFullYear()}-12-31`];
    case 'month':
      return [format(startOfMonth(anchor), 'yyyy-MM-dd'),
              format(endOfMonth(anchor),   'yyyy-MM-dd')];
    case 'week':
      return [format(startOfWeek(anchor),  'yyyy-MM-dd'),
              format(endOfWeek(anchor),    'yyyy-MM-dd')];
    case 'day':
    default: {
      const d = format(anchor, 'yyyy-MM-dd');
      return [d, d];
    }
  }
}

export function useInventory(view: ViewType, anchor: Date) {
  const [start, end] = calcRange(view, anchor);

  return useQuery({
    queryKey: ['inventory', start, end],
    queryFn: () =>
      api<InventoryEntry[]>(`/inventory?start=${start}&end=${end}`),
    // keepPreviousData: true, // Uncomment if using react-query v3 or v4
    staleTime: 60_000,   // 1-minute fresh window
  });
}
