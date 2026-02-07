from marshmallow import Schema, fields, validate, validates_schema, ValidationError

class ChangePasswordSchema(Schema):
    currentPassword = fields.String(required=True)
    newPassword = fields.String(required=True, validate=validate.Length(min=6))
    confirmPassword = fields.String(required=True)

    @validates_schema
    def validate_confirm_password(self, data, **kwargs):
        if data['newPassword'] != data['confirmPassword']:
            raise ValidationError("Passwords do not match", "confirmPassword")
