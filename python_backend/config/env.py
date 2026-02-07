import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PORT = int(os.getenv('PORT', 5000))
    MONGODB_URI = os.getenv('MONGODB_URI')
    JWT_SECRET = os.getenv('JWT_SECRET')
    JWT_EXPIRES_IN = os.getenv('JWT_EXPIRES_IN', '7d')

    API_KEY = os.getenv('API_KEY')
    RESEND_API_KEY = os.getenv('RESEND_API_KEY')
    RESEND_FROM_NAME = os.getenv('RESEND_FROM_NAME', "MITR SOS")
    RESEND_FROM_ADDRESS = os.getenv('RESEND_FROM_ADDRESS', "onboarding@resend.dev")
    RESEND_FROM_EMAIL = f"{RESEND_FROM_NAME} <{RESEND_FROM_ADDRESS}>"

    OTP_EXPIRY_MINUTES = int(os.getenv('OTP_EXPIRY_MINUTES', 10))
    NODE_ENV = os.getenv('NODE_ENV', 'development')
    DEVICE_DEFAULT_PASSWORD = os.getenv('DEVICE_DEFAULT_PASSWORD', 'default123')

    # Twilio Configuration
    TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
    TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')
