from flask import request, jsonify
from datetime import datetime
from models.User import User
from models.Device import Device
from models.TriggerSession import TriggerSession
from utils.api_error import ApiError
from utils.api_response import ApiResponse

def create_device():
    try:
        data = request.get_json()
        device_id = data.get('deviceId')
        device_password = data.get('devicePassword')

        if not device_id or not device_password:
             raise ApiError(400, 'Device ID and password are required')

        existing_device = Device.findOne({"deviceId": device_id})
        if existing_device:
             raise ApiError(400, 'Device ID already exists')

        device = Device(
            deviceId=device_id,
            devicePassword=device_password,
            emergencyContacts=[],
            triggerWords=[],
            isTriggered=False
        )
        device.save()

        return ApiResponse(201, {
            "success": True,
            "message": 'Device created successfully',
            "device": {
                "deviceId": device.deviceId,
                "createdAt": getattr(device, 'createdAt', None)
            }
        }).to_response()

    except ApiError as e:
        return jsonify({"success": False, "message": e.message}), e.status_code
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def link_device():
    try:
        data = request.get_json()
        device_id = data.get('deviceId')
        device_password = data.get('devicePassword')
        
        user = getattr(request, 'user', None)
        if not user: raise ApiError(401, "Unauthorized")
        
        user_id = user._id

        if not device_id or not device_password:
            raise ApiError(400, 'Device ID and password are required')

        trimmed_device_id = device_id.strip()
        trimmed_device_password = device_password.strip()

        device = Device.findOne({"deviceId": trimmed_device_id})
        if not device:
            raise ApiError(404, 'Device not found')

        is_match = device.compare_password(trimmed_device_password)
        if not is_match:
            raise ApiError(401, 'Invalid device password')

        if hasattr(device, 'ownerId') and device.ownerId and str(device.ownerId) != str(user_id):
            raise ApiError(400, 'Device already linked to another user')

        if not hasattr(device, 'ownerId') or not device.ownerId:
            device.ownerId = user_id
            device.save()

        if trimmed_device_id not in getattr(user, 'deviceIds', []):
            user.deviceIds = getattr(user, 'deviceIds', []) + [trimmed_device_id]
            user.save()

        return ApiResponse(200, {
            "success": True,
            "message": 'Device linked successfully',
            "deviceId": trimmed_device_id,
            "user": {
                "id": user._id,
                "userID": user.userID,
                "email": user.email,
                "deviceIds": user.deviceIds
            }
        }).to_response()

    except ApiError as e:
        return jsonify({"success": False, "message": e.message}), e.status_code
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def get_current_location(device_id):
    session = TriggerSession.findOne({"deviceId": device_id, "status": "active"})
    if not session or not hasattr(session, 'coordinates') or not session.coordinates:
        return None
    return session.coordinates[-1]

def get_device_info(device_id=None):
    try:
        if not device_id:
            device_id = request.args.get('deviceId')
            
        user = getattr(request, 'user', None)
        if not user: raise ApiError(401, "Unauthorized")

        if not device_id:
            raise ApiError(400, "Device ID is required")
            
        device = Device.findOne({"deviceId": device_id, "ownerId": user._id})
        if not device:
            raise ApiError(404, 'Device not found')

        current_location = None
        if getattr(device, 'isTriggered', False):
             current_location = get_current_location(device_id)

        return ApiResponse(200, {
            "success": True,
            "device": {
                "id": device._id,
                "deviceId": device.deviceId,
                "emergencyContacts": getattr(device, 'emergencyContacts', []),
                "triggerWords": getattr(device, 'triggerWords', []),
                "isTriggered": getattr(device, 'isTriggered', False),
                "lastActive": getattr(device, 'lastActive', None),
                "currentLocation": current_location
            }
        }).to_response()
        
    except ApiError as e:
        return jsonify({"success": False, "message": e.message}), e.status_code
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def update_emergency_contacts(device_id=None):
    try:
        data = request.get_json()
        emergency_contacts = data.get('emergencyContacts')
        
        user = getattr(request, 'user', None)
        if not user: raise ApiError(401, "Unauthorized")
        
        if not device_id: raise ApiError(400, "Device ID required")

        if not emergency_contacts or not isinstance(emergency_contacts, list):
             raise ApiError(400, 'Emergency contacts array is required')
             
        for contact in emergency_contacts:
             if not contact.get('name') or not contact.get('phone'):
                  raise ApiError(400, 'Each contact must have name and phone')
                  
        device = Device.findOne({"deviceId": device_id, "ownerId": user._id})
        if not device: raise ApiError(404, 'Device not found')
             
        device.emergencyContacts = emergency_contacts
        device.save()
        
        return ApiResponse(200, {
             "success": True,
             "message": 'Emergency contacts updated successfully',
             "emergencyContacts": device.emergencyContacts
        }).to_response()

    except ApiError as e:
        return jsonify({"success": False, "message": e.message}), e.status_code
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def update_trigger_words(device_id=None):
    try:
        data = request.get_json()
        trigger_words = data.get('triggerWords')
        
        user = getattr(request, 'user', None)
        if not user: raise ApiError(401, "Unauthorized")
        
        if not device_id: raise ApiError(400, "Device ID required")
             
        if not trigger_words or not isinstance(trigger_words, list):
             raise ApiError(400, "Trigger words array required")
             
        device = Device.findOne({"deviceId": device_id, "ownerId": user._id})
        if not device: raise ApiError(404, 'Device not found')
             
        device.triggerWords = trigger_words
        device.save()
        
        return ApiResponse(200, {
             "success": True,
             "message": 'Trigger words updated successfully',
             "triggerWords": device.triggerWords
        }).to_response()

    except ApiError as e:
        return jsonify({"success": False, "message": e.message}), e.status_code
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def get_public_emergency_contacts(device_id=None):
    try:
        if not device_id:
             raise ApiError(400, 'Device ID is required')

        device = Device.findOne({"deviceId": device_id})

        if not device:
            raise ApiError(404, 'Device not found')

        # Return only phone numbers
        contacts = [{"phone": c.get('phone')} for c in getattr(device, 'emergencyContacts', []) if c.get('phone')]

        return ApiResponse(200, {
            "success": True,
            "emergencyContacts": contacts
        }).to_response()
    except ApiError as e:
        return jsonify({"success": False, "message": e.message}), e.status_code
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500
