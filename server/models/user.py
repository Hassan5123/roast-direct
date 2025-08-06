from datetime import datetime
from db import get_database

class User:
    def __init__(self, email, password, first_name, last_name, role='customer'):
        """Initialize a new `User` instance.

        Args:
            email (str): User email address.
            password (str): Hashed password string.
            first_name (str): First name.
            last_name (str): Last name.
            role (str, optional): User role (`'admin'` or `'customer'`). Defaults to `'customer'`.
        """
        self.email = email
        self.password = password
        self.first_name = first_name
        self.last_name = last_name
        # Ensure role is one of the allowed values
        allowed_roles = {'admin', 'customer'}
        self.role = role if role in allowed_roles else 'customer'
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        """Convert user object to dictionary for MongoDB"""
        return {
            'email': self.email,
            'password': self.password,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    @staticmethod
    def find_by_email(email):
        """Find user by email in database"""
        db = get_database()
        return db.users.find_one({'email': email})
    
    @staticmethod
    def create_user(user_data):
        """Create new user in database"""
        db = get_database()
        result = db.users.insert_one(user_data)
        return result.inserted_id