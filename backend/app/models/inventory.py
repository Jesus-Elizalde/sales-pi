from app.extensions import db


class Inventory(db.Model):
    __tablename__ = "inventory"

    id           = db.Column(db.Integer, primary_key=True)
    date         = db.Column(db.Date,   nullable=False)
    qty_amount   = db.Column(db.Integer, nullable=False)
    total_amount = db.Column(db.Float,   nullable=False)

    entries = db.relationship(
        "InventoryEntry",
        backref="inventory",
        cascade="all, delete-orphan",
        lazy=True,
    )

    def __repr__(self) -> str:
        return f"<Inventory {self.id} {self.date}>"


class InventoryEntry(db.Model):
    __tablename__ = "inventory_entry"

    id           = db.Column(db.Integer, primary_key=True)
    inventory_id = db.Column(db.Integer, db.ForeignKey("inventory.id"), nullable=False)
    product_id   = db.Column(db.Integer, db.ForeignKey("product.id"),   nullable=False)
    qty          = db.Column(db.Integer, nullable=False)

    product = db.relationship("Product")

    def __repr__(self) -> str:
        return f"<InventoryEntry {self.id} prod={self.product_id} qty={self.qty}>"