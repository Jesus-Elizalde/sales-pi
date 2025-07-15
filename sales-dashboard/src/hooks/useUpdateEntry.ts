// hooks/useUpdateEntry.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InventoryEntry } from '@/types/inventory';

export function useUpdateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: InventoryEntry) => {
      const res = await fetch('/api/inventory/' + entry.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json() as Promise<InventoryEntry>;
    },
    onSuccess: () => {
      // invalidate every inventory query → background refetch
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
