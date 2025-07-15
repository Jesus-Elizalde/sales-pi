import * as React from 'react';

import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useProduct } from '@/hooks/useProduct';
import { useCreateProduct } from '@/hooks/useProductMutations';

type Product = {
  id: number;
  name: string;
  price: number;
  attr_num?: string;
};

type Props = {
  value: Product | null;
  onChange: (p: Product) => void;
};

export default function ProductSelect({ value, onChange }: Props) {
  /* ------------------------------------------------------------ */
  /* fetch & cache products                                        */
  /* ------------------------------------------------------------ */
  const { data: products = [] } = useProduct();
  /* ------------------------------------------------------------ */
  /* local open / query state                                      */
  /* ------------------------------------------------------------ */
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [newAttr, setNewAttr] = React.useState('');
  const [newPrice, setNewPrice] = React.useState('');
  const { mutateAsync: createProduct } = useCreateProduct();

  const q = query.toLowerCase().trim();
  const filtered =
    q === ''
      ? products
      : products.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const attrMatch = (p.attr_num ?? '').toLowerCase().includes(q);
        return nameMatch || attrMatch;
      });

  /* ------------------------------------------------------------ */
  /* UI                                                            */
  /* ------------------------------------------------------------ */
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start px-2 py-1 h-8 text-sm"
        >
          {value ? (
            <>
              <span className="truncate">{value.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {value.attr_num}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">Select product…</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-[280px]">
        <Command>
          <CommandInput
            placeholder="Search product..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandEmpty>
            {query === '' ? (
              'No match.'
            ) : (
              <div className="space-y-2 p-3">
                <p className="text-sm text-muted-foreground">
                  No products called “{query}”. Create it:
                </p>

                <input
                  placeholder="Attribute #"
                  value={newAttr}
                  onChange={(e) => setNewAttr(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-xs"
                />
                <input
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-xs"
                />

                <Button
                  size="sm"
                  onClick={async () => {
                    if (!newAttr || !newPrice) return;
                    const prod = await createProduct({
                      name: query,
                      attr_num: newAttr,
                      price: Number(newPrice),
                    });
                    onChange(prod);        // auto-select
                    setOpen(false);
                    setQuery('');
                    setNewAttr('');
                    setNewPrice('');
                  }}
                  className="w-full"
                >
                  Save product & use
                </Button>
              </div>
            )}
          </CommandEmpty>
          <CommandList>
            {filtered.map((p) => (
              <CommandItem
                key={p.id}
                value={`${p.name} ${p.attr_num ?? ''}`}
                onSelect={() => {
                  onChange(p);
                  setOpen(false);
                  setQuery('');
                }}
              >
                <div className="flex flex-col text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.attr_num} · ${p.price.toFixed(2)}
                  </span>
                </div>
              </CommandItem>
            ))}

            {/* ────── always-show “Create” row ────── */}
            <CommandItem
              value={`__create__${query}`}          // unique
              disabled={!query.trim()}
              onSelect={() => { /* handled via button below */ }}
              className="!cursor-default"
            >
              <div className="w-full space-y-2">
                <p className="text-sm">
                  Create new “<span className="font-semibold">{query}</span>”
                </p>

                <input
                  placeholder="Attribute #"
                  value={newAttr}
                  onChange={(e) => setNewAttr(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-xs"
                />
                <input
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-xs"
                />

                <Button
                  size="sm"
                  disabled={!newAttr || !newPrice}
                  className="w-full mt-1"
                  onClick={async (e) => {
                    e.stopPropagation();                // keep Command intact
                    const prod = await createProduct({
                      name: query.trim(),
                      attr_num: newAttr,
                      price: Number(newPrice),
                    });
                    onChange(prod);                     // auto-select
                    setOpen(false);
                    setQuery('');
                    setNewAttr('');
                    setNewPrice('');
                  }}
                >
                  Save product & use
                </Button>
              </div>
            </CommandItem>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
