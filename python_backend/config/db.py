from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from .env import Config
import sys

# Global client and database variables
client = None
db = None

def get_db():
    return db

def connect_db():
    global client, db
    try:
        client = MongoClient(
            Config.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            maxPoolSize=10,
            minPoolSize=2,
            socketTimeoutMS=45000
        )
        
        # Verify connection
        client.admin.command('ping')
        print('✓ MongoDB connected successfully')
        
        # Determine the database name from the URI or use a default
        # Assuming the URI contains the db name, pymongo handles it, 
        # but explicit selection is safer if we want to assign to 'db'
        db = client.get_database() 
        
    except (ConnectionFailure, OperationFailure) as err:
        print(f'MongoDB connection error: {err}', file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f'An unexpected error occurred: {e}', file=sys.stderr)
        sys.exit(1)

def close_db():
    global client
    if client:
        client.close()
        print('MongoDB disconnected')
