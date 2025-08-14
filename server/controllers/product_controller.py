from flask import jsonify, request
from datetime import datetime
from models.product import Product
from db import get_database

def add_product():
    """Add product (coffee item) to product schema in database"""
    try:
        data = request.get_json()

        required_fields = ['name', 'description', 'price', 'roast_level', 'origin_country', 'elevation', 'inventory_count', 'farm_info', 'processing_method', 'tasting_notes']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        new_product = Product(
            name=data['name'],
            description=data['description'],
            price=data['price'],
            roast_level=data['roast_level'],
            origin_country=data['origin_country'],
            elevation=data['elevation'],
            inventory_count=data['inventory_count'],
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


def get_all_products():
    """Get all active products with available inventory for catalog display"""
    try:
        db = get_database()
        # Only show products that are active AND have inventory > 0
        products = db.products.find({
            'is_active': True,
            'inventory_count': {'$gt': 0}
        })
        
        # Convert MongoDB cursor to list and handle ObjectId serialization
        products_list = []
        for product in products:
            product['_id'] = str(product['_id'])  # Convert ObjectId to string for JSON
            products_list.append(product)
        
        return jsonify({
            'message': 'Products retrieved successfully',
            'products': products_list,
            'count': len(products_list)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500


def get_product_by_id(product_id):
    """Get single product by ID for product detail page"""
    try:
        from bson import ObjectId
        from bson.errors import InvalidId
        
        try:
            object_id = ObjectId(product_id)
        except InvalidId:
            return jsonify({'error': 'Invalid product ID format'}), 400
        
        db = get_database()
        product = db.products.find_one({'_id': object_id, 'is_active': True})
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        # Convert ObjectId to string for JSON serialization
        product['_id'] = str(product['_id'])
        
        return jsonify({
            'message': 'Product retrieved successfully',
            'product': product
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500