from datetime import datetime

from flask import Blueprint, request, jsonify , Response
from app.extensions import db
from app.models import Inventory, InventoryEntry, Product

import io
import csv

inventory_bp = Blueprint("inventory", __name__, url_prefix="/api/inventory")

DATE_FMT = "%Y-%m-%d"


def _parse_date(value, field):
    try:
        return datetime.strptime(value, DATE_FMT).date()
    except Exception:
        return jsonify({"error": f"Invalid {field} format, expected YYYY-MM-DD"}), 400


def _inv_to_dict(inv: Inventory):
    return {
        "id": inv.id,
        "date": inv.date.strftime(DATE_FMT),
        "qty": inv.qty_amount,
        "total": round(inv.total_amount, 2),
        "items": [
            {
                "id": e.id,
                "product_id": e.product.id,
                "attrNumber": e.product.attr_num or "",
                "name": e.product.name,
                "price": round(e.product.price, 2),
                "qty": e.qty,
            }
            for e in inv.entries
        ],
    }


# -------- endpoints --------
@inventory_bp.get("")
def list_inventory():
    start = request.args.get("start")
    end = request.args.get("end")
    if not (start and end):
        return jsonify({"error": "start and end query params required"}), 400

    start_d = _parse_date(start, "start")
    end_d = _parse_date(end, "end")

    inventories = (
        Inventory.query.filter(Inventory.date >= start_d, Inventory.date <= end_d)
        .order_by(Inventory.date.asc())
        .all()
    )
    return jsonify([_inv_to_dict(i) for i in inventories]), 200


@inventory_bp.get("/<int:inv_id>")
def get_inventory(inv_id):
    inv = Inventory.query.get_or_404(inv_id)
    return jsonify(_inv_to_dict(inv)), 200


@inventory_bp.post("")
def create_inventory():
    data = request.get_json()
    if not data or "date" not in data or "items" not in data:
        return jsonify({"error": "date and items required"}), 400

    inv = Inventory(date=_parse_date(data["date"], "date"), qty_amount=0, total_amount=0)

    for item in data["items"]:
        try:
            product_id = item["product_id"]
            qty = int(item["qty"])
        except (KeyError, ValueError, TypeError):
            return jsonify({"error": "Each item needs product_id & qty"}), 400

        prod = Product.query.get(product_id)
        if not prod:
            return jsonify({"error": f"Unknown product_id {product_id}"}), 422

        entry = InventoryEntry(product_id=prod.id, qty=qty)
        inv.entries.append(entry)

        inv.qty_amount += qty
        inv.total_amount += qty * prod.price

    db.session.add(inv)
    db.session.commit()
    return jsonify(_inv_to_dict(inv)), 201


@inventory_bp.put("/<int:inv_id>")
def update_inventory(inv_id):
    inv = Inventory.query.get_or_404(inv_id)
    data = request.get_json()
    if not data or "date" not in data or "items" not in data:
        return jsonify({"error": "date and items required"}), 400

    inv.date = _parse_date(data["date"], "date")
    inv.qty_amount = 0
    inv.total_amount = 0

    InventoryEntry.query.filter_by(inventory_id=inv.id).delete()

    for item in data["items"]:
        try:
            product_id = item["product_id"]
            qty = int(item["qty"])
        except (KeyError, ValueError, TypeError):
            return jsonify({"error": "Each item needs product_id & qty"}), 400

        prod = Product.query.get(product_id)
        if not prod:
            return jsonify({"error": f"Unknown product_id {product_id}"}), 422

        entry = InventoryEntry(product_id=prod.id, qty=qty)
        inv.entries.append(entry)

        inv.qty_amount += qty
        inv.total_amount += qty * prod.price

    db.session.commit()
    return jsonify(_inv_to_dict(inv)), 200


@inventory_bp.delete("/<int:inv_id>")
def delete_inventory(inv_id):
    inv = Inventory.query.get_or_404(inv_id)
    db.session.delete(inv)
    db.session.commit()
    return jsonify({"result": "deleted"}), 204


@inventory_bp.delete("/items/<int:item_id>")
def delete_inventory_item(item_id):
    item = InventoryEntry.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"result": "deleted"}), 204


