import resend
from config.env import Config

resend.api_key = Config.RESEND_API_KEY

def get_from():
    return f"{Config.RESEND_FROM_NAME} <{Config.RESEND_FROM_ADDRESS}>"

def send_otp_email(email, otp):
    try:
        from_address = get_from()
        print(f"Sending OTP from: {from_address}")
        
        params = {
            "from": from_address,
            "to": email,
            "subject": "Your MITR SOS Verification Code",
            "html": f"""
                <h2>Your Verification Code</h2>
                <p>Your OTP is:</p>
                <h1>{otp}</h1>
                <p>Expires in {Config.OTP_EXPIRY_MINUTES} minutes.</p>
            """
        }
        
        email_resp = resend.Emails.send(params)
        
        # Resend SDK returns a dict, usually check 'id' or error
        # If error occurs, it might raise exception or return error object depending on version
        # Assuming success if no exception for now or checking return structure
        return True
    except Exception as e:
        print(f"❌ Resend Exception OTP: {e}")
        return False

def send_password_reset_email(email, otp):
    try:
        from_address = get_from()
        print(f"Sending Reset OTP from: {from_address}")
        
        params = {
            "from": from_address,
            "to": email,
            "subject": "MITR SOS Password Reset",
            "html": f"""
                <h2>Password Reset</h2>
                <p>Your reset OTP is:</p>
                <h1>{otp}</h1>
                <p>This code expires in {Config.OTP_EXPIRY_MINUTES} minutes.</p>
            """
        }
        
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"❌ Resend Exception Reset: {e}")
        return False
