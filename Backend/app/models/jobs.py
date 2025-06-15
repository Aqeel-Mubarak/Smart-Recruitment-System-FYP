# Import necessary SQLAlchemy components for database modeling
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class JobDescription(Base):
    """
    JobDescription model representing job postings in the system.
    This model stores information about job positions including title, description,
    and the HR personnel who posted the job.
    """
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description_text = Column(Text)
    hr_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    hr = relationship("User", back_populates="jobs")
    candidates = relationship("Candidate", back_populates="job_description")