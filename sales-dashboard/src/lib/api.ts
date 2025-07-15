// lib/api.ts
import type { InventoryEntry } from '@/types/inventory';

export async function fetchInventory(start: string, end: string) {
  const res = await fetch(
    `/api/inventory?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
  );
  if (!res.ok) throw new Error('Network error');
  return res.json() as Promise<InventoryEntry[]>;
}
