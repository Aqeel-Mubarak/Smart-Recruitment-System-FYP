# Import required libraries for email functionality
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_email(email, link):
    """
    Sends a password reset email to the specified email address.
    
    Args:
        email (str): Recipient's email address
        link (str): Password reset link to be included in the email
    
    Returns:
        bool: True if email sent successfully, None if failed
    """
    # Gmail account credentials for sending emails
    sender_email = "talharajput3455@gmail.com"
    sender_password = "lbuy utbx drvb segn"  # Use an App Password instead

    # Email body content
    body = f"Click the link to reset your password: {link}"

    # Create a multipart message and set headers
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = email
    message["Subject"] = "Reset Password Request"
    message.attach(MIMEText(body, "plain"))

    try:
        # Establish SMTP connection with Gmail's server
        server = smtplib.SMTP("smtp.gmail.com", 587)
        # server.ehlo()  # Identify yourself to the server
        server.starttls()  # Secure connection
        # server.ehlo()
        server.login(sender_email, sender_password)
        server.send_message(message)
        server.quit()

        print("Email sent successfully!")
        return True
    except Exception as e:
        print(f"Error sending email: {e}")  # Print the error
        return None


def send_verification_email(email, token):
    """
    Sends a verification email with a styled HTML button to verify user's account.
    
    Args:
        email (str): Recipient's email address
        token (str): Verification token to be included in the verification link
    
    Returns:
        bool: True if email sent successfully, error message string if failed
    """
    # link = f"http://localhost:5173/verify/{token}"
    # Production verification link
    link = f"http://207.180.240.67/verify/{token}"
    sender_email = "talharajput3455@gmail.com"
    sender_password = "lbuy utbx drvb segn"

    # Email subject and message
    subject = "Verify Your Account"
    req_msg = "Click the button below to verify your email.If you have not requested this email, just ignore it."

    # HTML template for the verification email with styled button
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; text-align: center;">
            <p>{req_msg}</p>
            <p>
                <a href="{link}" style="
                    display: inline-block;
                    padding: 12px 20px;
                    font-size: 16px;
                    color: white;
                    background-color: #007bff;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                " target="_blank">Verify Your Account</a>
            </p>
        </body>
    </html>
    """

    # Create multipart message and set headers
    msg = MIMEMultipart()
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = email
    msg.attach(MIMEText(html_content, "html"))

    try:
        # Establish SMTP connection and send email
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        return f"Failed to send email: {str(e)}"