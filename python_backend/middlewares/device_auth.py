from functools import wraps
from flask import request, jsonify
from config.env import Config
from utils.api_error import ApiError

def device_auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            api_key = request.headers.get('x-api-key')
            
            if not api_key or api_key != Config.API_KEY:
                raise ApiError(401, 'Invalid API key')
                
        except ApiError as e:
            return jsonify({'success': False, 'message': e.message}), e.status_code
        except Exception:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
            
        return f(*args, **kwargs)
    return decorated_function
