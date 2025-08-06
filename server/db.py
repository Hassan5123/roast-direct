from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance
    
    def connect(self):
        if self._client is None:
            self._client = MongoClient(os.getenv('MONGODB_URI'))
            self._db = self._client['roastdirect']
            print("MongoDB connection successful")
        return self._db
    
    def get_db(self):
        if self._db is None:
            return self.connect()
        return self._db

# Convenience function for easy importing
def get_database():
    return Database().get_db()