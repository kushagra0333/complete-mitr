import sys
import os

# Add the python-dev directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'python-dev'))

from config.env import Config
from config.db import connect_db, close_db

def test_config():
    print("Testing Configuration Loading...")
    print(f"PORT: {Config.PORT}")
    print(f"NODE_ENV: {Config.NODE_ENV}")
    # Masking secrets
    print(f"MONGODB_URI: {'*' * 5 if Config.MONGODB_URI else 'None'}")
    
    if not Config.MONGODB_URI:
        print("ERROR: MONGODB_URI is not set in .env file or environment.")
        return

    print("\nTesting Database Connection...")
    connect_db()
    close_db()

if __name__ == "__main__":
    test_config()
