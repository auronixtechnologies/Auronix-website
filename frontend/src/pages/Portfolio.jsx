import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowUpRight, Folder, Sparkles, GraduationCap, Briefcase, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { projectsAPI, imageUrl } from '../services/api';
import './pages.css';
import Loader from '../components/Loader';

const CATEGORIES = [
  { id: 'All', label: 'All Projects', icon: Folder },
  { id: 'Client Projects', label: 'Client Projects', icon: Briefcase },
  { id: 'Student Projects', label: 'Student Projects', icon: GraduationCap },
  { id: "Auronix's Arsenal", label: "Auronix's Arsenal", icon: Sparkles },
  { id: 'Special Occasions', label: 'Special Occasions', icon: Heart },
];

const DOMAIN_MAP = {
  'All Domains': null,
  'Web Development': 'Web',
  'AI & Machine Learning': 'ML',
  'LLM Integrations': 'LLM',
  'Custom Code Solutions': 'MCP'
};

export default function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDomain, setActiveDomain] = useState('All Domains');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Switching filters quickly fires overlapping requests, and they can
    // resolve out of order. `cancelled` makes sure only the newest one is
    // allowed to write to state.
    let cancelled = false;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const apiDomain = DOMAIN_MAP[activeDomain];
        const apiCategory = activeCategory === 'All' ? null : activeCategory;
        const data = await projectsAPI.getProjects(apiDomain, apiCategory);
        if (!cancelled) setProjects(data);
      } catch (error) {
        if (!cancelled) console.error('Error fetching projects:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProjects();
    return () => {
      cancelled = true;
    };
  }, [activeCategory, activeDomain]);

  const handleProjectClick = (projectId) => {
    navigate(`/portfolio/${projectId}`);
  };

  return (
    <motion.div 
      className="page portfolio-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="portfolio-hero">
        <span className="portfolio-subtitle">Projects & Case Studies</span>
        <h1>Engineered Architecture</h1>
        <p className="portfolio-intro-desc">
          Explore our record of high-performance web systems, AI models, custom LLM agents, and freelance products built for scale.
        </p>
      </div>

      {/* Main Section Category Tabs */}
      <div className="portfolio-category-nav" style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setActiveDomain('All Domains');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '50px',
                border: isActive ? '1px solid var(--accent-gold, #cba135)' : '1px solid var(--border-color, rgba(255,255,255,0.1))',
                background: isActive ? 'linear-gradient(135deg, rgba(203, 161, 53, 0.2) 0%, rgba(203, 161, 53, 0.05) 100%)' : 'var(--bg-secondary, rgba(255,255,255,0.03))',
                color: isActive ? '#fff' : 'var(--text-secondary, #aaa)',
                fontWeight: isActive ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? '0 4px 20px rgba(203, 161, 53, 0.25)' : 'none'
              }}
            >
              <Icon size={16} color={isActive ? 'var(--accent-gold, #cba135)' : 'currentColor'} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Domain Sub-filters - Only displayed when Student Projects is selected */}
      {activeCategory === 'Student Projects' && (
        <div className="portfolio-filters-row" style={{ marginTop: '10px', marginBottom: '40px' }}>
          {Object.keys(DOMAIN_MAP).map((filterName) => (
            <button
              key={filterName}
              className={`portfolio-filter-tab ${activeDomain === filterName ? 'active' : ''}`}
              onClick={() => setActiveDomain(filterName)}
            >
              {filterName}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <Loader />
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <h3>No projects found in this section.</h3>
          <p>Check back soon as we publish new additions!</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="portfolio-masonry-grid"
        >
          <AnimatePresence mode="popLayout">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, cubicBezier: [0.16, 1, 0.3, 1] }}
                className="portfolio-card-item"
                onClick={() => handleProjectClick(project.id)}
              >
                {/* Image Cover Layer */}
                <div className="portfolio-card-cover">
                  {project.has_image ? (
                    <img
                      src={imageUrl('projects', project.id, project.updated_at)}
                      alt={project.title}
                      className="portfolio-cover-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="portfolio-cover-placeholder">
                      <span className="placeholder-pattern"></span>
                      <span className="placeholder-text">{project.title.substring(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                  {/* Category & Domain badges */}
                  <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
                    <span className="portfolio-card-domain-badge" style={{ position: 'relative', top: 0, left: 0 }}>
                      {project.category || 'Portfolio'}
                    </span>
                    <span className="portfolio-card-domain-badge" style={{ position: 'relative', top: 0, left: 0, background: 'rgba(255,255,255,0.15)' }}>
                      {project.domain}
                    </span>
                  </div>
                </div>

                {/* Content details */}
                <div className="portfolio-card-details">
                  <div className="card-detail-header">
                    <h3>{project.title}</h3>
                    <ArrowUpRight className="card-arrow-icon" size={18} />
                  </div>
                  <p className="project-card-desc">{project.description}</p>
                  
                  {/* Tech Pill List */}
                  <div className="portfolio-tech-list">
                    {project.tech_stack.map((tech, idx) => (
                      <span key={idx} className="tech-badge">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="portfolio-card-footer">
                    <span className="explore-details-link">
                      Explore Details
                    </span>
                    <button 
                      className="portfolio-quote-btn"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        navigate(`/contact?project=${encodeURIComponent(project.title)}&service=${encodeURIComponent(project.domain)}`); 
                      }}
                      aria-label="Request Quote"
                    >
                      <MessageSquare size={14} />
                      <span>Quote</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
