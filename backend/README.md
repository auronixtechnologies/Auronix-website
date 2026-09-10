# Backend API - Auronix Technologies

FastAPI backend service for Auronix Technologies portfolio platform.

## Overview

This is the REST API backend built with:
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations  
- **PostgreSQL** - Database
- **Pydantic** - Data validation

## Quick Start

### Setup

1. **Activate virtual environment**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   copy .env.example .env
   # Edit .env with your settings
   ```

4. **Run server**
   ```bash
   python -m uvicorn app.main:app --reload
   ```

### API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health Check: `http://localhost:8000/health`
- Root: `http://localhost:8000/`

## Project Structure

```
app/
├── main.py                  # App instance, middleware, SPA serving
├── core/                    # Cross-cutting infrastructure
│   ├── config.py            # Settings + production config guard
│   ├── security.py          # JWT + admin credential verification
│   ├── db.py                # Engine, session, schema bootstrap
│   └── logging.py           # Logging configuration
├── media/                   # Image handling
│   ├── images.py            # Upload optimisation + cached serving
│   └── encoding.py          # base64 -> bytes decoding
├── routes/                  # API endpoints
│   ├── team.py
│   ├── projects.py
│   ├── contact.py           # Client projects
│   ├── leads.py
│   ├── blog.py
│   ├── auth.py              # Admin login
│   └── __init__.py          # Combines routers under /api/v1
├── repositories/            # Raw-SQL data access
├── services/                # Business logic
├── models/                  # SQLAlchemy ORM models
└── schemas/                 # Pydantic validation

Database/
├── schemas.sql              # Table definitions (fresh installs)
└── migration_alter_queries.sql  # Idempotent ALTERs (existing installs)

uploads/                     # Static file mount
seed.py                      # Sample data
requirements.txt             # Dependencies
pyproject.toml               # Ruff lint + format config
.env.example                 # Environment template
```

## Database Models

### TeamMember
- id, name, role, bio, skills (JSON)
- linkedin_url, portfolio_url, profile_image
- experience_level, created_at, updated_at

### Project
- id, title, description, domain (Web/ML/LLM/MCP)
- tech_stack (JSON), github_link, demo_link
- created_by (FK), is_featured, created_at, updated_at

### ClientProject
- id, client_name, project_title, description
- technologies (JSON), outcome, testimonial
- project_url, completed_at, created_at, updated_at

### Lead
- id, name, email, message, service_interest
- created_at, updated_at

## API Routes

### Team (`/api/v1/team`)
```
GET    /team                 - List all
GET    /team/{id}            - Get one
POST   /team                 - Create
PUT    /team/{id}            - Update
DELETE /team/{id}            - Delete
```

### Projects (`/api/v1/projects`)
```
GET    /projects             - List all (supports ?domain=ML)
GET    /projects/featured    - Get featured
GET    /projects/{id}        - Get one
POST   /projects             - Create
PUT    /projects/{id}        - Update
DELETE /projects/{id}        - Delete
```

### Client Projects (`/api/v1/client-projects`)
```
GET    /client-projects      - List all
GET    /client-projects/{id} - Get one
POST   /client-projects      - Create
PUT    /client-projects/{id} - Update
DELETE /client-projects/{id} - Delete
```

### Contact (`/api/v1/contact`)
```
POST   /contact              - Submit form
GET    /admin/leads          - List leads (admin)
GET    /admin/leads/{id}     - Get lead (admin)
DELETE /admin/leads/{id}     - Delete lead (admin)
```

## Sample Requests

### Create Team Member
```bash
curl -X POST http://localhost:8000/api/v1/team \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "role": "Frontend Developer",
    "bio": "React expert",
    "skills": ["React", "TypeScript"],
    "experience_level": "senior"
  }'
```

### Create Project
```bash
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "E-Commerce Platform",
    "description": "Full-stack e-commerce",
    "domain": "Web",
    "tech_stack": ["React", "FastAPI"],
    "created_by": 1
  }'
```

### Submit Contact Form
```bash
curl -X POST http://localhost:8000/api/v1/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "I need a web app",
    "service_interest": "Web Development"
  }'
```

### Filter Projects by Domain
```bash
curl http://localhost:8000/api/v1/projects?domain=ML&limit=5
```

## File Upload

Images are stored locally in the `uploads/` directory. Database stores the file path, not the binary data.

Access uploaded images:
```
http://localhost:8000/uploads/path/to/image.jpg
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=auronix_tech

# App
DEBUG=True
ENVIRONMENT=development
SECRET_KEY=your-secret-key

# Files
UPLOAD_FOLDER=uploads/
MAX_FILE_SIZE=5242880

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Development

### Create Sample Data
```bash
python seed.py
```

### Run Tests (optional, add pytest)
```bash
pip install pytest
pytest
```

### Database Migrations

For production, use Alembic:
```bash
pip install alembic
alembic init migrations
```

## Production Deployment

1. Set `DEBUG=False` and `ENVIRONMENT=production`
2. Generate strong `SECRET_KEY`
3. Use a production ASGI server:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
   ```
4. Configure reverse proxy (nginx)
5. Enable HTTPS
6. Set up database backups

## Troubleshooting

### Import Errors
- Ensure venv is activated
- Run `pip install -r requirements.txt`

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL
- Create database: `createdb auronix_tech`

### Port 8000 Already in Use
```bash
python -m uvicorn app.main:app --reload --port 8001
```

## Security Notes

- Change SECRET_KEY in production
- Implement authentication for admin endpoints
- Use environment variables for sensitive data
- Enable HTTPS in production
- Add rate limiting for production
- Validate all inputs (already done via Pydantic)

## Architecture

### Clean Architecture Layers

1. **Routes** - HTTP endpoints (app/routes/)
2. **Schemas** - Request/response validation (app/schemas/)
3. **Services** - Business logic (app/services/)
4. **Repositories** - Raw-SQL data access (app/repositories/)
5. **Models** - SQLAlchemy ORM models (app/models/)
6. **Core** - Config, security, DB, logging (app/core/)
7. **Media** - Image optimisation and serving (app/media/)

Dependencies point inward: routes depend on services, services on
repositories, and everything may depend on `core`. Nothing in `core` imports a
feature layer.

## Code Quality

Linting and formatting are handled by [Ruff](https://docs.astral.sh/ruff/),
configured in `pyproject.toml`:

```bash
pip install ruff
ruff check .          # lint
ruff check . --fix    # lint and autofix
ruff format .         # format
```

This separation makes the code:
- Easy to test
- Easy to maintain
- Easy to extend
- Loosely coupled

## Further Development

Consider adding:
- JWT authentication
- API rate limiting
- Request logging
- Error tracking (Sentry)
- Email notifications
- Caching (Redis)
- Search functionality
- Payment integration
- Admin dashboard
- API versioning

---

For questions, see main README.md
