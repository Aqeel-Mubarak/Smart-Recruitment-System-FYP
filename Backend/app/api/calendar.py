from fastapi import Depends,APIRouter,Request
from sqlalchemy.orm import Session,load_only
from app.database import get_db
from app.models import Calendar as Calendar_table
from sqlalchemy import and_
from app.schemas import Calendar as  Calendar_schema
from app.schemas import Calendar2 as  Calendar_schema2
from app.schemas import Slot1,Slot2
from typing import Optional
from cryptography.fernet import Fernet


router = APIRouter()

# Endpoint to add appointment
@router.post("/add_data_to_calendar")
def add_data_to_calendar(data:Calendar_schema, db: Session = Depends(get_db)):
    print(data)
    # print("Incoming Data:", data.model_dump())
    
    # Filter valid fields for the Calendar model
    appointment_data = data.model_dump(include={"jobtitle", "startdate", "starttime", "enddate", "endtime","status","jobid"})
    print("Filtered Appointment Data:", appointment_data)
    
    # Insert into the database
    appointment = Calendar_table(**appointment_data)
    # appointment = Calendar_table(**data.model_dump())
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return  data

# @router.get("/get_data_from_calendar")
# def add_data_to_calendar(title: Optional[str] = None, db: Session = Depends(get_db)):
#     data=db.query(Calendar_table).filter(Calendar_table.title==title).all()
#     return  data

# @router.get("/get_userdata_from_calendar")
# def get_data_to_calendar(hiringmanagerid: Optional[str] = None, db: Session = Depends(get_db)):
#     data=db.query(Calendar_table).filter(and_(Calendar_table.hiringmanagerid==hiringmanagerid,Calendar_table.jobid==jobid)).all()
#     return  data

