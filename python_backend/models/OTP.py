from .Model import Model
from datetime import datetime

class OTP(Model):
    collection_name = 'otps'
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not hasattr(self, 'createdAt'):
            self.createdAt = datetime.now()
            
    # MongoDB TTL index should be set manually in DB or via a setup script.
    # We can't easily enforce schema indexes in simple python class without an ODM like mongoengine or beanie.
    # For now, we rely on existing DB or manual index creation.
