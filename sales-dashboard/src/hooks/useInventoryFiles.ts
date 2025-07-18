// src/hooks/useInventoryFiles.ts
import { useMutation } from "@tanstack/react-query";
import { api, apiBlob } from "@/libs/api";

/* ------------------------------------------------------------------ */
/* 1) Export CSV   GET /inventory/export?start=YYYY-MM-DD&end=YYYY-MM-DD */
/* ------------------------------------------------------------------ */
export async function downloadInventoryCsv(
  start: string,
  end: string
): Promise<void> {
  const blob = await apiBlob(`/inventory/export?start=${start}&end=${end}`);
  triggerDownload(blob, `inventory_${start}_${end}.csv`);
}

/* ------------------------------------------------------------------ */
/* 2) Download template   GET /inventory/import-template              */
/* ------------------------------------------------------------------ */
export async function downloadInventoryTemplate(): Promise<void> {
  const blob = await apiBlob("/inventory/import-template");
  triggerDownload(blob, "inventory_import_template.csv");
}

/* ------------------------------------------------------------------ */
/* 3a) Import via CSV  POST /inventory/import  (multipart)            */
/*      wrapped in a react-query mutation for UI feedback             */
/* ------------------------------------------------------------------ */
export function useImportInventoryCsv() {
  return useMutation((file: File) => {
    const fd = new FormData();
    fd.append("file", file);                // field-name required by Flask
    return api<{ imported_dates: string[] }>("/inventory/import", {
      method: "POST",
      body: fd
    });
  });
}

/* ------------------------------------------------------------------ */
/* 3b) Import via JSON  POST /inventory/import (raw JSON)             */
/* ------------------------------------------------------------------ */
export interface InventoryJsonBlock {
  date: string;                                   // "YYYY-MM-DD"
  items: { product_id: number; qty: number }[];
}

export function useImportInventoryJson() {
  return useMutation((blocks: InventoryJsonBlock[]) =>
    api<{ imported_dates: string[] }>("/inventory/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blocks)
    })
  );
}

/* ---------- tiny helper to trigger browser download --------------- */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = Object.assign(document.createElement("a"), {
    href: url,
    download: filename
  });
  a.click();
  URL.revokeObjectURL(url);
}
