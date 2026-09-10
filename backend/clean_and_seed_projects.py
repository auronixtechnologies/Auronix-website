import os
import sys
from datetime import datetime

# Add app directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text

from app.core.db import SessionLocal, init_db
from app.models import ClientProject, Project, TeamMember

RAW_PROJECTS = [
    {
        "id": 1,
        "project_name": "Student Complaint Management System",
        "category_raw": "01-Web Development",
        "tech_stack": ["Django", "Bootstrap", "HTML5", "CSS3", "JavaScript", "SQLite"],
        "description": "Streamlines student grievance reporting by allowing students to submit, track, and categorize complaints with priority levels while enabling administration to manage resolution workflows.",
    },
    {
        "id": 2,
        "project_name": "Online Examination and Result Management System",
        "category_raw": "01-Web Development",
        "tech_stack": ["FastAPI", "SQLAlchemy", "SQLite", "React", "Vite", "Tailwind CSS"],
        "description": "Automates online exam creation, candidate evaluation, timed testing, and instant result score generation to eliminate manual grading errors.",
    },
    {
        "id": 3,
        "project_name": "Smart Attendance Management System",
        "category_raw": "01-Web Development",
        "tech_stack": ["FastAPI", "SQLAlchemy", "SQLite", "React", "Tailwind CSS", "Axios"],
        "description": "Simplifies student attendance tracking using QR code check-ins, GPS geolocation verification, and real-time analytical reporting for faculty.",
    },
    {
        "id": 4,
        "project_name": "College Event Management System",
        "category_raw": "01-Web Development",
        "tech_stack": ["FastAPI", "SQLAlchemy", "SQLite", "React", "Vite", "Tailwind CSS"],
        "description": "Centralizes campus event publishing, ticket booking, participant registration, and schedule management for college cultural and academic events.",
    },
    {
        "id": 5,
        "project_name": "Online Job Portal for Freshers",
        "category_raw": "01-Web Development",
        "tech_stack": ["FastAPI", "SQLAlchemy", "SQLite", "React", "Vite", "Tailwind CSS"],
        "description": "Connects graduating students with recruiters by providing job posting, resume submissions, application status tracking, and interview scheduling.",
    },
    {
        "id": 6,
        "project_name": "Library Management System",
        "category_raw": "01-Web Development",
        "tech_stack": ["FastAPI", "SQLAlchemy", "SQLite", "React", "Vite", "Tailwind CSS"],
        "description": "Digitizes book cataloging, issue/return tracking, fine calculations, and availability searches for campus libraries.",
    },
    {
        "id": 7,
        "project_name": "Online Voting System",
        "category_raw": "01-Web Development",
        "tech_stack": ["FastAPI", "SQLAlchemy", "SQLite", "React", "Vite", "Tailwind CSS"],
        "description": "Conducts secure, tamper-proof student union elections with voter authentication, encrypted ballot casting, and real-time vote tallying.",
    },
    {
        "id": 8,
        "project_name": "Personal Expense Tracker for Students",
        "category_raw": "01-Web Development",
        "tech_stack": ["React", "Vite", "HTML5", "CSS3", "JavaScript"],
        "description": "Helps students monitor personal budgets, categorize daily expenses, and analyze spending habits through visual charts.",
    },
    {
        "id": 9,
        "project_name": "Smart Hostel Room Allocation System",
        "category_raw": "01-Web Development",
        "tech_stack": ["FastAPI", "SQLAlchemy", "SQLite", "React", "Vite", "Tailwind CSS"],
        "description": "Automates student hostel room applications, preference matching, capacity monitoring, and bed allocation workflows.",
    },
    {
        "id": 10,
        "project_name": "Hostel Management System",
        "category_raw": "01-Web Development",
        "tech_stack": ["FastAPI", "SQLAlchemy", "SQLite", "React", "Vite", "Tailwind CSS"],
        "description": "Manages hostel administration, resident attendance records, mess billing, maintenance requests, and room allocations.",
    },
    {
        "id": 11,
        "project_name": "Digital Certificate Verification System",
        "category_raw": "01-Web Development",
        "tech_stack": ["FastAPI", "SQLAlchemy", "SQLite", "React", "Vite", "Tailwind CSS"],
        "description": "Prevents academic credential forgery by allowing third parties to instantly verify digitally signed student certificates via unique IDs or QR codes.",
    },
    {
        "id": 12,
        "project_name": "Online Grievance Redressal System with Escalation Levels",
        "category_raw": "01-Web Development",
        "tech_stack": ["FastAPI", "SQLAlchemy", "SQLite", "React", "Vite", "Tailwind CSS"],
        "description": "Handles institutional grievances with automated multi-tier escalation timelines if unresolved by primary authority officers.",
    },
    {
        "id": 13,
        "project_name": "Faculty Workload Management System",
        "category_raw": "01-Web Development",
        "tech_stack": ["FastAPI", "SQLAlchemy", "SQLite", "React", "Vite", "Tailwind CSS"],
        "description": "Tracks teaching hours, research duties, committee commitments, and administrative tasks to optimize faculty work distribution.",
    },
    {
        "id": 14,
        "project_name": "College Bus Route and Attendance Management System",
        "category_raw": "01-Web Development",
        "tech_stack": ["FastAPI", "SQLAlchemy", "SQLite", "React", "Vite", "Tailwind CSS"],
        "description": "Manages college transport operations, student bus stop allocations, route tracking, and daily boarding verification.",
    },
    {
        "id": 15,
        "project_name": "Research Paper Submission and Review Management System",
        "category_raw": "01-Web Development",
        "tech_stack": ["Django", "Bootstrap", "HTML5", "CSS3", "SQLite"],
        "description": "Facilitates academic conference paper submissions, peer reviewer assignments, revision tracking, and editor decision workflows.",
    },
    {
        "id": 16,
        "project_name": "College Placement Management System",
        "category_raw": "01-Web Development",
        "tech_stack": ["FastAPI", "SQLAlchemy", "SQLite", "React", "Vite", "Tailwind CSS"],
        "description": "Coordinates campus recruitment drives, student eligibility filtering, interview schedules, and job offer tracking.",
    },
    {
        "id": 17,
        "project_name": "Blood Bank Management System",
        "category_raw": "01-Web Development",
        "tech_stack": ["FastAPI", "SQLModel", "SQLite", "React", "Vite", "Tailwind CSS"],
        "description": "Manages donor registries, blood group inventory levels, and emergency blood request dispatching between donors and hospitals.",
    },
    {
        "id": 18,
        "project_name": "Online E-Learning Platform",
        "category_raw": "01-Web Development",
        "tech_stack": ["FastAPI", "SQLAlchemy", "SQLite", "React", "Vite", "Tailwind CSS"],
        "description": "Delivers online video courses, module quizzes, downloadable study resources, and student progress tracking.",
    },
    {
        "id": 19,
        "project_name": "Automated Project Report Generator",
        "category_raw": "02-AI-LLM",
        "tech_stack": [
            "FastAPI",
            "Google Gemini API",
            "SQLAlchemy",
            "SQLite",
            "React",
            "Vite",
            "Tailwind CSS",
        ],
        "description": "Automatically generates comprehensive, structured academic project documentation and reports using Google Gemini LLM based on user inputs.",
    },
    {
        "id": 20,
        "project_name": "LLM-Powered Resume Analyzer and Feedback System",
        "category_raw": "02-AI-LLM",
        "tech_stack": [
            "FastAPI",
            "Google Gemini API",
            "OpenAI API",
            "Anthropic API",
            "PyMuPDF",
            "React",
            "Vite",
            "Tailwind CSS",
        ],
        "description": "Analyzes resumes against industry standards and job descriptions using LLMs to provide tailored improvement feedback and ATS score optimization.",
    },
    {
        "id": 21,
        "project_name": "Fake News Detection System",
        "category_raw": "03-Machine Learning",
        "tech_stack": [
            "FastAPI",
            "Scikit-Learn",
            "NLTK",
            "Pandas",
            "NumPy",
            "React",
            "Tailwind CSS",
        ],
        "description": "Detects misleading news articles and misinformation by analyzing text patterns using natural language processing (NLP) and TF-IDF machine learning classification models.",
    },
    {
        "id": 22,
        "project_name": "Student Feedback Sentiment Analysis System",
        "category_raw": "03-Machine Learning",
        "tech_stack": ["Flask", "Flask-SQLAlchemy", "NLTK", "React", "Tailwind CSS"],
        "description": "Evaluates course and instructor feedback comments using NLP sentiment analysis to categorize responses into positive, negative, or neutral sentiment scores.",
    },
    {
        "id": 23,
        "project_name": "Context-Aware Multi-Agent Academic Assistant (MCP)",
        "category_raw": "04-MCP",
        "tech_stack": [
            "FastAPI",
            "Model Context Protocol (MCP)",
            "Google Gemini API",
            "Anthropic API",
            "MongoDB",
            "Redis",
            "Celery",
            "React",
            "Vite",
            "Tailwind CSS",
        ],
        "description": "Orchestrates specialized AI sub-agents to solve complex academic tasks, answer domain queries, and summarize research papers within a unified context-aware system.",
    },
    {
        "id": 24,
        "project_name": "Auronix Corporate Portal",
        "category_raw": "Standalone / Company",
        "tech_stack": ["FastAPI", "SQLAlchemy", "SQLite", "React", "Vite", "Axios"],
        "description": "Serves as a corporate hub showcasing agency services, client portfolio projects, software solutions, and business inquiry workflows.",
    },
    {
        "id": 25,
        "project_name": "Interactive Celebratory & Memory Web App",
        "category_raw": "Standalone / Custom Application",
        "tech_stack": [
            "React",
            "Vite",
            "GSAP",
            "Framer Motion",
            "Canvas Confetti",
            "HTML5",
            "CSS3",
        ],
        "description": "Delivers an interactive visual celebratory experience featuring animated memories, festive visual effects, dynamic media, and personal milestone greetings.",
    },
    {
        "id": 26,
        "project_name": "Our Portfolio Platform",
        "category_raw": "Standalone / Company",
        "tech_stack": [
            "Django",
            "Django REST Framework",
            "Django AllAuth",
            "React",
            "Vite",
            "Axios",
            "SQLite",
        ],
        "description": "A multi-tenant team portfolio management system for showcasing team members, projects across various categories (Client, Student, Internal), and professional achievements.",
    },
    {
        "id": 27,
        "project_name": "Interactive Code Practice Application",
        "category_raw": "Standalone / Web Application",
        "tech_stack": [
            "React",
            "Vite",
            "Pyodide",
            "Framer Motion",
            "Lucide Icons",
            "Canvas Confetti",
        ],
        "description": "Provides an in-browser Python coding sandbox with gamified level progression and client-side code execution without requiring backend execution servers.",
    },
    {
        "id": 28,
        "project_name": "Technical Interview Platform",
        "category_raw": "Standalone / Web Application",
        "tech_stack": ["React", "Vite", "React Router", "Lucide Icons", "jsPDF", "html2canvas"],
        "description": "Conducts online candidate technical assessments through MCQ quizzes and coding challenges with automated evaluation and downloadable PDF score reports.",
    },
    {
        "id": 29,
        "project_name": "Crackers Website",
        "category_raw": "Client Projects",
        "tech_stack": ["Python", "Django", "HTML5", "CSS3", "JavaScript", "SQLite", "WhatsApp API"],
        "description": "An e-commerce platform for ordering crackers online, featuring inventory management, customer user accounts, order tracking, and automated WhatsApp order notifications.",
    },
    {
        "id": 30,
        "project_name": "Finance Monitoring",
        "category_raw": "Auronix's Arsenal",
        "tech_stack": [
            "Python",
            "Django",
            "Firebase",
            "HTML5",
            "CSS3",
            "JavaScript",
            "SQLite",
            "SMS Gateway API",
        ],
        "description": "A financial tracking and customer monitoring system that manages client payment records, generates financial reports, and dispatches automated SMS alerts.",
    },
    {
        "id": 31,
        "project_name": "Session Management",
        "category_raw": "Auronix's Arsenal",
        "tech_stack": ["Python", "Django", "HTML5", "CSS3", "JavaScript", "SQLite"],
        "description": "An academic web portal for managing sessions, monitoring student attendance, organizing class schedules, and tracking student performance profiles.",
    },
    {
        "id": 32,
        "project_name": "Study Buddy",
        "category_raw": "02-AI-LLM",
        "tech_stack": ["Python", "Flask", "React", "Node.js", "SQLite", "AI / LLM API Integration"],
        "description": "An AI-powered learning assistant application designed to assist students with interactive study assistance, resource management, and automated query answering.",
    },
    {
        "id": 33,
        "project_name": "Turf Booking App",
        "category_raw": "Auronix's Arsenal",
        "tech_stack": [
            "Python",
            "Django",
            "HTML5",
            "CSS3",
            "JavaScript",
            "SQLite",
            "Payment Gateway API",
        ],
        "description": "A sports venue and turf reservation management platform supporting online slot bookings, team organization, facility reviews, and payment processing.",
    },
]


