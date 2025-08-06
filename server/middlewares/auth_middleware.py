from flask import request, jsonify, g
from functools import wraps
import jwt
import os
from models.user import User

def auth_required(f):
    """
    Decorator to require valid JWT authentication for routes
    Usage: @auth_required above route function
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Check for Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            
            # Check for Bearer format
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            else:
                return jsonify({'error': 'Invalid authorization format. Use: Bearer <token>'}), 401
        else:
            return jsonify({'error': 'Authorization header is required'}), 401
        
        try:
            # Get JWT secret and decode token
            secret_key = os.getenv('JWT_SECRET')
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            
            # Get user from database
            user = User.find_by_email(payload['email'])
            if not user:
                return jsonify({'error': 'User not found'}), 401
            
            # Store user info for use in route
            g.current_user_id = str(user['_id'])
            g.current_user = {
                'id': str(user['_id']),
                'email': user['email'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'role': user.get('role', 'customer')
            }
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except:
            return jsonify({'error': 'Authentication failed'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function