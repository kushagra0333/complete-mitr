from flask import Blueprint
from controllers import device_controller, session_controller
from middlewares.auth import auth_required
from middlewares.device_auth import device_auth_required
from middlewares.validate import validate
from validations.device_validation import (
    LinkDeviceSchema, UpdateEmergencyContactsSchema, UpdateTriggerWordsSchema,
    CreateDeviceSchema
)
from validations.session_validation import (
    StartTriggerSchema, AddCoordinatesSchema, StopTriggerSchema
)

device_bp = Blueprint('device', __name__)

# User endpoints
device_bp.add_url_rule('/link', view_func=auth_required(validate(LinkDeviceSchema())(device_controller.link_device)), methods=['POST'])
device_bp.add_url_rule('/<device_id>', view_func=auth_required(device_controller.get_device_info), methods=['GET'])
device_bp.add_url_rule('/<device_id>/emergency-contacts/public', view_func=device_controller.get_public_emergency_contacts, methods=['GET']) # Missing implement in controller
device_bp.add_url_rule('/<device_id>/emergency-contacts', view_func=auth_required(validate(UpdateEmergencyContactsSchema())(device_controller.update_emergency_contacts)), methods=['PUT'])
device_bp.add_url_rule('/<device_id>/trigger-words', view_func=auth_required(validate(UpdateTriggerWordsSchema())(device_controller.update_trigger_words)), methods=['PUT'])

# Device endpoints (Device Auth)
device_bp.add_url_rule('/trigger/start', view_func=device_auth_required(validate(StartTriggerSchema())(session_controller.start_trigger)), methods=['POST'])
device_bp.add_url_rule('/coordinates/add', view_func=device_auth_required(validate(AddCoordinatesSchema())(session_controller.add_coordinates)), methods=['POST'])
device_bp.add_url_rule('/trigger/stop', view_func=device_auth_required(validate(StopTriggerSchema())(session_controller.stop_trigger)), methods=['POST'])
device_bp.add_url_rule('/create', view_func=device_auth_required(validate(CreateDeviceSchema())(device_controller.create_device)), methods=['POST'])
