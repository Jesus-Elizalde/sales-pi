import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { InventoryItem } from '@/types/inventory';
import ProductSelect from './ProductSelect';
import AddItemForm from './AddNewItemForm';

/* ------------------------------------------------------------------ */
/* props                                                               */
/* ------------------------------------------------------------------ */
type ItemsTableProps = {
  items: InventoryItem[];
  onChange: (updatedItems: InventoryItem[]) => void; // push up when list changes
  onDelete: (id: number) => void; // push up when an item is deleted
};

export function InventoryItemsTable({ items, onChange, onDelete }: ItemsTableProps) {
  /* local editing state ------------------------------------------- */
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedItem, setEditedItem] = useState<InventoryItem | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);

  /* helpers -------------------------------------------------------- */
  const beginEdit = (idx: number, item: InventoryItem) => {
    setEditingRow(idx);
    setEditedItem({ ...item });
  };

  const saveEdit = () => {
    if (editingRow == null || editedItem == null) return;
    const next = items.map((it, i) => (i === editingRow ? editedItem : it));
    onChange(next);
    setEditingRow(null);
    setEditedItem(null);
  };

  const discardEdit = () => {
    setEditingRow(null);
    setEditedItem(null);
  };

   const handleAdd = (item: InventoryItem) => {
    onChange([...items, item]);
    setShowAddForm(false);
  };

  const handleDelete = (id: number) => {
    onDelete(id);
    setEditingRow(null);
    setEditedItem(null);
  };
  

  /* UI ------------------------------------------------------------- */
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h3 className="font-semibold">Items</h3>
        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? 'outline' : 'default'}
          className="w-full sm:w-auto"
        >
          {showAddForm ? 'Cancel' : 'Add Item'}
        </Button>
      </div>

      {/* Add-item form */}
      {showAddForm && (
        <AddItemForm onAdd={handleAdd} onCancel={() => setShowAddForm(false)} />
      )}

      {/* Data table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Attr #</TableHead>
              <TableHead className="min-w-[140px]">Product</TableHead>
              <TableHead className="w-24 text-right">Price</TableHead>
              <TableHead className="w-20 text-right">Qty</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item, idx) => {
              const isEditing = editingRow === idx;
              const working = isEditing ? editedItem ?? item : item;

              return (
                <TableRow key={idx} className="hover:bg-gray-50">
                  {/* Attr # */}
                 <TableCell>
                {/* never editable, just display */} 
                <span
                    className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded block"
                    onClick={() => beginEdit(idx, item)}
                >
                    {item.attrNumber}
                </span>
                </TableCell>

                  {/* PRODUCT with shadcn combobox */}
                  <TableCell>
                    {isEditing ? (
                      <ProductSelect
                        value={
                          working.product_id
                            ? {
                                id: working.product_id,
                                name: working.name,
                                price: working.price,
                                attr_num: working.attrNumber,
                              }
                            : null
                        }
                        onChange={(p) =>
                          setEditedItem((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  product_id: p.id,
                                  attrNumber: p.attr_num ?? '',
                                  name: p.name,
                                  price: p.price,
                                }
                              : null,
                          )
                        }
                      />
                    ) : (
                      <span
                        className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded block break-words"
                        onClick={() => beginEdit(idx, item)}
                      >
                        {item.name}
                      </span>
                    )}
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-right">
                    {/* always read-only; product combobox sets the value */}
                    <span
                        className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded block"
                        onClick={() => beginEdit(idx, item)}
                    >
                        ${working.price.toFixed(2)}
                    </span>
                    </TableCell>

                  {/* Qty */}
                  <TableCell className="text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        value={working.qty}
                        onChange={(e) =>
                          setEditedItem((p) =>
                            p ? { ...p, qty: Number(e.target.value) || 1 } : null,
                          )
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    ) : (
                      <span
                        className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded block"
                        onClick={() => beginEdit(idx, item)}
                      >
                        {working.qty}
                      </span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={saveEdit}
                          className="text-xs px-2"
                        >
                          Save
                        </Button>
                        <Button size="sm" variant="destructive"
                        onClick={() => handleDelete(item.id)}>Delete</Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={discardEdit}
                          className="text-xs px-2"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => beginEdit(idx, item)}
                        className="text-xs px-2"
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
