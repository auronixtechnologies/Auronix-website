# Auronix Technologies - Full Stack Web Application

> A production-ready portfolio website, team showcase, and project marketplace platform for Auronix Technologies built with FastAPI and React.

## 📋 Overview

This is a complete full-stack web application featuring:

- **Backend API** built with FastAPI and PostgreSQL
- **Frontend** built with React and Vite
- **Clean Architecture** following best practices
- **Modular Structure** for scalability and maintainability
- **Production-Ready** code with proper error handling and validation
- **Local File Storage** for images/uploads
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
- **File Storage**: Local file uploads with path storage in DB
- **Styling**: Modern CSS with responsive design

## 📁 Project Structure

```
Auronix Tech/
├── backend/                          # FastAPI application
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── team.py          # Team endpoints
│   │   │   │   ├── projects.py      # Portfolio project endpoints
│   │   │   │   ├── contact.py       # Client projects endpoints
│   │   │   │   └── leads.py         # Contact/leads endpoints
│   │   │   └── __init__.py
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   │   └── __init__.py
│   │   ├── schemas/                 # Pydantic validation schemas
│   │   │   └── __init__.py
│   │   ├── services/                # Business logic layer
│   │   │   └── __init__.py
│   │   ├── main.py                  # FastAPI app initialization
│   │   ├── db.py                    # Database connection
│   │   ├── config.py                # Configuration management
│   │   └── __init__.py
│   ├── uploads/                     # Image uploads directory
│   ├── seed_data.py                 # Sample data script
│   ├── requirements.txt             # Python dependencies
│   ├── .env.example                 # Environment variables template
│   └── README.md                    # Backend documentation
│
├── frontend/                        # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.jsx
│   │   │   ├── Navigation.css
│   │   │   ├── Footer.jsx
│   │   │   └── Footer.css
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Team.jsx
│   │   │   ├── Portfolio.jsx
│   │   │   ├── Contact.jsx
│   │   │   └── pages.css
│   │   ├── services/
│   │   │   └── api.js              # API client
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── README.md                   # Frontend documentation
│
━ .gitignore
└── README.md                        # This file

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
   python seed_data.py
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
python -c "from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).hash('your-password'))"
```

If `ADMIN_PASSWORD_HASH` is unset, admin login is disabled rather than left
open. When `ENVIRONMENT=production`, the app refuses to start unless
`SECRET_KEY` and `ADMIN_PASSWORD_HASH` are set, `DEBUG` is `False`, and
`ALLOWED_ORIGINS` is not `*`.

> [!WARNING]
> The credentials previously hardcoded here and in `app/auth.py` remain in git
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

## 📦 Building for Production

### Backend
```bash
# Run with production settings
# Edit .env with ENVIRONMENT=production, DEBUG=False
# Use a proper ASGI server like gunicorn+uvicorn

pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
```

### Frontend
```bash
npm run build

# Deploy the dist/ folder to your hosting service
```

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