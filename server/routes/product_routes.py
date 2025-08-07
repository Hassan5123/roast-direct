from flask import Blueprint
from controllers.product_controller import add_product, get_all_products, get_product_by_id
from middlewares.auth_middleware import auth_required

product_bp = Blueprint('product', __name__, url_prefix='/api/product')

@product_bp.route('/add_product', methods=['POST'])
@auth_required
def add_product_route():
    return add_product()


@product_bp.route('/products', methods=['GET'])
def get_all_products_route():
    return get_all_products()


@product_bp.route('/products/<string:product_id>', methods=['GET'])
def get_product_by_id_route(product_id):
    return get_product_by_id(product_id)