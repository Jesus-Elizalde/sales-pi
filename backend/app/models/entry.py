from app.extensions import db


class Entry(db.Model):
    __tablename__ = "entry"

    id         = db.Column(db.Integer, primary_key=True)
    batch_id   = db.Column(db.Integer, db.ForeignKey("batch.id"),   nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)

    qty      = db.Column(db.Integer, nullable=False)
    price    = db.Column(db.Float,   nullable=False)
    discount = db.Column(db.Float,   default=0)
    size     = db.Column(db.String(40), nullable=True)

    payments = db.relationship(
        "Payment",
        backref="entry",
        cascade="all, delete-orphan",
        lazy=True,
    )
    product = db.relationship("Product")

    def __repr__(self) -> str:
        return f"<Entry {self.id} prod={self.product_id} qty={self.qty}>"


class Payment(db.Model):
    __tablename__ = "payment"

    id          = db.Column(db.Integer, primary_key=True)
    entry_id    = db.Column(db.Integer, db.ForeignKey("entry.id"), nullable=False)
    payment_type = db.Column(db.String(10), nullable=False)
    amount      = db.Column(db.Float, nullable=False)

    def __repr__(self) -> str:
        return f"<Payment {self.id} {self.payment_type} {self.amount}>"