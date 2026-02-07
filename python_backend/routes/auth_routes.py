from flask import Blueprint
from controllers import auth_controller, user_controller
from middlewares.auth import auth_required
from middlewares.validate import validate
from validations.auth_validation import (
    SignupInitiateSchema, SignupCompleteSchema, LoginSchema,
    ForgotPasswordSchema, ResetPasswordSchema, UpdateUserInfoSchema
)

auth_bp = Blueprint('auth', __name__)

auth_bp.add_url_rule('/signup/initiate', view_func=validate(SignupInitiateSchema())(auth_controller.signup_initiate), methods=['POST'])
auth_bp.add_url_rule('/signup/complete', view_func=validate(SignupCompleteSchema())(auth_controller.signup_complete), methods=['POST'])
auth_bp.add_url_rule('/login', view_func=validate(LoginSchema())(auth_controller.login), methods=['POST'])
auth_bp.add_url_rule('/forgot-password', view_func=validate(ForgotPasswordSchema())(auth_controller.forgot_password), methods=['POST'])
auth_bp.add_url_rule('/reset-password', view_func=validate(ResetPasswordSchema())(auth_controller.reset_password), methods=['POST'])
auth_bp.add_url_rule('/logout', view_func=auth_required(auth_controller.logout), methods=['POST'])
auth_bp.add_url_rule('/logout-all', view_func=auth_required(auth_controller.logout_all), methods=['POST'])
auth_bp.add_url_rule('/user/update', view_func=auth_required(validate(UpdateUserInfoSchema())(user_controller.update_profile)), methods=['PUT'])
