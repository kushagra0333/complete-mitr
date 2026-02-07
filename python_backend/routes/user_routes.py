from flask import Blueprint
from controllers import user_controller, device_controller
from middlewares.auth import auth_required
from middlewares.validate import validate
from validations.user_validation import ChangePasswordSchema
from validations.device_validation import LinkDeviceSchema, UpdateEmergencyContactsSchema, UpdateTriggerWordsSchema

user_bp = Blueprint('user', __name__)

user_bp.add_url_rule('/profile', view_func=auth_required(user_controller.get_profile), methods=['GET'])
user_bp.add_url_rule('/change-password', view_func=auth_required(validate(ChangePasswordSchema())(user_controller.change_password)), methods=['POST'])
user_bp.add_url_rule('/account', view_func=auth_required(user_controller.delete_account), methods=['DELETE'])

# Duplicate logic routes to match Node structure
# /device/link maps to userController.linkDevice or deviceController.linkDevice?
# Node userRoutes.js imports linkDevice from userController.js (which imports from deviceController usually or implements same)
# Node userController imports from deviceController? I verified userController.js and it has linkDevice impl.
# It is duplicated logic. I'll point to device_controller to avoid bugs, but path is /device/link
user_bp.add_url_rule('/device/link', view_func=auth_required(validate(LinkDeviceSchema())(device_controller.link_device)), methods=['POST'])
user_bp.add_url_rule('/device', view_func=auth_required(device_controller.get_device_info), methods=['GET']) # Node maps to getDevice
user_bp.add_url_rule('/device/emergency-contacts', view_func=auth_required(validate(UpdateEmergencyContactsSchema())(device_controller.update_emergency_contacts)), methods=['PUT'])
user_bp.add_url_rule('/device/trigger-words', view_func=auth_required(validate(UpdateTriggerWordsSchema())(device_controller.update_trigger_words)), methods=['PUT'])
