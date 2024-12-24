from app.models import User

def get_user_by_email(session, email):
    user = session.query(User).filter(User.email == email).first()
    return user

def user_create(session, user):
    session.add(user)
    session.commit()
    return user

