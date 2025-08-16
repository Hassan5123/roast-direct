from flask import request, jsonify, g
from db import get_database
from bson import ObjectId
from bson.errors import InvalidId
from models.order import Order
import random
from datetime import datetime


VALID_GRIND_OPTIONS = [
    'Whole Bean', 'Aeropress', 'Espresso', 'Chemex', 'Cold Brew', 
    'Pour Over', 'French Press', 'Moka Pot', 'Auto Drip'
]

def calculate_subtotal():
    """Calculate subtotal for cart items"""
    try:
        data = request.get_json()
        if not data or 'items' not in data:
            return jsonify({'error': 'Items are required'}), 400
        
        items = data['items']
        if not items or len(items) == 0:
            return jsonify({'error': 'Cart cannot be empty'}), 400
        
        db = get_database()
        subtotal = 0
        validated_items = []
        
        for item in items:
            # Validate item structure
            if not all(key in item for key in ['product_id', 'quantity', 'grind_option']):
                return jsonify({'error': 'Each item must have product_id, quantity, and grind_option'}), 400
            
            try:
                product_id = ObjectId(item['product_id'])
                quantity = int(item['quantity'])
                grind_option = item['grind_option']
                
                if quantity <= 0:
                    return jsonify({'error': 'Quantity must be positive'}), 400
                    
                if grind_option not in VALID_GRIND_OPTIONS:
                    return jsonify({'error': f'Invalid grind option. Must be one of: {", ".join(VALID_GRIND_OPTIONS)}'}), 400
                
            except (InvalidId, ValueError):
                return jsonify({'error': 'Invalid product ID or quantity format'}), 400
            
            # Get product from database
            product = db.products.find_one({'_id': product_id, 'is_active': True})
            if not product:
                return jsonify({'error': f'Product not found or inactive'}), 404
            
            # Validate stock availability
            if product['inventory_count'] < quantity:
                return jsonify({
                    'error': f'Insufficient stock for {product["name"]}. Available: {product["inventory_count"]}, Requested: {quantity}'
                }), 400
            
            # Calculate item total
            item_total = product['price'] * quantity
            subtotal += item_total
            
            # Store validated item info for response
            validated_items.append({
                'product_id': str(product_id),
                'product_name': product['name'],
                'price_at_time': product['price'],
                'quantity': quantity,
                'item_total': round(item_total, 2),
                'grind_option': grind_option
            })
        
        return jsonify({
            'message': 'Subtotal calculated successfully',
            'subtotal': round(subtotal, 2),
            'items': validated_items,
            'item_count': len(validated_items)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500


def calculate_final_total():
    """Calculate tax, shipping, and final total for order. Also sanitizes card info for security."""
    try:
        data = request.get_json()
        if not data or 'subtotal' not in data:
            return jsonify({'error': 'Subtotal is required'}), 400
        
        try:
            subtotal = float(data['subtotal'])
            if subtotal <= 0:
                return jsonify({'error': 'Subtotal must be positive'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid subtotal format'}), 400
        
        # Check for required payment fields
        required_payment_fields = [
            'card_number', 'cardholder_name', 'cvc', 'exp_month', 'exp_year', 
            'shipping_address', 'billing_address'
        ]
        
        missing_fields = [field for field in required_payment_fields if field not in data]
        if missing_fields:
            return jsonify({
                'error': 'Missing required payment fields', 
                'missing_fields': missing_fields
            }), 400
            
        # Validate card information
        card_errors = []
        
        # Validate card number
        card_number = str(data['card_number']).replace(' ', '').replace('-', '')
        if not card_number.isdigit() or len(card_number) < 13 or len(card_number) > 19:
            card_errors.append('Invalid card number format')
        
        # Validate cardholder name
        cardholder_name = str(data['cardholder_name']).strip()
        if len(cardholder_name) < 3 or len(cardholder_name) > 100:
            card_errors.append('Invalid cardholder name')
        
        # Validate CVC
        cvc = str(data['cvc'])
        if not cvc.isdigit() or len(cvc) < 3 or len(cvc) > 4:
            card_errors.append('Invalid CVC format')
        
        # Validate expiration date
        try:
            exp_month = int(data['exp_month'])
            exp_year = int(data['exp_year'])
            if exp_month < 1 or exp_month > 12:
                card_errors.append('Invalid expiration month (must be 1-12)')
            if exp_year < datetime.now().year or exp_year > datetime.now().year + 20:
                card_errors.append('Invalid expiration year')
        except (ValueError, TypeError):
            card_errors.append('Invalid expiration date format')
        
        # Validate shipping address
        shipping_address = data['shipping_address']
        if not isinstance(shipping_address, dict):
            card_errors.append('Shipping address must be an object')
        else:
            address_required_fields = ['street', 'city', 'state', 'zip']
            for field in address_required_fields:
                if field not in shipping_address or not str(shipping_address.get(field, '')).strip():
                    card_errors.append(f'Shipping address missing: {field}')
        
        # Validate billing address
        billing_address = data['billing_address']
        if not isinstance(billing_address, dict):
            card_errors.append('Billing address must be an object')
        else:
            for field in address_required_fields:
                if field not in billing_address or not str(billing_address.get(field, '')).strip():
                    card_errors.append(f'Billing address missing: {field}')
        
        if card_errors:
            return jsonify({'error': 'Validation failed', 'details': card_errors}), 400
        
        # Calculate random shipping cost (3.99 - 7.99)
        shipping_cost = round(random.uniform(3.99, 7.99), 2)
        
        # Calculate random tax rate (5% - 12%) and apply to subtotal
        tax_rate = random.uniform(0.05, 0.12)
        tax_amount = round(subtotal * tax_rate, 2)
        
        # Calculate final total
        final_total = round(subtotal + tax_amount + shipping_cost, 2)
        
        return jsonify({
            'message': 'Order totals calculated and payment info validated successfully',
            'subtotal': subtotal,
            'tax_amount': tax_amount,
            'tax_rate': round(tax_rate * 100, 1),  # Return as percentage for display
            'shipping_cost': shipping_cost,
            'final_total': final_total,
            'validation_passed': True
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500


def place_order():
    """Place order and update inventory"""
    try:
        data = request.get_json()
        
        # Validate required fields - only need items, shipping_address, final_total
        required_fields = ['items', 'shipping_address', 'final_total']
        if not data or not all(field in data for field in required_fields):
            return jsonify({'error': 'Required fields: items, shipping_address, final_total'}), 400
        
        user_id = g.current_user_id
        items = data['items']
        shipping_address = data['shipping_address']
        final_total = data['final_total']
        
        # Validate items structure
        if not items or len(items) == 0:
            return jsonify({'error': 'Order must contain at least one item'}), 400
        
        try:
            final_total = float(final_total)
            if final_total <= 0:
                return jsonify({'error': 'Final total must be positive'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid final total format'}), 400
        
        db = get_database()
        processed_items = []
        
        # Start a session for atomic operations
        with db.client.start_session() as session:
            with session.start_transaction():
                # Process each item
                for item in items:
                    if not all(key in item for key in ['product_id', 'quantity', 'price_at_time', 'grind_option']):
                        return jsonify({'error': 'Each item must have product_id, quantity, price_at_time, and grind_option'}), 400
                    
                    try:
                        product_id = ObjectId(item['product_id'])
                        quantity = int(item['quantity'])
                        price_at_time = float(item['price_at_time'])
                        grind_option = item['grind_option']
                        
                        if quantity <= 0:
                            return jsonify({'error': 'Quantity must be positive'}), 400
                        if price_at_time <= 0:
                            return jsonify({'error': 'Price must be positive'}), 400
                        if grind_option not in VALID_GRIND_OPTIONS:
                            return jsonify({'error': f'Invalid grind option. Must be one of: {", ".join(VALID_GRIND_OPTIONS)}'}), 400
                            
                    except (InvalidId, ValueError, TypeError):
                        return jsonify({'error': 'Invalid item data format'}), 400
                    
                    # Get and validate product with stock check
                    product = db.products.find_one({'_id': product_id, 'is_active': True}, session=session)
                    if not product:
                        return jsonify({'error': 'Product not found or inactive'}), 404
                    
                    # Final stock validation
                    if product['inventory_count'] < quantity:
                        return jsonify({
                            'error': f'Insufficient stock for {product["name"]}. Available: {product["inventory_count"]}, Requested: {quantity}'
                        }), 400
                    
                    # Update inventory atomically
                    result = db.products.update_one(
                        {'_id': product_id, 'inventory_count': {'$gte': quantity}},
                        {'$inc': {'inventory_count': -quantity}},
                        session=session
                    )
                    
                    if result.modified_count == 0:
                        return jsonify({
                            'error': f'Failed to reserve inventory for {product["name"]}. Item may have been purchased by another user.'
                        }), 409
                    
                    # Store processed item
                    processed_items.append({
                        'product_id': product_id,
                        'quantity': quantity,
                        'price_at_time': price_at_time,
                        'grind_option': grind_option
                    })

                order = Order(
                    user_id=user_id,
                    items=processed_items,
                    shipping_address=shipping_address,
                    billing_address=None,
                    payment_info=None,
                    final_total=final_total
                )
                
                order_result = db.orders.insert_one(order.to_dict(), session=session)
                
                if not order_result.inserted_id:
                    return jsonify({'error': 'Failed to create order'}), 500
        
        return jsonify({
            'message': 'Order placed successfully',
            'order_id': str(order_result.inserted_id),
            'order_number': order.order_number,
            'final_total': final_total,
            'status': order.status
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500


def get_all_orders():
    """Get all orders for the current user"""
    try:
        user_id = g.current_user_id
        db = get_database()
        
        # Find all orders for this user, sorted by creation date (newest first)
        orders = list(db.orders.find({'user_id': ObjectId(user_id)}).sort('created_at', -1))
        
        if not orders:
            return jsonify({
                'message': 'No orders found',
                'orders': []
            }), 200
        
        # Format orders for frontend display
        formatted_orders = []
        for order in orders:
            # Get product names for display
            order_items = []
            for item in order['items']:
                product = db.products.find_one({'_id': item['product_id']})
                product_name = product['name'] if product else 'Unknown Product'
                
                order_items.append({
                    'product_id': str(item['product_id']),
                    'product_name': product_name,
                    'quantity': item['quantity'],
                    'price_at_time': item['price_at_time'],
                    'grind_option': item['grind_option'],
                    'item_total': round(item['price_at_time'] * item['quantity'], 2)
                })
            
            # Format the order summary
            formatted_order = {
                'order_id': str(order['_id']),
                'order_number': order['order_number'],
                'created_at': order['created_at'],
                'status': order['status'],
                'final_total': order['final_total'],
                'item_count': len(order_items),
                'items': order_items,
                # Include basic shipping info for display
                'shipping_address': {
                    'city': order['shipping_address'].get('city', ''),
                    'state': order['shipping_address'].get('state', ''),
                    'zip': order['shipping_address'].get('zip', '')
                }
            }
            formatted_orders.append(formatted_order)
        
        return jsonify({
            'message': 'Orders retrieved successfully',
            'count': len(formatted_orders),
            'orders': formatted_orders
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500


def get_order_by_id(order_id):
    """Get details of a specific order"""
    try:
        user_id = g.current_user_id
        
        try:
            order_id = ObjectId(order_id)
        except InvalidId:
            return jsonify({'error': 'Invalid order ID format'}), 400
        
        db = get_database()
        order = db.orders.find_one({'_id': order_id})
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Verify the order belongs to the current user
        if str(order['user_id']) != str(user_id):
            return jsonify({'error': 'Unauthorized access to this order'}), 403
        
        # Get product details for each item
        order_items = []
        for item in order['items']:
            product = db.products.find_one({'_id': item['product_id']})
            
            product_info = {
                'product_id': str(item['product_id']),
                'product_name': product['name'] if product else 'Product no longer available',
                'image_url': product.get('image_url', '') if product else '',
                'quantity': item['quantity'],
                'price_at_time': item['price_at_time'],
                'grind_option': item['grind_option'],
                'item_total': round(item['price_at_time'] * item['quantity'], 2)
            }
            order_items.append(product_info)
        
        order_details = {
            'order_id': str(order['_id']),
            'order_number': order['order_number'],
            'user_id': str(order['user_id']),
            'created_at': order['created_at'],
            'status': order['status'],
            'final_total': order['final_total'],
            'items': order_items,
            'shipping_address': order['shipping_address'],
            'billing_address': order.get('billing_address'),
            'payment_info': {
                'payment_method': 'card',  # Default for portfolio demo
                'last_four': '****'        # Masked for security
            } if order.get('payment_info') else None
        }
        
        return jsonify({
            'message': 'Order retrieved successfully',
            'order': order_details
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500


def cancel_order(order_id):
    """Cancel an order and restore inventory"""
    try:
        user_id = g.current_user_id
        
        try:
            order_id = ObjectId(order_id)
        except InvalidId:
            return jsonify({'error': 'Invalid order ID format'}), 400
        
        db = get_database()
        
        # Start a session for atomic operations
        with db.client.start_session() as session:
            with session.start_transaction():
                # Find the order
                order = db.orders.find_one({'_id': order_id}, session=session)
                
                if not order:
                    return jsonify({'error': 'Order not found'}), 404
                
                # Verify the order belongs to the current user
                if str(order['user_id']) != str(user_id):
                    return jsonify({'error': 'Unauthorized access to this order'}), 403
                
                # Check if order is in a state that can be canceled
                if order['status'] not in ['in-progress', 'processing']:
                    return jsonify({
                        'error': f"Order cannot be canceled in '{order['status']}' status"
                    }), 400
                
                # Update order status
                result = db.orders.update_one(
                    {'_id': order_id},
                    {'$set': {'status': 'canceled'}},
                    session=session
                )
                
                if result.modified_count == 0:
                    return jsonify({'error': 'Failed to cancel order'}), 500
                
                # Restore inventory for each item
                restored_items = []
                for item in order['items']:
                    product_id = item['product_id']
                    quantity = item['quantity']
                    
                    # Add quantities back to inventory
                    db.products.update_one(
                        {'_id': product_id},
                        {'$inc': {'inventory_count': quantity}},
                        session=session
                    )
                    
                    # Get product info for response
                    product = db.products.find_one({'_id': product_id}, session=session)
                    product_name = product['name'] if product else 'Unknown Product'
                    
                    restored_items.append({
                        'product_id': str(product_id),
                        'product_name': product_name,
                        'quantity_restored': quantity
                    })
        
        return jsonify({
            'message': 'Order canceled successfully',
            'order_id': str(order_id),
            'order_number': order['order_number'],
            'restored_items': restored_items
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500


def mark_as_delivered(order_id):
    """Mark an order as delivered (admin function)"""
    try:
        try:
            order_id = ObjectId(order_id)
        except InvalidId:
            return jsonify({'error': 'Invalid order ID format'}), 400
        
        db = get_database()
        
        # Find the order
        order = db.orders.find_one({'_id': order_id})
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Check if order can be marked as delivered
        if order['status'] == 'canceled':
            return jsonify({'error': 'Cannot mark canceled order as delivered'}), 400
        
        if order['status'] == 'delivered':
            return jsonify({'message': 'Order is already marked as delivered'}), 200
        
        # Update order status
        result = db.orders.update_one(
            {'_id': order_id},
            {'$set': {'status': 'delivered'}}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'Failed to update order status'}), 500
        
        return jsonify({
            'message': 'Order marked as delivered successfully',
            'order_id': str(order_id),
            'order_number': order['order_number']
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500