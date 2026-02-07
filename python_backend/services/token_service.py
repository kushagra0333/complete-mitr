import jwt
import datetime
from config.env import Config

def generate_auth_token(user_id):
    # Parsing '7d' to seconds/datetime manually or assuming config has sane values.
    # JWT library handles 'exp' as epoch usually.
    # For now simplicity: default 7 days if string parsing fails or complex logic needs extracting.
    
    expires_in = Config.JWT_EXPIRES_IN
    delta = timedelta(days=7) # Default
    
    if isinstance(expires_in, str):
        if expires_in.endswith('d'):
            delta = datetime.timedelta(days=int(expires_in[:-1]))
        elif expires_in.endswith('h'):
            delta = datetime.timedelta(hours=int(expires_in[:-1]))
        elif expires_in.endswith('m'):
            delta = datetime.timedelta(minutes=int(expires_in[:-1]))
            
    payload = {
        'id': str(user_id),
        'exp': datetime.datetime.utcnow() + delta
    }
    
    return jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')

def verify_token(token):
    try:
        return jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
    except Exception:
        return None