# ---------- EXPORT ----------
@inventory_bp.get("/export")
def export_inventory():
    """
    Stream a CSV file:
    date, inventory_id, item_id, product_id, attr_num, name, price, qty
    """
    start = request.args.get("start")
    end   = request.args.get("end")
    if not (start and end):
        return jsonify({"error": "start and end query params required"}), 400

    try:
        start_d = datetime.strptime(start, DATE_FMT).date()
        end_d   = datetime.strptime(end,   DATE_FMT).date()
    except Exception:
        return jsonify({"error": "Invalid date format, use YYYY-MM-DD"}), 400

    # generator yields rows → streamed response (doesn't load everything in RAM)
    def generate():
        OUT = io.StringIO()
        writer = csv.writer(OUT)
        writer.writerow(["date", "inventory_id", "item_id",
                         "product_id", "attr_num", "name",
                         "price", "qty"])
        yield OUT.getvalue(); OUT.seek(0); OUT.truncate(0)

        q = (
            Inventory.query
            .filter(Inventory.date >= start_d, Inventory.date <= end_d)
            .order_by(Inventory.date.asc())
        )
        for inv in q:
            for item in inv.entries:
                writer.writerow([
                    inv.date.strftime(DATE_FMT),
                    inv.id,
                    item.id,
                    item.product.id,
                    item.product.attr_num or "",
                    item.product.name,
                    f"{item.product.price:.2f}",
                    item.qty
                ])
                yield OUT.getvalue()
                OUT.seek(0); OUT.truncate(0)

    headers = {
        "Content-Disposition":
            f'attachment; filename="inventory_{start}_{end}.csv"',
        "Content-Type": "text/csv"
    }
    return Response(generate(), headers=headers)

# ---------- IMPORT ----------
@inventory_bp.post("/import")
def import_inventory():
    """
    Accept multipart/form-data file upload (CSV)
    OR raw JSON payload:
    [
      { "date":"YYYY-MM-DD",
        "items":[{"product_id":1,"qty":8}, …] },
      …
    ]
    Creates or replaces inventories on matching date.
    """
    # ---- 1) CSV ----
    if "file" in request.files:
        f = request.files["file"]
        stream = io.StringIO(f.stream.read().decode("utf-8"))
        reader = csv.DictReader(stream)
        rows_by_date: dict[str, list[dict]] = {}
        for row in reader:
            date = row["date"]
            rows_by_date.setdefault(date, []).append(row)

        created = []
        for date, rows in rows_by_date.items():
            inv_date = datetime.strptime(date, DATE_FMT).date()
            # delete existing inventory for that date (optional rule)
            Inventory.query.filter_by(date=inv_date).delete()

            inv = Inventory(date=inv_date, qty_amount=0, total_amount=0)
            for r in rows:
                prod = Product.query.get(int(r["product_id"]))
                if not prod:
                    db.session.rollback()
                    return jsonify({"error": f"Unknown product {r['product_id']}"}), 422
                qty = int(r["qty"])
                inv_entry = InventoryEntry(product_id=prod.id, qty=qty)
                inv.entries.append(inv_entry)
                inv.qty_amount   += qty
                inv.total_amount += qty * prod.price

            db.session.add(inv)
            created.append(inv_date.strftime(DATE_FMT))

        db.session.commit()
        return jsonify({"imported_dates": created}), 201

    # ---- 2) JSON ----
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "CSV file (field name: file) or JSON body required"}), 400

    imported = []
    for block in data:
        try:
            inv_date = datetime.strptime(block["date"], DATE_FMT).date()
            items = block["items"]
        except Exception:
            return jsonify({"error": "Invalid JSON shape"}), 400

        Inventory.query.filter_by(date=inv_date).delete()

        inv = Inventory(date=inv_date, qty_amount=0, total_amount=0)
        for it in items:
            prod = Product.query.get(it["product_id"])
            if not prod:
                db.session.rollback()
                return jsonify({"error": f"Unknown product {it['product_id']}"}), 422
            qty = int(it["qty"])
            inv.entries.append(InventoryEntry(product_id=prod.id, qty=qty))
            inv.qty_amount   += qty
            inv.total_amount += qty * prod.price

        db.session.add(inv)
        imported.append(inv_date.strftime(DATE_FMT))

    db.session.commit()
    return jsonify({"imported_dates": imported}), 201

@inventory_bp.get("/import-template")
def inventory_import_template():
    """
    Download a CSV template for bulk inventory import.
    Columns:
        date, product_id, qty
    An example row is included using today's date and product_id=1.
    """
    import csv, io
    from datetime import date

    OUT = io.StringIO()
    writer = csv.writer(OUT)
    writer.writerow(["date", "product_id", "qty"])    # header row
    writer.writerow([date.today().strftime(DATE_FMT), 1, 10])  # example

    csv_data = OUT.getvalue()
    headers = {
        "Content-Disposition": 'attachment; filename="inventory_import_template.csv"',
        "Content-Type": "text/csv",
    }
    return Response(csv_data, headers=headers)
