from datetime import date, datetime, time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from ..auth import marks_to_grade
from ..db import get_db
from ..deps import get_current_user
from ..models import (
    Announcement,
    AttendanceLog,
    AttendanceRecord,
    CalendarEvent,
    Exam,
    NewsItem,
    Placement,
    SgpaSubject,
    Subject,
    TimetableSlot,
    User,
)
from ..schemas import AttendanceUpdate, MarkAttendanceIn, SgpaSubjectIn
from ..services.attendance import after_attend, after_bunks, classes_needed, max_bunks, percentage, status_label

router = APIRouter(prefix="/api", tags=["student"])


def _scope(query, model, user: User):
    return query.filter(
        model.department == user.department,
        model.course == user.course,
        model.year == user.year,
        model.semester == user.semester,
        model.section == user.section,
    )


def _attendance_row(rec: AttendanceRecord) -> dict:
    missed = rec.total_classes - rec.classes_attended
    pct = percentage(rec.classes_attended, rec.total_classes)
    target = rec.target_percentage
    return {
        "id": rec.id,
        "subject_id": rec.subject_id,
        "subject": rec.subject.name,
        "code": rec.subject.code,
        "faculty": rec.subject.faculty,
        "credits": rec.subject.credits,
        "total_classes": rec.total_classes,
        "classes_attended": rec.classes_attended,
        "classes_missed": missed,
        "percentage": pct,
        "target_percentage": target,
        "status": status_label(pct, target),
        "max_bunks": max_bunks(rec.classes_attended, rec.total_classes, target),
        "classes_needed": classes_needed(rec.classes_attended, rec.total_classes, target),
    }


def _ensure_records(db: Session, user: User):
    subjects = _scope(db.query(Subject), Subject, user).all()
    existing = {r.subject_id for r in db.query(AttendanceRecord).filter(AttendanceRecord.student_id == user.id).all()}
    for sub in subjects:
        if sub.id not in existing:
            db.add(AttendanceRecord(student_id=user.id, subject_id=sub.id, total_classes=0, classes_attended=0, target_percentage=85))
    db.commit()


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _ensure_records(db, user)
    records = (
        db.query(AttendanceRecord)
        .options(joinedload(AttendanceRecord.subject))
        .filter(AttendanceRecord.student_id == user.id)
        .all()
    )
    att_rows = [_attendance_row(r) for r in records]
    overall_att = 0
    if att_rows:
        tot = sum(r["total_classes"] for r in att_rows)
        att = sum(r["classes_attended"] for r in att_rows)
        overall_att = percentage(att, tot)

    sgpa_rows = db.query(SgpaSubject).filter(SgpaSubject.student_id == user.id, SgpaSubject.predicted.is_(False)).all()
    sgpa = _sgpa_from_rows(sgpa_rows)

    weekday = datetime.now().weekday()
    slots = (
        _scope(db.query(TimetableSlot), TimetableSlot, user)
        .options(joinedload(TimetableSlot.subject))
        .filter(TimetableSlot.day_of_week == weekday)
        .order_by(TimetableSlot.start_time)
        .all()
    )
    now = datetime.now().time()
    today_classes = [_slot_out(s, db, user) for s in slots]
    next_class = next((c for c in today_classes if c["start_time"] > now.strftime("%H:%M")), None)

    exams = (
        db.query(Exam)
        .filter(Exam.department == user.department, Exam.semester == user.semester, Exam.exam_date >= date.today())
        .order_by(Exam.exam_date)
        .limit(6)
        .all()
    )
    events = db.query(CalendarEvent).filter(CalendarEvent.event_date >= date.today()).order_by(CalendarEvent.event_date).limit(6).all()
    announcements = db.query(Announcement).order_by(Announcement.published_at.desc()).limit(5).all()
    news = db.query(NewsItem).order_by(NewsItem.published_at.desc()).limit(4).all()
    placements = db.query(Placement).filter(Placement.drive_date >= date.today()).order_by(Placement.drive_date).limit(4).all()
    semester_end = db.query(CalendarEvent).filter(CalendarEvent.category == "academic", CalendarEvent.title.ilike("%semester end%")).first()

    return {
        "student": {
            "name": user.name,
            "usn": user.usn,
            "email": user.email,
            "photo_url": user.photo_url,
            "course": user.course,
            "department": user.department,
            "year": user.year,
            "semester": user.semester,
            "section": user.section,
            "interests": user.interests,
            "role": user.role,
        },
        "overall_attendance": overall_att,
        "current_sgpa": sgpa["sgpa"],
        "today_classes": today_classes,
        "next_class": next_class,
        "upcoming_exams": [
            {
                "id": e.id,
                "title": e.title,
                "exam_type": e.exam_type,
                "subject_name": e.subject_name,
                "exam_date": e.exam_date.isoformat(),
            }
            for e in exams
        ],
        "semester_end": semester_end.event_date.isoformat() if semester_end else None,
        "events": [_event(e) for e in events],
        "announcements": [_ann(a) for a in announcements],
        "news": [_news(n) for n in news],
        "placements": [_placement(p) for p in placements],
        "attendance_alerts": [r for r in att_rows if r["status"] != "safe"],
    }


