/**
 * Home Page Component
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tilt } from 'react-tilt';
import { FaReact, FaPython, FaAws, FaDocker } from 'react-icons/fa';
import { SiFastapi, SiPostgresql, SiTensorflow } from 'react-icons/si';
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

  return (
    <div className="page">
      <motion.section 
        className="hero"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Welcome to Auronix Technologies
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Expert team for web development, ML, LLM, and custom solutions
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link to="/contact">
              <button className="btn btn-primary">Get Started</button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Trust Badges Marquee */}
      <section className="trust-badges">
        <p className="trust-text">Trusted Technologies We Use</p>
        <div className="marquee-container">
          <div className="marquee-content">
            <FaReact size={40} color="#61DAFB" />
            <FaPython size={40} color="#3776AB" />
            <SiFastapi size={40} color="#009688" />
            <SiPostgresql size={40} color="#336791" />
            <FaAws size={40} color="#FF9900" />
            <FaDocker size={40} color="#2496ED" />
            <SiTensorflow size={40} color="#FF6F00" />
            {/* Duplicate for infinite loop effect */}
            <FaReact size={40} color="#61DAFB" />
            <FaPython size={40} color="#3776AB" />
            <SiFastapi size={40} color="#009688" />
            <SiPostgresql size={40} color="#336791" />
            <FaAws size={40} color="#FF9900" />
            <FaDocker size={40} color="#2496ED" />
            <SiTensorflow size={40} color="#FF6F00" />
          </div>
        </div>
      </section>

      <section className="featured-projects">
        <h2>Featured Projects</h2>
        {loading ? (
          <Loader />
        ) : (
          <div className="projects-grid">
            {featuredProjects.map((project, index) => (
              <Tilt key={project.id} options={defaultTiltOptions}>
                <motion.div 
                  className="project-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <p className="domain">Domain: {project.domain}</p>
                  <div className="tech-stack">
                    {project.tech_stack.map((tech, idx) => (
                      <span key={idx} className="tech-badge">
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </Tilt>
            ))}
          </div>
        )}
      </section>

      {featuredTestimonials.length > 0 && (
        <section className="testimonials-section">
          <h2>Client Feedback</h2>
          <div className="testimonials-grid">
            {featuredTestimonials.map((t, index) => (
              <motion.div 
                key={t.id} 
                className="testimonial-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="quote-mark">"</div>
                <p className="testimonial-text">{t.testimonial}</p>
                <div className="testimonial-meta">
                  <strong>{t.client_name}</strong>
                  <span>for <em>{t.project_title}</em></span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <section className="cta">
        <h2>Ready to start your project?</h2>
        <Link to="/contact">
          <button className="btn btn-primary">Contact Us</button>
        </Link>
      </section>
    </div>
  );
}
