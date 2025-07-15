import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { InventoryEntry, InventoryItem } from "@/types/entry";

type DayViewProps = {
  currentDate: Date;
  entries: InventoryEntry[];
  onUpdateEntry: (entry: InventoryEntry) => void;
};

export function DayView({ currentDate, entries, onUpdateEntry }: DayViewProps) {
  const entry = entries.find((e) => isSameDay(new Date(e.date), currentDate));
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedItem, setEditedItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<InventoryItem>({ qty: 1, name: "", price: 0 });
  const [showAddForm, setShowAddForm] = useState(false);

  if (!entry) {
    return (
      <div className="text-center text-gray-400 py-12">
        <div className="text-lg">No entry scheduled for this day</div>
        <div className="text-sm mt-2">Select a different date or create a new entry</div>
      </div>
    );
  }

  const handleEditStart = (index: number, item: InventoryItem) => {
    setEditingRow(index);
    setEditedItem({ ...item });
  };

  const handleEditSave = () => {
    if (editedItem && editingRow !== null) {
      entry.items[editingRow] = editedItem;
      recalcTotals(entry);
      onUpdateEntry({ ...entry });
      setEditingRow(null);
      setEditedItem(null);
    }
  };

  const handleEditDiscard = () => {
    setEditingRow(null);
    setEditedItem(null);
  };

  const handleAddItem = () => {
    if (newItem.name.trim() && newItem.price > 0) {
      entry.items.push({ ...newItem });
      recalcTotals(entry);
      onUpdateEntry({ ...entry });
      setNewItem({ qty: 1, name: "", price: 0 });
      setShowAddForm(false);
    }
  };

  function recalcTotals(entry: InventoryEntry) {
    const newTotal = entry.items.reduce((sum, item) => sum + item.qty * item.price, 0);
    entry.totalAmount = newTotal;
    // For demo, keep the same cash/card ratio
    const sum = entry.cashTotal + entry.cardTotal;
    const cashRatio = sum === 0 ? 0.5 : entry.cashTotal / sum;
    entry.cashTotal = Number.parseFloat((newTotal * cashRatio).toFixed(2));
    entry.cardTotal = Number.parseFloat((newTotal - entry.cashTotal).toFixed(2));
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <div className="font-semibold text-lg">{format(currentDate, "EEEE")}</div>
        <div className="text-gray-600 text-sm sm:text-base">{format(currentDate, "MMMM d, yyyy")}</div>
        <div className="mt-2 text-sm text-gray-600">Entry #{entry.id}</div>
      </div>
      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 p-3 rounded-md text-center">
          <div className="text-sm text-green-600">Cash Total</div>
          <div className="text-xl font-semibold text-green-700">${entry.cashTotal.toFixed(2)}</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-md text-center">
          <div className="text-sm text-blue-600">Card Total</div>
          <div className="text-xl font-semibold text-blue-700">${entry.cardTotal.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-md text-center">
          <div className="text-sm text-gray-600">Total Amount</div>
          <div className="text-xl font-semibold">${entry.totalAmount.toFixed(2)}</div>
        </div>
      </div>
      {/* Items Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <h3 className="font-semibold">Items</h3>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            variant={showAddForm ? "outline" : "default"}
            className="w-full sm:w-auto"
          >
            {showAddForm ? "Cancel" : "Add Item"}
          </Button>
        </div>
        {/* Add Item Form */}
        {showAddForm && (
          <div className="border-b bg-blue-50 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={newItem.qty}
                  onChange={(e) => setNewItem({ ...newItem, qty: Number.parseInt(e.target.value) || 1 })}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="Item name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: Number.parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <Button size="sm" onClick={handleAddItem} className="w-full sm:w-auto">
                Add Item
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 sm:w-20">Qty</TableHead>
                <TableHead className="min-w-[120px]">Name</TableHead>
                <TableHead className="w-20 sm:w-24 text-right">Price</TableHead>
                <TableHead className="w-20 sm:w-24 text-right">Total</TableHead>
                <TableHead className="w-20 sm:w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entry.items.map((item, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell>
                    {editingRow === index ? (
                      <input
                        type="number"
                        min="1"
                        value={editedItem?.qty || 1}
                        onChange={(e) =>
                          setEditedItem((prev) =>
                            prev ? { ...prev, qty: Number.parseInt(e.target.value) || 1 } : null
                          )
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    ) : (
                      <span
                        className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded block"
                        onClick={() => handleEditStart(index, item)}
                      >
                        {item.qty}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRow === index ? (
                      <input
                        type="text"
                        value={editedItem?.name || ""}
                        onChange={(e) =>
                          setEditedItem((prev) => (prev ? { ...prev, name: e.target.value } : null))
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    ) : (
                      <span
                        className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded block break-words"
                        onClick={() => handleEditStart(index, item)}
                      >
                        {item.name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingRow === index ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editedItem?.price || 0}
                        onChange={(e) =>
                          setEditedItem((prev) =>
                            prev ? { ...prev, price: Number.parseFloat(e.target.value) || 0 } : null
                          )
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    ) : (
                      <span
                        className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded block"
                        onClick={() => handleEditStart(index, item)}
                      >
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    $
                    {(
                      ((editingRow === index ? editedItem : item)?.qty ?? 0) *
                        (editingRow === index ? (editedItem?.price ?? 0) : item.price)
                    ).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {editingRow === index ? (
                      <div className="flex flex-col sm:flex-row gap-1">
                        <Button size="sm" variant="outline" onClick={handleEditSave} className="text-xs px-2">
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleEditDiscard} className="text-xs px-2">
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditStart(index, item)}
                        className="text-xs px-2"
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
