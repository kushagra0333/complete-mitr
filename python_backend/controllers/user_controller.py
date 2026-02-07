from flask import request, jsonify
from models.User import User
from models.Device import Device
from models.TriggerSession import TriggerSession
from utils.api_error import ApiError
from utils.api_response import ApiResponse

def get_profile():
    try:
        user = getattr(request, 'user', None)
        if not user: raise ApiError(401, "Unauthorized")

        devices = Device.find({"ownerId": user._id})
        
        device_list = []
        if devices:
            for device in devices:
                device_list.append({
                    "deviceId": device.deviceId,
                    "isTriggered": getattr(device, 'isTriggered', False),
                    "lastActive": getattr(device, 'lastActive', None)
                })

        return ApiResponse(200, {
            "user": {
                "id": user._id,
                "userID": user.userID,
                "name": user.name,
                "email": user.email,
                "verified": user.verified,
                "deviceIds": getattr(user, 'deviceIds', []),
                "createdAt": getattr(user, 'createdAt', None),
                "devices": device_list
            }
        }).to_response()
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def update_profile():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        
        user = getattr(request, 'user', None)
        if not user: raise ApiError(401, "Unauthorized")

        if name: user.name = name
        if email: user.email = email
        user.save()

        return ApiResponse(200, {
            "message": 'Profile updated successfully',
            "user": {
                "id": user._id,
                "userID": user.userID,
                "name": user.name,
                "email": user.email,
                "deviceIds": getattr(user, 'deviceIds', [])
            }
        }).to_response()
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def change_password():
    try:
        data = request.get_json()
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')
        
        user = getattr(request, 'user', None)
        if not user: raise ApiError(401, "Unauthorized")
        
        # User model in python caches password in object if loaded, or we might need to fetch it
        # If Middleware only fetched strict fields, password might be missing if it was select:False
        # My Model implementation defaults to fetching all provided fields. 
        # But User defined password as select:False in Node. In Python implementation of Model.find, it fetches all.
        # But if password was not in projection...
        # Let's verify password.
        
        is_match = user.compare_password(current_password)
        if not is_match:
             raise ApiError(401, 'Current password is incorrect')
             
        user.password = new_password
        # Save handles hashing
        user.save()
        
        return ApiResponse(200, {
             "message": 'Password changed successfully'
        }).to_response()

    except ApiError as e:
        return jsonify({"success": False, "message": e.message}), e.status_code
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def delete_account():
    # Only if route exists
    try:
        user = getattr(request, 'user', None)
        if not user: raise ApiError(401, "Unauthorized")
        
        user_id = user._id
        
        # Delete related data
        User.deleteOne({"_id": user_id})
        Device.deleteMany({"ownerId": user_id})
        TriggerSession.deleteMany({"userId": user_id})
        
        return ApiResponse(200, {
             "message": 'Account and all associated data deleted successfully'
        }).to_response()
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def unlink_device(device_id):
    try:
        # route /device/<device_id> DELETE
        user = getattr(request, 'user', None)
        if not user: raise ApiError(401, "Unauthorized")
        
        device = Device.findOne({"deviceId": device_id, "ownerId": user._id})
        if not device:
             raise ApiError(404, 'Device not found')
             
        # Unset ownerId
        # device.ownerId = None # Logic for update:
        # Device.findOneAndUpdate({"deviceId": device_id}, {"$unset": {"ownerId": ""}}) in Node
        # My Model doesn't support $unset update operator directly in save().
        # I can use findOneAndUpdate directly from class.
        
        Device.findOneAndUpdate({"deviceId": device_id}, {"$unset": {"ownerId": ""}})
        
        # Pull from user
        # User.findByIdAndUpdate(userId, { $pull: { deviceIds: deviceId } })
        
        User.findOneAndUpdate({"_id": user._id}, {"$pull": {"deviceIds": device_id}})
        
        return ApiResponse(200, {
             "message": 'Device removed successfully'
        }).to_response()

    except ApiError as e:
        return jsonify({"success": False, "message": e.message}), e.status_code
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500
