from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate 
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sales.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
db = SQLAlchemy(app)
migrate = Migrate(app, db) 

# --- Models ---

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    price = db.Column(db.Float, nullable=False)  # Price per unit
    attr_num = db.Column(db.String(40), nullable=True)  # Optional attribute for product number

class Batch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)  # Only date, no time
    card_amount = db.Column(db.Float, default=0)
    cash_amount = db.Column(db.Float, default=0)
    total_amount = db.Column(db.Float, default=0)
    entries = db.relationship('Entry', backref='batch', cascade='all, delete-orphan')

class Entry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    batch_id = db.Column(db.Integer, db.ForeignKey('batch.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    qty = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    discount = db.Column(db.Float, default=0)
    size = db.Column(db.String(40), nullable=True)  # Added size field
    payments = db.relationship('Payment', backref='entry', cascade='all, delete-orphan')
    product = db.relationship('Product')

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    entry_id = db.Column(db.Integer, db.ForeignKey('entry.id'), nullable=False)
    payment_type = db.Column(db.String(10), nullable=False)
    amount = db.Column(db.Float, nullable=False)

class InventoryEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    inventory_id = db.Column(db.Integer, db.ForeignKey('inventory.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    qty = db.Column(db.Integer, nullable=False)
    product = db.relationship('Product')

class Inventory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)  # Only date, no time
    qty_amount = db.Column(db.Integer, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    entries = db.relationship('InventoryEntry', backref='inventory', cascade='all, delete-orphan')

# --- PRODUCT ENDPOINTS ---

@app.route('/products', methods=['POST'])
def create_product():
    """Create a new product."""
    data = request.get_json()
    name = data.get('name')
    price = data.get('price')
    attr_num = data.get('attr_num')
    if not name or price is None:
        return jsonify({'error': 'Name and price are required'}), 400
    product = Product(name=name, price=price, attr_num=attr_num)
    db.session.add(product)
    db.session.commit()
    return jsonify({'id': product.id, 'name': product.name, 'price': product.price, 'attr_num': product.attr_num}), 201

@app.route('/products', methods=['GET'])
def get_products():
    """List all products."""
    products = Product.query.all()
    return jsonify([{'id': p.id, 'name': p.name, 'price': p.price, 'attr_num': p.attr_num} for p in products])

# --- BATCH ENDPOINTS ---

@app.route('/batches', methods=['POST'])
def create_batch():
    """Create a new batch (date only)."""
    data = request.get_json()
    try:
        batch_date = datetime.strptime(data['date'], "%Y-%m-%d").date()
    except Exception:
        return jsonify({"error": "Invalid date format, use YYYY-MM-DD"}), 400
    batch = Batch(date=batch_date)
    db.session.add(batch)
    db.session.commit()
    return jsonify({"id": batch.id, "date": batch.date.isoformat()}), 201

@app.route('/batches', methods=['GET'])
def get_batches():
    """List all batches (id and date)."""
    batches = Batch.query.order_by(Batch.date.desc()).all()
    return jsonify([{"id": b.id, "date": b.date.isoformat()} for b in batches])

@app.route('/batches/by-date/<date>', methods=['GET'])
def get_batch_by_date(date):
    """
    Get a batch by date (YYYY-MM-DD) and include all its entries and payments.
    """
    try:
        batch_date = datetime.strptime(date, "%Y-%m-%d").date()
    except Exception:
        return jsonify({"error": "Invalid date format, use YYYY-MM-DD"}), 400

    batch = Batch.query.filter_by(date=batch_date).first()
    if not batch:
        return jsonify({"error": "No batch found for this date"}), 404

    entries = []
    for e in batch.entries:
        payments = [{
            'id': p.id,
            'payment_type': p.payment_type,
            'amount': p.amount
        } for p in e.payments]
        entries.append({
            'id': e.id,
            'batch_id': e.batch_id,
            'product_id': e.product_id,
            'product_name': e.product.name if e.product else None,
            'qty': e.qty,
            'price': e.price,
            'discount': e.discount,
            'size': e.size,
            'payments': payments
        })

    return jsonify({
        "id": batch.id,
        "date": batch.date.isoformat(),
        "card_amount": batch.card_amount,
        "cash_amount": batch.cash_amount,
        "total_amount": batch.total_amount,
        "entries": entries
    })

@app.route('/batches/<int:batch_id>', methods=['PUT', 'PATCH'])
def update_batch(batch_id):
    """Edit a batch (date, totals)."""
    batch = Batch.query.get_or_404(batch_id)
    data = request.get_json()
    if 'date' in data:
        try:
            batch.date = datetime.strptime(data['date'], "%Y-%m-%d").date()
        except Exception:
            return jsonify({"error": "Invalid date format, use YYYY-MM-DD"}), 400
    if 'card_amount' in data:
        batch.card_amount = data['card_amount']
    if 'cash_amount' in data:
        batch.cash_amount = data['cash_amount']
    if 'total_amount' in data:
        batch.total_amount = data['total_amount']
    db.session.commit()
    return jsonify({"id": batch.id, "date": batch.date.isoformat()})

@app.route('/batches/<int:batch_id>', methods=['DELETE'])
def delete_batch(batch_id):
    """Delete a batch (and its entries/payments)."""
    batch = Batch.query.get_or_404(batch_id)
    db.session.delete(batch)
    db.session.commit()
    return jsonify({"result": "deleted"})

# --- ENTRY ENDPOINTS ---

@app.route('/entries', methods=['POST'])
def create_entry():
    """Create a new entry for a batch, with payments."""
    data = request.get_json()
    entry = Entry(
        batch_id=data['batch_id'],
        product_id=data['product_id'],
        qty=data['qty'],
        price=data['price'],
        discount=data.get('discount', 0),
        size=data.get('size')  # Accept size if provided
    )
    db.session.add(entry)
    db.session.commit()
    for payment_data in data['payments']:
        payment = Payment(
            entry_id=entry.id,
            payment_type=payment_data['payment_type'],
            amount=payment_data['amount']
        )
        db.session.add(payment)
    db.session.commit()
    return jsonify({"id": entry.id}), 201

@app.route('/entries', methods=['GET'])
def get_entries():
    """List all entries, or filter by batch_id."""
    batch_id = request.args.get('batch_id')
    query = Entry.query
    if batch_id:
        query = query.filter_by(batch_id=batch_id)
    entries = query.all()
    result = []
    for e in entries:
        payments = [{
            'id': p.id,
            'payment_type': p.payment_type,
            'amount': p.amount
        } for p in e.payments]
        result.append({
            'id': e.id,
            'batch_id': e.batch_id,
            'product_id': e.product_id,
            'product_name': e.product.name if e.product else None,
            'qty': e.qty,
            'price': e.price,
            'discount': e.discount,
            'size': e.size,  # Include size in response
            'payments': payments
        })
    return jsonify(result)

@app.route('/entries/<int:entry_id>', methods=['PUT', 'PATCH'])
def update_entry(entry_id):
    """
    Edit an entry.
    You can also edit/add/delete its payments by providing a 'payments' array:
    - To update a payment, include its 'id'.
    - To add a payment, omit 'id'.
    - Payments not included will be deleted.
    """
    entry = Entry.query.get_or_404(entry_id)
    data = request.get_json()
    # Update entry fields
    if 'batch_id' in data:
        entry.batch_id = data['batch_id']
    if 'product_id' in data:
        entry.product_id = data['product_id']
    if 'qty' in data:
        entry.qty = data['qty']
    if 'price' in data:
        entry.price = data['price']
    if 'discount' in data:
        entry.discount = data['discount']
    if 'size' in data:
        entry.size = data['size']
    # Payments management
    if 'payments' in data:
        new_payments = data['payments']
        existing_payments = {p.id: p for p in entry.payments}
        sent_payment_ids = set()
        for p in new_payments:
            if 'id' in p and p['id'] in existing_payments:
                # Update existing payment
                payment = existing_payments[p['id']]
                payment.payment_type = p.get('payment_type', payment.payment_type)
                payment.amount = p.get('amount', payment.amount)
                sent_payment_ids.add(payment.id)
            else:
                # Add new payment
                payment = Payment(
                    entry_id=entry.id,
                    payment_type=p['payment_type'],
                    amount=p['amount']
                )
                db.session.add(payment)
                db.session.flush()
                sent_payment_ids.add(payment.id)
        # Delete payments not present in the new list
        for payment in entry.payments:
            if payment.id not in sent_payment_ids:
                db.session.delete(payment)
    db.session.commit()
    return jsonify({"id": entry.id})

@app.route('/entries/<int:entry_id>', methods=['DELETE'])
def delete_entry(entry_id):
    """Delete an entry (and its payments)."""
    entry = Entry.query.get_or_404(entry_id)
    db.session.delete(entry)
    db.session.commit()
    return jsonify({"result": "deleted"})

# --- PAYMENT ENDPOINTS (GET only, all other payment actions are via entries) ---

@app.route('/payments', methods=['GET'])
def get_payments():
    """List all payments."""
    payments = Payment.query.all()
    return jsonify([
        {
            "id": p.id,
            "entry_id": p.entry_id,
            "payment_type": p.payment_type,
            "amount": p.amount
        } for p in payments
    ])

# --- Inventory helpers ---
DATE_FMT = "%Y-%m-%d"

def parse_date(value, field):
    """Convert 'YYYY-MM-DD' -> datetime.date or abort 400."""
    try:
        return datetime.strptime(value, DATE_FMT).date()
    except Exception:
        return jsonify(400, description=f"Invalid {field} format, expected YYYY-MM-DD")

def inv_to_dict(inv: Inventory):
    """Serialize Inventory {id,date,qty_amount,total_amount,entries[]}"""
    return {
        "id":    inv.id,
        "date":  inv.date.strftime(DATE_FMT),
        "qty":   inv.qty_amount,
        "total": round(inv.total_amount, 2),
        "items": [
            {
                "id": e.id,
                "product_id": e.product.id,
                "attrNumber": e.product.attr_num or "",
                "name":       e.product.name,
                "price":      round(e.product.price, 2),
                "qty":        e.qty
            }
            for e in inv.entries
        ]
    }


# --- INVENTORY ENDPOINTS ---
# GET /inventory?start=yyyy-mm-dd&end=yyyy-mm-dd
@app.route("/inventory", methods=["GET"])
def list_inventory():
    start = request.args.get("start")
    end   = request.args.get("end")
    if not (start and end):
        return jsonify({"error": "start and end query params required"}), 400

    start_d = parse_date(start, "start")
    end_d   = parse_date(end,   "end")

    inventories = (
        Inventory.query
        .filter(Inventory.date >= start_d, Inventory.date <= end_d)
        .order_by(Inventory.date.asc())
        .all()
    )
    return jsonify([inv_to_dict(i) for i in inventories]), 200


# GET /inventory/<id>
@app.route("/inventory/<int:inv_id>", methods=["GET"])
def get_inventory(inv_id):
    inv = Inventory.query.get_or_404(inv_id)
    return jsonify(inv_to_dict(inv)), 200


# POST /inventory   { date:"YYYY-MM-DD", items:[{product_id, qty}] }
@app.route("/inventory", methods=["POST"])
def create_inventory():
    data = request.get_json()
    if not data or "date" not in data or "items" not in data:
        return jsonify({"error": "date and items required"}), 400

    inv_date = parse_date(data["date"], "date")
    inv = Inventory(date=inv_date, qty_amount=0, total_amount=0)

    for item in data["items"]:
        try:
            product_id = item["product_id"]
            qty        = int(item["qty"])
        except (KeyError, ValueError, TypeError):
            return jsonify({"error": "Each item needs product_id & qty"}), 400

        prod = Product.query.get(product_id)
        if not prod:
            return jsonify({"error": f"Unknown product_id {product_id}"}), 422

        entry = InventoryEntry(product_id=prod.id, qty=qty)
        inv.entries.append(entry)

        inv.qty_amount   += qty
        inv.total_amount += qty * prod.price

    db.session.add(inv)
    db.session.commit()
    return jsonify(inv_to_dict(inv)), 201


# PUT /inventory/<id>  (full replace)
@app.route("/inventory/<int:inv_id>", methods=["PUT"])
def update_inventory(inv_id):
    inv = Inventory.query.get_or_404(inv_id)
    data = request.get_json()
    if not data or "date" not in data or "items" not in data:
        return jsonify({"error": "date and items required"}), 400

    inv.date         = parse_date(data["date"], "date")
    inv.qty_amount   = 0
    inv.total_amount = 0

    # Remove existing child rows
    InventoryEntry.query.filter_by(inventory_id=inv.id).delete()

    for item in data["items"]:
        try:
            product_id = item["product_id"]
            qty        = int(item["qty"])
        except (KeyError, ValueError, TypeError):
            return jsonify({"error": "Each item needs product_id & qty"}), 400

        prod = Product.query.get(product_id)
        if not prod:
            return jsonify({"error": f"Unknown product_id {product_id}"}), 422

        entry = InventoryEntry(product_id=prod.id, qty=qty)
        inv.entries.append(entry)

        inv.qty_amount   += qty
        inv.total_amount += qty * prod.price

    db.session.commit()
    return jsonify(inv_to_dict(inv)), 200


# DELETE /inventory/<id>
@app.route("/inventory/<int:inv_id>", methods=["DELETE"])
def delete_inventory(inv_id):
    inv = Inventory.query.get_or_404(inv_id)
    db.session.delete(inv)
    db.session.commit()
    return jsonify({"result": "deleted"}), 204

# DELETE /items/<int:item_id>
@app.route("/items/<int:item_id>", methods=["DELETE"])
def delete_inventory_item(item_id):
    """
    Delete an item from an inventory entry.
    This is a soft delete, it will remove the item from the inventory entry.
    """
    item = InventoryEntry.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"result": "deleted"}), 204


# Instead, at the bottom of your file, before app.run():
if __name__ == "__main__":
    with app.app_context():
        db.create_all()