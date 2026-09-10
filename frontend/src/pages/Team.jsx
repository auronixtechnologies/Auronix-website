import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { teamAPI, imageUrl } from '../services/api';
import './pages.css';
import Loader from '../components/Loader';

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardTab, setCardTab] = useState('about'); // 'about' | 'skills' | 'projects'

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Reset internal card tab when slider index shifts
  useEffect(() => {
    setCardTab('about');
  }, [currentIndex]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const data = await teamAPI.getTeamMembers(0, 50);
      setMembers(data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % members.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + members.length) % members.length);
  };

  if (loading) {
    return (
      <div className="page team-page-container">
        <Loader />
      </div>
    );
  }

  const member = members[currentIndex];
  const prevIndex = (currentIndex - 1 + members.length) % members.length;
  const nextIndex = (currentIndex + 1) % members.length;
  const prevMember = members[prevIndex];
  const nextMember = members[nextIndex];

  return (
    <div className="page team-page-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center team-hero"
      >
        <span className="team-subtitle-top">Our Engineers</span>
        <h1>Meet the Team</h1>
        <p className="intro team-intro-text">
          Explore team bios, skills, and portfolio projects one by one.
        </p>
      </motion.div>

      {members.length > 0 && (
        <div className="team-slider-wrapper">
          {/* Previous Card Preview (Left Side) */}
          {members.length > 1 && (
            <div className="side-card-preview left-preview" onClick={handlePrev}>
              {prevMember.has_image ? (
                <img
                  src={imageUrl('team', prevMember.id, prevMember.updated_at)}
                  alt={prevMember.name}
                  className="side-avatar"
                />
              ) : (
                <div className="side-avatar-placeholder">
                  {prevMember.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <h3>{prevMember.name}</h3>
              <p>{prevMember.role}</p>
            </div>
          )}

          {/* Left Navigation Key */}
          <button className="slider-nav-btn prev-btn" onClick={handlePrev} aria-label="Previous member">
            <ChevronLeft size={24} />
          </button>

          {/* Core Spotlight Card */}
          <div className="team-slider-card-container">
            {/* 3D Stacked Deck Effect Cards */}
            <div className="deck-card deck-card-back-left"></div>
            <div className="deck-card deck-card-back-right"></div>
            <div className="slider-mesh-glow"></div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="team-card creative-team-card slider-active-card"
              >
                {/* Header Profile section */}
                <div className="team-card-header">
                  {member.has_image ? (
                    <img
                      src={imageUrl('team', member.id, member.updated_at)}
                      alt={member.name}
                      className="member-avatar"
                    />
                  ) : (
                    <div className="member-avatar-placeholder">
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="member-basic">
                    <h2>{member.name}</h2>
                    <p className="role">{member.role}</p>
                    <span className="experience-badge">{member.experience_level.toUpperCase()}</span>
                  </div>
                </div>

                {/* Sub-tab selection row */}
                <div className="team-card-tabs">
                  <button
                    className={`card-tab-btn ${cardTab === 'about' ? 'active' : ''}`}
                    onClick={() => setCardTab('about')}
                  >
                    Bio
                  </button>
                  <button
                    className={`card-tab-btn ${cardTab === 'skills' ? 'active' : ''}`}
                    onClick={() => setCardTab('skills')}
                  >
                    Skills
                  </button>
                  {member.projects && member.projects.length > 0 && (
                    <button
                      className={`card-tab-btn ${cardTab === 'projects' ? 'active' : ''}`}
                      onClick={() => setCardTab('projects')}
                    >
                      Projects
                    </button>
                  )}
                </div>

                {/* Tab content bodies */}
                <div className="team-card-body">
                  {cardTab === 'about' && (
                    <div className="tab-pane-content pane-about">
                      <p className="bio">{member.bio}</p>
                      <div className="member-socials">
                        {member.linkedin_url && (
                          <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-link">
                            LinkedIn
                          </a>
                        )}
                        {member.portfolio_url && (
                          <a href={member.portfolio_url} target="_blank" rel="noopener noreferrer" className="social-link">
                            Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {cardTab === 'skills' && (
                    <div className="tab-pane-content pane-skills">
                      <div className="skills-grid-badges">
                        {member.skills.map((skill, idx) => (
                          <span key={idx} className="skill-badge-tag">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {cardTab === 'projects' && (
                    <div className="tab-pane-content pane-projects">
                      <div className="projects-mini-list">
                        {member.projects.map(proj => (
                          <div key={proj.id} className="project-mini-item">
                            <span className="proj-dot"></span>
                            <div className="proj-info">
                              <span className="proj-title">{proj.title}</span>
                              <span className="proj-domain">{proj.domain}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Navigation Key */}
          <button className="slider-nav-btn next-btn" onClick={handleNext} aria-label="Next member">
            <ChevronRight size={24} />
          </button>

          {/* Next Card Preview (Right Side) */}
          {members.length > 1 && (
            <div className="side-card-preview right-preview" onClick={handleNext}>
              {nextMember.has_image ? (
                <img
                  src={imageUrl('team', nextMember.id, nextMember.updated_at)}
                  alt={nextMember.name}
                  className="side-avatar"
                />
              ) : (
                <div className="side-avatar-placeholder">
                  {nextMember.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <h3>{nextMember.name}</h3>
              <p>{nextMember.role}</p>
            </div>
          )}
        </div>
      )}

      {/* Slider dots indicators */}
      {members.length > 0 && (
        <div className="team-slider-pagination">
          <span className="pagination-counter">
            {String(currentIndex + 1).padStart(2, '0')} &nbsp;/&nbsp; {String(members.length).padStart(2, '0')}
          </span>
          <div className="pagination-dots">
            {members.map((_, idx) => (
              <button
                key={idx}
                className={`pagination-dot ${currentIndex === idx ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              ></button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
