from datetime import datetime
from bson import ObjectId
import uuid
import random

class Order:
    def __init__(self, user_id, items, shipping_address, billing_address, payment_info, final_total):
        self.user_id = ObjectId(user_id)
        self.order_number = self.generate_order_number()
        self.items = items  # Array of {product_id, quantity, grind_option, price_at_time}
        self.shipping_address = shipping_address
        self.billing_address = billing_address
        self.payment_info = payment_info  # Stripe payment intent ID or charge ID
        self.final_total = final_total
        self.status = 'in-progress'  # in-progress, delivered, canceled
        self.canceled_at = None
        self.delivered_at = None
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    @staticmethod
    def generate_order_number():
        """Generate unique order number for customer reference"""
        date_str = datetime.utcnow().strftime('%Y%m%d')
        random_suffix = str(uuid.uuid4())[:4].upper()
        return f"RD-{date_str}-{random_suffix}"
    
    def to_dict(self):
        """Convert order object to dictionary for MongoDB"""
        return {
            'user_id': self.user_id,
            'order_number': self.order_number,
            'items': self.items,
            'shipping_address': self.shipping_address,
            'billing_address': self.billing_address,
            'payment_info': self.payment_info,
            'final_total': self.final_total,
            'status': self.status,
            'canceled_at': self.canceled_at,
            'delivered_at': self.delivered_at,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }