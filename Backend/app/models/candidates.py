# Import necessary SQLAlchemy components for database modeling
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Candidate(Base):
    """
    Candidate model representing job applicants in the system.
    This model stores candidate information and their relationship with job descriptions.
    """
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    resume_text = Column(Text)
    score = Column(Integer, default=0)
    email = Column(String, index=True, nullable=True)  # New field for email
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"))

    job_description = relationship("JobDescription", back_populates="candidates")