# Import necessary SQLAlchemy components for database modeling
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Calendar(Base):
    """
    Calendar model representing interview scheduling information.
    This model stores details about interview dates, times, and associated job information.
    """
    __tablename__ = "calendar"

    id = Column(Integer, primary_key=True, index=True)
    jobtitle = Column(String, index=True)
    startdate = Column(String)
    starttime = Column(String)
    enddate = Column(String)
    endtime = Column(String)
    status = Column(String)
    # email = Column(String, index=True,unique=True, nullable=True)
    jobid = Column(Integer, ForeignKey("jobdescriptions.id"))

    job = relationship("JobDescription", back_populates="calendars")
    
    def __repr__(self):
        """
        String representation of the Calendar object.
        Returns a formatted string containing the calendar entry details.
        """
        return (f"<Calendar(title='{self.jobtitle}', startdate='{self.startdate}', "
                f"starttime='{self.starttime}', enddate='{self.enddate}', endtime='{self.endtime},status='{self.status}')>")

    