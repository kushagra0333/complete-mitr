from flask import jsonify

class ApiResponse:
    def __init__(self, status_code, data, message="Success"):
        self.status_code = status_code
        self.data = data
        self.message = message
        self.success = status_code < 400

    def to_response(self):
        response_body = {
            "success": self.success,
            "message": self.message,
            "data": self.data
        }
        return jsonify(response_body), self.status_code

# Helper function to match the usage `new ApiResponse(res, 200, ...)` if possible, 
# but in Flask we return the response object.
# The controller will likely use it as: 
# return ApiResponse(200, data, message).to_response()
