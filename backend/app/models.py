from datetime import date, datetime, time
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, Time, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="student")
    name: Mapped[str] = mapped_column(String(120))
    usn: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(400), nullable=True)
    course: Mapped[str | None] = mapped_column(String(40), nullable=True)
    department: Mapped[str | None] = mapped_column(String(80), nullable=True)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    semester: Mapped[int | None] = mapped_column(Integer, nullable=True)
    section: Mapped[str | None] = mapped_column(String(8), nullable=True)
    interests: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    attendance_records: Mapped[list["AttendanceRecord"]] = relationship(back_populates="student")
    attendance_logs: Mapped[list["AttendanceLog"]] = relationship(back_populates="student")
    achievements: Mapped[list["Achievement"]] = relationship(back_populates="student")


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(20), index=True)
    name: Mapped[str] = mapped_column(String(160))
    faculty: Mapped[str] = mapped_column(String(120))
    credits: Mapped[int] = mapped_column(Integer, default=3)
    course: Mapped[str] = mapped_column(String(40))
    department: Mapped[str] = mapped_column(String(80))
    year: Mapped[int] = mapped_column(Integer)
    semester: Mapped[int] = mapped_column(Integer)
    section: Mapped[str] = mapped_column(String(8), default="A")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    __table_args__ = (UniqueConstraint("student_id", "subject_id", name="uq_att_student_subject"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"))
    total_classes: Mapped[int] = mapped_column(Integer, default=0)
    classes_attended: Mapped[int] = mapped_column(Integer, default=0)
    target_percentage: Mapped[float] = mapped_column(Float, default=85.0)

    student: Mapped[User] = relationship(back_populates="attendance_records")
    subject: Mapped[Subject] = relationship()


class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    slot_id: Mapped[int] = mapped_column(ForeignKey("timetable_slots.id"))
    status: Mapped[str] = mapped_column(String(20), default="not_marked")
    marked_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    student: Mapped[User] = relationship(back_populates="attendance_logs")
    slot: Mapped["TimetableSlot"] = relationship()


class TimetableSlot(Base):
    __tablename__ = "timetable_slots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"))
    day_of_week: Mapped[int] = mapped_column(Integer)
    start_time: Mapped[time] = mapped_column(Time)
    end_time: Mapped[time] = mapped_column(Time)
    classroom: Mapped[str] = mapped_column(String(40))
    week_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    course: Mapped[str] = mapped_column(String(40))
    department: Mapped[str] = mapped_column(String(80))
    year: Mapped[int] = mapped_column(Integer)
    semester: Mapped[int] = mapped_column(Integer)
    section: Mapped[str] = mapped_column(String(8))

    subject: Mapped[Subject] = relationship()


class Exam(Base):
    __tablename__ = "exams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(160))
    exam_type: Mapped[str] = mapped_column(String(20))
    subject_name: Mapped[str] = mapped_column(String(160))
    exam_date: Mapped[date] = mapped_column(Date)
    department: Mapped[str] = mapped_column(String(80))
    semester: Mapped[int] = mapped_column(Integer)


class CalendarEvent(Base):
    __tablename__ = "calendar_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(40))
    event_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    location: Mapped[str | None] = mapped_column(String(160), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(40), default="general")
    published_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)


class NewsItem(Base):
    __tablename__ = "news_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    summary: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(40))
    published_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class QuestionPaper(Base):
    __tablename__ = "question_papers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    course: Mapped[str] = mapped_column(String(40))
    department: Mapped[str] = mapped_column(String(80))
    semester: Mapped[int] = mapped_column(Integer)
    subject: Mapped[str] = mapped_column(String(160))
    exam_type: Mapped[str] = mapped_column(String(20))
    academic_year: Mapped[str] = mapped_column(String(20))
    url: Mapped[str] = mapped_column(String(400))


class CourseMaterial(Base):
    __tablename__ = "course_materials"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    material_type: Mapped[str] = mapped_column(String(40))
    subject: Mapped[str] = mapped_column(String(160))
    department: Mapped[str] = mapped_column(String(80))
    semester: Mapped[int] = mapped_column(Integer)
    url: Mapped[str] = mapped_column(String(400))
    source: Mapped[str | None] = mapped_column(String(160), nullable=True)


