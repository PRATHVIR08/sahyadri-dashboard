from datetime import date, datetime, time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import require_admin
from ..models import (
    Achievement,
    Alumni,
    Announcement,
    CalendarEvent,
    CourseMaterial,
    Developer,
    Exam,
    HigherStudyResource,
    MiniProject,
    NewsItem,
    Placement,
    ProblemStatement,
    QuestionPaper,
    ResearchPaper,
    Subject,
    TimetableSlot,
    User,
    Vacancy,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


class GenericIn(BaseModel):
    data: dict[str, Any]


def _serialize(obj) -> dict:
    out = {}
    for key, value in obj.__dict__.items():
        if key.startswith("_"):
            continue
        if isinstance(value, (date, datetime)):
            out[key] = value.isoformat()
        elif isinstance(value, time):
            out[key] = value.strftime("%H:%M")
        else:
            out[key] = value
    return out


MODELS = {
    "students": User,
    "subjects": Subject,
    "announcements": Announcement,
    "news": NewsItem,
    "events": CalendarEvent,
    "exams": Exam,
    "papers": QuestionPaper,
    "materials": CourseMaterial,
    "placements": Placement,
    "vacancies": Vacancy,
    "higher-studies": HigherStudyResource,
    "problems": ProblemStatement,
    "mini-projects": MiniProject,
    "research": ResearchPaper,
    "alumni": Alumni,
    "achievements": Achievement,
    "developers": Developer,
    "timetable": TimetableSlot,
}


@router.get("/stats")
def stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return {
        "students": db.query(User).filter(User.role == "student").count(),
        "announcements": db.query(Announcement).count(),
        "events": db.query(CalendarEvent).count(),
        "placements": db.query(Placement).count(),
        "alumni": db.query(Alumni).count(),
        "materials": db.query(CourseMaterial).count(),
    }


@router.get("/{resource}")
def list_resource(resource: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    model = MODELS.get(resource)
    if not model:
        raise HTTPException(404, "Unknown resource")
    rows = db.query(model).all()
    if model is User:
        return [
            {
                "id": u.id,
                "email": u.email,
                "name": u.name,
                "usn": u.usn,
                "role": u.role,
                "department": u.department,
                "semester": u.semester,
                "section": u.section,
            }
            for u in rows
        ]
    return [_serialize(r) for r in rows]


@router.post("/{resource}")
def create_resource(resource: str, payload: dict, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    model = MODELS.get(resource)
    if not model or model is User:
        raise HTTPException(400, "Cannot create this resource here")
    payload.pop("id", None)
    obj = model(**_coerce(model, payload))
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return _serialize(obj)


@router.put("/{resource}/{item_id}")
def update_resource(resource: str, item_id: int, payload: dict, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    model = MODELS.get(resource)
    if not model:
        raise HTTPException(404, "Unknown resource")
    obj = db.query(model).filter(model.id == item_id).first()
    if not obj:
        raise HTTPException(404, "Not found")
    payload.pop("id", None)
    for key, value in _coerce(model, payload).items():
        if hasattr(obj, key):
            setattr(obj, key, value)
    db.commit()
    return _serialize(obj)


@router.delete("/{resource}/{item_id}")
def delete_resource(resource: str, item_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    model = MODELS.get(resource)
    if not model or model is User:
        raise HTTPException(400, "Cannot delete this resource")
    obj = db.query(model).filter(model.id == item_id).first()
    if not obj:
        raise HTTPException(404, "Not found")
    db.delete(obj)
    db.commit()
    return {"ok": True}


def _coerce(model, payload: dict) -> dict:
    cols = {c.name: c.type.python_type if hasattr(c.type, "python_type") else str for c in model.__table__.columns}
    out = {}
    for key, value in payload.items():
        if key not in cols or value is None:
            if key in model.__table__.columns.keys():
                out[key] = value
            continue
        if key in {"event_date", "end_date", "exam_date", "drive_date", "deadline", "item_date", "achieved_on", "week_start"} and isinstance(value, str) and value:
            out[key] = date.fromisoformat(value[:10])
        elif key in {"start_time", "end_time"} and isinstance(value, str):
            parts = value.split(":")
            out[key] = time(int(parts[0]), int(parts[1]))
        elif key == "published_at" and isinstance(value, str):
            out[key] = datetime.fromisoformat(value.replace("Z", ""))
        else:
            out[key] = value
    return out
