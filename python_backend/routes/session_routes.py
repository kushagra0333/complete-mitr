from flask import Blueprint
from controllers import session_controller
from middlewares.auth import auth_required
from middlewares.device_auth import device_auth_required
from middlewares.validate import validate
from validations.session_validation import (
    StartTriggerSchema, AddCoordinatesSchema, StopTriggerSchema
)

session_bp = Blueprint('session', __name__)

# Device endpoints (mapped in deviceRoutes too, but Node sessionRoutes also has them)
session_bp.add_url_rule('/start', view_func=device_auth_required(validate(StartTriggerSchema())(session_controller.start_trigger)), methods=['POST'])
session_bp.add_url_rule('/coordinates', view_func=device_auth_required(validate(AddCoordinatesSchema())(session_controller.add_coordinates)), methods=['POST'])
session_bp.add_url_rule('/stop', view_func=device_auth_required(validate(StopTriggerSchema())(session_controller.stop_trigger)), methods=['POST'])

# User endpoints
session_bp.add_url_rule('/history', view_func=auth_required(session_controller.get_session_history), methods=['GET'])
session_bp.add_url_rule('/active', view_func=auth_required(session_controller.get_active_session), methods=['GET']) # Node: getActiveSessions
session_bp.add_url_rule('/<session_id>', view_func=auth_required(session_controller.get_session_details), methods=['GET']) # Missing impl
session_bp.add_url_rule('/status/<device_id>', view_func=auth_required(session_controller.get_session_status), methods=['GET']) # Missing impl
