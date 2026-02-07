import json
from twilio.rest import Client
from config.env import Config

class SMSService:
    def __init__(self):
        self.client = None
        self.from_number = None
        if Config.TWILIO_ACCOUNT_SID and Config.TWILIO_AUTH_TOKEN:
            self.client = Client(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)
            self.from_number = self.clean_number(Config.TWILIO_PHONE_NUMBER)

    def clean_number(self, num):
        if not num: return None
        # Remove zero-width chars etc.
        # Python replacement for regex /[\u202A...]/g
        # Simplified for now
        return num.strip()

    def format_phone_number(self, phone):
        if not phone: return None
        # Implement logic similar to Node.js version
        return phone # Placeholder for complex logic

    def send_emergency_sms(self, contacts, device_id):
        # We need async here if we want to match node logic, but python requests are sync unless using aiohttp.
        # Twilio python client is blocking by default.
        # We can simulate async or just run blocking for now as Flask handlers are usually threaded.
        
        if not contacts:
            print('No contacts configured')
            return []

        message_text = f"""🚨 EMERGENCY ALERT from MITR Device {device_id}
Help needed! Click to see location: https://mitr-beta.vercel.app
This is an automated alert from MITR SOS system."""

        results = []
        for contact in contacts:
            try:
                to_number = self.format_phone_number(contact['phone'])
                if not self.client:
                    print("Twilio client not initialized")
                    continue
                    
                message = self.client.messages.create(
                    body=message_text,
                    from_=self.from_number,
                    to=to_number
                )
                results.append({
                    "contactName": contact['name'],
                    "status": "sent",
                    "sid": message.sid
                })
            except Exception as e:
                print(f"Failed SMS to {contact['name']}: {e}")
                results.append({
                    "contactName": contact['name'],
                    "status": "failed",
                    "error": str(e)
                })
        return results

sms_service = SMSService()
