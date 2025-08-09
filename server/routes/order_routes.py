from flask import Blueprint
from middlewares.auth_middleware import auth_required
from controllers.order_controller import (
    calculate_subtotal,
    calculate_final_total,
    place_order,
    get_all_orders,
    get_order_by_id,
    cancel_order,
    mark_as_delivered
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

@orders_bp.route('/all_orders', methods=['GET'])
@auth_required
def get_all_orders_route():
    """Get all orders for the current user"""
    return get_all_orders()

@orders_bp.route('/<order_id>', methods=['GET'])
@auth_required
def get_order_by_id_route(order_id):
    """Get details of a specific order"""
    return get_order_by_id(order_id)

@orders_bp.route('/cancel/<order_id>', methods=['POST'])
@auth_required
def cancel_order_route(order_id):
    """Cancel an order and restore inventory"""
    return cancel_order(order_id)

@orders_bp.route('/deliver/<order_id>', methods=['POST'])
@auth_required
def mark_as_delivered_route(order_id):
    """Mark an order as delivered (admin function)"""
    return mark_as_delivered(order_id)