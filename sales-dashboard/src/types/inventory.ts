export type InventoryItem = {
  id: number; // unique identifier for the item
  product_id: number;
  attrNumber: string;
  name: string;
  price: number;
  qty: number;
}

export type InventoryEntry = {
  id: number;
  date: string; // ISO string, e.g., "2025-01-01"
  items: InventoryItem[];
  qty: number;
  total: number;
};