class Placement(Base):
    __tablename__ = "placements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company: Mapped[str] = mapped_column(String(160))
    role: Mapped[str] = mapped_column(String(160))
    package: Mapped[str] = mapped_column(String(80))
    eligibility: Mapped[str] = mapped_column(Text)
    drive_date: Mapped[date] = mapped_column(Date)
    application_url: Mapped[str] = mapped_column(String(400))
    process: Mapped[str] = mapped_column(Text)
    departments: Mapped[str] = mapped_column(String(200))
    min_cgpa: Mapped[float] = mapped_column(Float, default=6.5)


class Vacancy(Base):
    __tablename__ = "vacancies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company: Mapped[str] = mapped_column(String(160))
    title: Mapped[str] = mapped_column(String(160))
    vacancy_type: Mapped[str] = mapped_column(String(40))
    location: Mapped[str] = mapped_column(String(120))
    stipend: Mapped[str | None] = mapped_column(String(80), nullable=True)
    apply_url: Mapped[str] = mapped_column(String(400))
    deadline: Mapped[date] = mapped_column(Date)
    description: Mapped[str] = mapped_column(Text)


class HigherStudyResource(Base):
    __tablename__ = "higher_study_resources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    exam_or_path: Mapped[str] = mapped_column(String(80))
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(40))
    url: Mapped[str] = mapped_column(String(400))
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class ProblemStatement(Base):
    __tablename__ = "problem_statements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    source: Mapped[str] = mapped_column(String(40))
    domain: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(Text)


class MiniProject(Base):
    __tablename__ = "mini_projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(80))
    difficulty: Mapped[str] = mapped_column(String(20))
    description: Mapped[str] = mapped_column(Text)
    stack: Mapped[str] = mapped_column(String(200))


class ResearchPaper(Base):
    __tablename__ = "research_papers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(240))
    authors: Mapped[str] = mapped_column(String(240))
    venue: Mapped[str] = mapped_column(String(160))
    year: Mapped[int] = mapped_column(Integer)
    topic: Mapped[str] = mapped_column(String(120))
    url: Mapped[str] = mapped_column(String(400))
    resource_type: Mapped[str] = mapped_column(String(40), default="paper")


class Alumni(Base):
    __tablename__ = "alumni"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    graduation_year: Mapped[int] = mapped_column(Integer)
    department: Mapped[str] = mapped_column(String(80))
    course: Mapped[str] = mapped_column(String(40))
    company: Mapped[str] = mapped_column(String(160))
    job_role: Mapped[str] = mapped_column(String(160))
    industry: Mapped[str] = mapped_column(String(80))
    higher_studies: Mapped[str | None] = mapped_column(String(200), nullable=True)
    skills: Mapped[str] = mapped_column(String(240))
    linkedin: Mapped[str] = mapped_column(String(240))
    expertise: Mapped[str] = mapped_column(Text)


class AlumniQuestion(Base):
    __tablename__ = "alumni_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    alumni_id: Mapped[int] = mapped_column(ForeignKey("alumni.id"))
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    topic: Mapped[str] = mapped_column(String(80))
    question: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    student_name: Mapped[str] = mapped_column(String(120))
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(Text)
    achieved_on: Mapped[date] = mapped_column(Date)
    department: Mapped[str] = mapped_column(String(80))

    student: Mapped[User | None] = relationship(back_populates="achievements")


class Developer(Base):
    __tablename__ = "developers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(80))
    department: Mapped[str] = mapped_column(String(80))
    contribution: Mapped[str] = mapped_column(Text)
    github: Mapped[str | None] = mapped_column(String(240), nullable=True)
    linkedin: Mapped[str | None] = mapped_column(String(240), nullable=True)
    portfolio: Mapped[str | None] = mapped_column(String(240), nullable=True)


class LostFoundItem(Base):
    __tablename__ = "lost_found_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    kind: Mapped[str] = mapped_column(String(10))
    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text)
    location: Mapped[str] = mapped_column(String(160))
    item_date: Mapped[date] = mapped_column(Date)
    image_url: Mapped[str | None] = mapped_column(String(400), nullable=True)
    contact: Mapped[str] = mapped_column(String(160))
    claim_status: Mapped[str] = mapped_column(String(20), default="open")


class SgpaSubject(Base):
    __tablename__ = "sgpa_subjects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    subject_name: Mapped[str] = mapped_column(String(160))
    credits: Mapped[int] = mapped_column(Integer)
    cie_marks: Mapped[float] = mapped_column(Float, default=0)
    see_marks: Mapped[float] = mapped_column(Float, default=0)
    total_marks: Mapped[float] = mapped_column(Float, default=0)
    predicted: Mapped[bool] = mapped_column(Boolean, default=False)
