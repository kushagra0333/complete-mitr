from flask import Flask, jsonify, request
from flask_cors import CORS
from config.env import Config
from config.db import connect_db
from routes.auth_routes import auth_bp
from routes.device_routes import device_bp
from routes.session_routes import session_bp
from routes.user_routes import user_bp
import os
import json
import datetime

def create_app():
    # In Docker, we copy the build folder to /app/build, so it's a sibling of app.py
    app = Flask(__name__, static_folder='build')
    CORS(app)

    # Connect to MongoDB
    connect_db()

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(device_bp, url_prefix='/api/device')
    app.register_blueprint(session_bp, url_prefix='/api/sessions')
    app.register_blueprint(user_bp, url_prefix='/api/user')

    # Emergency file endpoints
    # To mimic node __dirname behavior
    # Assuming app.py is in python-dev/
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    EMERGENCY_FILE_PATH = os.path.join(BASE_DIR, 'src', 'emergency.txt')
    
    # Ensure src directory exists
    os.makedirs(os.path.dirname(EMERGENCY_FILE_PATH), exist_ok=True)

    @app.route('/api/update-emergency-data', methods=['POST'])
    def update_emergency_data():
        try:
            data = request.get_json()
            with open(EMERGENCY_FILE_PATH, 'w') as f:
                json.dump(data, f, indent=2)
            print(f'Updated emergency.txt: {data}')
            return jsonify({'success': True})
        except Exception as e:
            print(f'File write error: {e}')
            return jsonify({'error': str(e)}), 500

    @app.route('/api/emergency-data', methods=['GET'])
    def get_emergency_data():
        try:
            if not os.path.exists(EMERGENCY_FILE_PATH):
                return jsonify({}), 200 # Or return empty content? Node returns file content.
            
            with open(EMERGENCY_FILE_PATH, 'r') as f:
                data = f.read()
            return data, 200, {'Content-Type': 'text/plain'}
        except Exception as e:
            print(f'File read error: {e}')
            return jsonify({'error': str(e)}), 500

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(app.static_folder + '/' + path):
            return app.send_static_file(path)
        else:
            return app.send_static_file('index.html')

    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'ok',
            'timestamp': str(datetime.datetime.now()), # datetime needed
            'environment': Config.NODE_ENV
        })

    @app.errorhandler(404)
    def page_not_found(e):
        return jsonify({
            'status': 'error',
            'message': 'Endpoint not found'
        }), 404

    return app


if __name__ == '__main__':
    app = create_app()
    print(f"🚀 MITR SOS Backend running on port {Config.PORT}")
    print(f"Environment: {Config.NODE_ENV}")
    app.run(port=int(Config.PORT or 5000), debug=(Config.NODE_ENV == 'development'))
