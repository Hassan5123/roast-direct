from datetime import datetime

class Product:
    def __init__(self, name, description, price, roast_level, origin_country, elevation,
                 inventory_count, farm_info,
                 processing_method, tasting_notes):
        self.name = name
        self.description = description
        self.price = float(price)
        self.roast_level = roast_level  # 'light', 'medium', 'dark'
        self.origin_country = origin_country
        self.elevation = elevation # in meters
        self.inventory_count = int(inventory_count)
        self.farm_info = farm_info
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
            'elevation': self.elevation,
            'inventory_count': self.inventory_count,
            'farm_info': self.farm_info,
            'processing_method': self.processing_method,
            'tasting_notes': self.tasting_notes,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'is_active': self.is_active
        }