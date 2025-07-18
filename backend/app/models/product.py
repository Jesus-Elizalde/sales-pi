from app.extensions import db


class Product(db.Model):
    __tablename__ = "product"

    id        = db.Column(db.Integer, primary_key=True)
    name      = db.Column(db.String(80),  nullable=False)
    price     = db.Column(db.Float,       nullable=False)   # Price per unit
    attr_num  = db.Column(db.String(40),  nullable=True)    # Optional attribute number

    def __repr__(self) -> str:            # optional, nice debugging
        return f"<Product {self.id} {self.name}>"