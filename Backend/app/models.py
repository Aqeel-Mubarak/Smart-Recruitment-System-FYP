from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description_text = Column(Text)
    hr_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    deadline = Column(String)
    status = Column(String, nullable=False, default="open")
    hr = relationship("User", back_populates="jobs")
    candidates = relationship("Candidate", back_populates="job_description")
    calendars = relationship("Calendar", back_populates="job")


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    resume_text = Column(Text)
    score = Column(Integer, default=0)
    email = Column(String, index=True, nullable=True) 
    resume_url = Column(String)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"))

    job_description = relationship("JobDescription", back_populates="candidates")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    cell_phone = Column(String(15), nullable=False)
    company_name = Column(String(100), nullable=True)
    city = Column(String(50), nullable=True)
    country = Column(String(50), nullable=True)
    gender = Column(String(10), nullable=False) 
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    jobs = relationship("JobDescription", back_populates="hr")
    
    
    
    
class Calendar(Base):
    __tablename__ = "calendar"

    id = Column(Integer, primary_key=True, index=True)
    jobtitle = Column(String, index=True)
    startdate = Column(String)
    starttime = Column(String)
    enddate = Column(String)
    endtime = Column(String)
    status = Column(String)
    # email = Column(String, index=True,unique=True, nullable=True)
    jobid = Column(Integer, ForeignKey("job_descriptions.id"))
    candidate_id=Column(Integer)

    job = relationship("JobDescription", back_populates="calendars")
    
    def __repr__(self):
        return (f"<Calendar(title='{self.jobtitle}', startdate='{self.startdate}', "
                f"starttime='{self.starttime}', enddate='{self.enddate}', endtime='{self.endtime},status='{self.status}')>")

    