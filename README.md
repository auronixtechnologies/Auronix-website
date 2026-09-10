# Auronix Technologies - Full Stack Web Application

> A production-ready portfolio website, team showcase, and project marketplace platform for Auronix Technologies built with FastAPI and React.

## 📋 Overview

This is a complete full-stack web application featuring:

- **Backend API** built with FastAPI and PostgreSQL
- **Frontend** built with React and Vite
- **Clean Architecture** following best practices
- **Modular Structure** for scalability and maintainability
- **Production-Ready** code with proper error handling and validation
- **Images stored in Postgres**, optimised on upload and served from a cached endpoint
- **Admin Endpoints** for managing team members, projects, and leads

## 🎯 Features

### Core Modules

1. **Team Module** - Showcase team members with skills and experience
2. **Portfolio Projects** - Display past projects with filtering by domain (Web, ML, LLM, MCP)
3. **Client Projects** - Case studies and testimonials
4. **Contact/Leads** - Lead capture system from contact form

### Tech Stack

- **Backend**: FastAPI + SQLAlchemy ORM
- **Database**: PostgreSQL
- **Frontend**: React 18 + Vite + React Router
- **Images**: Optimised to WebP on upload, stored as BYTEA, served with long-lived caching
- **Styling**: Modern CSS with responsive design

## 📁 Project Structure

```
Auronix Tech/
├── backend/                            # FastAPI application
│   ├── app/
│   │   ├── main.py                     # App instance, middleware, SPA serving
│   │   ├── core/                       # Cross-cutting infrastructure
│   │   │   ├── config.py               # Settings + production config guard
│   │   │   ├── security.py             # JWT + admin credential verification
│   │   │   └── db.py                   # Engine, session, schema bootstrap
│   │   ├── media/                      # Image handling
│   │   │   ├── images.py               # Upload optimisation + cached serving
│   │   │   └── encoding.py             # base64 <-> bytes helpers
│   │   ├── routes/                     # HTTP endpoints
│   │   │   ├── team.py                 # Team endpoints
│   │   │   ├── projects.py             # Portfolio project endpoints
│   │   │   ├── contact.py              # Client project endpoints
│   │   │   ├── leads.py                # Contact/lead endpoints
│   │   │   ├── blog.py                 # Blog endpoints
│   │   │   ├── auth.py                 # Admin login
│   │   │   └── __init__.py             # Combines routers under /api/v1
│   │   ├── services/                   # Business logic layer
│   │   ├── repositories/               # Raw-SQL repositories
│   │   ├── models/                     # SQLAlchemy ORM models
│   │   └── schemas/                    # Pydantic request/response schemas
│   ├── Database/
│   │   ├── schemas.sql                 # Table definitions (fresh installs)
│   │   └── migration_alter_queries.sql # Idempotent ALTERs (existing installs)
│   ├── uploads/                        # Static file mount
│   ├── seed.py                         # Sample data script
│   ├── requirements.txt                # Python dependencies
│   └── .env.example                    # Environment variable template
│
├── frontend/                           # React application
│   ├── src/
│   │   ├── components/                 # Navigation, Footer, Loader, ...
│   │   ├── pages/                      # Home, Portfolio, Team, Blog, admin/, ...
│   │   ├── services/
│   │   │   ├── api.js                  # Public API client + imageUrl()
│   │   │   └── adminApi.js             # Authenticated admin client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── Dockerfile                          # Multi-stage build (frontend + API)
├── .dockerignore
├── render.yaml                         # Render blueprint
├── docker-compose.yml                  # Local Postgres + pgAdmin
└── README.md                           # This file
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** for backend
- **Node.js 18+** for frontend
- **PostgreSQL 12+** installed and running

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup environment variables**
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and ensure correct PostgreSQL credentials:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/auronix_tech
   DATABASE_USER=postgres
   DATABASE_PASSWORD=password
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=auronix_tech
   DEBUG=True
   SECRET_KEY=your-secret-key-change-in-production
   ```

5. **Create PostgreSQL Database** (if not already created)
   ```sql
   createdb auronix_tech
   ```

6. **Run the backend server**
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   
   The API will be available at `http://localhost:8000`
   - API Docs (Swagger UI): `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

7. **Seed sample data** (optional, in a new terminal)
   ```bash
   python seed.py
   ```

### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal)
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   copy .env.example .env
   ```
   
   Default `.env` should work for local development:
   ```
   VITE_API_URL=http://localhost:8000/api/v1
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

## 🔐 Admin Panel Access

The admin dashboard is a secure area for managing team members, projects, and leads. 

### URLs
- **Admin Login Page**: `http://localhost:5173/auronix-admin`
- **Admin Dashboard**: `http://localhost:5173/auronix-admin/dashboard` *(Requires successful login)*

