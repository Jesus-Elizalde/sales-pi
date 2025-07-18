from app.extensions import db


class Batch(db.Model):
    __tablename__ = "batch"

    id           = db.Column(db.Integer, primary_key=True)
    date         = db.Column(db.Date,   nullable=False)  # Only date, no time
    card_amount  = db.Column(db.Float,  default=0)
    cash_amount  = db.Column(db.Float,  default=0)
    total_amount = db.Column(db.Float,  default=0)

    # One-to-many
    entries = db.relationship(
        "Entry",
        backref="batch",
        cascade="all, delete-orphan",
        lazy=True,
    )

    def __repr__(self) -> str:
        return f"<Batch {self.id} {self.date}>"