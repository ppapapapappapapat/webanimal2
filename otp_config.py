# otp_config.py
import os
from datetime import timedelta
import datetime

# OTP Configuration
class OTPConfig:
    # OTP settings
    OTP_LENGTH = 6
    OTP_EXPIRY_MINUTES = 5
    OTP_MAX_ATTEMPTS = 3
    OTP_COOLDOWN_SECONDS = 60  # Wait 60 seconds before sending new OTP
    
    # Email configuration
    EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
    EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
    EMAIL_USER = os.getenv('EMAIL_USER', 'your-email@gmail.com')
    EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', '')  # Use app password for Gmail
    EMAIL_USE_TLS = True
    
    # Rate limiting
    MAX_OTP_PER_HOUR = 5
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION = timedelta(minutes=15)
    
    # Templates
    EMAIL_SUBJECT = "Your Wildlife Detection System Login Code"
    
    @staticmethod
    def get_email_template(otp_code, username):
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .otp-code {{ font-size: 32px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; padding: 15px; background: white; border-radius: 8px; letter-spacing: 10px; }}
                .footer {{ text-align: center; margin-top: 30px; color: #777; font-size: 12px; }}
                .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Wildlife Detection System</h1>
                </div>
                <div class="content">
                    <h2>Hello {username},</h2>
                    <p>Your login verification code is:</p>
                    <div class="otp-code">{otp_code}</div>
                    <p>This code will expire in {OTPConfig.OTP_EXPIRY_MINUTES} minutes.</p>
                    
                    <div class="warning">
                        <p><strong>⚠️ Security Notice:</strong></p>
                        <p>• Never share this code with anyone</p>
                        <p>• Our team will never ask for your verification code</p>
                        <p>• If you didn't request this code, please ignore this email</p>
                    </div>
                    
                    <p>Enter this code on the login page to complete your authentication.</p>
                    
                    <p>Best regards,<br>
                    Wildlife Detection System Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>© {datetime.datetime.now().year} Wildlife Detection System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """