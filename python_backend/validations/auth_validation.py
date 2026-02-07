from marshmallow import Schema, fields, validate, validates_schema, ValidationError

class SignupInitiateSchema(Schema):
    userID = fields.String(required=True, validate=validate.Length(min=3, max=20))
    email = fields.Email(required=True)
    name = fields.String(required=True, validate=validate.Length(min=2, max=50))

class SignupCompleteSchema(Schema):
    userID = fields.String(required=True, validate=validate.Length(min=3, max=20))
    email = fields.Email(required=True)
    otp = fields.String(required=True, validate=validate.Length(equal=6))
    name = fields.String(required=True, validate=validate.Length(min=2, max=50))
    password = fields.String(required=True, validate=validate.Length(min=6))
    confirmPassword = fields.String(required=True)

    @validates_schema
    def validate_confirm_password(self, data, **kwargs):
        if data['password'] != data['confirmPassword']:
            raise ValidationError("Passwords do not match", "confirmPassword")

class LoginSchema(Schema):
    userID = fields.String(required=True, validate=validate.Length(min=3, max=30))
    password = fields.String(required=True, validate=validate.Length(min=6))

class ForgotPasswordSchema(Schema):
    email = fields.Email(required=True)

class ResetPasswordSchema(Schema):
    email = fields.Email(required=True)
    otp = fields.String(required=True, validate=validate.Length(equal=6))
    newPassword = fields.String(required=True, validate=validate.Length(min=6))
    confirmPassword = fields.String(required=True)

    @validates_schema
    def validate_confirm_password(self, data, **kwargs):
        if data['newPassword'] != data['confirmPassword']:
            raise ValidationError("Passwords do not match", "confirmPassword")

class UpdateUserInfoSchema(Schema):
    name = fields.String(validate=validate.Length(min=2, max=50))
    userID = fields.String(validate=validate.Length(min=3, max=20))

    @validates_schema
    def validate_at_least_one(self, data, **kwargs):
        if not data.get('name') and not data.get('userID'):
            raise ValidationError("At least one of 'name' or 'userID' is required")
