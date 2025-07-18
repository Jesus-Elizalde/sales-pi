// MonthlyPdfButton.tsx
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable, { type UserOptions } from 'jspdf-autotable';
import type { InventoryEntry } from '@/types/inventory';

// ──────────────────────────────────────────────────────────
// helpers
// ──────────────────────────────────────────────────────────
const filterByMonth = (list: InventoryEntry[], isoMonth: string) =>
    list.filter((e) => e.date.startsWith(isoMonth));

/*  Convert "2025-07"  →  "July 2025"  */
const prettyMonth = (isoMonth: string) => {
    const [y, m] = isoMonth.split('-').map(Number);
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
        new Date(y, m - 1, 1),
    );
};

/*  Convert "2025-07-14"  →  "Monday 14th 2025"  */
const prettyDay = (isoDate: string) => {
    const d = new Date(isoDate);
    const day = d.getDate();
    const suffix =
        day % 10 === 1 && day !== 11
            ? 'st'
            : day % 10 === 2 && day !== 12
                ? 'nd'
                : day % 10 === 3 && day !== 13
                    ? 'rd'
                    : 'th';

    return `${new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
    }).format(d)} ${day}${suffix} ${d.getFullYear()}`;
};

const fmtPrice = (v: number) => `$${fmtUSD(v)}`;          // "$12.34"
const fmtQty = (v: number) => `x${v}`;                  // "x3"
const fmtTotal = (v: number) => `= $${fmtUSD(v)}`;        // "= $37.02"
const fmtDiscTot = (v: number) => `-40% = $${fmtUSD(v)}`;   // "-40% = $22.21"

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

const fmtUSD = (n: number): string =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ──────────────────────────────────────────────────────────
// component
// ──────────────────────────────────────────────────────────
type Props = { entries: InventoryEntry[] };

const MonthlyPdfButton: React.FC<Props> = ({ entries }) => {
    const [month, setMonth] = useState('2025-07');
    const [busy, setBusy] = useState(false);

    const handleDownload = () => {
        setBusy(true);
        try {
            const monthEntries = filterByMonth(entries, month);
            if (!monthEntries.length) {
                alert('No data for this month.'); return;
            }

            /* ─ Grand totals for whole month ─────────────────── */
            let grand = 0;
            monthEntries.forEach(e => e.items.forEach(i => (grand += i.price * i.qty)));
            grand = round2(grand);
            const grandDiscount = round2(grand * 0.6);

            /* ─ Group by day ──────────────────────────────────── */
            const grouped: Record<string, InventoryEntry[]> = {};
            monthEntries.forEach((e) => ((grouped[e.date] ||= []).push(e)));

            const doc = new jsPDF({ orientation: 'portrait', unit: 'pt' });

            /* ─ Title & grand totals ─────────────────────────── */
            const title = `Inventory – ${prettyMonth(month)}`;
            doc.setFontSize(18);
            doc.text(title, 40, 40);

            doc.setFontSize(12);
            doc.text(`Grand total: ${fmtTotal(grand)}`, 40, 60);
            doc.text(`Grand total ${fmtDiscTot(grandDiscount)}`, 40, 76);
            let cursorY = 100;

            /* ─ Day tables ───────────────────────────────────── */
            Object.entries(grouped)
                .sort(([d1], [d2]) => (d1 < d2 ? -1 : 1))
                .forEach(([dayISO, orders]) => {
                    // header line for the day
                    doc.setFontSize(14);
                    doc.text(prettyDay(dayISO), 40, cursorY);
                    cursorY += 10;

                    // gather rows & daily totals
                    const rows: (string | number)[][] = [];
                    let dayTotal = 0;
                    orders.forEach((o) =>
                        o.items.forEach((i) => {
                            const line = i.price * i.qty;
                            dayTotal += line;
                            rows.push([
                                i.attrNumber,
                                i.name,
                                fmtPrice(i.price),              // « $ »
                                fmtQty(i.qty),                  // « x »
                                fmtTotal(round2(line)),         // « = »
                                fmtDiscTot(round2(line * 0.6)), // « -40% = »
                            ]);
                        }),
                    );

                    const footer: (string | number | { content: string; colSpan: number; styles: { halign: string } })[] = [
                        { content: 'Day total', colSpan: 4, styles: { halign: 'right' } },
                        fmtTotal(round2(dayTotal)),
                        fmtDiscTot(round2(dayTotal * 0.6)),
                    ];

                    /* table */
                    autoTable(doc, {
                        startY: cursorY + 4,
                        head: [['Attr #', 'Name', 'Price', 'Qty', 'Total', 'Total –40%']],
                        body: rows,
                        foot: [footer],
                        styles: { fontSize: 8 },
                        headStyles: { fillColor: [40, 100, 200] },
                    } as UserOptions);

                    cursorY = (doc as unknown as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
                });

            doc.save(`inventory-${prettyMonth(month)}.pdf`);
        } catch (err) {
            console.error(err);
            alert('Error generating PDF.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div style={{ fontFamily: 'sans-serif' }}>
            <label>
                Month&nbsp;
                <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                />
            </label>
            <button
                style={{ marginLeft: 12, padding: '6px 16px' }}
                onClick={handleDownload}
                disabled={busy}
            >
                {busy ? 'Working…' : 'Download PDF'}
            </button>
        </div>
    );
};

export default MonthlyPdfButton;
