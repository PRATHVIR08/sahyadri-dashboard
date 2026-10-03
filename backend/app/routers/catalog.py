from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..config import settings
from ..db import get_db
from ..deps import get_current_user
from ..models import (
    Achievement,
    Alumni,
    AlumniQuestion,
    CourseMaterial,
    Developer,
    HigherStudyResource,
    LostFoundItem,
    MiniProject,
    NewsItem,
    Placement,
    ProblemStatement,
    QuestionPaper,
    ResearchPaper,
    User,
    Vacancy,
)
from ..schemas import AlumniQuestionIn

router = APIRouter(prefix="/api", tags=["catalog"])


@router.get("/news")
def news(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(NewsItem).order_by(NewsItem.published_at.desc()).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "summary": n.summary,
            "category": n.category,
            "published_at": n.published_at.isoformat(),
        }
        for n in rows
    ]


@router.get("/papers")
def papers(
    department: str | None = None,
    semester: int | None = None,
    exam_type: str | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(QuestionPaper)
    dep = department or user.department
    sem = semester or user.semester
    if dep:
        query = query.filter(QuestionPaper.department == dep)
    if sem:
        query = query.filter(QuestionPaper.semester == sem)
    if exam_type:
        query = query.filter(QuestionPaper.exam_type == exam_type)
    if q:
        like = f"%{q}%"
        query = query.filter(QuestionPaper.subject.ilike(like) | QuestionPaper.title.ilike(like))
    return [
        {
            "id": p.id,
            "title": p.title,
            "course": p.course,
            "department": p.department,
            "semester": p.semester,
            "subject": p.subject,
            "exam_type": p.exam_type,
            "academic_year": p.academic_year,
            "url": p.url,
        }
        for p in query.all()
    ]


@router.get("/materials")
def materials(
    material_type: str | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(CourseMaterial).filter(CourseMaterial.department == user.department, CourseMaterial.semester == user.semester)
    if material_type:
        query = query.filter(CourseMaterial.material_type == material_type)
    if q:
        like = f"%{q}%"
        query = query.filter(CourseMaterial.title.ilike(like) | CourseMaterial.subject.ilike(like))
    return [
        {
            "id": m.id,
            "title": m.title,
            "material_type": m.material_type,
            "subject": m.subject,
            "department": m.department,
            "semester": m.semester,
            "url": m.url,
            "source": m.source,
        }
        for m in query.all()
    ]


@router.get("/placements")
def placements(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(Placement).order_by(Placement.drive_date).all()
    result = []
    for p in rows:
        eligible = user.department in p.departments.split(",") if user.department else True
        result.append(
            {
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
                "matches_department": eligible,
            }
        )
    return result


@router.get("/vacancies")
def vacancies(vacancy_type: str | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = db.query(Vacancy)
    if vacancy_type:
        query = query.filter(Vacancy.vacancy_type == vacancy_type)
    return [
        {
            "id": v.id,
            "company": v.company,
            "title": v.title,
            "vacancy_type": v.vacancy_type,
            "location": v.location,
            "stipend": v.stipend,
            "apply_url": v.apply_url,
            "deadline": v.deadline.isoformat(),
            "description": v.description,
        }
        for v in query.order_by(Vacancy.deadline).all()
    ]


@router.get("/higher-studies")
def higher_studies(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return [
        {
            "id": r.id,
            "exam_or_path": r.exam_or_path,
            "title": r.title,
            "category": r.category,
            "url": r.url,
            "notes": r.notes,
        }
        for r in db.query(HigherStudyResource).all()
    ]


@router.get("/problems")
def problems(source: str | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = db.query(ProblemStatement)
    if source:
        query = query.filter(ProblemStatement.source == source)
    return [
        {"id": p.id, "title": p.title, "source": p.source, "domain": p.domain, "description": p.description}
        for p in query.all()
    ]


@router.get("/mini-projects")
def mini_projects(category: str | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = db.query(MiniProject)
    if category:
        query = query.filter(MiniProject.category == category)
    return [
        {
            "id": p.id,
            "title": p.title,
            "category": p.category,
            "difficulty": p.difficulty,
            "description": p.description,
            "stack": p.stack,
        }
        for p in query.all()
    ]


@router.get("/research")
def research(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return [
        {
            "id": p.id,
            "title": p.title,
            "authors": p.authors,
            "venue": p.venue,
            "year": p.year,
            "topic": p.topic,
            "url": p.url,
            "resource_type": p.resource_type,
        }
        for p in db.query(ResearchPaper).all()
    ]


@router.get("/alumni")
def alumni(
    department: str | None = None,
    company: str | None = None,
    industry: str | None = None,
    skill: str | None = None,
    higher_studies: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(Alumni)
    if department:
        query = query.filter(Alumni.department == department)
    if company:
        query = query.filter(Alumni.company.ilike(f"%{company}%"))
    if industry:
        query = query.filter(Alumni.industry.ilike(f"%{industry}%"))
    if skill:
        query = query.filter(Alumni.skills.ilike(f"%{skill}%"))
    if higher_studies:
        query = query.filter(Alumni.higher_studies.ilike(f"%{higher_studies}%"))
    return [
        {
            "id": a.id,
            "name": a.name,
            "graduation_year": a.graduation_year,
            "department": a.department,
            "course": a.course,
            "company": a.company,
            "job_role": a.job_role,
            "industry": a.industry,
            "higher_studies": a.higher_studies,
            "skills": a.skills,
            "linkedin": a.linkedin,
            "expertise": a.expertise,
        }
        for a in query.all()
    ]


@router.post("/alumni/questions")
def ask_alumni(payload: AlumniQuestionIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = AlumniQuestion(alumni_id=payload.alumni_id, student_id=user.id, topic=payload.topic, question=payload.question)
    db.add(q)
    db.commit()
    return {"ok": True, "id": q.id}


@router.get("/achievements")
def achievements(category: str | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = db.query(Achievement)
    if category:
        query = query.filter(Achievement.category == category)
    return [
        {
            "id": a.id,
            "student_name": a.student_name,
            "title": a.title,
            "category": a.category,
            "description": a.description,
            "achieved_on": a.achieved_on.isoformat(),
            "department": a.department,
        }
        for a in query.order_by(Achievement.achieved_on.desc()).all()
    ]


@router.get("/developers")
def developers(db: Session = Depends(get_db)):
    return [
        {
            "id": d.id,
            "name": d.name,
            "role": d.role,
            "department": d.department,
            "contribution": d.contribution,
            "github": d.github,
            "linkedin": d.linkedin,
            "portfolio": d.portfolio,
        }
        for d in db.query(Developer).all()
    ]


@router.get("/lost-found")
def lost_found(kind: str | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = db.query(LostFoundItem)
    if kind:
        query = query.filter(LostFoundItem.kind == kind)
    items = [
        {
            "id": i.id,
            "kind": i.kind,
            "title": i.title,
            "description": i.description,
            "location": i.location,
            "item_date": i.item_date.isoformat(),
            "image_url": i.image_url,
            "contact": i.contact,
            "claim_status": i.claim_status,
        }
        for i in query.order_by(LostFoundItem.item_date.desc()).all()
    ]
    return {"external_url": settings.lost_and_found_url, "items": items}


@router.get("/students/network")
def network(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    peers = db.query(User).filter(User.role == "student", User.id != user.id).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "usn": p.usn,
            "department": p.department,
            "year": p.year,
            "semester": p.semester,
            "section": p.section,
            "interests": p.interests,
        }
        for p in peers
    ]
