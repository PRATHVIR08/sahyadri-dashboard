from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import create_access_token, hash_password, is_college_email, verify_password
from ..db import get_db
from ..deps import get_current_user
from ..models import User
from ..schemas import LoginIn, ProfileOut, ProfileUpdate, RegisterIn, TokenOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    if not is_college_email(email):
        raise HTTPException(400, "Use your Sahyadri college email (example: name.is.24@sahyadri.edu.in)")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(400, "An account with this email already exists")
    if db.query(User).filter(User.usn == payload.usn.upper()).first():
        raise HTTPException(400, "This USN is already registered")
    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        role="student",
        name=payload.name.strip(),
        usn=payload.usn.upper().strip(),
        photo_url=payload.photo_url,
        course=payload.course,
        department=payload.department.upper(),
        year=payload.year,
        semester=payload.semester,
        section=payload.section.upper(),
        interests=payload.interests,
    )
    db.add(user)
    db.commit()
    return TokenOut(access_token=create_access_token(user.email, user.role))


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return TokenOut(access_token=create_access_token(user.email, user.role))


@router.get("/me", response_model=ProfileOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.put("/profile", response_model=ProfileOut)
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user
