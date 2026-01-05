import os
import smtplib
from email.message import EmailMessage
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Gmail Configuration
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_PASSWORD = os.getenv("GMAIL_PASSWORD")

def send_email_notification(to_email: str, subject: str, body: str):
    if not GMAIL_USER or not GMAIL_PASSWORD:
        logger.warning("Gmail credentials not set. Skipping email notification.")
        logger.info(f"Would have sent email to {to_email}: {subject}")
        return

    try:
        msg = EmailMessage()
        msg.set_content(body)
        msg['Subject'] = subject
        msg['From'] = GMAIL_USER
        msg['To'] = to_email

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(GMAIL_USER, GMAIL_PASSWORD)
            smtp.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email: {e}")

def send_whatsapp_notification(to_phone: str, message: str):
    """
    Placeholder for WhatsApp notification service.
    Direct integration requires WhatsApp Business API credentials.
    For now, we just log the intent.
    """
    logger.info(f"WhatsApp Notification (Simulated) to {to_phone}: {message}")
    # Implementation path:
    # 1. Use Twilio or Meta Graph API
    # 2. POST request to https://graph.facebook.com/v17.0/{phone_number_id}/messages
    # 3. Requires generic template or 24hr window