def _orm_public(obj, extras=None):
    data = {k: v for k, v in obj.__dict__.items() if not k.startswith("_")}
    for key, value in list(data.items()):
        if hasattr(value, "isoformat"):
            data[key] = value.isoformat() if not isinstance(value, time) else value.strftime("%H:%M")
    if extras:
        data.update(extras)
    return data


def _event(e):
    return {
        "id": e.id,
        "title": e.title,
        "category": e.category,
        "event_date": e.event_date.isoformat(),
        "end_date": e.end_date.isoformat() if e.end_date else None,
        "location": e.location,
        "description": e.description,
    }


def _ann(a):
    return {
        "id": a.id,
        "title": a.title,
        "body": a.body,
        "category": a.category,
        "published_at": a.published_at.isoformat(),
        "featured": a.featured,
    }


def _news(n):
    return {
        "id": n.id,
        "title": n.title,
        "summary": n.summary,
        "category": n.category,
        "published_at": n.published_at.isoformat(),
    }


def _placement(p):
    return {
        "id": p.id,
        "company": p.company,
        "role": p.role,
        "package": p.package,
        "eligibility": p.eligibility,
        "drive_date": p.drive_date.isoformat(),
        "application_url": p.application_url,
        "process": p.process,
        "departments": p.departments,
        "min_cgpa": p.min_cgpa,
    }


def _slot_out(slot: TimetableSlot, db: Session, user: User) -> dict:
    log = (
        db.query(AttendanceLog)
        .filter(AttendanceLog.student_id == user.id, AttendanceLog.slot_id == slot.id)
        .order_by(AttendanceLog.id.desc())
        .first()
    )
    return {
        "id": slot.id,
        "subject_id": slot.subject_id,
        "subject": slot.subject.name,
        "faculty": slot.subject.faculty,
        "classroom": slot.classroom,
        "day_of_week": slot.day_of_week,
        "start_time": slot.start_time.strftime("%H:%M"),
        "end_time": slot.end_time.strftime("%H:%M"),
        "attendance_status": log.status if log else "not_marked",
    }


def _sgpa_from_rows(rows: list[SgpaSubject]) -> dict:
    details = []
    num = den = 0
    for row in rows:
        total = row.total_marks or (row.cie_marks + row.see_marks * 0.5)
        grade, gp = marks_to_grade(total)
        num += gp * row.credits
        den += row.credits
        details.append(
            {
                "id": row.id,
                "subject_name": row.subject_name,
                "credits": row.credits,
                "cie_marks": row.cie_marks,
                "see_marks": row.see_marks,
                "total_marks": total,
                "grade": grade,
                "grade_points": gp,
                "predicted": row.predicted,
            }
        )
    return {"subjects": details, "sgpa": round(num / den, 2) if den else 0}


