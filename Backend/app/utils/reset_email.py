import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(email, otp):
    sender_email = "talharajput3455@gmail.com"
    sender_password = "lbuy utbx drvb segn"

    body = f"Your reset password code is {otp}. If you have not requested this code, then secure your account"

    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = email
    message["Subject"] = "Reset Password Request"
    message.attach(MIMEText(body, "plain"))

    try:
        # SMTP connection
        server = smtplib.SMTP("smtp.gmail.com", 587)  # For Gmail
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(message)
        server.quit()

        return "reset email sent successfully"
    except Exception as e:
        return None
