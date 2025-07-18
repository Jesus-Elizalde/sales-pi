"""
Aggregate every Blueprint for easy registration within create_app().
"""
from .products   import products_bp
from .batches    import batches_bp
from .entries    import entries_bp
from .inventory  import inventory_bp

ALL_BLUEPRINTS = (
    products_bp,
    batches_bp,
    entries_bp,
    inventory_bp,
)