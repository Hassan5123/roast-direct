from flask import jsonify, request
from datetime import datetime
from models.product import Product
from db import get_database

def add_product():
    """Add product (coffee item) to product schema in database"""
    try:
        data = request.get_json()

        required_fields = ['name', 'description', 'price', 'roast_level', 'origin_country', 'elevation', 'inventory_count', 'image_url', 'roast_date', 'farm_info', 'processing_method', 'tasting_notes']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        try:
            roast_date = datetime.fromisoformat(data['roast_date'])
        except ValueError:
            return jsonify({'error': 'Invalid roast_date format. Use YYYY-MM-DD'}), 400

        new_product = Product(
            name=data['name'],
            description=data['description'],
            price=data['price'],
            roast_level=data['roast_level'],
            origin_country=data['origin_country'],
            elevation=data['elevation'],
            inventory_count=data['inventory_count'],
            image_url=data['image_url'],
            roast_date=roast_date,
            farm_info=data['farm_info'],
            processing_method=data['processing_method'],
            tasting_notes=data['tasting_notes'],
        )

        db = get_database()
        result = db.products.insert_one(new_product.to_dict())
        product_id = result.inserted_id

        return jsonify({'message': 'Product added successfully', 'product_id': str(product_id)}), 201
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500