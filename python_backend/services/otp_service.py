import random
from datetime import datetime, timedelta
from config.env import Config
from .email_service import send_otp_email, send_password_reset_email

def generate_otp():
    return str(random.randint(100000, 999999))

def get_otp_expiry():
    minutes = int(Config.OTP_EXPIRY_MINUTES)
    return datetime.now() + timedelta(minutes=minutes)

def send_verification_otp(email):
    try:
        otp = generate_otp()
        sent = send_otp_email(email, otp)
        
        if not sent:
            raise Exception("Failed to send OTP email")
            
        return otp
    except Exception as e:
        print(f"❌ Error in send_verification_otp: {e}")
        raise Exception("Failed to send verification OTP")

def send_reset_otp(email):
    try:
        otp = generate_otp()
        sent = send_password_reset_email(email, otp)
        
        if not sent:
            raise Exception("Failed to send reset OTP email")
            
        return otp
    except Exception as e:
        print(f"❌ Error in send_reset_otp: {e}")
        raise Exception("Failed to send reset OTP")
