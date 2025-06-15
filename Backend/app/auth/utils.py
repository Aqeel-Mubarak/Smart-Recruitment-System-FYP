# Import required libraries for password hashing and JWT operations
from passlib.context import CryptContext
from jose import  jwt
from jose.exceptions import JWTError
from datetime import datetime, timedelta
from app.core.config import settings

# Initialize password hashing context using bcrypt algorithm
# 'deprecated="auto"' allows for automatic handling of deprecated hash formats
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Function to hash a plain text password using bcrypt
# Returns a hashed string that can be safely stored in the database
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Function to verify if a plain text password matches a hashed password
# Returns True if the password matches, False otherwise
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
 

def create_access_token(data: dict) -> str:
    """
    Create a JWT token with the provided data and an expiration time.
    
    Args:
        data (dict): Dictionary containing the data to be encoded in the token
        
    Returns:
        str: Encoded JWT token string
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# Decode JWT token
def decode_access_token(token: str) -> dict:
    """
    Decode a JWT token and return the payload.
    Raises exceptions for invalid or expired tokens.
    
    Args:
        token (str): The JWT token string to decode
        
    Returns:
        dict: The decoded token payload
        
    Raises:
        JWTError: If token is invalid, expired, or missing required claims
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        # Optionally validate required claims (e.g., "sub")
        if "sub" not in payload:
            raise JWTError("Missing 'sub' claim in token")
        return payload
    except jwt.ExpiredSignatureError:
        raise JWTError("Token has expired")
    except jwt.JWTClaimsError:
        raise JWTError("Incorrect claims. Please check the audience and issuer")
    except JWTError:
        raise JWTError("Invalid token")


