import bcrypt
from .Model import Model

class User(Model):
    collection_name = 'users'

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Set defaults if not present
        if not hasattr(self, 'verified'):
            self.verified = False
        if not hasattr(self, 'deviceIds'):
            self.deviceIds = []
        if not hasattr(self, 'tokens'):
            self.tokens = []

    def save(self):
        # Handle password hashing
        if hasattr(self, 'password') and self.password and not self.password.startswith(b'$2b$'.decode('utf-8')) and not self.password.startswith('$2b$'):
            # Check if it's already hashed (mock check, real world needs better state tracking)
            # In Mongoose, isModified check is used. Here, we assume if we are saving and it looks like plain text...
            # A better way is to use a flag or method `set_password`. 
            # For this conversion, we'll hash if it doesn't look like a bcrypt hash.
            # standard bcrypt hash is 60 chars.
            if len(self.password) != 60: 
                self.password = bcrypt.hashpw(self.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        return super().save()

    def compare_password(self, candidate_password):
        if not hasattr(self, 'password'):
            return False
        return bcrypt.checkpw(candidate_password.encode('utf-8'), self.password.encode('utf-8'))

    # Helper alias to match JS code where possible, or update controller to use compare_password
    async def comparePassword(self, candidate_password):
        # In Python we don't need async for bcrypt usually as it's CPU bound, but controllers are written with async pattern in mind conceptually?
        # Actually existing controllers call `await user.comparePassword(password)`
        # But in Flask sync handlers, we don't await. 
        # I should update controllers to remove await for this if I convert them to sync Flask views.
        # My converted controllers in step 92 DO NOT use await for compare_password (I commented it out or mocked it).
        return self.compare_password(candidate_password)
