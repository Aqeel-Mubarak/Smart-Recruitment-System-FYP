# Import User model from app.models
from app.models import User

def get_user_by_email(session, email):
    """
    Retrieve a user from the database by their email address.
    
    Args:
        session: SQLAlchemy database session
        email (str): Email address of the user to find
        
    Returns:
        User: User object if found, None if no user exists with the given email
    """
    user = session.query(User).filter(User.email == email).first()
    return user

def user_create(session, user):
    """
    Create a new user in the database.
    
    Args:
        session: SQLAlchemy database session
        user (User): User object to be created
        
    Returns:
        User: The created user object with updated database fields
    """
    session.add(user)
    session.commit()
    return user

