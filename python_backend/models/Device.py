import bcrypt
from .Model import Model

class Device(Model):
    collection_name = 'devices'

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not hasattr(self, 'emergencyContacts'):
            self.emergencyContacts = []
        if not hasattr(self, 'triggerWords'):
            self.triggerWords = []
        if not hasattr(self, 'locationUpdateInterval'):
            self.locationUpdateInterval = 30
        if not hasattr(self, 'isTriggered'):
             self.isTriggered = False

    def save(self):
         if hasattr(self, 'devicePassword') and self.devicePassword:
            if len(self.devicePassword) != 60:
                self.devicePassword = bcrypt.hashpw(self.devicePassword.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
         return super().save()

    def compare_password(self, candidate_password):
        if not hasattr(self, 'devicePassword'):
            return False
        return bcrypt.checkpw(candidate_password.encode('utf-8'), self.devicePassword.encode('utf-8'))
        
    # Alias
    async def comparePassword(self, candidate_password):
        return self.compare_password(candidate_password)
