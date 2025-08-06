from datetime import datetime

class Product:
    def __init__(self, name, description, price, roast_level, origin_country, 
                 inventory_count, image_url, roast_date=None, farm_info=None, 
                 processing_method=None, tasting_notes=None):
        self.name = name
        self.description = description
        self.price = float(price)
        self.roast_level = roast_level  # 'light', 'medium', 'dark'
        self.origin_country = origin_country
        self.inventory_count = int(inventory_count)
        self.image_url = image_url
        self.roast_date = roast_date or datetime.utcnow()
        self.farm_info = farm_info  # Optional detailed farm information
        self.processing_method = processing_method  # 'washed', 'natural', 'honey', etc.
        self.tasting_notes = tasting_notes or []  # Array of flavor notes
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.is_active = True  # For soft delete by disabling products
    
    def to_dict(self):
        """Convert product object to dictionary for MongoDB"""
        return {
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'roast_level': self.roast_level,
            'origin_country': self.origin_country,
            'inventory_count': self.inventory_count,
            'image_url': self.image_url,
            'roast_date': self.roast_date,
            'farm_info': self.farm_info,
            'processing_method': self.processing_method,
            'tasting_notes': self.tasting_notes,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'is_active': self.is_active
        }
    
    def calculate_freshness_days(self):
        """Calculate days since roast for freshness indicator"""
        if not self.roast_date:
            return None
        return (datetime.utcnow() - self.roast_date).days
    
    def is_fresh(self):
        """Determine if coffee is still fresh (within a month of roast)"""
        days_since_roast = self.calculate_freshness_days()
        return days_since_roast is not None and days_since_roast <= 30
    
    def is_in_stock(self):
        """Check if product has available inventory"""
        return self.inventory_count > 0