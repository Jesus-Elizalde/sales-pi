export type InventoryItem = {
  qty: number;
  name: string;
  price: number;
};

export type InventoryEntry = {
  id: number;
  date: string; // ISO string, e.g., "2025-01-01"
  items: InventoryItem[];
  cashTotal: number;
  cardTotal: number;
  totalAmount: number;
};