### Credentials

Admin credentials are read from the environment — they are not stored in the
codebase. Set these in `backend/.env`:

```bash
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD_HASH=<bcrypt hash>
```

Generate the hash (never store the plaintext password):

```bash
python -c "import bcrypt; print(bcrypt.hashpw(b'your-password', bcrypt.gensalt()).decode())"
```

If `ADMIN_PASSWORD_HASH` is unset, admin login is disabled rather than left
open. When `ENVIRONMENT=production`, the app refuses to start unless
`SECRET_KEY` and `ADMIN_PASSWORD_HASH` are set, `DEBUG` is `False`, and
`ALLOWED_ORIGINS` is not `*`.

> [!WARNING]
> The credentials previously hardcoded here and in `app/core/security.py` remain in git
> history. Treat them as compromised and choose a new password.

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Endpoints

#### Team Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/team` | Get all team members |
| GET | `/team/{id}` | Get specific team member |
| POST | `/team` | Create team member (admin) |
| PUT | `/team/{id}` | Update team member (admin) |
| DELETE | `/team/{id}` | Delete team member (admin) |

#### Portfolio Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | Get all projects |
| GET | `/projects?domain=ML` | Get projects by domain |
| GET | `/projects/featured` | Get featured projects |
| GET | `/projects/{id}` | Get specific project |
| POST | `/projects` | Create project (admin) |
| PUT | `/projects/{id}` | Update project (admin) |
| DELETE | `/projects/{id}` | Delete project (admin) |

#### Client Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/client-projects` | Get all client projects |
| GET | `/client-projects/{id}` | Get specific client project |
| POST | `/client-projects` | Create client project (admin) |
| PUT | `/client-projects/{id}` | Update client project (admin) |
| DELETE | `/client-projects/{id}` | Delete client project (admin) |

#### Contact/Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/contact` | Submit contact form |
| GET | `/admin/leads` | Get all leads (admin) |
| GET | `/admin/leads/{id}` | Get specific lead (admin) |
| DELETE | `/admin/leads/{id}` | Delete lead (admin) |

## 💾 Database Schema

### team_members
```sql
- id (integer, primary key)
- name (string)
- role (string)
- bio (text)
- skills (JSON array)
- linkedin_url (string)
- portfolio_url (string)
- profile_image (string - file path)
- experience_level (string)
- created_at (datetime)
- updated_at (datetime)
```

### projects
```sql
- id (integer, primary key)
- title (string)
- description (text)
- domain (string)
- tech_stack (JSON array)
- github_link (string)
- demo_link (string)
- price (string)
- created_by (foreign key to team_members)
- is_featured (boolean)
- created_at (datetime)
- updated_at (datetime)
```

### client_projects
```sql
- id (integer, primary key)
- client_name (string)
- project_title (string)
- description (text)
- technologies (JSON array)
- outcome (text)
- testimonial (text)
- project_url (string)
- completed_at (datetime)
- created_at (datetime)
- updated_at (datetime)
```

