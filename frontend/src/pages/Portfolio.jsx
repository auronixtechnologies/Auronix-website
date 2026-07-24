import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { projectsAPI } from '../services/api';
import './pages.css';
import Loader from '../components/Loader';

const DOMAIN_MAP = {
  'All': null,
  'Web Development': 'Web',
  'AI & Machine Learning': 'ML',
  'LLM Integrations': 'LLM',
  'Custom Code Solutions': 'MCP'
};

export default function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [activeFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const apiDomain = DOMAIN_MAP[activeFilter];
      const data = await projectsAPI.getProjects(apiDomain);
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <span className="portfolio-subtitle">Case Studies</span>
        <h1>Engineered Architecture</h1>
        <p className="portfolio-intro-desc">
          Explore our record of high-performance web systems, custom LLM agents, and automation workflows built for scale.
        </p>
      </div>

      {/* Premium Filter row */}
      <div className="portfolio-filters-row">
        {Object.keys(DOMAIN_MAP).map((filterName) => (
          <button
            key={filterName}
            className={`portfolio-filter-tab ${activeFilter === filterName ? 'active' : ''}`}
            onClick={() => setActiveFilter(filterName)}
          >
            {filterName}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <motion.div 
          layout
          className="portfolio-masonry-grid"
        >
          <AnimatePresence mode="popLayout">
            {projects.map((project, index) => (
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
                  {project.project_image_data && project.project_image_type ? (
                    <img
                      src={`data:${project.project_image_type};base64,${project.project_image_data}`}
                      alt={project.title}
                      className="portfolio-cover-img"
                    />
                  ) : (
                    <div className="portfolio-cover-placeholder">
                      <span className="placeholder-pattern"></span>
                      <span className="placeholder-text">{project.title.substring(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                  {/* Absolute domain label */}
                  <span className="portfolio-card-domain-badge">
                    {project.domain}
                  </span>
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
                      Explore Case Study
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
