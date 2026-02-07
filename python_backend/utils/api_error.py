class ApiError(Exception):
    def __init__(self, status_code, message, errors=None, stack=None):
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.success = False
        self.errors = errors
        
        # In Python, stack trace is usually handled by logging, but we can store it if passed
        self.stack = stack

    def to_dict(self):
        return {
            "success": self.success,
            "message": self.message,
            "errors": self.errors,
            # "stack": self.stack # Usually not sent to prod client
        }
