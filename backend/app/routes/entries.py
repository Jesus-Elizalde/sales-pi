from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Entry, Payment

entries_bp = Blueprint("entries", __name__, url_prefix="/api/entries")


@entries_bp.post("")
def create_entry():
    data = request.get_json()
    entry = Entry(
        batch_id=data["batch_id"],
        product_id=data["product_id"],
        qty=data["qty"],
        price=data["price"],
        discount=data.get("discount", 0),
        size=data.get("size"),
    )
    db.session.add(entry)
    db.session.commit()

    for p in data["payments"]:
        pay = Payment(entry_id=entry.id, payment_type=p["payment_type"], amount=p["amount"])
        db.session.add(pay)

    db.session.commit()
    return jsonify({"id": entry.id}), 201


@entries_bp.get("")
def list_entries():
    batch_id = request.args.get("batch_id")
    query = Entry.query
    if batch_id:
        query = query.filter_by(batch_id=batch_id)

    result = []
    for e in query.all():
        result.append(
            {
                "id": e.id,
                "batch_id": e.batch_id,
                "product_id": e.product_id,
                "product_name": e.product.name if e.product else None,
                "qty": e.qty,
                "price": e.price,
                "discount": e.discount,
                "size": e.size,
                "payments": [
                    {"id": p.id, "payment_type": p.payment_type, "amount": p.amount}
                    for p in e.payments
                ],
            }
        )
    return jsonify(result)


@entries_bp.route("/<int:entry_id>", methods=["PUT", "PATCH"])
def update_entry(entry_id):
    entry = Entry.query.get_or_404(entry_id)
    data = request.get_json()

    # ---- entry fields ----
    for fld in ("batch_id", "product_id", "qty", "price", "discount", "size"):
        if fld in data:
            setattr(entry, fld, data[fld])

    # ---- payments ----
    if "payments" in data:
        new_pays = data["payments"]
        existing = {p.id: p for p in entry.payments}
        seen_ids = set()

        for p in new_pays:
            if "id" in p and p["id"] in existing:
                pay = existing[p["id"]]
                pay.payment_type = p.get("payment_type", pay.payment_type)
                pay.amount       = p.get("amount",       pay.amount)
                seen_ids.add(pay.id)
            else:
                pay = Payment(entry_id=entry.id,
                              payment_type=p["payment_type"],
                              amount=p["amount"])
                db.session.add(pay)
                db.session.flush()
                seen_ids.add(pay.id)

        for pay in entry.payments:
            if pay.id not in seen_ids:
                db.session.delete(pay)

    db.session.commit()
    return jsonify({"id": entry.id})


@entries_bp.delete("/<int:entry_id>")
def delete_entry(entry_id):
    entry = Entry.query.get_or_404(entry_id)
    db.session.delete(entry)
    db.session.commit()
    return jsonify({"result": "deleted"})
