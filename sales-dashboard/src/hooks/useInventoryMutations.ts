import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/fetcher';
import type { InventoryEntry } from '@/types/inventory';

export function useCreateInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      date: string;
      items: { product_id: number; qty: number }[];
    }) => api<InventoryEntry>('/inventory', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

export function useUpdateInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inv: InventoryEntry) =>
      api<InventoryEntry>(`/inventory/${inv.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          date: inv.date,
          items: inv.items.map(i => ({
            product_id: Number(i.product_id), // adapt!
            qty: i.qty,
          })),
        }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

export function useDeleteInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api<never>(`/inventory/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

export function useDeleteInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {itemId: number }) =>
      api<never>(`/items/${payload.itemId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
}
