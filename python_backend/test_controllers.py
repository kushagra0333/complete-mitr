import sys
import os

# Add the python-dev directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'python-dev'))

def test_imports():
    try:
        print("Testing imports...")
        from controllers import auth_controller
        print("✓ auth_controller imported")
        from controllers import user_controller
        print("✓ user_controller imported")
        from controllers import device_controller
        print("✓ device_controller imported")
        from controllers import session_controller
        print("✓ session_controller imported")
        print("All controllers imported successfully.")
    except Exception as e:
        print(f"Error importing controllers: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_imports()
