from flask import jsonify, request
import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from models.user import User
from db import get_database


def generate_jwt_token(user_id, role, email):
    """Generate JWT token for user"""
    secret_key = os.getenv('JWT_SECRET')
    
    if not secret_key:
        raise ValueError("JWT_SECRET environment variable is required")
    
    payload = {
        'user_id': str(user_id),
        'role': role,
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=7),
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(payload, secret_key, algorithm='HS256')
    return token

def register():
    """Handle user signup"""
    try:
        data = request.get_json()
        
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        role = data.get('role', 'customer')
        if role not in ('admin', 'customer'):
            return jsonify({'error': 'Invalid role specified'}), 400
        
        existing_user = User.find_by_email(data['email'])
        if existing_user:
            return jsonify({'error': 'User already exists with this email'}), 409
        
        password_bytes = data['password'].encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password_bytes, salt)
        
        new_user = User(
            email=data['email'],
            password=hashed_password.decode('utf-8'),
            first_name=data['first_name'],
            last_name=data['last_name'],
            role=role
        )
        
        user_id = User.create_user(new_user.to_dict())
        
        token = generate_jwt_token(user_id, role, data['email'])
        
        return jsonify({
            'message': 'User created successfully',
            'token': token,
            'user': {
                'id': str(user_id),
                'email': data['email'],
                'role': role,
                'first_name': data['first_name'],
                'last_name': data['last_name']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

def login():
    """Handle user login"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.find_by_email(data['email'])
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        password_bytes = data['password'].encode('utf-8')
        hashed_password = user['password'].encode('utf-8')
        
        if not bcrypt.checkpw(password_bytes, hashed_password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        role = user.get('role', 'customer')
        token = generate_jwt_token(user['_id'], role, user['email'])
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': str(user['_id']),
                'email': user['email'],
                'role': role,
                'first_name': user['first_name'],
                'last_name': user['last_name']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500