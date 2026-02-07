import sys
import os

# Add python-dev to path
sys.path.append(os.path.join(os.getcwd(), 'python-dev'))

try:
    print("Attempting to import app...")
    from app import create_app
    print("App imported successfully.")
    
    print("Attempting to create app instance...")
    app = create_app()
    print("App instance created successfully.")
    print("Test Passed!")
except Exception as e:
    print(f"Test Failed: {e}")
    sys.exit(1)
