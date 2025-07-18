import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/libs/api";
import type { InventoryEntry } from "@/types/inventory";

/* -------------------------------------------------------------- */
/* Create (POST)                                                  */
/* -------------------------------------------------------------- */
export function useCreateInventory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      date: string;
      items: { product_id: number; qty: number }[];
    }) =>
      api<InventoryEntry>("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }),

    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] })
  });
}

/* -------------------------------------------------------------- */
/* Update (PUT)                                                   */
/* -------------------------------------------------------------- */
export function useUpdateInventory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (inv: InventoryEntry) =>
      api<InventoryEntry>(`/api/inventory/${inv.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: inv.date,
          items: inv.items.map(i => ({
            product_id: Number(i.product_id),
            qty: i.qty
          }))
        })
      }),

    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] })
  });
}

/* -------------------------------------------------------------- */
/* Delete entire inventory                                        */
/* -------------------------------------------------------------- */
export function useDeleteInventory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api<never>(`/api/inventory/${id}`, { method: "DELETE" }),

    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] })
  });
}

/* -------------------------------------------------------------- */
/* Delete a single entry (item)                                   */
/* -------------------------------------------------------------- */
export function useDeleteInventoryItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: { itemId: number }) =>
      api<never>(`/api/inventory/items/${payload.itemId}`, {
        method: "DELETE"
      }),

    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] })
  });
}
