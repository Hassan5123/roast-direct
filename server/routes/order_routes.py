from flask import Blueprint
from middlewares.auth_middleware import auth_required
from controllers.order_controller import (
    calculate_subtotal,
    calculate_final_total, 
    place_order
)

orders_bp = Blueprint('orders', __name__, url_prefix='/api/orders')

@orders_bp.route('/subtotal', methods=['POST'])
@auth_required
def calculate_subtotal_route():
    """Calculate subtotal for cart items"""
    return calculate_subtotal()

@orders_bp.route('/final_total', methods=['POST'])
@auth_required  
def calculate_final_total_route():
    """Calculate tax, shipping, and final total for order"""
    return calculate_final_total()

@orders_bp.route('/place_order', methods=['POST'])
@auth_required
def place_order_route():
    """Place order and update inventory"""
    return place_order()