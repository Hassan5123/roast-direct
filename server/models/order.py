from datetime import datetime
from bson import ObjectId
import uuid

class Order:
    def __init__(self, user_id, items, shipping_address, billing_address=None, 
                 payment_method=None, subtotal=0, shipping_cost=0, tax_amount=0, 
                 total=0, order_notes=None):
        self.user_id = ObjectId(user_id)
        self.order_number = self.generate_order_number()
        self.items = items  # Array of {product_id, quantity, grind_option, price_at_time}
        self.shipping_address = shipping_address
        self.billing_address = billing_address or shipping_address
        self.payment_method = payment_method
        self.subtotal = float(subtotal)
        self.shipping_cost = float(shipping_cost)
        self.tax_amount = float(tax_amount)
        self.total = float(total)
        self.order_notes = order_notes
        self.status = 'in-progress'  # in-progress, completed, canceled
        self.tracking_number = None
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.shipped_at = None
        self.delivered_at = None
    
    @staticmethod
    def generate_order_number():
        """Generate unique order number for customer reference"""
        # Format: RD-YYYYMMDD-XXXX (RoastDirect + date + random)
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
            'payment_method': self.payment_method,
            'subtotal': self.subtotal,
            'shipping_cost': self.shipping_cost,
            'tax_amount': self.tax_amount,
            'total': self.total,
            'order_notes': self.order_notes,
            'status': self.status,
            'tracking_number': self.tracking_number,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'shipped_at': self.shipped_at,
            'delivered_at': self.delivered_at
        }
    
    def calculate_totals(self):
        """Recalculate order totals based on items"""
        self.subtotal = sum(item['price_at_time'] * item['quantity'] for item in self.items)
        # Basic tax calculation
        self.tax_amount = self.subtotal * 0.08  # 8% default tax rate
        self.total = self.subtotal + self.shipping_cost + self.tax_amount
        return self.total
    
    def add_item(self, product_id, quantity, grind_option, price_at_time):
        """Add item to order"""
        item = {
            'product_id': ObjectId(product_id),
            'quantity': int(quantity),
            'grind_option': grind_option,  # 'Whole Bean', 'Aeropress', 'Espresso', 'Chemex', 'Cold Brew', 'Pour Over', 'French Press', 'Moka Pot', 'Auto Drip'
            'price_at_time': float(price_at_time)
        }
        self.items.append(item)
        self.calculate_totals()
    
    def can_be_cancelled(self):
        """Check if order can still be cancelled"""
        return self.status == 'in-progress'