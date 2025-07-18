from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Product

products_bp = Blueprint("products", __name__, url_prefix="/api/products")


@products_bp.post("")
def create_product():
    data = request.get_json()
    name  = data.get("name")
    price = data.get("price")
    attr  = data.get("attr_num")

    if not name or price is None:
        return jsonify({"error": "Name and price are required"}), 400

    prod = Product(name=name, price=price, attr_num=attr)
    db.session.add(prod)
    db.session.commit()

    return (
        jsonify({"id": prod.id, "name": prod.name,
                 "price": prod.price, "attr_num": prod.attr_num}),
        201,
    )


@products_bp.get("")
def list_products():
    products = Product.query.all()
    return jsonify(
        [
            {"id": p.id, "name": p.name,
             "price": p.price, "attr_num": p.attr_num}
            for p in products
        ]
    )
