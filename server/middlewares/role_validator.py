from flask import jsonify, g
from functools import wraps

def admin_required(f):
    """
    Decorator to require admin role for routes
    Must be used AFTER @auth_required decorator
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_role = g.current_user.get('role', 'customer')
        if user_role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function