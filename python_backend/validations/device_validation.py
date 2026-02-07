from marshmallow import Schema, fields, validate

class EmergencyContactSchema(Schema):
    name = fields.String(required=True)
    phone = fields.String(required=True)

class LocationSchema(Schema):
    lat = fields.Float(validate=validate.Range(min=-90, max=90))
    long = fields.Float(validate=validate.Range(min=-180, max=180))

class LinkDeviceSchema(Schema):
    deviceId = fields.String(required=True)
    devicePassword = fields.String(required=True)

class UpdateEmergencyContactsSchema(Schema):
    emergencyContacts = fields.List(fields.Nested(EmergencyContactSchema), required=True)

class UpdateTriggerWordsSchema(Schema):
    triggerWords = fields.List(fields.String(), required=True)

class StartTriggerSchema(Schema):
    deviceId = fields.String(required=True)
    initialLocation = fields.Nested(LocationSchema)

class AddCoordinatesSchema(Schema):
    deviceId = fields.String(required=True)
    lat = fields.Float(required=True, validate=validate.Range(min=-90, max=90))
    long = fields.Float(required=True, validate=validate.Range(min=-180, max=180))

class StopTriggerSchema(Schema):
    deviceId = fields.String(required=True)

class CreateDeviceSchema(Schema):
    deviceId = fields.String(required=True, validate=validate.Length(min=3))
    devicePassword = fields.String(required=True, validate=validate.Length(min=6))
