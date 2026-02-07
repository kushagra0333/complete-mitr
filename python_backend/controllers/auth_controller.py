from flask import request, jsonify
from datetime import datetime, timedelta
import os

from models.User import User
from models.OTP import OTP
from services import otp_service, token_service, email_service
from utils.api_error import ApiError
from utils.api_response import ApiResponse

# Helper for validation
def validate_signup_initiate(data):
    if not data.get('userID') or len(data['userID']) < 3 or len(data['userID']) > 20:
        return "Invalid userID"
    if not data.get('email') or '@' not in data['email']:
        return "Invalid email"
    if not data.get('name') or len(data['name']) < 2 or len(data['name']) > 50:
        return "Invalid name"
    return None

def signup_initiate():
    try:
        data = request.get_json()
        error = validate_signup_initiate(data)
        if error:
            return jsonify({"success": False, "message": error}), 400

        user_id = data['userID']
        email = data['email']
        name = data['name']

        existing_user = User.findOne({
            "$or": [{"userID": user_id}, {"email": email}]
        })

        if existing_user:
            return jsonify({
                "success": False,
                "message": 'User already exists with this userID or email'
            }), 400

        otp = otp_service.send_verification_otp(email)

        new_otp = OTP(email=email, otp=otp)
        new_otp.save()

        response_data = {
            "success": True,
            "message": 'OTP sent to email successfully. Proceed to complete signup.',
            "tempUser": { "userID": user_id, "email": email, "name": name },
        }
        
        if os.getenv('NODE_ENV') == 'development':
            response_data["otp"] = otp

        return jsonify(response_data), 200

    except Exception as error:
        print(f'Signup Initiate Error: {error}')
        return jsonify({
            "success": False,
            "message": 'Server error during signup initiation'
        }), 500

def signup_complete():
    try:
        data = request.get_json()
        
        # Basic Validation
        required_fields = ['userID', 'email', 'otp', 'name', 'password', 'confirmPassword']
        for field in required_fields:
            if not data.get(field):
                raise ApiError(400, f"{field} is required")
        
        if data['password'] != data['confirmPassword']:
             raise ApiError(400, "Passwords do not match")
             
        user_id = data['userID']
        email = data['email']
        otp = data['otp']
        name = data['name']
        password = data['password']

        existing_user = User.findOne({
            "$or": [{"userID": user_id}, {"email": email}]
        })

        if existing_user:
            raise ApiError(400, 'User already exists with this userID or email')

        otp_record = OTP.findOne({"email": email})
        
        if not otp_record:
            raise ApiError(400, 'OTP not found or expired')

        is_otp_valid = otp_record.otp == otp
        
        if hasattr(otp_record, 'createdAt') and isinstance(otp_record.createdAt, datetime):
             is_otp_expired = otp_record.createdAt < datetime.utcnow() - timedelta(minutes=10)
        else:
             is_otp_expired = False 

        if not is_otp_valid or is_otp_expired:
             raise ApiError(400, 'Invalid or expired OTP')

        user = User(
            userID=user_id,
            email=email,
            name=name,
            password=password,
            verified=True
        )
        user.save()

        token = token_service.generate_auth_token(user._id)
        
        user.tokens = getattr(user, 'tokens', []) + [{"token": token}]
        user.save()

        OTP.deleteOne({"_id": otp_record._id})

        user_data = {
            "id": user._id,
            "userID": user.userID,
            "email": user.email,
            "name": user.name,
            "verified": user.verified
        }
        
        return jsonify({
            "success": True,
            "message": 'User registered successfully',
            "data": {
                "token": token,
                "user": user_data
            }
        }), 201

    except ApiError as e:
        return jsonify({"success": False, "message": e.message}), e.status_code
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def login():
    try:
        data = request.get_json()
        user_id = data.get('userID')
        password = data.get('password')

        if not user_id or not password:
             raise ApiError(400, "userID and password are required")

        user = User.findOne({"userID": user_id}) 
        if not user:
            raise ApiError(401, 'Invalid credentials')
        
        if not getattr(user, 'verified', False):
            raise ApiError(403, 'Account not verified')

        is_match = user.compare_password(password)
        if not is_match:
            raise ApiError(401, 'Invalid credentials')

        token = token_service.generate_auth_token(user._id)
        
        user.tokens = getattr(user, 'tokens', []) + [{"token": token}]
        user.save()

        return ApiResponse(200, {
            "user": {
                "id": user._id,
                "userID": user.userID,
                "email": user.email,
                "name": user.name,
                "verified": user.verified,
                "deviceIds": getattr(user, 'deviceIds', []),
            },
            "token": token
        }).to_response()

    except ApiError as e:
        return jsonify({"success": False, "message": e.message}), e.status_code
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email: raise ApiError(400, "Email required")
        
        user = User.findOne({"email": email})
        if not user: raise ApiError(404, "User not found")
        
        otp = otp_service.generate_otp()
        otp_expires = otp_service.get_otp_expiry()
        
        user.otp = otp
        user.otpExpires = otp_expires
        user.save()
        
        # email_service is sync/async? 
        # email_service.send_password_reset_email is likely synchronous wrapper or we need to check
        # Assuming sync for now or we just call it
        email_service.send_password_reset_email(email, otp)
        
        return ApiResponse(200, {
             "message": 'Password reset OTP sent to email',
             "email": email
        }).to_response()

    except ApiError as e:
        return jsonify({"success": False, "message": e.message}), e.status_code
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def reset_password():
    try:
        data = request.get_json()
        email = data.get('email')
        otp = data.get('otp')
        new_password = data.get('newPassword')
        confirm_password = data.get('confirmPassword')
        
        if not email or not otp or not new_password or not confirm_password:
             raise ApiError(400, "All fields required")
             
        if new_password != confirm_password:
             raise ApiError(400, "Passwords do not match")
             
        user = User.findOne({"email": email})
        if not user: raise ApiError(404, "User not found")
        
        # Check OTP
        if getattr(user, 'otp', None) != otp:
             raise ApiError(400, "Invalid OTP")
             
        if getattr(user, 'otpExpires', datetime.min) < datetime.utcnow():
             raise ApiError(400, "Expired OTP")
             
        user.password = new_password
        user.otp = None
        user.otpExpires = None
        user.save()
        
        return ApiResponse(200, {
             "message": 'Password reset successfully'
        }).to_response()

    except ApiError as e:
        return jsonify({"success": False, "message": e.message}), e.status_code
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def logout():
    try:
        user = getattr(request, 'user', None)
        token = getattr(request, 'token', None)
        
        if user and token:
             user.tokens = [t for t in getattr(user, 'tokens', []) if t.get('token') != token]
             user.save()
             
        return ApiResponse(200, {
             "message": 'Logged out successfully'
        }).to_response()
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def logout_all():
    try:
        user = getattr(request, 'user', None)
        
        if user:
             user.tokens = []
             user.save()
             
        return ApiResponse(200, {
             "message": 'Logged out from all devices'
        }).to_response()
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500
