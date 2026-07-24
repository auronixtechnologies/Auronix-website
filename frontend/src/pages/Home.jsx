/**
 * Home Page Component
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tilt } from 'react-tilt';
import { Code2, Cpu, Database, Server, Cloud, Terminal, Globe, Zap, Shield } from 'lucide-react';
import { projectsAPI, clientProjectsAPI } from '../services/api';
import './pages.css';

import Loader from '../components/Loader';

const defaultTiltOptions = {
  reverse: false,  // reverse the tilt direction
  max: 15,         // max tilt rotation (degrees)
  perspective: 1000, // Transform perspective, the lower the more extreme the tilt gets.
  scale: 1.05,     // 2 = 200%, 1.5 = 150%, etc..
  speed: 1000,     // Speed of the enter/exit transition
  transition: true, // Set a transition on enter/exit.
  axis: null,      // What axis should be disabled. Can be X or Y.
  reset: true,     // If the tilt effect has to be reset on exit.
  easing: "cubic-bezier(.03,.98,.52,.99)", // Easing on enter/exit.
};

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [featuredTestimonials, setFeaturedTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [consoleTab, setConsoleTab] = useState('api');
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    fetchFeaturedProjects();
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const data = await clientProjectsAPI.getClientProjects(0, 50);
      setFeaturedTestimonials(data.filter(cp => cp.is_featured && cp.testimonial));
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const fetchFeaturedProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getFeaturedProjects();
      setFeaturedProjects(data);
    } catch (error) {
      console.error('Error fetching featured projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const consoleContent = {
    api: [
      { text: 'auronix --api status', prompt: true },
      { text: '● auronix-api-server.service - Active: running', prompt: false },
      { text: '↳ Load: 12% | Latency: 42ms | SSL: Verified', prompt: false },
      { text: '↳ Logs: GET /v1/projects 200 OK - 15ms', prompt: false }
    ],
    ml: [
      { text: 'auronix --ml status', prompt: true },
      { text: '● auronix-llm-orchestrator - Active: listening', prompt: false },
      { text: '↳ VRAM: 32GB/80GB | CUDA: v12.1 | Epochs: 400', prompt: false },
      { text: '↳ State: Inference model loaded (llama-3.1-8b)', prompt: false }
    ],
    web: [
      { text: 'auronix --web status', prompt: true },
      { text: '● auronix-frontend-client - Active: running', prompt: false },
      { text: '↳ Framework: React + Vite + Framer Motion', prompt: false },
      { text: '↳ Theme variables successfully loaded', prompt: false }
    ]
  };

  return (
    <div className="page">
      <motion.section
        className="hero-asymmetric"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="hero-left">
          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Welcome to Auronix Technologies
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Creative solutions for your digital presence
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link to="/contact">
              <button className="btn btn-primary">
                Get Started <Zap size={18} style={{ marginLeft: '6px' }} />
              </button>
            </Link>
          </motion.div>
        </div>

        <div className="hero-right">
          {/* Interactive Console Widget */}
          <div className="console-widget">
            <div className="console-header">
              <div className="console-dots">
                <span className="console-dot red"></span>
                <span className="console-dot yellow"></span>
                <span className="console-dot green"></span>
              </div>
              <div className="console-tabs">
                <button
                  className={`console-tab ${consoleTab === 'api' ? 'active' : ''}`}
                  onClick={() => setConsoleTab('api')}
                >
                  API
                </button>
                <button
                  className={`console-tab ${consoleTab === 'ml' ? 'active' : ''}`}
                  onClick={() => setConsoleTab('ml')}
                >
                  AI/ML
                </button>
                <button
                  className={`console-tab ${consoleTab === 'web' ? 'active' : ''}`}
                  onClick={() => setConsoleTab('web')}
                >
                  Web
                </button>
              </div>
            </div>
            <div className="console-body">
              {consoleContent[consoleTab].map((line, index) => (
                <div key={index} className="console-line">
                  {line.prompt && <span className="console-prompt">auronix@core:~$</span>}
                  <span>{line.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-bento-row">
            {/* SLA Circular Progress Widget */}
            <div className="hero-bento-widget sla-widget">
              <div className="progress-ring-container">
                <svg className="progress-ring-svg">
                  <circle className="progress-ring-circle-bg" cx="40" cy="40" r="36" strokeWidth="4"></circle>
                  <circle className="progress-ring-circle" cx="40" cy="40" r="36" strokeWidth="4"></circle>
                </svg>
                <span className="progress-percent">99%</span>
              </div>
              <h3>Uptime SLA</h3>
              <p>Guaranteed reliability</p>
            </div>

            {/* Projects Completed Widget */}
            <div className="hero-bento-widget">
              <div className="widget-number">25+</div>
              <div className="widget-label">Completed Projects</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Globally distributed systems.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Trust Badges Marquee Redesign */}
      <section className="capabilities-section-marquee">
        <div className="capabilities-header-compact">
          <span className="capabilities-subtitle">Core Capabilities</span>
          <h2>Technologies & Core Expertise</h2>
        </div>

        <div className="dual-marquee-container">
          {/* Row 1: Left-scrolling core competencies */}
          <div className="marquee-row row-left">
            <div className="marquee-track">
              <div className="marquee-pill"><Code2 size={18} className="pill-icon" /><span>Web Architecture</span></div>
              <div className="marquee-pill"><Cpu size={18} className="pill-icon" /><span>Machine Learning</span></div>
              <div className="marquee-pill"><Database size={18} className="pill-icon" /><span>Database Tuning</span></div>
              <div className="marquee-pill"><Server size={18} className="pill-icon" /><span>Backend Scale</span></div>
              <div className="marquee-pill"><Cloud size={18} className="pill-icon" /><span>Cloud Infrastructure</span></div>
              <div className="marquee-pill"><Terminal size={18} className="pill-icon" /><span>DevOps pipelines</span></div>
              <div className="marquee-pill"><Globe size={18} className="pill-icon" /><span>Distributed Systems</span></div>
              <div className="marquee-pill"><Zap size={18} className="pill-icon" /><span>High Performance</span></div>
              <div className="marquee-pill"><Shield size={18} className="pill-icon" /><span>API Protection</span></div>
              {/* Duplicate */}
              <div className="marquee-pill"><Code2 size={18} className="pill-icon" /><span>Web Architecture</span></div>
              <div className="marquee-pill"><Cpu size={18} className="pill-icon" /><span>Machine Learning</span></div>
              <div className="marquee-pill"><Database size={18} className="pill-icon" /><span>Database Tuning</span></div>
              <div className="marquee-pill"><Server size={18} className="pill-icon" /><span>Backend Scale</span></div>
              <div className="marquee-pill"><Cloud size={18} className="pill-icon" /><span>Cloud Infrastructure</span></div>
              <div className="marquee-pill"><Terminal size={18} className="pill-icon" /><span>DevOps pipelines</span></div>
              <div className="marquee-pill"><Globe size={18} className="pill-icon" /><span>Distributed Systems</span></div>
              <div className="marquee-pill"><Zap size={18} className="pill-icon" /><span>High Performance</span></div>
              <div className="marquee-pill"><Shield size={18} className="pill-icon" /><span>API Protection</span></div>
            </div>
          </div>

          {/* Row 2: Right-scrolling tools & languages */}
          <div className="marquee-row row-right">
            <div className="marquee-track">
              <div className="marquee-pill tool-pill"><span>React</span></div>
              <div className="marquee-pill tool-pill"><span>Next.js</span></div>
              <div className="marquee-pill tool-pill"><span>Python</span></div>
              <div className="marquee-pill tool-pill"><span>Node.js</span></div>
              <div className="marquee-pill tool-pill"><span>Golang</span></div>
              <div className="marquee-pill tool-pill"><span>FastAPI</span></div>
              <div className="marquee-pill tool-pill"><span>PostgreSQL</span></div>
              <div className="marquee-pill tool-pill"><span>Redis</span></div>
              <div className="marquee-pill tool-pill"><span>AWS</span></div>
              <div className="marquee-pill tool-pill"><span>Docker</span></div>
              <div className="marquee-pill tool-pill"><span>Kubernetes</span></div>
              {/* Duplicate */}
              <div className="marquee-pill tool-pill"><span>React</span></div>
              <div className="marquee-pill tool-pill"><span>Next.js</span></div>
              <div className="marquee-pill tool-pill"><span>Python</span></div>
              <div className="marquee-pill tool-pill"><span>Node.js</span></div>
              <div className="marquee-pill tool-pill"><span>Golang</span></div>
              <div className="marquee-pill tool-pill"><span>FastAPI</span></div>
              <div className="marquee-pill tool-pill"><span>PostgreSQL</span></div>
              <div className="marquee-pill tool-pill"><span>Redis</span></div>
              <div className="marquee-pill tool-pill"><span>AWS</span></div>
              <div className="marquee-pill tool-pill"><span>Docker</span></div>
              <div className="marquee-pill tool-pill"><span>Kubernetes</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-projects">
        <h2>Featured Projects</h2>
        {loading ? (
          <Loader />
        ) : (
          <div className="bento-grid">
            {featuredProjects.map((project, index) => {
              return (
                <div key={project.id}>
                  <Tilt options={defaultTiltOptions} style={{ height: '100%' }}>
                    <motion.div
                      className="project-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                      <div className="status-indicator">
                        <span className="status-dot active"></span>
                        <span>Active System</span>
                      </div>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                      <p className="domain">Domain: {project.domain}</p>
                      <div className="tech-stack" style={{ marginBottom: '20px' }}>
                        {project.tech_stack.map((tech, idx) => (
                          <span key={idx} className="tech-badge">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="project-metrics">
                        <div className="metric-item">
                          <span className="metric-val">{index === 0 ? "98.7ms" : "42ms"}</span>
                          <span className="metric-lbl">Response</span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-val">{index % 2 === 0 ? "99.9%" : "100%"}</span>
                          <span className="metric-lbl">Uptime SLA</span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-val">{index === 0 ? "10M+" : "2.5M+"}</span>
                          <span className="metric-lbl">API Calls</span>
                        </div>
                      </div>
                    </motion.div>
                  </Tilt>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {featuredTestimonials.length > 0 && (
        <section className="testimonials-section creative-testimonial-sec">
          <div className="section-header-compact">
            <span className="section-subtitle">Wall of Trust</span>
            <h2>Client Success</h2>
          </div>
          
          <div className="editorial-testimonials compact-testimonials">
            <div className="testimonial-success-badge-tag">
              <span className="success-badge-dot"></span>
              <span className="success-badge-val-txt">
                {activeTestimonial === 0 ? "+145% ROI" : activeTestimonial === 1 ? "4.2x Scale" : "99.9% SLA"}
              </span>
            </div>

            <motion.div
              key={activeTestimonial}
              className="testimonial-display-compact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="quote-icon-small">“</div>
              <p className="testimonial-quote-text">
                {featuredTestimonials[activeTestimonial].testimonial}
              </p>
              
              <div className="testimonial-meta-row">
                <div className="testimonial-client-details">
                  <span className="testimonial-client-name">
                    {featuredTestimonials[activeTestimonial].client_name}
                  </span>
                  <span className="testimonial-client-project">
                    Partner for {featuredTestimonials[activeTestimonial].project_title}
                  </span>
                </div>

                <div className="testimonial-selectors-inline">
                  {featuredTestimonials.map((t, idx) => (
                    <button
                      key={t.id}
                      className={`testimonial-dot-btn ${activeTestimonial === idx ? 'active' : ''}`}
                      onClick={() => setActiveTestimonial(idx)}
                      title={t.client_name}
                    >
                      {t.client_name.substring(0, 2).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <section className="cta">
        <div className="cta-left">
          <h2>Ready to bring your ideas to life?</h2>
          <p>Let's collaborate on building high-performance systems and bespoke digital products.</p>
        </div>
        <div className="cta-right">
          <div className="cta-terminal-prompt">
            <div>
              <span className="terminal-dir">auronix@client:~$ </span>
              <span className="terminal-cmd">npm init auronix-project</span>
            </div>
            <div style={{ opacity: 0.5, fontSize: '0.75rem', marginTop: '4px' }}>
              ✦ Initializing secure handshakes...
            </div>
          </div>
          <Link to="/contact">
            <button className="btn btn-primary cta-magnetic-btn">
              Initiate Project <Zap size={18} style={{ marginLeft: '6px' }} />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}

