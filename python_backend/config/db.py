
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
        # Pymongo doesn't have strictQuery, it's specific to Mongoose schemas.
        # We configure the client with the same timeouts and pool sizes.
        client = MongoClient(
            Config.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            maxPoolSize=10,
            minPoolSize=2,
            socketTimeoutMS=45000
        )
        
        # Verify connection immediately to catch errors early
        client.admin.command('ping')
        print('✓ MongoDB connected successfully')
        
        # Select database
        db = client.get_database() 
        
    except (ConnectionFailure, OperationFailure) as err:
        print(f'MongoDB connection error: {err}', file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f'MongoDB connection error: {e}', file=sys.stderr)
        sys.exit(1)

def close_db():
    global client
    if client:
        client.close()
        print('MongoDB disconnected')

# Note: Pymongo doesn't support event listeners for 'disconnected' or 'error' in the same way as Mongoose.
# Connection monitoring would require implementing a custom Monitoring event listener if strictly needed.

