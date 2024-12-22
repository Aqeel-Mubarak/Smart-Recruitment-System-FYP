from pydantic import BaseModel

class Calendar(BaseModel):
    title: str
    startdate: str
    starttime: str
    enddate: str
    endtime: str
    status:str