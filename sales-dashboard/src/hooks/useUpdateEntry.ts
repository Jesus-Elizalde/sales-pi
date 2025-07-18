// hooks/useUpdateEntry.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InventoryEntry } from '@/types/inventory';
import { api } from '@/libs/api';

// export function useUpdateEntry() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: async (entry: InventoryEntry) => {
//       const res = await fetch('/api/inventory/' + entry.id, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(entry),
//       });
//       if (!res.ok) throw new Error('Failed to update');
//       return res.json() as Promise<InventoryEntry>;
//     },
//     onSuccess: () => {
//       // invalidate every inventory query → background refetch
//       qc.invalidateQueries({ queryKey: ['inventory'] });
//     },
//   });
// }

export function useUpdateEntry(){
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (entry: InventoryEntry) =>
      api<InventoryEntry>(`/api/inventory/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: entry.date,
          items: entry.items.map(i => ({
            product_id: Number(i.product_id),
            qty: i.qty
          }))
        })
      }),

    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] })
  });
}