def map_domain(p: dict) -> str:
    cat_raw = p.get("category_raw", "")
    tech = " ".join(p.get("tech_stack", []))
    if "02-AI-LLM" in cat_raw or "LLM" in tech or "AI" in tech:
        return "LLM"
    elif "03-Machine Learning" in cat_raw:
        return "ML"
    elif "04-MCP" in cat_raw:
        return "MCP"
    return "Web"


def map_category(p: dict) -> str:
    id_val = p.get("id", 0)
    cat_raw = p.get("category_raw", "")
    if cat_raw in ["Client Projects", "Auronix's Arsenal", "Special Occasions"]:
        return cat_raw
    if id_val == 25:
        return "Special Occasions"
    elif id_val <= 23:
        return "Student Projects"
    return "Auronix's Arsenal"


def seed_projects():
    init_db()
    db = SessionLocal()
    try:
        # Ensure category column exists on projects table
        db.execute(
            text(
                "ALTER TABLE projects ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Student Projects';"
            )
        )
        db.commit()

        print("Wiping existing project data from DB...")
        db.execute(text("TRUNCATE TABLE project_members CASCADE;"))
        db.execute(text("TRUNCATE TABLE projects CASCADE;"))
        db.execute(text("TRUNCATE TABLE client_projects CASCADE;"))
        db.commit()

        # Check if team member exists
        team_member = db.query(TeamMember).first()
        if not team_member:
            team_member = TeamMember(
                name="Auronix Engineering",
                role="Core Development Team",
                bio="Full-stack engineering & AI solution experts at Auronix Technologies.",
                skills=["React", "FastAPI", "Python", "Docker", "TailwindCSS"],
                experience_level="senior",
            )
            db.add(team_member)
            db.commit()
            db.refresh(team_member)

        print(f"Seeding {len(RAW_PROJECTS)} new projects into DB...")
        for p in RAW_PROJECTS:
            domain = map_domain(p)
            category = map_category(p)

            project_obj = Project(
                title=p["project_name"],
                description=p["description"],
                category=category,
                domain=domain,
                tech_stack=p["tech_stack"],
                created_by=team_member.id,
                is_featured=(p["id"] in [2, 19, 20, 23, 24, 27, 29]),
            )
            db.add(project_obj)

            # If it's a Client Project, also seed to client_projects table for Client Case Studies
            if category == "Client Projects":
                client_proj = ClientProject(
                    client_name=p["project_name"] + " Client",
                    project_title=p["project_name"],
                    description=p["description"],
                    technologies=p["tech_stack"],
                    outcome="Successfully launched e-commerce store with real-time WhatsApp order dispatch.",
                    testimonial="Auronix delivered a smooth, high-reliability ordering system for our seasonal sales.",
                    is_featured=True,
                    completed_at=datetime.utcnow(),
                )
                db.add(client_proj)

        db.commit()
        print(
            f"Successfully seeded all {len(RAW_PROJECTS)} projects and updated Client Projects table in PostgreSQL database!"
        )
    except Exception as e:
        db.rollback()
        print(f"Error seeding projects: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_projects()
