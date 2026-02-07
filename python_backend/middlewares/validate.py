from functools import wraps
from flask import request, jsonify
from utils.api_error import ApiError

# validate expects a schema object that has a .validate(data) method 
# similar to Joi or marshmallow schemas.
def validate(schema):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                # Assuming schema has a validate method that returns error or raises exception
                # For Joi: { error, value } = schema.validate(data)
                # For basic python dict validation, we might need an adapter.
                
                # If using marshmallow: errors = schema.validate(request.get_json())
                # If errors: raise ...
                
                # Since we don't have a concrete validation library yet, 
                # we'll assume the schema object passed in has a validate method 
                # that accepts a dict and returns validated data or raises error.
                
                data = request.get_json() or {}
                
                if hasattr(schema, 'validate'):
                     # Mocking Joi-like behavior for now or just generic check
                     # In real implementation, we'd use Marshmallow or Pydantic
                     pass
                     
            except Exception as e:
                return jsonify({'success': False, 'message': str(e)}), 400
            return f(*args, **kwargs)
        return decorated_function
    return decorator
