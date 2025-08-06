from datetime import datetime
from db import get_database

class User:
    def __init__(self, email, password, first_name, last_name):
        self.email = email
        self.password = password  # Will be hashed later
        self.first_name = first_name
        self.last_name = last_name
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        """Convert user object to dictionary for MongoDB"""
        return {
            'email': self.email,
            'password': self.password,
            'first_name': self.first_name,
            'last_name': self.last_name,
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