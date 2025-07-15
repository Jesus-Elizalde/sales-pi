/* --------------------------------------------------------------------------
 * InventoryDayView.tsx
 * --------------------------------------------------------------------------
 * Day-level calendar view that shows / edits a single InventoryEntry.
 * -------------------------------------------------------------------------- */
import { format } from 'date-fns';

import type { InventoryEntry, InventoryItem } from '@/types/inventory';
import { useDeleteInventoryItem, useUpdateInventory } from '@/hooks/useInventoryMutations';
import { AddNewInventory } from '../AddNewInventory';
import { InventoryItemsTable } from '../InventoryItemsTable';

/* ------------------------------------------------------------------ */
/* props                                                               */
/* ------------------------------------------------------------------ */
type DayViewProps = {
  currentDate: Date;
  entries: InventoryEntry[];
};

export function InventoryDayView({ currentDate, entries }: DayViewProps) {
  /* --------------------------------------------------------------- */
  /* locate the entry that matches currentDate                        */
  /* --------------------------------------------------------------- */
  // const entry = entries.find((e) => isSameDay(new Date(e.date), currentDate));
  const entry = entries[0];
  /* --------------------------------------------------------------- */
  /* TanStack Query mutation                                         */
  /* --------------------------------------------------------------- */
  const {
    mutate: updateInventory,
    isPending: isSaving,
    error: saveError,
    isSuccess: saveSuccess,
  } = useUpdateInventory();

  const { mutate: deleteItem,
    isSuccess: deleteSuccess,
  } = useDeleteInventoryItem();

  /* ------------------------------------------------------------------
   * util: recalc qty + total
   * ------------------------------------------------------------------ */
  function recalcTotals(ent: InventoryEntry): InventoryEntry {
    const qty = ent.items.reduce((n, it) => n + it.qty, 0);
    const total = ent.items.reduce((n, it) => n + it.qty * it.price, 0);
    return { ...ent, qty, total: Number(total.toFixed(2)) };
  }

  /* ------------------------------------------------------------------
   * util: submit to server
   * ------------------------------------------------------------------ */
  const pushToServer = (updated: InventoryEntry) => {
    updateInventory(updated);
  };

    const handleItemsChange = (items: InventoryItem[]) => {
    if (!entry) return;
    const updated = recalcTotals({ ...entry, items });
    pushToServer(updated);
  };

  const handleDeleteItem = (id: number) => {
    if (!entry) return;

    deleteItem({ itemId: id });
    const updatedItems = entry.items.filter((item) => item.id !== id);
    const updatedEntry = recalcTotals({ ...entry, items: updatedItems });
    pushToServer(updatedEntry);
  }

  /* ================================================================ */
  /* guard: nothing on this day                                       */
  /* ================================================================ */
  if (!entry) {
    return (
      <div className="text-center text-gray-400 py-12">
        <div className="text-lg">No entry scheduled for this day</div>
        <div className="text-sm mt-2">Select a different date or create a new entry</div>
        <AddNewInventory currentDate={currentDate} />
      </div>
    );
  }


  /* ================================================================ */
  /* UI                                                               */
  /* ================================================================ */
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ─────────────────────────────────────────── Header */}
      <div className="text-center border-b pb-4">
        <div className="font-semibold text-lg">{format(currentDate, 'EEEE')}</div>
        <div className="text-gray-600 text-sm sm:text-base">
          {format(currentDate, 'MMMM d, yyyy')}
        </div>
        <div className="mt-2 text-sm text-gray-600">Entry #{entry.id}</div>
        {isSaving && (
          <span className="ml-2 rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
            Saving…
          </span>
        )}
        {saveError && (
          <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
            Failed to save
          </span>
        )}
        {saveSuccess && (
          <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
            Saved successfully
          </span>
        )}
        {deleteSuccess && (
          <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
            Deleted successfully
          </span>
        )}
      </div>

      {/* ─────────────────────────────────────────── Financial summary */}
      <div>
        <div className="bg-gray-50 p-3 rounded-md text-center w-full">
          <div className="text-sm text-gray-600">Total Amount</div>
          <div className="text-xl font-semibold">${entry.total.toFixed(2)}</div>
        </div>
      </div>

      {/* ─────────────────────────────────────────── Items table */}
       <InventoryItemsTable items={entry.items} onChange={handleItemsChange} onDelete={handleDeleteItem} />
    </div>
  );
}
