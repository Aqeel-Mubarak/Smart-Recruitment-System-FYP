from pydantic import BaseModel


class JobCreate(BaseModel):
    title: str
    description_text: str

class JobRead(JobCreate):
    id: int

    class Config:
        orm_mode = True