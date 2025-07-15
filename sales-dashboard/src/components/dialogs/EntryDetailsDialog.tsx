import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { InventoryEntry } from "@/types/entry";
import { format } from "date-fns";

type EntryDetailsDialogProps = {
  entry: InventoryEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EntryDetailsDialog({ entry, open, onOpenChange }: EntryDetailsDialogProps) {
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
            <div>Cash: <span className="font-semibold text-green-700">${entry.cashTotal.toFixed(2)}</span></div>
            <div>Card: <span className="font-semibold text-blue-700">${entry.cardTotal.toFixed(2)}</span></div>
            <div>Total: <span className="font-semibold">${entry.totalAmount.toFixed(2)}</span></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
