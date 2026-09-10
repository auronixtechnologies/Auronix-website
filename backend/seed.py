import os
import sys
from datetime import datetime

# Add the parent/app directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text

from app.core.db import SessionLocal, init_db
from app.models import BlogPost, ClientProject, Project, TeamMember


def seed_database():
    print("Initializing database schema...")
    try:
        init_db()
    except Exception as e:
        print(f"Schema initialization warning (might already exist): {e}")

    db = SessionLocal()
    try:
        # Clean up existing data to allow re-runs of seed
        print("Cleaning up old data...")
        db.execute(text("TRUNCATE TABLE project_members CASCADE;"))
        db.execute(text("TRUNCATE TABLE blog_posts CASCADE;"))
        db.execute(text("TRUNCATE TABLE projects CASCADE;"))
        db.execute(text("TRUNCATE TABLE client_projects CASCADE;"))
        db.execute(text("TRUNCATE TABLE team_members CASCADE;"))
        db.execute(text("TRUNCATE TABLE leads CASCADE;"))
        db.commit()
        print("Database cleared.")

        print("Seeding Team Members...")
        # 1. Team Members
        elena = TeamMember(
            name="Elena Rostova",
            role="Lead AI & LLM Engineer",
            bio="Elena specializes in NLP, large language models, and multi-agent systems. She previously built generative AI pipelines for major tech companies and holds an MS in Computer Science.",
            skills=[
                "Python",
                "PyTorch",
                "LangChain",
                "OpenAI",
                "FastAPI",
                "Vector Databases",
                "LlamaIndex",
                "Hugging Face",
            ],
            linkedin_url="https://linkedin.com/in/elena-rostova-demo",
            portfolio_url="https://github.com/elena-rostova-demo",
            experience_level="lead",
        )
        alex = TeamMember(
            name="Alex Mercer",
            role="Senior Full Stack Developer",
            bio="Alex is a full-stack engineer passionate about responsive designs and performant backend architectures. He is an expert in React, Node.js, FastAPI, and Kubernetes.",
            skills=[
                "React",
                "TypeScript",
                "FastAPI",
                "PostgreSQL",
                "Docker",
                "AWS",
                "CI/CD",
                "Next.js",
                "Kubernetes",
            ],
            linkedin_url="https://linkedin.com/in/alex-mercer-demo",
            portfolio_url="https://alexmercer-demo.dev",
            experience_level="senior",
        )
        sarah = TeamMember(
            name="Sarah Chen",
            role="Lead UI/UX & Frontend Designer",
            bio="Sarah bridges the gap between design and technology. She has over 6 years of experience designing beautiful, interactive web and mobile interfaces that focus on accessibility and motion design.",
            skills=[
                "Figma",
                "React",
                "TailwindCSS",
                "Framer Motion",
                "CSS3",
                "HTML5",
                "Adobe Creative Suite",
                "UX Research",
            ],
            linkedin_url="https://linkedin.com/in/sarah-chen-demo",
            portfolio_url="https://behance.net/sarah-chen-demo",
            experience_level="lead",
        )

        db.add_all([elena, alex, sarah])
        db.commit()
        db.refresh(elena)
        db.refresh(alex)
        db.refresh(sarah)
        print(
            f"Seeded 3 team members: Elena (ID: {elena.id}), Alex (ID: {alex.id}), Sarah (ID: {sarah.id})"
        )

        print("Seeding Portfolio Projects...")
        # 2. Portfolio Projects
        auraflow = Project(
            title="AuraFlow (LLM Agent Platform)",
            description="A state-of-the-art multi-agent orchestration platform that lets enterprises build, test, and deploy collaborative LLM agents with vector database RAG search. Features an interactive flow builder and token consumption diagnostics.",
            domain="LLM",
            tech_stack=[
                "Python",
                "FastAPI",
                "LangChain",
                "OpenAI",
                "Qdrant",
                "React",
                "TailwindCSS",
            ],
            github_link="https://github.com/auronix-tech/auraflow",
            demo_link="https://auraflow.auronix-demo.com",
            price="$8,500",
            created_by=elena.id,
            is_featured=True,
        )

        ecommerce = Project(
            title="Auronix eCommerce Suite",
            description="A premium high-performance headless commerce engine with lightning fast page loads. Built with Next.js App Router, Tailwind CSS, FastAPI, and PostgreSQL. Includes real-time stock sync, analytics dashboards, and Stripe Payment Intents.",
            domain="Web",
            tech_stack=[
                "React",
                "Next.js",
                "FastAPI",
                "PostgreSQL",
                "Redis",
                "Stripe API",
                "Docker",
            ],
            github_link="https://github.com/auronix-tech/ecommerce-suite",
            demo_link="https://shop.auronix-demo.com",
            price="$4,200",
            created_by=alex.id,
            is_featured=True,
        )

        constellation = Project(
            title="Constellation Analytics Dashboard",
            description="An immersive, real-time analytics suite featuring webGL and canvas animations. It visualizes server health metrics, web vitals, and user interaction coordinates dynamically across server constellations.",
            domain="Web",
            tech_stack=["React", "TypeScript", "D3.js", "Three.js", "FastAPI", "InfluxDB"],
            github_link="https://github.com/auronix-tech/constellation-analytics",
            demo_link="https://constellation.auronix-demo.com",
            price="$3,800",
            created_by=sarah.id,
            is_featured=False,
        )

        mcp_bridge = Project(
            title="HyperMCP System Bridge",
            description="A Model Context Protocol (MCP) server that exposes filesystem utilities, git operations, and local DB operations to LLM clients. Allows AI models to read, modify, and build files safely in sandboxed environments.",
            domain="MCP",
            tech_stack=["TypeScript", "Node.js", "Express", "Docker", "Svelte", "SQLite"],
            github_link="https://github.com/auronix-tech/hypermcp-bridge",
            demo_link="https://mcp.auronix-demo.com",
            price="$2,500",
            created_by=alex.id,
            is_featured=True,
        )

        db.add_all([auraflow, ecommerce, constellation, mcp_bridge])
        db.commit()
        db.refresh(auraflow)
        db.refresh(ecommerce)
        db.refresh(constellation)
        db.refresh(mcp_bridge)
        print("Seeded 4 portfolio projects: AuraFlow, eCommerce, Constellation, HyperMCP")

        # Set up project members (many-to-many relationship)
        # AuraFlow has Elena (creator), Alex, and Sarah as members
        db.execute(
            text("INSERT INTO project_members (project_id, team_member_id) VALUES (:p_id, :tm_id)"),
            {"p_id": auraflow.id, "tm_id": elena.id},
        )
        db.execute(
            text("INSERT INTO project_members (project_id, team_member_id) VALUES (:p_id, :tm_id)"),
            {"p_id": auraflow.id, "tm_id": alex.id},
        )
        db.execute(
            text("INSERT INTO project_members (project_id, team_member_id) VALUES (:p_id, :tm_id)"),
            {"p_id": auraflow.id, "tm_id": sarah.id},
        )

        # eCommerce has Alex (creator) and Sarah
        db.execute(
            text("INSERT INTO project_members (project_id, team_member_id) VALUES (:p_id, :tm_id)"),
            {"p_id": ecommerce.id, "tm_id": alex.id},
        )
        db.execute(
            text("INSERT INTO project_members (project_id, team_member_id) VALUES (:p_id, :tm_id)"),
            {"p_id": ecommerce.id, "tm_id": sarah.id},
        )

        # Constellation has Sarah (creator) and Alex
        db.execute(
            text("INSERT INTO project_members (project_id, team_member_id) VALUES (:p_id, :tm_id)"),
            {"p_id": constellation.id, "tm_id": sarah.id},
        )
        db.execute(
            text("INSERT INTO project_members (project_id, team_member_id) VALUES (:p_id, :tm_id)"),
            {"p_id": constellation.id, "tm_id": alex.id},
        )

        # HyperMCP has Alex (creator) and Elena
        db.execute(
            text("INSERT INTO project_members (project_id, team_member_id) VALUES (:p_id, :tm_id)"),
            {"p_id": mcp_bridge.id, "tm_id": alex.id},
        )
        db.execute(
            text("INSERT INTO project_members (project_id, team_member_id) VALUES (:p_id, :tm_id)"),
            {"p_id": mcp_bridge.id, "tm_id": elena.id},
        )

        db.commit()
        print("Associated team members with projects.")

        print("Seeding Client Projects (Case Studies & Testimonials)...")
        # 3. Client Projects
        logitrack = ClientProject(
            client_name="LogiTrack Global Solutions",
            project_title="AI-Powered Route Optimization Engine",
            description="We built a custom vehicle routing optimizer that calculates real-time delivery sequences for 120+ active trucks. Reduced fuel costs by 22% and increased delivery punctuality across North America.",
            technologies=["Python", "FastAPI", "Google OR-Tools", "React", "PostgreSQL", "Docker"],
            outcome="Achieved a 22% reduction in fleet fuel consumption and automated 100% of driver dispatch route planning.",
            testimonial="The team at Auronix Technologies delivered our route optimizer ahead of schedule. The impact on our daily operations was immediate—we saved thousands in fuel costs in the first month alone.",
            project_url="https://logitrack-case-study.com",
            is_featured=True,
            completed_at=datetime(2025, 11, 15),
        )

        finsphere = ClientProject(
            client_name="FinSphere Banking Group",
            project_title="Secured Financial Support Assistant",
            description="Developed a highly secure RAG chatbot using open-source LLMs deployed on-premise. The assistant resolves over 75% of basic customer banking questions instantly while complying with strict financial regulations.",
            technologies=["Python", "PyTorch", "Llama 3", "LlamaIndex", "FastAPI", "Qdrant"],
            outcome="Automated 75% of general support inquiries and maintained 100% data compliance within local banking servers.",
            testimonial="Auronix has stellar expertise in LLMs and AI compliance. They built a custom, on-prem solution for us that met all our strict security audits, keeping our client data completely private.",
            project_url="https://finsphere-case-study.com",
            is_featured=True,
            completed_at=datetime(2026, 3, 20),
        )

        medvantage = ClientProject(
            client_name="MedVantage Health",
            project_title="Automated Medical Record Parser",
            description="We built an LLM-powered extraction pipeline that processes incoming clinical referrals and maps them to structured medical standards. Reduced ingestion time from 4 hours to 3 minutes.",
            technologies=["Python", "FastAPI", "OpenAI API", "PostgreSQL", "React"],
            outcome="Achieved a 98.7% data extraction accuracy rate and reduced manual patient intake labor by 85%.",
            testimonial="The MedVantage integration was a monumental success. Auronix built a clinical extraction pipeline that is both HIPAA compliant and incredibly precise. Our admin team saves hours every day.",
            project_url="https://medvantage-case-study.com",
            is_featured=True,
            completed_at=datetime(2026, 5, 12),
        )

        db.add_all([logitrack, finsphere, medvantage])
        db.commit()
        print("Seeded 3 Client Projects/Testimonials")

        print("Seeding Blog Posts...")
        # 4. Blog Posts
        post1 = BlogPost(
            title="Building Interactive Orbit Visualizations in React",
            slug="interactive-orbit-visualizations-react",
            content="""# Interactive Orbit Visualizations in React

Visualizing team structures or systems doesn't have to be a boring grid. By combining standard React state with simple trigonometry, we can construct interactive constellation systems.

## The Math Behind Satellites

To position items on a circular path of radius $R$ around a central point $(C_x, C_y)$, we use the polar to Cartesian coordinates formula:

$$X = C_x + R \\times \\cos(\\theta)$$
$$Y = C_y + R \\times \\sin(\\theta)$$

Where $\\theta$ is the angle in radians.

## React Implementation

Here is a simple snippet showing how we can drive the orbit angles using `requestAnimationFrame`:

```jsx
useEffect(() => {
  let last = null;
  const animate = (timestamp) => {
    if (!last) last = timestamp;
    const delta = timestamp - last;
    last = timestamp;

    setAngles(prev => prev.map(angle => (angle + 0.05 * delta) % 360));
    requestAnimationFrame(animate);
  };
  const id = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(id);
}, []);
```

This dynamic feeling keeps your portfolio interactive and keeps users engaged. Try hovering components to pause the animation!
""",
            author_id=sarah.id,
            published_at=datetime(2026, 6, 1),
            is_published=True,
            tags=["React", "CSS", "Trigonometry", "Framer Motion"],
        )

        post2 = BlogPost(
            title="Designing High Performance APIs with FastAPI",
            slug="high-performance-apis-fastapi",
            content="""# Designing High Performance APIs with FastAPI

FastAPI has quickly become one of the most popular backend frameworks for Python developers. Thanks to its native `asyncio` support and automatic validation via Pydantic, it provides an incredible developer experience alongside speed matching Node.js and Go.

## Key Performance Tips

1. **Leverage Async Correctly**: Use `async def` for I/O bound tasks, but use standard `def` for heavy CPU bound work so it runs in a thread pool and doesn't block the main event loop.
2. **Database Connection Pooling**: Ensure your database engine is initialized with optimal pool sizes:
   ```python
   engine = create_engine(
       DATABASE_URL,
       pool_size=10,
       max_overflow=20,
       pool_pre_ping=True
   )
   ```
3. **Pydantic Validation**: Limit complex nested validations inside fast endpoints to reduce serialization overhead.

By following clean structure and proper middleware configurations, your FastAPI app can handle thousands of requests per second easily.
""",
            author_id=elena.id,
            published_at=datetime(2026, 6, 20),
            is_published=True,
            tags=["FastAPI", "Python", "PostgreSQL", "Database Tuning"],
        )

        db.add_all([post1, post2])
        db.commit()
        print("Seeded 2 Blog Posts")

        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
