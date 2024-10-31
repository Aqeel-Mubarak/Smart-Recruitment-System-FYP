from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description_text = Column(Text)

    candidates = relationship("Candidate", back_populates="job_description")

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    resume_text = Column(Text)
    score = Column(Integer, default=0)
    email = Column(String, index=True, nullable=True)  # New field for email
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"))

    job_description = relationship("JobDescription", back_populates="candidates")
