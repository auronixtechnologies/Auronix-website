/**
 * Project Detail Page
 * Immersive project showcase with interactive Team Orbit Constellation
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Hexagon, LayoutList, Settings, Rocket, Activity, Code2, Server, Cloud, Database, Leaf, Zap, Book, Box, ShoppingCart } from 'lucide-react';
import { projectsAPI, teamAPI } from '../services/api';
import './ProjectDetail.css';
import Loader from '../components/Loader';

// Role-to-color mapping for orbit nodes
const ROLE_COLORS = {
  frontend: { color: '#A18F68', glow: 'rgba(161, 143, 104, 0.4)', text: '#151515', label: 'Frontend' },
  backend: { color: '#262626', glow: 'rgba(38, 38, 38, 0.4)', text: '#FFFFFF', label: 'Backend' },
  'ui/ux': { color: '#E6D8B8', glow: 'rgba(230, 216, 184, 0.4)', text: '#151515', label: 'UI/UX' },
  'full stack': { color: '#FFFFFF', glow: 'rgba(255, 255, 255, 0.4)', text: '#151515', label: 'Full Stack' },
  ml: { color: '#A18F68', glow: 'rgba(161, 143, 104, 0.4)', text: '#151515', label: 'ML Engineer' },
  devops: { color: '#262626', glow: 'rgba(38, 38, 38, 0.4)', text: '#FFFFFF', label: 'DevOps' },
  lead: { color: '#A18F68', glow: 'rgba(161, 143, 104, 0.4)', text: '#151515', label: 'Tech Lead' },
  default: { color: '#A18F68', glow: 'rgba(161, 143, 104, 0.4)', text: '#151515', label: 'Developer' },
};

function getRoleStyle(role) {
  if (!role) return ROLE_COLORS.default;
  const key = role.toLowerCase();
  for (const [k, v] of Object.entries(ROLE_COLORS)) {
    if (key.includes(k)) return v;
  }
  return ROLE_COLORS.default;
}

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ──────────────────────────────────────────────
// Team Orbit Constellation Component
// ──────────────────────────────────────────────
function TeamConstellation({ members }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [angles, setAngles] = useState(() =>
    members.map((_, i) => (360 / members.length) * i)
  );
  const animRef = useRef(null);
  const pausedAngles = useRef({});

  useEffect(() => {
    if (members.length === 0) return;
    let last = null;

    const animate = (ts) => {
      if (!last) last = ts;
      const delta = ts - last;
      last = ts;

      setAngles((prev) =>
        prev.map((angle, i) => {
          const memberId = members[i]?.id;
          if (hoveredId === memberId) {
            pausedAngles.current[memberId] = angle;
            return angle;
          }
          // Restore paused angle smoothly when unpausing
          const speed = 0.02 + i * 0.005; // different speeds per orbit
          return (angle + speed * delta * 0.06) % 360;
        })
      );

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [members, hoveredId]);

  if (members.length === 0) return null;

  // Responsive orbit radius
  const orbitRadius = Math.min(160, 90 + members.length * 10);
  const svgSize = (orbitRadius + 60) * 2;
  const cx = svgSize / 2;
  const cy = svgSize / 2;

  return (
    <div className="constellation-wrapper">
      <h2 className="constellation-title">
        <span className="title-icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Hexagon size={24} /></span> Team Constellation
      </h2>
      <p className="constellation-subtitle">
        Hover a member to pause their orbit & reveal details
      </p>

      <div className="constellation-scene" style={{ width: svgSize, height: svgSize }}>
        {/* SVG orbit rings */}
        <svg
          className="orbit-svg"
          width={svgSize}
          height={svgSize}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <defs>
            <radialGradient id="planetGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#A18F68" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#262626" stopOpacity="0.4" />
            </radialGradient>
            {members.map((m, i) => {
              const rs = getRoleStyle(m.role);
              return (
                <radialGradient key={m.id} id={`nodGrad${m.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={rs.color} />
                  <stop offset="100%" stopColor={rs.color} stopOpacity="0.3" />
                </radialGradient>
              );
            })}
          </defs>

          {/* Orbit ring */}
          <circle
            cx={cx}
            cy={cy}
            r={orbitRadius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />

          {/* Orbit trail lines */}
          {members.map((m, i) => {
            const deg = ((angles[i] - 40 + 360) % 360) * (Math.PI / 180);
            const x = cx + orbitRadius * Math.cos(deg);
            const y = cy + orbitRadius * Math.sin(deg);
            const rs = getRoleStyle(m.role);
            return (
              <line
                key={`trail-${m.id}`}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={rs.color}
                strokeOpacity={hoveredId === m.id ? 0.3 : 0.08}
                strokeWidth="1"
                strokeDasharray="3 6"
              />
            );
          })}
        </svg>

        {/* Central planet */}
        <div className="constellation-planet">
          <div className="planet-core">
            <span className="planet-icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Rocket size={24} /></span>
          </div>
          <div className="planet-ring" />
        </div>

        {/* Member satellites */}
        {members.map((member, i) => {
          const deg = angles[i] * (Math.PI / 180);
          const x = cx + orbitRadius * Math.cos(deg) - 28;
          const y = cy + orbitRadius * Math.sin(deg) - 28;
          const rs = getRoleStyle(member.role);
          const isHovered = hoveredId === member.id;

          return (
            <div
              key={member.id}
              className={`member-satellite ${isHovered ? 'hovered' : ''}`}
              style={{
                left: x,
                top: y,
                '--node-color': rs.color,
                '--node-glow': rs.glow,
              }}
              onMouseEnter={() => setHoveredId(member.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Avatar */}
              <div className="satellite-avatar">
                {member.profile_image_data && member.profile_image_type ? (
                  <img
                    src={`data:${member.profile_image_type};base64,${member.profile_image_data}`}
                    alt={member.name}
                  />
                ) : (
                  <span className="avatar-initials">{getInitials(member.name)}</span>
                )}
              </div>

              {/* Tooltip */}
              {isHovered && (
                <div className="satellite-tooltip">
                  <div
                    className="tooltip-role-bar"
                    style={{ background: rs.color }}
                  />
                  <p className="tooltip-name">{member.name}</p>
                  <p className="tooltip-role" style={{ color: rs.color }}>
                    {rs.label}
                  </p>
                  {member.experience_level && (
                    <span className="tooltip-level">{member.experience_level}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend row */}
      <div className="constellation-legend">
        {members.map((m) => {
          const rs = getRoleStyle(m.role);
          return (
            <div key={m.id} className="legend-item">
              <span
                className="legend-dot"
                style={{ background: rs.color, boxShadow: `0 0 6px ${rs.glow}` }}
              />
              <span className="legend-name">{m.name}</span>
              <span className="legend-role" style={{ color: rs.color }}>
                · {rs.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Project Detail Page
// ──────────────────────────────────────────────
export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const proj = await projectsAPI.getProject(id);
        setProject(proj);

        // Use the team_members array from the project response
        // If no team members are assigned, show the creator as fallback
        if (proj.team_members && proj.team_members.length > 0) {
          setTeamMembers(proj.team_members);
        } else {
          // Fallback: fetch creator if team_members is empty
          const allMembers = await teamAPI.getTeamMembers(0, 50);
          const creator = allMembers.find((m) => m.id === proj.created_by);
          if (creator) setTeamMembers([creator]);
          else setTeamMembers(allMembers.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="pd-loading">
        <Loader />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pd-error">
        <h2>Project not found</h2>
        <button className="pd-back-btn" onClick={() => navigate('/portfolio')}>
          ← Back to Portfolio
        </button>
      </div>
    );
  }

  const domainColors = {
    Web: '#A18F68',
    ML: '#E6D8B8',
    LLM: '#FFFFFF',
    MCP: '#262626',
  };
  const domainColor = domainColors[project.domain] || '#A18F68';

  return (
    <div className="pd-page">
      {/* ── Hero Banner ── */}
      <div className="pd-hero" style={{ '--domain-color': domainColor }}>
        {project.project_image_data && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url(data:${project.project_image_type};base64,${project.project_image_data})`,
            backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15
          }} />
        )}
        <div className="pd-hero-bg" />
        <div className="pd-hero-content">
          <button className="pd-back-btn" onClick={() => navigate('/portfolio')}>
            ← Portfolio
          </button>
          <div className="pd-domain-badge" style={{ borderColor: domainColor, color: domainColor }}>
            {project.domain}
          </div>
          <h1 className="pd-title">{project.title}</h1>
          <p className="pd-subtitle">{project.description}</p>

          <div className="pd-hero-actions">
            <button 
              onClick={() => navigate(`/contact?project=${encodeURIComponent(project.title)}&service=${encodeURIComponent(project.domain)}`)} 
              className="pd-action-btn pd-btn-demo" 
              style={{ '--domain-color': domainColor }}>
              <ShoppingCart size={18} /> BUY THIS PROJECT
            </button>
          </div>
        </div>

        {/* Floating particles */}
        <div className="pd-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`pd-particle pd-particle-${i}`} style={{ '--domain-color': domainColor }} />
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="pd-tabs">
        {['overview', 'team', 'tech'].map((tab) => (
          <button
            key={tab}
            className={`pd-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{ '--domain-color': domainColor, display: 'inline-flex', alignItems: 'center' }}
          >
            {tab === 'overview' && <LayoutList size={16} style={{marginRight: '6px'}} />}
            {tab === 'team' && <Hexagon size={16} style={{marginRight: '6px'}} />}
            {tab === 'tech' && <Settings size={16} style={{marginRight: '6px'}} />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="pd-body">

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="pd-tab-content fade-in">
            <div className="pd-overview-grid">
              <div className="pd-overview-main">
                <div className="pd-info-card">
                  <h3>About This Project</h3>
                  <p>{project.description}</p>
                </div>

                {project.price && (
                  <div className="pd-info-card pd-price-card">
                    <h3>Project Value</h3>
                    <div className="pd-price">{project.price}</div>
                  </div>
                )}
              </div>

              <div className="pd-overview-meta">
                <div className="pd-meta-card">
                  <div className="pd-meta-item">
                    <span className="pd-meta-label">Domain</span>
                    <span className="pd-meta-value" style={{ color: domainColor }}>{project.domain}</span>
                  </div>
                  <div className="pd-meta-item">
                    <span className="pd-meta-label">Status</span>
                    <span className="pd-meta-value pd-status">
                      <span className="status-dot" /> Active
                    </span>
                  </div>
                  <div className="pd-meta-item">
                    <span className="pd-meta-label">Team Size</span>
                    <span className="pd-meta-value">{teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="pd-meta-item">
                    <span className="pd-meta-label">Tech Stack</span>
                    <span className="pd-meta-value">{project.tech_stack.length} technologies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Constellation Tab */}
        {activeTab === 'team' && (
          <div className="pd-tab-content fade-in">
            <TeamConstellation members={teamMembers} />

            {/* Team cards below constellation */}
            <div className="pd-team-cards">
              {teamMembers.map((m) => {
                const rs = getRoleStyle(m.role);
                return (
                  <div
                    key={m.id}
                    className="pd-team-member-card"
                    style={{ '--member-color': rs.color, '--member-glow': rs.glow }}
                  >
                    <div className="ptm-avatar-wrap">
                      {m.profile_image_data && m.profile_image_type ? (
                        <img
                          src={`data:${m.profile_image_type};base64,${m.profile_image_data}`}
                          alt={m.name}
                          className="ptm-avatar"
                        />
                      ) : (
                        <div className="ptm-avatar ptm-initials-avatar">
                          {getInitials(m.name)}
                        </div>
                      )}
                      <div
                        className="ptm-role-badge"
                        style={{ background: rs.color, color: rs.text || '#FFFFFF' }}
                      >
                        {rs.label}
                      </div>
                    </div>
                    <div className="ptm-info">
                      <h3>{m.name}</h3>
                      <p className="ptm-bio">{m.bio || 'Team contributor on this project.'}</p>
                      {m.skills && (
                        <div className="ptm-skills">
                          {m.skills.slice(0, 4).map((s, i) => (
                            <span key={i} className="ptm-skill">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tech Stack Tab */}
        {activeTab === 'tech' && (
          <div className="pd-tab-content fade-in">
            <div className="pd-tech-header">
              <h2>Technology Stack</h2>
              <p>The tools and frameworks powering this project</p>
            </div>
            <div className="pd-tech-grid">
              {project.tech_stack.map((tech, i) => (
                <div
                  key={i}
                  className="pd-tech-item"
                  style={{ animationDelay: `${i * 0.07}s`, '--domain-color': domainColor }}
                >
                  <div className="tech-icon-wrap">
                    <span className="tech-glyph" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {tech.toLowerCase().includes('react') ? <Activity size={24} /> :
                       tech.toLowerCase().includes('python') ? <Code2 size={24} /> :
                       tech.toLowerCase().includes('node') ? <Server size={24} /> :
                       tech.toLowerCase().includes('docker') ? <Box size={24} /> :
                       tech.toLowerCase().includes('postgres') || tech.toLowerCase().includes('sql') ? <Database size={24} /> :
                       tech.toLowerCase().includes('mongo') ? <Leaf size={24} /> :
                       tech.toLowerCase().includes('redis') ? <Database size={24} /> :
                       tech.toLowerCase().includes('aws') ? <Cloud size={24} /> :
                       tech.toLowerCase().includes('typescript') ? <Book size={24} /> :
                       tech.toLowerCase().includes('fastapi') ? <Zap size={24} /> :
                       <Settings size={24} />}
                    </span>
                  </div>
                  <span className="tech-name">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
