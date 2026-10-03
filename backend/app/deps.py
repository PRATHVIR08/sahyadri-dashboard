from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from .auth import decode_token
from .db import get_db
from .models import User

oauth2 = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def get_current_user(token: str = Depends(oauth2), db: Session = Depends(get_db)) -> User:
    credentials_error = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")
    try:
        payload = decode_token(token)
        email = payload.get("sub")
        if not email:
            raise credentials_error
    except JWTError:
        raise credentials_error
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise credentials_error
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
