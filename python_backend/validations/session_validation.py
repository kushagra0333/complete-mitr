from marshmallow import Schema, fields, validate

class CoordinateSchema(Schema):
    latitude = fields.Float(required=True, validate=validate.Range(min=-90, max=90))
    longitude = fields.Float(required=True, validate=validate.Range(min=-180, max=180))
    accuracy = fields.Float(validate=validate.Range(min=0))
    speed = fields.Float(validate=validate.Range(min=0))

class StartTriggerSchema(Schema):
    deviceId = fields.String(required=True)
    initialLocation = fields.Nested(CoordinateSchema)

class AddCoordinatesSchema(Schema):
    deviceId = fields.String(required=True)
    latitude = fields.Float(required=True, validate=validate.Range(min=-90, max=90))
    longitude = fields.Float(required=True, validate=validate.Range(min=-180, max=180))
    accuracy = fields.Float(validate=validate.Range(min=0))
    speed = fields.Float(validate=validate.Range(min=0))

class StopTriggerSchema(Schema):
    deviceId = fields.String(required=True)
    manualStop = fields.Boolean(load_default=True)
