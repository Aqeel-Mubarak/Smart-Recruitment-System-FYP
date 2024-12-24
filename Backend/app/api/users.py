from fastapi import APIRouter, Depends, HTTPException,Form
from sqlalchemy.orm import Session
from app.auth.utils import hash_password
from app.models import User
from app.schemas import UserCreate
from app.database import get_db  # Assume database session setup
from app.crud.users import (
    get_user_by_email,
    user_create,
)

router = APIRouter()

@router.post("/signup", response_model=UserCreate)
def signup(
    db: Session = Depends(get_db),
    first_name :str = Form(...),
    last_name : str = Form(...),
    cell_phone: str = Form(...),
    company_name: str = Form(...),
    city : str = Form(...),
    country : str = Form(...),
    gender : str = Form(...),
    email : str = Form(...),
    password : str = Form(...),

):
    existing_user = get_user_by_email(db, email)
    if existing_user:
        raise HTTPException(status_code=409, detail="Email is already registered")
    
    hashed_password = hash_password(password)
    new_user = User(
        first_name = first_name,
        last_name = last_name,
        cell_phone = cell_phone,
        company_name = company_name,
        city = city,
        country = country,
        gender = gender,
        email = email,
        hashed_password = hashed_password,
    )
    user = user_create(db, new_user)
    print(user.email)
    return user
