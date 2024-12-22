from fastapi import Depends,APIRouter
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Calendar as Calendar_table
from sqlalchemy import and_
from app.schemas import Calendar as  Calendar_schema
from typing import Optional

router = APIRouter()

# Endpoint to add appointment
@router.post("/add_data_to_calendar")
def add_data_to_calendar(data:Calendar_schema, db: Session = Depends(get_db)):
    print(data)
    # print("Incoming Data:", data.model_dump())
    
    # Filter valid fields for the Calendar model
    appointment_data = data.model_dump(include={"title", "startdate", "starttime", "enddate", "endtime","status"})
    print("Filtered Appointment Data:", appointment_data)
    
    # Insert into the database
    appointment = Calendar_table(**appointment_data)
    # appointment = Calendar_table(**data.model_dump())
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return  data

@router.get("/get_data_from_calendar")
def add_data_to_calendar(title: Optional[str] = None, db: Session = Depends(get_db)):
    data=db.query(Calendar_table).filter(Calendar_table.title==title).all()
    return  data

# @router.delete("/delete_data_from_calendar")
# def delete_data_from_calendar(data:Calendar_schema, db: Session = Depends(get_db)):
#     print("Deleting Record:", data.model_dump())
#     ans= db.query(Calendar_table).filter(and_(
#         Calendar_table.title == data.title,
#         Calendar_table.startdate == data.startdate,
#         Calendar_table.starttime == data.starttime,
#         Calendar_table.enddate == data.enddate,
#         Calendar_table.endtime == data.endtime)
#     ).all()
#     print(ans)    
#     db.commit()
#     return 


from sqlalchemy import func, and_

@router.delete("/delete_data_from_calendar")
def delete_data_from_calendar(data: Calendar_schema, db: Session = Depends(get_db)):
    # Clean input data to remove leading/trailing spaces
    title = data.title.strip()
    startdate = data.startdate.strip()
    starttime = data.starttime.strip()
    enddate = data.enddate.strip()
    endtime = data.endtime.strip()

    print("Cleaned Data:")
    print(f"Title: {title}, Start Date: {startdate}, Start Time: {starttime}, "
          f"End Date: {enddate}, End Time: {endtime}")

    # Perform the delete query with cleaned input
    ans = db.query(Calendar_table).filter(and_(
        func.trim(Calendar_table.title) == title,
        func.trim(Calendar_table.startdate) == startdate,
        func.trim(Calendar_table.starttime) == starttime,
        func.trim(Calendar_table.enddate) == enddate,
        func.trim(Calendar_table.endtime) == endtime
    ))

    records = ans.all()
    print("Matching Records:", records)

    if records:
        ans.delete(synchronize_session=False)
        db.commit()
        print("Record Deleted Successfully")
        return {"message": "Record deleted successfully."}
    else:
        print("No matching record found.")
        return {"message": "No matching record found."}


import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr


# Email details schema
class EmailRequest(BaseModel):
    to_email: EmailStr
    subject: str
    body: str

@router.post("/send_email/")
def send_email(request: EmailRequest):
    print(request)
    sender_email = "talharajput3455@gmail.com"
    sender_password = "lbuy utbx drvb segn"

    # Email content
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = request.to_email
    message["Subject"] = request.subject
    message.attach(MIMEText(request.body, "plain"))

    try:
        # SMTP connection
        server = smtplib.SMTP("smtp.gmail.com", 587)  # For Gmail
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(message)
        server.quit()
        return {"message": "Email sent successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")


@router.put("/update_status")
def update_status(data: Calendar_schema, db: Session = Depends(get_db)):
    """
    Update the status column for a specific row in the calendar table.
    """
    print(data)
    title = data.title.strip()
    startdate = data.startdate.strip()
    starttime = data.starttime.strip()
    enddate = data.enddate.strip()
    endtime = data.endtime.strip()
    # Find the specific row by ID
    calendar_entry = db.query(Calendar_table).filter(and_(
        func.trim(Calendar_table.title) == title,
        func.trim(Calendar_table.startdate) == startdate,
        func.trim(Calendar_table.starttime) == starttime,
        func.trim(Calendar_table.enddate) == enddate,
        func.trim(Calendar_table.endtime) == endtime
    )).first()
    print(calendar_entry)
    if not calendar_entry:
        raise HTTPException(status_code=404, detail="Calendar entry not found")

    # Update only the 'status' column
    calendar_entry.status = data.status
    db.commit()
    db.refresh(calendar_entry)

    return {"message": "Status updated successfully", "updated_entry": calendar_entry}


@router.get("/get_status")
def get_status(title:str,startdate:str,starttime:str,enddate:str,endtime:str, db: Session = Depends(get_db)):
    """
    Update the status column for a specific row in the calendar table.
    """
    # Find the specific row by ID
    title = title.strip()
    startdate = startdate.strip()
    starttime = starttime.strip()
    enddate = enddate.strip()
    endtime = endtime.strip()
    print(title,startdate,starttime,enddate,endtime)
    calendar_entry = db.query(Calendar_table).filter(and_(
        func.trim(Calendar_table.title) == title,
        func.trim(Calendar_table.startdate) == startdate,
        func.trim(Calendar_table.starttime) == starttime,
        func.trim(Calendar_table.enddate) == enddate,
        func.trim(Calendar_table.endtime) == endtime
    )).first()
    print(calendar_entry)
    if not calendar_entry:
        raise HTTPException(status_code=404, detail="Calendar entry not found")

    # Update only the 'status' column
    print(calendar_entry.status)
    return {'status':calendar_entry.status}