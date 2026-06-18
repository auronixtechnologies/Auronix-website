/**
 * Portfolio Page Component
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tilt } from 'react-tilt';
import { projectsAPI } from '../services/api';
import './pages.css';
import Loader from '../components/Loader';

const DOMAINS = ['Web', 'ML', 'LLM', 'MCP'];

const defaultTiltOptions = {
  reverse: false,
  max: 15,
  perspective: 1000,
  scale: 1.05,
  speed: 1000,
  transition: true,
  axis: null,
  reset: true,
  easing: "cubic-bezier(.03,.98,.52,.99)",
};

export default function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [selectedDomain]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getProjects(selectedDomain);
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
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Portfolio</h1>
        <p className="intro">Our recent work and case studies — click any project to explore</p>
      </motion.div>

      <motion.div 
        className="filter-buttons"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <button
          className={`filter-btn ${selectedDomain === null ? 'active' : ''}`}
          onClick={() => setSelectedDomain(null)}
        >
          All Projects
        </button>
        {DOMAINS.map((domain) => (
          <button
            key={domain}
            className={`filter-btn ${selectedDomain === domain ? 'active' : ''}`}
            onClick={() => setSelectedDomain(domain)}
          >
            {domain}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <Loader />
      ) : (
        <div className="projects-grid">
          {projects.map((project, index) => (
            <Tilt key={project.id} options={defaultTiltOptions}>
              <motion.div
                className="project-card clickable-card"
                onClick={() => handleProjectClick(project.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleProjectClick(project.id)}
                aria-label={`View ${project.title} details`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                {project.project_image_data && project.project_image_type && (
                  <div style={{ width: '100%', height: '140px', marginBottom: '16px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img
                      src={`data:${project.project_image_type};base64,${project.project_image_data}`}
                      alt={project.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <h3>{project.title}</h3>
                <p className="domain">{project.domain}</p>
                <p>{project.description}</p>
                <div className="tech-stack">
                  {project.tech_stack.map((tech, idx) => (
                    <span key={idx} className="tech-badge">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="project-card-footer">
                  <span className="view-details-hint">
                    View Details →
                  </span>
                  <div className="project-links" onClick={(e) => { e.stopPropagation(); navigate(`/contact?project=${encodeURIComponent(project.title)}&service=${encodeURIComponent(project.domain)}`); }}>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageCircle size={16} /> Request Quote
                    </button>
                  </div>
                </div>
              </motion.div>
            </Tilt>
          ))}
        </div>
      )}
    </div>
  );
}
