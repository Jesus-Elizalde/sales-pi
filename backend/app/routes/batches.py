from datetime import datetime

from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Batch, Entry, Payment

batches_bp = Blueprint("batches", __name__, url_prefix="/batches")

# ---------- helpers ----------
DATE_FMT = "%Y-%m-%d"


# ---------- endpoints ----------
@batches_bp.post("")
def create_batch():
    data = request.get_json()
    try:
        batch_date = datetime.strptime(data["date"], DATE_FMT).date()
    except Exception:
        return jsonify({"error": "Invalid date format, use YYYY-MM-DD"}), 400

    batch = Batch(date=batch_date)
    db.session.add(batch)
    db.session.commit()
    return jsonify({"id": batch.id, "date": batch.date.isoformat()}), 201


@batches_bp.get("")
def list_batches():
    batches = Batch.query.order_by(Batch.date.desc()).all()
    return jsonify([{"id": b.id, "date": b.date.isoformat()} for b in batches])


@batches_bp.get("/by-date/<date>")
def get_batch_by_date(date):
    try:
        batch_date = datetime.strptime(date, DATE_FMT).date()
    except Exception:
        return jsonify({"error": "Invalid date format, use YYYY-MM-DD"}), 400

    batch = Batch.query.filter_by(date=batch_date).first()
    if not batch:
        return jsonify({"error": "No batch found for this date"}), 404

    entries_out = []
    for e in batch.entries:
        entries_out.append(
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

    return jsonify(
        {
            "id": batch.id,
            "date": batch.date.isoformat(),
            "card_amount": batch.card_amount,
            "cash_amount": batch.cash_amount,
            "total_amount": batch.total_amount,
            "entries": entries_out,
        }
    )


@batches_bp.route("/<int:batch_id>", methods=["PUT", "PATCH"])
def update_batch(batch_id):
    batch = Batch.query.get_or_404(batch_id)
    data = request.get_json()

    if "date" in data:
        try:
            batch.date = datetime.strptime(data["date"], DATE_FMT).date()
        except Exception:
            return jsonify({"error": "Invalid date format, use YYYY-MM-DD"}), 400
    if "card_amount" in data:
        batch.card_amount = data["card_amount"]
    if "cash_amount" in data:
        batch.cash_amount = data["cash_amount"]
    if "total_amount" in data:
        batch.total_amount = data["total_amount"]

    db.session.commit()
    return jsonify({"id": batch.id, "date": batch.date.isoformat()})


@batches_bp.delete("/<int:batch_id>")
def delete_batch(batch_id):
    batch = Batch.query.get_or_404(batch_id)
    db.session.delete(batch)
    db.session.commit()
    return jsonify({"result": "deleted"})