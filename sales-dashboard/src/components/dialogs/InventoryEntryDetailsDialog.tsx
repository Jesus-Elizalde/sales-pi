import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { InventoryEntry } from "@/types/inventory";
import { format } from "date-fns";

type EntryDetailsDialogProps = {
  entry: InventoryEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function InventoryEntryDetailsDialog({ entry, open, onOpenChange }: EntryDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div>
          <h2 className="text-lg font-semibold mb-2">Entry #{entry.id}</h2>
          <div className="text-sm text-gray-600 mb-4">{format(new Date(entry.date), "MMMM d, yyyy")}</div>
          <div className="mb-4">
            <div className="font-semibold">Items:</div>
            <ul className="list-disc pl-4">
              {entry.items.map((item, idx) => (
                <li key={idx}>
                  {item.qty} × {item.name} @ ${item.price.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
         
            <div>Total: <span className="font-semibold">${entry.total.toFixed(2)}</span></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
