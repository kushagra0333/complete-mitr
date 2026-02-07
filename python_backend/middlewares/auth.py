from functools import wraps
from flask import request, g, jsonify
from models.User import User
from services import token_service
from utils.api_error import ApiError

def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            token = None
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
            
            if not token:
                raise ApiError(401, 'Authentication required')

            # We need to ensure verify_token is available in token_service
            decoded = token_service.verify_token(token)
            
            # verify_token might return None or raise error if invalid
            if not decoded:
                 raise ApiError(401, 'Invalid token')

            user = User.findOne({
                '_id': decoded.get('id'),
                'tokens.token': token
            })

            if not user:
                raise ApiError(401, 'Invalid token')

            # Store user in g (flask global) or request
            # g.user is standard in Flask, but sometimes request.user is used for ease of access
            g.user = user
            g.token = token
            # Also attach to request for compatibility with converted controllers that might use request.user
            request.user = user 
            request.token = token

        except ApiError as e:
            return jsonify({'success': False, 'message': e.message}), e.status_code
        except Exception as e:
            return jsonify({'success': False, 'message': 'Authentication error'}), 401

        return f(*args, **kwargs)
    return decorated_function
