from flask import Blueprint
from controllers.product_controller import add_product, get_all_products, get_product_by_id
from middlewares.auth_middleware import auth_required

products_bp = Blueprint('products', __name__, url_prefix='/api/products')

@products_bp.route('/add_product', methods=['POST'])
@auth_required
def add_product_route():
    return add_product()


@products_bp.route('/all_products', methods=['GET'])
def get_all_products_route():
    return get_all_products()


@products_bp.route('/product/<string:product_id>', methods=['GET'])
def get_product_by_id_route(product_id):
    return get_product_by_id(product_id)