### leads
```sql
- id (integer, primary key)
- name (string)
- email (string)
- message (text)
- service_interest (string)
- created_at (datetime)
- updated_at (datetime)
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
- `DATABASE_URL` - PostgreSQL connection string
- `DEBUG` - Debug mode (True/False)
- `ENVIRONMENT` - environment type (development/production)
- `SECRET_KEY` - Secret key for security
- `UPLOAD_FOLDER` - Path for uploads (default: uploads/)
- `MAX_FILE_SIZE` - Max file size in bytes
- `ALLOWED_ORIGINS` - CORS allowed origins

**Frontend (.env)**
- `VITE_API_URL` - Backend API URL

## 📦 Deployment

The whole application ships as one Docker image: the React app is built and
copied next to the API, which serves both. Nothing needs a separate frontend
host, and the browser talks to a single origin.

### Full stack with Docker Compose (recommended)

API, built frontend and PostgreSQL, self-contained. This is the same database
setup as local development, just containerised.

```bash
cp .env.docker.example .env.docker
#   1. SECRET_KEY        python -c "import secrets; print(secrets.token_urlsafe(48))"
#   2. ADMIN_EMAIL
#   3. ADMIN_PASSWORD_HASH — note the "$" doubling explained in the file
docker compose up -d --build
```

The site and API are then on <http://localhost:8000>.

| Command | Effect |
|---|---|
| `docker compose up -d --build` | build and start the stack |
| `docker compose logs -f app` | follow application logs |
| `docker compose down` | stop; **database is kept** |
| `docker compose down -v` | stop and **delete the database volume** |
| `docker compose --profile tools up -d` | also start pgAdmin on :5050 |

Database files live in the named volume `auronix_postgres_data`. The app
reaches Postgres at `postgres:5432` on the compose network; the published
`5436` is only there for psql or a GUI client and can be removed.

Override host ports with a plain `.env` beside the compose file:

```bash
APP_PORT=8080
POSTGRES_PORT=5436
```

### Where this can run

Anywhere Docker Compose runs and the disk persists — a VPS, a self-hosted
box, or your own machine. The volume survives restarts and redeploys.

**Not Render.** A Render web service runs the Dockerfile alone; it has no
concept of a compose file, so the Postgres service would simply not exist.
Its container filesystem is also ephemeral, so a database running *inside*
the app container would be wiped on every deploy, restart, and free-tier idle
spin-down. To use Render, keep the database somewhere else and pass its
`DATABASE_URL` in — see `render.yaml`.

### Running the image on its own

Useful when the database already lives elsewhere:

```bash
docker build -t auronix .
docker run --rm -p 8000:8000   -e DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"   -e ENVIRONMENT=production   -e DEBUG=false   -e SECRET_KEY="..."   -e ADMIN_EMAIL="you@example.com"   -e ADMIN_PASSWORD_HASH='$2b$12$...'   auronix
```

Pass the hash unescaped here — the `$` doubling is a Compose quirk and does
not apply to `docker run` or to a platform's environment variables.

The app validates its configuration on startup and refuses to boot a
production instance with a development `SECRET_KEY`, `DEBUG` on, a missing or
malformed admin hash, or wildcard CORS.

## 🔐 Security Considerations

⚠️ **Important for Production:**

1. **Change SECRET_KEY** - Generate a strong secret key
2. **Use HTTPS** - Always use HTTPS in production
3. **Add Authentication** - Implement proper authentication for admin endpoints
4. **Database Backups** - Regular backup strategy
5. **Environment Variables** - Never commit .env file
6. **CORS Settings** - Restrict allowed origins appropriately
7. **Rate Limiting** - Add rate limiting for API endpoints
8. **Input Validation** - Already implemented via Pydantic schemas

## 🧪 Testing

To test the API, you can use the interactive Swagger UI at:
```
http://localhost:8000/docs
```

Or use curl:
```bash
# Get all team members
curl http://localhost:8000/api/v1/team

# Get featured projects
curl http://localhost:8000/api/v1/projects/featured

# Submit contact form
curl -X POST http://localhost:8000/api/v1/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "I am interested in your services",
    "service_interest": "Web Development"
  }'
```

## 🛠️ Development Workflow

### Adding a New Feature

1. **Backend**
   - Create database model in `app/models/__init__.py`
   - Create Pydantic schema in `app/schemas/__init__.py`
   - Create service layer in `app/services/__init__.py`
   - Create API routes in `app/api/routes/`
   - Include routes in `app/api/__init__.py`

2. **Frontend**
   - Add API client method in `src/services/api.js`
   - Create page component in `src/pages/`
   - Add styles in component CSS file
   - Add route in `src/App.jsx`

## 📝 Code Organization Principles

- **Separation of Concerns** - Each file has a single responsibility
- **Reusability** - Shared logic in service layer
- **Clean Code** - Clear variable names and function purposes
- **Documentation** - Comments for complex logic
- **Error Handling** - Proper exception handling throughout
- **Validation** - Input validation at API boundaries

## 🚨 Troubleshooting

### Backend Issues

**Database Connection Error**
```
Check PostgreSQL is running
Verify DATABASE_URL in .env
Ensure database exists: createdb auronix_tech
```

**Module Import Error**
```
Ensure venv is activated
Re-run: pip install -r requirements.txt
```

### Frontend Issues

**Port 5173 Already in Use**
```bash
npm run dev -- --port 5174
```

**API Connection Refused**
```
Ensure backend is running on port 8000
Check VITE_API_URL in .env
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Contributing

When contributing:
1. Follow the established code structure
2. Write comments for complex logic
3. Test changes thoroughly
4. Update documentation as needed

## 📄 License

Proprietary - Auronix Technologies

## 👨‍💻 Development Team

Built with ❤️ by the Auronix Technologies team

---

**For questions or support, contact: auronixtechnologies@gmail.com**


**Docker querying command**
```docker exec -it auronix-db psql -U auronix_admin -d auronix_db```