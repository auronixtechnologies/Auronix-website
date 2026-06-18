/**
 * Team Page Component
 */

import { useEffect, useState } from 'react';
import { Folder } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tilt } from 'react-tilt';
import { teamAPI } from '../services/api';
import './pages.css';
import Loader from '../components/Loader';

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

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

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

  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Our Team</h1>
        <p className="intro">Meet the talented developers and designers behind Auronix Technologies</p>
      </motion.div>

      {loading ? (
        <Loader />
      ) : (
        <div className="team-grid">
          {members.map((member, index) => (
            <Tilt key={member.id} options={defaultTiltOptions}>
              <motion.div
                className="team-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                {member.profile_image_data && member.profile_image_type && (
                  <img
                    src={`data:${member.profile_image_type};base64,${member.profile_image_data}`}
                    alt={member.name}
                    className="member-avatar"
                  />
                )}
                <div className="member-info">
                  <h2>{member.name}</h2>
                  <p className="role">{member.role}</p>
                  <p className="experience">{member.experience_level.toUpperCase()}</p>
                  <p className="bio">{member.bio}</p>
                  {member.skills && (
                    <div className="skills">
                      {member.skills.map((skill, idx) => (
                        <span key={idx} className="skill-badge">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  {member.projects && member.projects.length > 0 && (
                    <div className="member-projects">
                      <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Folder size={14} /> Projects Worked On
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                        {member.projects.map(proj => (
                          <span key={proj.id} className="skill-badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                            {proj.title} <span style={{ opacity: 0.7, fontSize: '0.8em', marginLeft: '4px' }}>({proj.domain})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="links">
                    {member.linkedin_url && (
                      <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                        LinkedIn
                      </a>
                    )}
                    {member.portfolio_url && (
                      <a href={member.portfolio_url} target="_blank" rel="noopener noreferrer">
                        Portfolio
                      </a>
                    )}
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
