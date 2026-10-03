from datetime import date
from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str
    usn: str
    course: str
    department: str
    year: int
    semester: int
    section: str
    interests: str = ""
    photo_url: str | None = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProfileOut(BaseModel):
    id: int
    email: str
    role: str
    name: str
    usn: str | None
    photo_url: str | None
    course: str | None
    department: str | None
    year: int | None
    semester: int | None
    section: str | None
    interests: str | None

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    name: str | None = None
    photo_url: str | None = None
    course: str | None = None
    department: str | None = None
    year: int | None = None
    semester: int | None = None
    section: str | None = None
    interests: str | None = None


class AttendanceUpdate(BaseModel):
    subject_id: int
    total_classes: int | None = None
    classes_attended: int | None = None
    target_percentage: float | None = None


class MarkAttendanceIn(BaseModel):
    slot_id: int
    status: str


class BunkQuery(BaseModel):
    subject_id: int
    target_percentage: float = 85
    planned_bunks: int = 0
    extra_attend: int = 0


class SgpaSubjectIn(BaseModel):
    subject_name: str
    credits: int
    cie_marks: float = 0
    see_marks: float = 0
    total_marks: float | None = None
    predicted: bool = False


class AlumniQuestionIn(BaseModel):
    alumni_id: int
    topic: str
    question: str
