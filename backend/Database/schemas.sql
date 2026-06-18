CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    bio TEXT,
    skills JSONB,
    linkedin_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    profile_image_data BYTEA,
    profile_image_type VARCHAR(50),
    experience_level VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    domain VARCHAR(100) NOT NULL,
    tech_stack JSONB NOT NULL,
    github_link VARCHAR(500),
    demo_link VARCHAR(500),
    price VARCHAR(100),
    project_image_data BYTEA,
    project_image_type VARCHAR(50),
    created_by INTEGER REFERENCES team_members(id),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_members (
    project_id INTEGER REFERENCES projects(id),
    team_member_id INTEGER REFERENCES team_members(id),
    PRIMARY KEY (project_id, team_member_id)
);

CREATE TABLE IF NOT EXISTS client_projects (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    technologies JSONB NOT NULL,
    outcome TEXT,
    testimonial TEXT,
    project_url VARCHAR(500),
    project_image_data BYTEA,
    project_image_type VARCHAR(50),
    is_featured BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    service_type VARCHAR(255),
    budget VARCHAR(100),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES team_members(id),
    published_at TIMESTAMP,
    is_published BOOLEAN DEFAULT FALSE,
    image_data BYTEA,
    image_type VARCHAR(50),
    tags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