@router.get("/get_jobdata_from_calendar")
def get_data_to_calendar(jobid: Optional[str] = None, db: Session = Depends(get_db)):
    data=db.query(Calendar_table).filter(and_(Calendar_table.jobid==jobid)).all()
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
    jobtitle = data.jobtitle.strip()
    startdate = data.startdate.strip()
    starttime = data.starttime.strip()
    enddate = data.enddate.strip()
    endtime = data.endtime.strip()
    jobid=data.jobid

    ans = db.query(Calendar_table).filter(and_(
        func.trim(Calendar_table.jobtitle) == jobtitle,
        func.trim(Calendar_table.startdate) == startdate,
        func.trim(Calendar_table.starttime) == starttime,
        func.trim(Calendar_table.enddate) == enddate,
        func.trim(Calendar_table.endtime) == endtime,
        (Calendar_table.jobid) == jobid
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
class Email(BaseModel):
    id:int
    email:str

class EmailRequest(BaseModel):
    to_email: list[Email]
    subject: str
    body: str
    linkkk: str
    encodedhiringmanagerid: str
    encodedjobid: str

@router.post("/send_email")
def send_email(request: EmailRequest):
    sender_email = "talharajput3455@gmail.com"
    sender_password = "lbuy utbx drvb segn"

    # Initialize results
    results = {"success": [], "failed": []}
    linkkk=request.linkkk
    # encodedhiringmanagerid=request.encodedhiringmanagerid,
    # encodedjobid=request.encodedjobid
    # print(linkkk,encodedhiringmanagerid,encodedjobid)
    print(request.body)
    print(linkkk)
    for recipient in request.to_email:
        # Email content
        print(recipient)
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = recipient.email
        message["Subject"] = request.subject
        linkkk=f'{linkkk}/{recipient.email}'
        # linkkk = f"http://207.180.240.67/Calendar/{encodedhiringmanagerid[0]}/{encodedjobid}/{recipient.id}"
        message.attach(MIMEText(request.body+linkkk, "plain"))

        try:
            # SMTP connection
            server = smtplib.SMTP("smtp.gmail.com", 587)  # For Gmail
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(message)
            server.quit()

            # Track success
            results["success"].append(recipient)
        except Exception as e:
            # Track failure
            results["failed"].append({"email": recipient, "error": str(e)})

    return {"message": "Email process completed.", "results": results}


@router.put("/update_status")
def update_status(data: Calendar_schema2, db: Session = Depends(get_db)):
    """
    Update the status column for a specific row in the calendar table.
    """
    print(data)
    calendar_entry = db.query(Calendar_table).filter(and_(
        Calendar_table.candidate_id == data.candidate_id,
    )).first()
    if calendar_entry:
        raise HTTPException(status_code=404, detail="Calendar entry not found")
    jobtitle = data.jobtitle.strip()
    startdate = data.startdate.strip()
    starttime = data.starttime.strip()
    enddate = data.enddate.strip()
    endtime = data.endtime.strip()
    jobid=data.jobid

    calendar_entry = db.query(Calendar_table).filter(and_(
        func.trim(Calendar_table.jobtitle) == jobtitle,
        func.trim(Calendar_table.startdate) == startdate,
        func.trim(Calendar_table.starttime) == starttime,
        func.trim(Calendar_table.enddate) == enddate,
        func.trim(Calendar_table.endtime) == endtime,
        (Calendar_table.jobid) == jobid
    )).first()
    print(calendar_entry)
    if not calendar_entry:
        raise HTTPException(status_code=404, detail="Calendar entry not found")

    # Update only the 'status' column
    if calendar_entry.status=='true':
        calendar_entry.status = 'false'
        calendar_entry.candidate_id = None
    else:
        calendar_entry.status = 'true'
        calendar_entry.candidate_id=data.candidate_id
        
    db.commit()
    db.refresh(calendar_entry)

    return {"message": "Status updated successfully", "updated_entry": calendar_entry}


@router.get("/get_status")
def get_status(jobtitle:str,startdate:str,starttime:str,enddate:str,endtime:str,jobid:int, db: Session = Depends(get_db)):
    """
    Update the status column for a specific row in the calendar table.
    """
    # Find the specific row by ID
    jobtitle = jobtitle.strip()
    startdate = startdate.strip()
    starttime = starttime.strip()
    enddate = enddate.strip()
    endtime = endtime.strip()
    jobid= jobid

    calendar_entry = db.query(Calendar_table).filter(and_(
        func.trim(Calendar_table.jobtitle) == jobtitle,
        func.trim(Calendar_table.startdate) == startdate,
        func.trim(Calendar_table.starttime) == starttime,
        func.trim(Calendar_table.enddate) == enddate,
        func.trim(Calendar_table.endtime) == endtime,
        (Calendar_table.jobid) == jobid
    )).first()
    print(calendar_entry)
    if not calendar_entry:
        raise HTTPException(status_code=404, detail="Calendar entry not found")

    # Update only the 'status' column
    print(calendar_entry.status)
    return {'status':calendar_entry.status}




key = b'VzqJzLm3OxaW7x42Dgfdf45Tf8tZXC9NVXIXYJv3BQk='  # Use the same key for both encryption and decryption
cipher = Fernet(key)

@router.post('/encryptid')
async def encrypt_id(request: Request):
    print(request)
    data = await request.json()
    value = data.get("value")
    print(value)
    encodedlst = [cipher.encrypt(str(val).encode()).decode() for val in value]
    return {'encodedlst': encodedlst}

@router.post('/decryptid')
async def decrypt_id(request: Request):
    data = await request.json()
    value = data.get("value")
    decodedlst = [cipher.decrypt(val.encode()).decode() for val in value]
    return {'decodedlst': decodedlst}


@router.put("/get_id")
def get_id(candidate_id:int, db: Session = Depends(get_db)):
    """
    Update the status column for a specific row in the calendar table.
    """

    calendar_entry = db.query(Calendar_table).filter(and_(
        func.trim(Calendar_table.candidate_id) == candidate_id,
    )).first()
    if calendar_entry:
        raise HTTPException(status_code=404, detail="Calendar entry not found")
    return 

# # FastAPI Route to Get Time Slots by jobid
# @router.get("/getSlots")
# async def get_slots(jobid: int, db: Session = Depends(get_db)):
#     # Query the database to get slots by jobid
#     slots = db.query(Calendar_table).filter(Calendar_table.jobid == jobid).all()
#     return slots

@router.get("/getSlots")
async def get_slots(jobid: int, db: Session = Depends(get_db)):
    # Query the database to get slots by jobid, loading only the required columns
    slots = db.query(Calendar_table).filter(Calendar_table.jobid == jobid).options(load_only(
        Calendar_table.id,
        Calendar_table.starttime,
        Calendar_table.endtime,
        Calendar_table.isselected,
        Calendar_table.jobid
    )).all()
    # print(slots)
    # Map the results directly into a list of dict-like objects that can be serialized by FastAPI
    return slots


# Create a new calendar slot
@router.post("/addSlot")
async def add_slot(slot: Slot1, db: Session = Depends(get_db)):
    # print(slot)
    db_slot = Calendar_table(
        id=slot.id,
        starttime=slot.startTime,
        endtime=slot.endTime,
        isselected=slot.isSelected,
        jobid=slot.jobId,
        selectedby=None
    )
    db.add(db_slot)
    db.commit()
    db.refresh(db_slot)
    return db_slot

# Remove a calendar slot by ID
@router.delete("/removeSlot/{slotId}")
async def remove_slot(slotId: str, db: Session = Depends(get_db)):
    # print(slotId)
    db_slot = db.query(Calendar_table).filter(Calendar_table.id == slotId).first()
    if db_slot is None:
        raise HTTPException(status_code=404, detail="Slot not found")
    db.delete(db_slot)
    db.commit()
    return {"message": "Slot removed successfully"}

# Select or unselect a calendar slot
@router.post("/selectSlot")
async def select_slot(request:Request, db: Session = Depends(get_db)):
    print("herhikjr")
    request_data = await request.json()
    # print(request_data)
    id = request_data.get("id")
    user_id = request_data.get("email")
    print(user_id)
    db_slot = db.query(Calendar_table).filter(Calendar_table.id == id).first()
    if db_slot is None:
        raise HTTPException(status_code=404, detail="Slot not found")
    if db_slot.selectedby!=None and db_slot.selectedby!=user_id:
        raise HTTPException(status_code=404, detail="Slot already booked")
    
    # Toggle selection
    if db_slot.selectedby == user_id:
        db_slot.isselected = False
        db_slot.selectedby = None
    else:
        if db_slot:
            db_slot2 = db.query(Calendar_table).filter(Calendar_table.selectedby == user_id,Calendar_table.jobid == db_slot.jobid).first()
            if db_slot2:
                raise HTTPException(status_code=404, detail="User already booked")
        db_slot.isselected = True
        db_slot.selectedby = user_id
    
    db.commit()
    db.refresh(db_slot)
    return db_slot

