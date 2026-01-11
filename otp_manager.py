# otp_manager.py
import os
import secrets
import string
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import hashlib
from flask import current_app
from otp_config import OTPConfig

class OTPManager:
    def __init__(self):
        self.config = OTPConfig()
    
    def generate_otp(self):
        """Generate a secure OTP code"""
        digits = string.digits
        return ''.join(secrets.choice(digits) for _ in range(self.config.OTP_LENGTH))
    
    def hash_otp(self, otp):
        """Hash OTP for secure storage"""
        salt = os.urandom(32)
        key = hashlib.pbkdf2_hmac(
            'sha256',
            otp.encode('utf-8'),
            salt,
            100000
        )
        return salt.hex() + key.hex()
    
    def verify_otp_hash(self, otp, hashed_otp):
        """Verify OTP against stored hash"""
        salt = bytes.fromhex(hashed_otp[:64])
        key = bytes.fromhex(hashed_otp[64:])
        new_key = hashlib.pbkdf2_hmac(
            'sha256',
            otp.encode('utf-8'),
            salt,
            100000
        )
        return new_key == key
    
    def send_otp_email(self, email, username, otp_code):
        """Send OTP via email"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = self.config.EMAIL_SUBJECT
            msg['From'] = self.config.EMAIL_USER
            msg['To'] = email
            
            # Create HTML content
            html_content = self.config.get_email_template(otp_code, username)
            
            # Attach HTML part
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Connect to SMTP server
            with smtplib.SMTP(self.config.EMAIL_HOST, self.config.EMAIL_PORT) as server:
                if self.config.EMAIL_USE_TLS:
                    server.starttls()
                server.login(self.config.EMAIL_USER, self.config.EMAIL_PASSWORD)
                server.send_message(msg)
            
            print(f"✅ OTP email sent to {email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send OTP email: {e}")
            return False
    
    def can_send_otp(self, user):
        """Check if we can send OTP (rate limiting)"""
        if not user.otp_last_sent:
            return True
        
        time_since_last = datetime.utcnow() - user.otp_last_sent
        return time_since_last.total_seconds() >= self.config.OTP_COOLDOWN_SECONDS
    
    def is_otp_valid(self, user, otp):
        """Check if OTP is valid"""
        if not user.last_otp or not user.otp_expiry:
            return False
        
        # Check expiry
        if datetime.utcnow() > user.otp_expiry:
            return False
        
        # Check attempts
        if user.otp_failed_attempts >= self.config.OTP_MAX_ATTEMPTS:
            return False
        
        # Verify OTP
        if not self.verify_otp_hash(otp, user.last_otp):
            user.otp_failed_attempts += 1
            return False
        
        return True
    
    def clear_otp(self, user):
        """Clear OTP data after successful verification"""
        user.last_otp = None
        user.otp_expiry = None
        user.otp_failed_attempts = 0