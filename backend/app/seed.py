from datetime import date, datetime, time, timedelta

from sqlalchemy.orm import Session

from .auth import hash_password
from .models import (
    Achievement,
    Alumni,
    Announcement,
    AttendanceRecord,
    CalendarEvent,
    CourseMaterial,
    Developer,
    Exam,
    HigherStudyResource,
    LostFoundItem,
    MiniProject,
    NewsItem,
    Placement,
    ProblemStatement,
    QuestionPaper,
    ResearchPaper,
    SgpaSubject,
    Subject,
    TimetableSlot,
    User,
    Vacancy,
)


def seed_if_empty(db: Session) -> None:
    if db.query(User).first():
        return

    student = User(
        email="prathvir.is.24@sahyadri.edu.in",
        password_hash=hash_password("Sahyadri@123"),
        role="student",
        name="R S Prathvir",
        usn="4SF24IS040",
        photo_url=None,
        course="BE",
        department="ISE",
        year=3,
        semester=5,
        section="A",
        interests="Web Development, AI/ML, Product Design",
    )
    admin = User(
        email="admin@sahyadri.edu.in",
        password_hash=hash_password("Admin@12345"),
        role="admin",
        name="Portal Admin",
        usn=None,
        course="BE",
        department="ISE",
        year=3,
        semester=5,
        section="A",
        interests="Campus operations",
    )
    peer = User(
        email="ananya.cs.24@sahyadri.edu.in",
        password_hash=hash_password("Sahyadri@123"),
        role="student",
        name="Ananya Rao",
        usn="4SF24CS012",
        course="BE",
        department="CSE",
        year=3,
        semester=5,
        section="B",
        interests="Competitive programming, Cloud",
    )
    db.add_all([student, admin, peer])
    db.flush()

    subjects = [
        Subject(code="21CS51", name="Automata Theory", faculty="Prof. Kavitha Shetty", credits=3, course="BE", department="ISE", year=3, semester=5, section="A"),
        Subject(code="21CS52", name="Computer Networks", faculty="Dr. Naveen Kumar", credits=4, course="BE", department="ISE", year=3, semester=5, section="A"),
        Subject(code="21CS53", name="Database Management Systems", faculty="Prof. Shilpa B", credits=4, course="BE", department="ISE", year=3, semester=5, section="A"),
        Subject(code="21CS54", name="Software Engineering", faculty="Prof. Rohan Pai", credits=3, course="BE", department="ISE", year=3, semester=5, section="A"),
        Subject(code="21CSL55", name="CN Laboratory", faculty="Prof. Deepa K", credits=1, course="BE", department="ISE", year=3, semester=5, section="A"),
        Subject(code="21CSL56", name="DBMS Laboratory", faculty="Prof. Shilpa B", credits=1, course="BE", department="ISE", year=3, semester=5, section="A"),
        Subject(code="21CIP57", name="Research Methodology", faculty="Dr. Prashanth B", credits=2, course="BE", department="ISE", year=3, semester=5, section="A"),
    ]
    db.add_all(subjects)
    db.flush()

    totals = [42, 40, 38, 36, 20, 18, 16]
    attended = [36, 31, 34, 28, 18, 16, 12]
    for sub, tot, att in zip(subjects, totals, attended):
        db.add(
            AttendanceRecord(
                student_id=student.id,
                subject_id=sub.id,
                total_classes=tot,
                classes_attended=att,
                target_percentage=85,
            )
        )

    periods = [
        (time(9, 0), time(9, 55)),
        (time(9, 55), time(10, 50)),
        (time(11, 10), time(12, 5)),
        (time(12, 5), time(13, 0)),
        (time(14, 0), time(14, 55)),
        (time(14, 55), time(15, 50)),
    ]
    # Mon-Fri subject rotation
    week = [
        [0, 1, 2, 3, 4, 5],
        [1, 2, 0, 6, 3, 1],
        [2, 3, 1, 0, 5, 4],
        [3, 0, 6, 1, 2, 3],
        [0, 4, 1, 2, 6, 3],
    ]
    rooms = ["LH-204", "LH-205", "Lab-ISE1", "LH-204", "Lab-ISE2", "LH-301"]
    for day, order in enumerate(week):
        for idx, sub_i in enumerate(order):
            db.add(
                TimetableSlot(
                    subject_id=subjects[sub_i].id,
                    day_of_week=day,
                    start_time=periods[idx][0],
                    end_time=periods[idx][1],
                    classroom=rooms[idx],
                    course="BE",
                    department="ISE",
                    year=3,
                    semester=5,
                    section="A",
                )
            )

    today = date(2026, 10, 3)
    db.add_all(
        [
            Exam(title="CIE-2 Computer Networks", exam_type="CIE", subject_name="Computer Networks", exam_date=date(2026, 10, 16), department="ISE", semester=5),
            Exam(title="CIE-2 DBMS", exam_type="CIE", subject_name="Database Management Systems", exam_date=date(2026, 10, 18), department="ISE", semester=5),
            Exam(title="CIE-2 Automata Theory", exam_type="CIE", subject_name="Automata Theory", exam_date=date(2026, 10, 20), department="ISE", semester=5),
            Exam(title="SEE Odd Semester", exam_type="SEE", subject_name="All subjects", exam_date=date(2027, 1, 12), department="ISE", semester=5),
        ]
    )

    db.add_all(
        [
            CalendarEvent(title="Gandhi Jayanti", category="holiday", event_date=date(2026, 10, 2), location="Campus closed", description="National holiday"),
            CalendarEvent(title="CIE-2 Week", category="cie", event_date=date(2026, 10, 16), end_date=date(2026, 10, 22), location="Respective classrooms", description="Internal assessment round 2"),
            CalendarEvent(title="Sahyadri Hackathon 2026", category="hackathon", event_date=date(2026, 10, 24), end_date=date(2026, 10, 26), location="Innovation Lab", description="36-hour campus hackathon"),
            CalendarEvent(title="Placement Drive — Infosys", category="placement", event_date=date(2026, 10, 10), location="Seminar Hall", description="On-campus recruitment"),
            CalendarEvent(title="Aakriti Cultural Fest", category="cultural", event_date=date(2026, 11, 14), end_date=date(2026, 11, 16), location="Main Ground", description="Annual cultural festival"),
            CalendarEvent(title="IEEE Workshop on Cloud", category="workshop", event_date=date(2026, 10, 8), location="CSE Seminar Hall", description="Hands-on AWS workshop"),
            CalendarEvent(title="Semester End", category="academic", event_date=date(2027, 1, 31), location="Campus", description="Odd semester closing date"),
            CalendarEvent(title="NSS Blood Donation Camp", category="club", event_date=date(2026, 10, 12), location="Open Air Theatre", description="NSS unit camp"),
            CalendarEvent(title="SEE Practicals", category="see", event_date=date(2027, 1, 5), end_date=date(2027, 1, 10), location="Labs", description="Laboratory SEE"),
        ]
    )

    db.add_all(
        [
            Announcement(title="CIE-2 timetable released", body="Department of ISE has published the CIE-2 schedule. Check Academics → Calendar.", category="exam", featured=True),
            Announcement(title="Minimum attendance reminder", body="Students below 85% will not be eligible for SEE without condonation. Check Attendance To-Do.", category="attendance", featured=True),
            Announcement(title="Library extended hours", body="Central library will remain open till 9 PM during CIE week.", category="campus"),
        ]
    )

    db.add_all(
        [
            NewsItem(title="Sahyadri team wins Smart India Hackathon regional round", summary="ISE and CSE students secured a top-3 finish with a campus waste-routing prototype.", category="achievement", published_at=datetime(2026, 9, 28)),
            NewsItem(title="New AI Lab inaugurated", summary="The Department of AIML opened a GPU lab sponsored by an industry partner.", category="campus", published_at=datetime(2026, 9, 20)),
            NewsItem(title="Faculty paper accepted at ICSE workshop", summary="Dr. Naveen Kumar's paper on network telemetry was accepted.", category="faculty", published_at=datetime(2026, 9, 12)),
        ]
    )

    db.add_all(
        [
            QuestionPaper(title="CN CIE-1 2025", course="BE", department="ISE", semester=5, subject="Computer Networks", exam_type="CIE", academic_year="2025-26", url="https://example.edu/papers/cn-cie1-2025.pdf"),
            QuestionPaper(title="DBMS SEE 2025", course="BE", department="ISE", semester=5, subject="Database Management Systems", exam_type="SEE", academic_year="2024-25", url="https://example.edu/papers/dbms-see-2025.pdf"),
            QuestionPaper(title="Automata CIE-2 2024", course="BE", department="ISE", semester=5, subject="Automata Theory", exam_type="CIE", academic_year="2024-25", url="https://example.edu/papers/atc-cie2-2024.pdf"),
            QuestionPaper(title="SE SEE 2024", course="BE", department="ISE", semester=5, subject="Software Engineering", exam_type="SEE", academic_year="2023-24", url="https://example.edu/papers/se-see-2024.pdf"),
        ]
    )

    db.add_all(
        [
            CourseMaterial(title="Tanenbaum — Computer Networks", material_type="textbook", subject="Computer Networks", department="ISE", semester=5, url="https://example.edu/books/tanenbaum", source="Faculty recommended"),
            CourseMaterial(title="CN short notes module 3", material_type="short_notes", subject="Computer Networks", department="ISE", semester=5, url="https://example.edu/notes/cn-m3", source="Student notes"),
            CourseMaterial(title="DBMS ER diagrams handwritten", material_type="handwritten", subject="Database Management Systems", department="ISE", semester=5, url="https://example.edu/notes/dbms-er", source="Class notes"),
            CourseMaterial(title="SE UML slide deck", material_type="faculty", subject="Software Engineering", department="ISE", semester=5, url="https://example.edu/slides/se-uml", source="Prof. Rohan Pai"),
            CourseMaterial(title="Gate Smashers DBMS playlist", material_type="youtube", subject="Database Management Systems", department="ISE", semester=5, url="https://youtube.com/playlist?list=dbms", source="YouTube"),
            CourseMaterial(title="GeeksforGeeks CN tutorials", material_type="external", subject="Computer Networks", department="ISE", semester=5, url="https://www.geeksforgeeks.org/computer-network-tutorials/", source="GFG"),
        ]
    )

    db.add_all(
        [
            Placement(company="Infosys", role="Systems Engineer", package="3.6 LPA", eligibility="BE — all branches, 70% throughout, no active backlogs", drive_date=date(2026, 10, 10), application_url="https://campus.infosys.com", process="Online test → Technical → HR", departments="CSE,ISE,AIML,ECE,ME", min_cgpa=7.0),
            Placement(company="TCS", role="Ninja / Digital", package="3.36 – 7.0 LPA", eligibility="BE 2027 batch, 6.0 CGPA", drive_date=date(2026, 10, 28), application_url="https://nextstep.tcs.com", process="TCS NQT → Interview", departments="CSE,ISE,AIML,ECE", min_cgpa=6.0),
            Placement(company="Amazon", role="SDE Intern", package="Stipend ₹1.1L / month", eligibility="ISE/CSE/AIML, strong DSA", drive_date=date(2026, 11, 5), application_url="https://amazon.jobs", process="OA → 2 technical rounds", departments="CSE,ISE,AIML", min_cgpa=7.5),
        ]
    )

    db.add_all(
        [
            Vacancy(company="Unacademy", title="Frontend Intern", vacancy_type="internship", location="Remote", stipend="₹25,000", apply_url="https://unacademy.com/careers", deadline=date(2026, 10, 20), description="React internship, 6 months."),
            Vacancy(company="HashedIn by Deloitte", title="Software Engineer", vacancy_type="full-time", location="Bengaluru", stipend="6–8 LPA", apply_url="https://hashedin.com", deadline=date(2026, 11, 1), description="Off-campus full-time for 2027 batch."),
            Vacancy(company="Local startup — Mangaluru", title="Part-time web developer", vacancy_type="part-time", location="Mangaluru", stipend="₹8,000", apply_url="https://example.com/apply", deadline=date(2026, 10, 15), description="Campus-adjacent product studio."),
        ]
    )

    db.add_all(
        [
            HigherStudyResource(exam_or_path="GATE", title="GATE CS 2027 official site", category="exam", url="https://gate.iisc.ac.in", notes="Focus on CN, DBMS, Algorithms"),
            HigherStudyResource(exam_or_path="GRE", title="ETS GRE student guide", category="exam", url="https://www.ets.org/gre", notes="Verbal + Quant 3-month plan"),
            HigherStudyResource(exam_or_path="IELTS", title="British Council IELTS", category="exam", url="https://www.ielts.org", notes=None),
            HigherStudyResource(exam_or_path="TOEFL", title="TOEFL iBT", category="exam", url="https://www.ets.org/toefl", notes=None),
            HigherStudyResource(exam_or_path="CAT", title="IIM CAT", category="exam", url="https://iimcat.ac.in", notes="For MBA track"),
            HigherStudyResource(exam_or_path="MS", title="MS abroad checklist", category="path", url="https://educationusa.state.gov", notes="SOP, LORs, SOP timeline"),
            HigherStudyResource(exam_or_path="M.Tech", title="CCMT counselling primer", category="path", url="https://ccmt.nic.in", notes="GATE qualified"),
            HigherStudyResource(exam_or_path="Scholarships", title="Inlaks & JN Tata listing", category="scholarship", url="https://www.jntataendowment.org", notes="Need + merit"),
        ]
    )

    db.add_all(
        [
            ProblemStatement(title="Smart canteen queue prediction", source="college", domain="AI/ML", description="Predict rush hours using POS and Wi-Fi occupancy."),
            ProblemStatement(title="Western Ghats landslide early warning", source="industry", domain="IoT", description="Sensor + rainfall model for coastal Karnataka."),
            ProblemStatement(title="Campus lost-item matching", source="hackathon", domain="Web Development", description="Image similarity for lost and found reports."),
            ProblemStatement(title="Low-cost water quality monitor", source="real-world", domain="IoT", description="For Netravati river stretches near Mangaluru."),
        ]
    )

    db.add_all(
        [
            MiniProject(title="Department event portal", category="Web Development", difficulty="Beginner", description="CRUD events with RSVP.", stack="React, FastAPI, Postgres"),
            MiniProject(title="Attendance anomaly detector", category="AI/ML", difficulty="Intermediate", description="Flag sudden drops in attendance.", stack="Python, scikit-learn"),
            MiniProject(title="Placement dashboard", category="Data Science", difficulty="Intermediate", description="Visualize drive outcomes.", stack="Pandas, Plotly"),
            MiniProject(title="Smart classroom occupancy", category="IoT", difficulty="Advanced", description="PIR + MQTT occupancy.", stack="ESP32, MQTT"),
            MiniProject(title="Secure notes locker", category="Cybersecurity", difficulty="Intermediate", description="Encrypted student notes.", stack="WebCrypto, FastAPI"),
            MiniProject(title="Campus bus tracker", category="Mobile Development", difficulty="Intermediate", description="Live shuttle location.", stack="Flutter, Firebase"),
        ]
    )

    db.add_all(
        [
            ResearchPaper(title="Attention is All You Need", authors="Vaswani et al.", venue="NeurIPS", year=2017, topic="AI/ML", url="https://arxiv.org/abs/1706.03762", resource_type="paper"),
            ResearchPaper(title="Writing a CS conference paper", authors="Sahyadri Research Cell", venue="Internal guide", year=2025, topic="Paper writing", url="https://example.edu/guides/cs-paper", resource_type="guide"),
            ResearchPaper(title="IEEE ACCESS author kit", authors="IEEE", venue="IEEE", year=2026, topic="Journals", url="https://ieeeaccess.ieee.org", resource_type="journal"),
        ]
    )

    db.add_all(
        [
            Alumni(name="Sneha Kamath", graduation_year=2021, department="ISE", course="BE", company="Microsoft", job_role="Software Engineer", industry="Product", higher_studies=None, skills="C#, Azure, System Design", linkedin="https://linkedin.com/in/snehakamath", expertise="Placements, internships, product engineering"),
            Alumni(name="Aditya Shenoy", graduation_year=2019, department="CSE", course="BE", company="Carnegie Mellon", job_role="MS Student", industry="Higher Studies", higher_studies="MS CS, CMU", skills="ML, Research", linkedin="https://linkedin.com/in/adityashenoy", expertise="MS applications, SOP reviews"),
            Alumni(name="Megha Bhat", graduation_year=2020, department="ISE", course="BE", company="Goldman Sachs", job_role="Analyst", industry="Finance", higher_studies=None, skills="Python, SQL, Markets", linkedin="https://linkedin.com/in/meghabhat", expertise="Quant internships, CAT vs campus"),
        ]
    )

    db.add_all(
        [
            Achievement(student_id=student.id, student_name="R S Prathvir", title="SIH 2026 regional finalist", category="Hackathons", description="Smart waste routing for campus hostels.", achieved_on=date(2026, 9, 28), department="ISE"),
            Achievement(student_id=peer.id, student_name="Ananya Rao", title="CodeChef 5-star", category="Coding competitions", description="Consistent contest rating above 2000.", achieved_on=date(2026, 8, 14), department="CSE"),
            Achievement(student_id=None, student_name="Football team", title="VTU zonal runners-up", category="Sports", description="Men's football zonal tournament.", achieved_on=date(2026, 9, 5), department="Sports"),
        ]
    )

    db.add_all(
        [
            Developer(name="R S Prathvir", role="Project Manager", department="ISE", contribution="Product vision, full-stack architecture, portal launch", github="https://github.com", linkedin="https://linkedin.com", portfolio="https://sahyadri.edu.in"),
            Developer(name="Campus Tech Club", role="Frontend Developer", department="CSE", contribution="Dashboard UI, timetable, attendance views", github="https://github.com", linkedin="https://linkedin.com", portfolio=None),
            Developer(name="Data Cell", role="Database Developer", department="ISE", contribution="Supabase schema and academic seed datasets", github="https://github.com", linkedin="https://linkedin.com", portfolio=None),
            Developer(name="Design Circle", role="UI/UX Designer", department="ISE", contribution="Visual language inspired by the Western Ghats", github=None, linkedin="https://linkedin.com", portfolio=None),
        ]
    )

    db.add_all(
        [
            LostFoundItem(kind="lost", title="Black ID card holder", description="Sahyadri ID with ISE sticker", location="LH-204", item_date=today - timedelta(days=1), image_url=None, contact="4SF24IS040", claim_status="open"),
            LostFoundItem(kind="found", title="Calculator (Casio fx-991)", description="Found near library steps", location="Central Library", item_date=today - timedelta(days=2), image_url=None, contact="Library desk", claim_status="open"),
        ]
    )

    marks = [(38, 72), (34, 64), (40, 78), (32, 60), (42, 80), (40, 76), (30, 58)]
    for sub, (cie, see) in zip(subjects, marks):
        db.add(
            SgpaSubject(
                student_id=student.id,
                subject_name=sub.name,
                credits=sub.credits,
                cie_marks=cie,
                see_marks=see,
                total_marks=cie + see * 0.5,
                predicted=False,
            )
        )

    db.commit()
