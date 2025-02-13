from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.auth.utils import hash_password, verify_password, create_access_token, decode_access_token
from app.models import User, Candidate, JobDescription
from app.schemas import UserCreate, Token
from app.database import get_db  
from app.crud.users import (
    get_user_by_email,
    user_create,
)
from fastapi.security import OAuth2PasswordBearer
from app.utils.email_utils import send_verification_email

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
    token = create_access_token({"sub":user.email})
    verification = send_verification_email(user.email, token)
    if not verification:
        raise HTTPException(status_code=400, detail="error sending verification email")
    return user


@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db),
    email : str = Form(...),
    password : str = Form(...),
):
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User Not registered with this email")
    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=401, detail="Invalid Password"
        )
    if not user.is_verified:
        raise HTTPException (
            status_code=422, detail="Account not verified"
        )
    access_token = create_access_token({"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}



# OAuth2 scheme for getting token from request
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# Dependency to get current user
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise credentials_exception
    return user

@router.get("/me", response_model=dict)
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "is_active": current_user.is_active,
        "is_superuser": current_user.is_superuser,
    }

@router.get("/totalApplications", response_model=dict)
def get_total_applications_by_HR(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    total_applications = (
        db.query(func.count(Candidate.id))
        .join(JobDescription, Candidate.job_description_id == JobDescription.id)
        .filter(JobDescription.hr_id == current_user.id)
        .scalar()
    )
    return {
        "total_applications": total_applications,
        "name" : current_user.first_name + " " + current_user.last_name
    }

@router.get("/verify/{token}")
def verify_account(token: str, db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    email = payload.get("sub")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        return HTTPException(
            status_code=409, detail='Account with this email already verified'
        )

    user.is_verified = True
    db.commit()

    return user


