from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Calendar(Base):
    __tablename__ = "calendar"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    startdate= Column(String)
    starttime= Column(String)
    enddate= Column(String)
    endtime= Column(String)
    status=Column(String)
    
    def __repr__(self):
        return (f"<Calendar(title='{self.title}', startdate='{self.startdate}', "
                f"starttime='{self.starttime}', enddate='{self.enddate}', endtime='{self.endtime},status='{self.status}')>")

    

    