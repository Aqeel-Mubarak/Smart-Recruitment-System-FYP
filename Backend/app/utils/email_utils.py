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

        return True
    except Exception as e:
        return None



def send_verification_email(email, token):
    link = f"http://localhost:5173/verify/{token}"
    #link = f"http://207.180.240.67/verify/{token}"
    sender_email = "talharajput3455@gmail.com"
    sender_password = "lbuy utbx drvb segn"

    subject = "Verify Your Account"
    req_msg = "Click the button below to verify your email.If you have not requested this email, just ignore it."

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

    msg = MIMEMultipart()
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = email
    msg.attach(MIMEText(html_content, "html"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        return f"Failed to send email: {str(e)}"