import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ProductSelect from '@/components/ProductSelect';
import type { InventoryItem } from '@/types/inventory';

type Props = {
  onAdd: (item: InventoryItem) => void;
  onCancel: () => void;
};

export default function AddItemForm({ onAdd, onCancel }: Props) {
  /* form state */
  const [draft, setDraft] = useState<InventoryItem>({
    product_id: 0,
    attrNumber: '',
    name: '',
    price: 0,
    qty: 1,
  });

  const canSave = draft.product_id !== 0 && draft.qty > 0;

  return (
    <div className="border-b bg-blue-50 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {/* Product picker (fills id, name, price, attr) */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Product</label>
          <ProductSelect
            value={
              draft.product_id
                ? {
                  id: draft.product_id,
                  name: draft.name,
                  price: draft.price,
                  attr_num: draft.attrNumber,
                }
                : null
            }
            onChange={(p) =>
              setDraft({
                ...draft,
                product_id: p.id,
                name: p.name,
                price: p.price,
                attrNumber: p.attr_num ?? '',
              })
            }
          />
        </div>

        {/* Qty */}
        <div>
          <label className="block text-sm font-medium mb-1">Qty</label>
          <input
            type="number"
            min="1"
            value={draft.qty}
            onChange={(e) =>
              setDraft({ ...draft, qty: Number(e.target.value) || 1 })
            }
            className="w-full px-2 py-1 border rounded text-sm"
          />
        </div>

        {/* Attr # (read-only, comes from product) */}
        <div>
          <label className="block text-sm font-medium mb-1">Attr #</label>
          <input
            value={draft.attrNumber}
            disabled
            className="w-full px-2 py-1 border rounded text-sm bg-gray-100"
          />
        </div>

        {/* Price (read-only) */}
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            value={draft.price.toFixed(2)}
            disabled
            className="w-full px-2 py-1 border rounded text-sm bg-gray-100"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <Button
          size="sm"
          onClick={() => canSave && onAdd(draft)}
          className="w-full sm:w-auto"
          disabled={!canSave}
        >
          Add Item
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
