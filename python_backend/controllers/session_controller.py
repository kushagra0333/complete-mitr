from flask import request, jsonify
from datetime import datetime
from models.User import User
from models.Device import Device
from models.TriggerSession import TriggerSession
from utils.api_error import ApiError
from utils.api_response import ApiResponse
from services.sms_service import sms_service

active_sessions = {}

def start_trigger():
    try:
        data = request.get_json()
        device_id = data.get('deviceId')
        initial_location = data.get('initialLocation')

        if not device_id: raise ApiError(400, "Device ID is required")

        device = Device.findOne({"deviceId": device_id})
        if not device: raise ApiError(404, "Device not found")

        if getattr(device, 'currentSession', None):
             old_session = TriggerSession.findOne({"_id": device.currentSession})
             if old_session and getattr(old_session, 'status', None) == 'active':
                  raise ApiError(400, "Device already has an active session")

        owner_id = getattr(device, 'ownerId', None)

        session = TriggerSession(
            deviceId=device_id,
            userId=owner_id,
            status="active",
            startTime=datetime.utcnow(),
            triggerStartLocation=initial_location,
            coordinates=[]
        )
        session.save()

        device.currentSession = session._id
        device.lastActive = datetime.utcnow()
        device.isTriggered = True
        device.save()

        active_sessions[device_id] = {
             "sessionId": str(session._id),
             "lastUpdate": datetime.utcnow(),
             "coordinatesCount": 0
        }

        emergency_contacts = getattr(device, 'emergencyContacts', [])
        if emergency_contacts:
             try:
                 sms_service.send_emergency_sms(emergency_contacts, device_id)
             except Exception as e:
                 print(f"Failed to send SMS: {e}")

        return ApiResponse(201, {
            "message": "Trigger session started",
            "sessionId": session._id,
            "startTime": session.startTime,
            "triggerStartLocation": session.triggerStartLocation,
            "smsSent": len(emergency_contacts) > 0
        }).to_response()

    except ApiError as e:
        return jsonify({"success": False, "message": e.message}), e.status_code
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def add_coordinates():
    try:
        data = request.get_json()
        device_id = data.get('deviceId')
        lat = data.get('latitude')
        lng = data.get('longitude')
        accuracy = data.get('accuracy')
        speed = data.get('speed')

        if not device_id or lat is None or lng is None:
             raise ApiError(400, 'Device ID and coordinates are required')

        device = Device.findOne({"deviceId": device_id})
        current_session_id = getattr(device, 'currentSession', None)
        
        if not device or not current_session_id:
             raise ApiError(404, 'No active session found for device')

        session = TriggerSession.findOne({"_id": current_session_id, "status": "active"})
        if not session:
             raise ApiError(404, 'No active session found for device')

        new_coordinate = {
             "latitude": lat,
             "longitude": lng,
             "accuracy": accuracy,
             "speed": speed,
             "timestamp": datetime.utcnow()
        }

        session.coordinates.append(new_coordinate)
        session.save()

        device.lastActive = datetime.utcnow()
        device.save()
        
        if device_id in active_sessions:
             active_sessions[device_id]['lastUpdate'] = datetime.utcnow()
             active_sessions[device_id]['coordinatesCount'] = len(session.coordinates)

        return ApiResponse(200, {
             "message": 'Coordinates added to session',
             "sessionId": session._id,
             "coordinatesCount": len(session.coordinates),
             "latestLocation": new_coordinate
        }).to_response()

    except ApiError as e:
        return jsonify({"success": False, "message": e.message}), e.status_code
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def stop_trigger():
    try:
        data = request.get_json()
        device_id = data.get('deviceId')
        manual_stop = data.get('manualStop', True)

        if not device_id: raise ApiError(400, 'Device ID is required')

        device = Device.findOne({"deviceId": device_id})
        current_session_id = getattr(device, 'currentSession', None)

        if not device or not current_session_id:
             raise ApiError(404, 'No active session found for device')

        session = TriggerSession.findOne({"_id": current_session_id, "status": "active"})
        if not session:
              raise ApiError(404, 'No active session found for device')
              
        session.status = "completed"
        session.endTime = datetime.utcnow()
        session.manualStop = manual_stop
        session.save()

        device.currentSession = None
        device.isTriggered = False
        device.lastActive = datetime.utcnow()
        device.save()
        
        if device_id in active_sessions:
             del active_sessions[device_id]

        duration = (session.endTime - session.startTime).total_seconds()

        return ApiResponse(200, {
             "message": 'Trigger session stopped',
             "sessionId": session._id,
             "startTime": session.startTime,
             "endTime": session.endTime,
             "coordinatesCount": len(session.coordinates),
             "duration": duration
        }).to_response()

    except ApiError as e:
        return jsonify({"success": False, "message": e.message}), e.status_code
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def get_session_history():
    try:
        user = getattr(request, 'user', None)
        if not user: raise ApiError(401, "Unauthorized")

        device_id = request.args.get('deviceId')
        limit = int(request.args.get('limit', 10))
        page = int(request.args.get('page', 1))
        
        query = {"userId": user._id}
        if device_id: query["deviceId"] = device_id
             
        skip = (page - 1) * limit
        sessions = TriggerSession.find(query, limit=limit, skip=skip, sort=[("startTime", -1)])
        total = TriggerSession.countDocuments(query)

        session_list = []
        for s in sessions:
             session_list.append({
                  "deviceId": s.deviceId,
                  "startTime": s.startTime,
                  "endTime": getattr(s, 'endTime', None),
                  "status": s.status,
                  "coordinatesCount": len(s.coordinates) if hasattr(s, 'coordinates') else 0,
                  "manualStop": getattr(s, 'manualStop', False)
             })

        return ApiResponse(200, {
             "sessions": session_list,
             "pagination": {
                  "total": total,
                  "page": page,
                  "limit": limit
             }
        }).to_response()
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def get_active_session():
    # mapped to /active (User)
    try:
        user = getattr(request, 'user', None)
        if not user: raise ApiError(401, "Unauthorized")
        
        # In Node getActiveSessions finds ALL active sessions for user.
        sessions = TriggerSession.find({"userId": user._id, "status": "active"})
        
        active_list = []
        for s in sessions:
             active_list.append({
                  "deviceId": s.deviceId,
                  "startTime": s.startTime,
                  "coordinates": s.coordinates,
                  "triggerStartLocation": getattr(s, 'triggerStartLocation', None)
             })

        return ApiResponse(200, {
             "activeSessions": active_list
        }).to_response()
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def get_session_details(session_id):
    try:
        user = getattr(request, 'user', None)
        if not user: raise ApiError(401, "Unauthorized")

        session = TriggerSession.findOne({"_id": session_id, "userId": user._id})
        if not session:
             raise ApiError(404, 'Session not found')

        duration = None
        if getattr(session, 'endTime', None):
             duration = (session.endTime - session.startTime).total_seconds()

        return ApiResponse(200, {
             "session": {
                  "id": session._id,
                  "deviceId": session.deviceId,
                  "startTime": session.startTime,
                  "endTime": getattr(session, 'endTime', None),
                  "status": session.status,
                  "coordinates": session.coordinates,
                  "triggerStartLocation": getattr(session, 'triggerStartLocation', None),
                  "manualStop": getattr(session, 'manualStop', False),
                  "duration": duration
             }
        }).to_response()
    except ApiError as e:
        return jsonify({"success": False, "message": e.message}), e.status_code
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500

def get_session_status(device_id):
    try:
        user = getattr(request, 'user', None)
        if not user: raise ApiError(401, "Unauthorized")

        device = Device.findOne({"deviceId": device_id, "ownerId": user._id})
        if not device:
             raise ApiError(404, 'Device not found')

        current_session_id = getattr(device, 'currentSession', None)
        if not current_session_id:
             return ApiResponse(200, { "isActive": False, "message": 'No active session' }).to_response()

        session = TriggerSession.findOne({"_id": current_session_id, "status": "active"})
        if not session:
             return ApiResponse(200, { "isActive": False, "message": 'No active session' }).to_response()

        last_update = None
        if session.coordinates:
             last_update = session.coordinates[-1]['timestamp']

        return ApiResponse(200, {
             "isActive": True,
             "sessionId": session._id,
             "startTime": session.startTime,
             "coordinatesCount": len(session.coordinates),
             "lastUpdate": last_update,
             # "updateInterval": device.locationUpdateInterval # If implemented
        }).to_response()
    except ApiError as e:
        return jsonify({"success": False, "message": e.message}), e.status_code
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500
