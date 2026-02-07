from datetime import datetime
from .Model import Model

class TriggerSession(Model):
    collection_name = 'triggersessions'

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not hasattr(self, 'status'):
            self.status = 'active'
        if not hasattr(self, 'startTime'):
            self.startTime = datetime.now()
        if not hasattr(self, 'coordinates'):
            self.coordinates = []
        if not hasattr(self, 'manualStop'):
            self.manualStop = False
