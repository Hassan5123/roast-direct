from flask import Blueprint
from controllers.product_controller import add_product
from middlewares.auth_middleware import auth_required

product_bp = Blueprint('product', __name__, url_prefix='/api/product')

@product_bp.route('/add_product', methods=['POST'])
@auth_required
def add_product_route():
    return add_product()