@router.get("/attendance")
def attendance(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _ensure_records(db, user)
    records = (
        db.query(AttendanceRecord)
        .options(joinedload(AttendanceRecord.subject))
        .filter(AttendanceRecord.student_id == user.id)
        .all()
    )
    rows = [_attendance_row(r) for r in records]
    tot = sum(r["total_classes"] for r in rows)
    att = sum(r["classes_attended"] for r in rows)
    return {
        "subjects": rows,
        "summary": {
            "total_classes": tot,
            "classes_attended": att,
            "classes_missed": tot - att,
            "percentage": percentage(att, tot),
            "target_percentage": 85,
        },
    }


@router.post("/attendance")
def update_attendance(payload: AttendanceUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rec = (
        db.query(AttendanceRecord)
        .options(joinedload(AttendanceRecord.subject))
        .filter(AttendanceRecord.student_id == user.id, AttendanceRecord.subject_id == payload.subject_id)
        .first()
    )
    if not rec:
        raise HTTPException(404, "Subject attendance not found")
    if payload.total_classes is not None:
        rec.total_classes = payload.total_classes
    if payload.classes_attended is not None:
        rec.classes_attended = payload.classes_attended
    if payload.target_percentage is not None:
        rec.target_percentage = payload.target_percentage
    if rec.classes_attended > rec.total_classes:
        raise HTTPException(400, "Attended classes cannot exceed total classes")
    db.commit()
    db.refresh(rec)
    return _attendance_row(rec)


@router.get("/attendance/bunk")
def bunk_calc(
    subject_id: int,
    target_percentage: float = 85,
    planned_bunks: int = 0,
    extra_attend: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rec = (
        db.query(AttendanceRecord)
        .options(joinedload(AttendanceRecord.subject))
        .filter(AttendanceRecord.student_id == user.id, AttendanceRecord.subject_id == subject_id)
        .first()
    )
    if not rec:
        raise HTTPException(404, "Subject not found")
    return {
        "subject": rec.subject.name,
        "current": percentage(rec.classes_attended, rec.total_classes),
        "total_classes": rec.total_classes,
        "classes_attended": rec.classes_attended,
        "target_percentage": target_percentage,
        "max_bunks": max_bunks(rec.classes_attended, rec.total_classes, target_percentage),
        "classes_needed": classes_needed(rec.classes_attended, rec.total_classes, target_percentage),
        "after_bunking": after_bunks(rec.classes_attended, rec.total_classes, planned_bunks),
        "after_attending": after_attend(rec.classes_attended, rec.total_classes, extra_attend),
        "planned_bunks": planned_bunks,
        "extra_attend": extra_attend,
    }


@router.get("/attendance/todo")
def attendance_todo(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    data = attendance(db, user)
    todos = []
    for row in data["subjects"]:
        if row["status"] == "safe" and row["max_bunks"] <= 1:
            todos.append({**row, "message": f"{row['subject']} is close to the {row['target_percentage']}% line. Avoid bunking."})
        elif row["status"] == "warning":
            todos.append({**row, "message": f"Attend {row['classes_needed']} more {row['subject']} class(es) to reach {row['target_percentage']}%."})
        elif row["status"] == "risk":
            todos.append({**row, "message": f"SEE eligibility risk in {row['subject']}. You need {row['classes_needed']} consecutive classes."})
    return {"items": todos, "count": len(todos)}


@router.get("/timetable")
def timetable(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    slots = (
        _scope(db.query(TimetableSlot), TimetableSlot, user)
        .options(joinedload(TimetableSlot.subject))
        .order_by(TimetableSlot.day_of_week, TimetableSlot.start_time)
        .all()
    )
    days = [[] for _ in range(7)]
    for slot in slots:
        days[slot.day_of_week].append(_slot_out(slot, db, user))
    weekday = datetime.now().weekday()
    today = days[weekday] if weekday < 7 else []
    now = datetime.now().strftime("%H:%M")
    next_class = next((c for c in today if c["start_time"] > now), None)
    return {"week": days, "today": today, "next_class": next_class, "upcoming": [c for c in today if c["start_time"] > now]}


@router.post("/timetable/attendance")
def mark_from_timetable(payload: MarkAttendanceIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if payload.status not in {"attended", "absent", "not_marked"}:
        raise HTTPException(400, "Invalid status")
    slot = db.query(TimetableSlot).filter(TimetableSlot.id == payload.slot_id).first()
    if not slot:
        raise HTTPException(404, "Slot not found")
    log = (
        db.query(AttendanceLog)
        .filter(AttendanceLog.student_id == user.id, AttendanceLog.slot_id == slot.id)
        .first()
    )
    previous = log.status if log else "not_marked"
    if log:
        log.status = payload.status
    else:
        log = AttendanceLog(student_id=user.id, slot_id=slot.id, status=payload.status)
        db.add(log)

    rec = (
        db.query(AttendanceRecord)
        .filter(AttendanceRecord.student_id == user.id, AttendanceRecord.subject_id == slot.subject_id)
        .first()
    )
    if rec:
        # revert previous contribution
        if previous == "attended":
            rec.total_classes = max(0, rec.total_classes - 1)
            rec.classes_attended = max(0, rec.classes_attended - 1)
        elif previous == "absent":
            rec.total_classes = max(0, rec.total_classes - 1)
        if payload.status == "attended":
            rec.total_classes += 1
            rec.classes_attended += 1
        elif payload.status == "absent":
            rec.total_classes += 1
    db.commit()
    return {"ok": True, "status": payload.status}


@router.get("/sgpa")
def get_sgpa(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    actual = db.query(SgpaSubject).filter(SgpaSubject.student_id == user.id, SgpaSubject.predicted.is_(False)).all()
    predicted = db.query(SgpaSubject).filter(SgpaSubject.student_id == user.id, SgpaSubject.predicted.is_(True)).all()
    actual_res = _sgpa_from_rows(actual)
    pred_res = _sgpa_from_rows(predicted or actual)
    what_if = []
    for row in actual_res["subjects"]:
        improved = min(100, row["total_marks"] + 10)
        grade, gp = marks_to_grade(improved)
        num = den = 0
        for other in actual_res["subjects"]:
            use_gp = gp if other["id"] == row["id"] else other["grade_points"]
            num += use_gp * other["credits"]
            den += other["credits"]
        what_if.append(
            {
                "subject_name": row["subject_name"],
                "current_total": row["total_marks"],
                "improved_total": improved,
                "new_sgpa": round(num / den, 2) if den else 0,
                "delta": round((num / den if den else 0) - actual_res["sgpa"], 2),
            }
        )
    return {"actual": actual_res, "predicted": pred_res, "what_if": what_if}


@router.post("/sgpa")
def save_sgpa(items: list[SgpaSubjectIn], db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    predicted_flag = any(i.predicted for i in items)
    db.query(SgpaSubject).filter(SgpaSubject.student_id == user.id, SgpaSubject.predicted.is_(predicted_flag)).delete()
    for item in items:
        total = item.total_marks if item.total_marks is not None else item.cie_marks + item.see_marks * 0.5
        db.add(
            SgpaSubject(
                student_id=user.id,
                subject_name=item.subject_name,
                credits=item.credits,
                cie_marks=item.cie_marks,
                see_marks=item.see_marks,
                total_marks=total,
                predicted=item.predicted,
            )
        )
    db.commit()
    return get_sgpa(db, user)


@router.get("/calendar")
def calendar(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    events = db.query(CalendarEvent).order_by(CalendarEvent.event_date).all()
    exams = db.query(Exam).filter(Exam.department == user.department).order_by(Exam.exam_date).all()
    return {
        "events": [_event(e) for e in events],
        "exams": [
            {
                "id": e.id,
                "title": e.title,
                "exam_type": e.exam_type,
                "subject_name": e.subject_name,
                "exam_date": e.exam_date.isoformat(),
                "department": e.department,
                "semester": e.semester,
            }
            for e in exams
        ],
    }


@router.get("/announcements")
def announcements(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return [_ann(a) for a in db.query(Announcement).order_by(Announcement.published_at.desc()).all()]
