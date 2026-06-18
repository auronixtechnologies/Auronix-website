/**
 * AdminDashboard.jsx
 * Full CMS dashboard for managing projects, team, client projects & leads.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  isLoggedIn, clearToken,
  adminProjects, adminTeam, adminClientProjects, adminLeads,
} from '../../services/adminApi';
import './Admin.css';
import { Folder, Users, Handshake, Mail, Star, AlertTriangle, CheckCircle, XCircle, Lock, Eye, EyeOff, LogOut, Globe, RefreshCw, Hexagon } from 'lucide-react';
import Loader from '../../components/Loader';

// ── UTILITY FUNCTIONS ──────────────────────────────────────────
const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

const getMimeType = (file) => file.type || 'image/jpeg';

// ── Small helpers ──────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`ad-toast ad-toast-${type}`}>
      {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />} {msg}
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="ad-modal-overlay">
      <div className="ad-modal ad-confirm-modal">
        <div className="ad-confirm-icon"><AlertTriangle size={32} /></div>
        <p>{message}</p>
        <div className="ad-modal-actions">
          <button className="ad-btn ad-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="ad-btn ad-btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── PROJECTS TAB ──────────────────────────────────────────────
const BLANK_PROJECT = {
  title: '', description: '', domain: 'Web',
  tech_stack: '', github_link: '', demo_link: '',
  price: '', is_featured: false, created_by: 1, team_member_ids: [],
  project_image_data: '', project_image_type: '',
};

function ProjectsTab({ showToast }) {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', data }
  const [form, setForm] = useState(BLANK_PROJECT);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { 
      setProjects(await adminProjects.list());
      setMembers(await adminTeam.list());
    }
    catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(BLANK_PROJECT); setModal({ mode: 'add' }); };
  const openEdit = (p) => {
    setForm({ 
      ...p, 
      tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack.join(', ') : p.tech_stack,
      team_member_ids: p.team_members ? p.team_members.map(m => m.id) : []
    });
    setModal({ mode: 'edit', id: p.id });
  };

  const handleProjectImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const base64 = await imageToBase64(file);
      setForm({
        ...form,
        project_image_data: base64,
        project_image_type: getMimeType(file)
      });
    } catch (err) {
      showToast('Error uploading image', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // If team members are selected, use the first one as created_by, otherwise use default
      const createdBy = form.team_member_ids && form.team_member_ids.length > 0 
        ? form.team_member_ids[0] 
        : (form.created_by || 1);
      
      const payload = {
        ...form,
        tech_stack: form.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
        created_by: parseInt(createdBy),
        team_member_ids: form.team_member_ids || [],
      };
      if (modal.mode === 'add') await adminProjects.create(payload);
      else await adminProjects.update(modal.id, payload);
      showToast(`Project ${modal.mode === 'add' ? 'created' : 'updated'} successfully!`, 'success');
      setModal(null);
      load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await adminProjects.delete(id);
      showToast('Project deleted.', 'success');
      load();
    } catch (e) { showToast(e.message, 'error'); }
    setConfirm(null);
  };

  return (
    <div className="ad-tab-section">
      <div className="ad-section-header">
        <div>
          <h2>Projects</h2>
          <p>{projects.length} total portfolio projects</p>
        </div>
        <button className="ad-btn ad-btn-primary" onClick={openAdd}>+ Add Project</button>
      </div>

      {loading ? <div className="ad-loading-row"><Loader /></div> : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr><th>Title</th><th>Domain</th><th>Tech Stack</th><th>Featured</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.title}</strong></td>
                  <td><span className="ad-badge">{p.domain}</span></td>
                  <td className="ad-tech-cell">{(p.tech_stack || []).slice(0, 3).join(', ')}{p.tech_stack?.length > 3 ? '…' : ''}</td>
                  <td>{p.is_featured ? <Star size={16} color="#fbbf24" fill="#fbbf24" style={{ display: "inline-block" }} /> : '—'}</td>
                  <td>
                    <div className="ad-row-actions">
                      <button className="ad-btn-sm ad-btn-edit" onClick={() => openEdit(p)}>Edit</button>
                      <button className="ad-btn-sm ad-btn-del" onClick={() => setConfirm({ id: p.id, name: p.title })}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="ad-modal-overlay">
          <div className="ad-modal">
            <div className="ad-modal-head">
              <h3>{modal.mode === 'add' ? 'Add New Project' : 'Edit Project'}</h3>
              <button className="ad-close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <form className="ad-form" onSubmit={handleSave}>
              <div className="ad-form-grid">
                <div className="ad-field">
                  <label>Title *</label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Project name" />
                </div>
                <div className="ad-field">
                  <label>Domain *</label>
                  <select value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })}>
                    {['Web', 'ML', 'LLM', 'MCP'].map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="ad-field ad-field-full">
                  <label>Description *</label>
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Project description" />
                </div>
                <div className="ad-field ad-field-full">
                  <label>Tech Stack <span className="ad-hint">(comma-separated)</span></label>
                  <input value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} placeholder="React, FastAPI, PostgreSQL" />
                </div>
                <div className="ad-field">
                  <label>GitHub Link</label>
                  <input type="url" value={form.github_link || ''} onChange={(e) => setForm({ ...form, github_link: e.target.value })} placeholder="https://github.com/..." />
                </div>
                <div className="ad-field">
                  <label>Demo Link</label>
                  <input type="url" value={form.demo_link || ''} onChange={(e) => setForm({ ...form, demo_link: e.target.value })} placeholder="https://..." />
                </div>
                <div className="ad-field">
                  <label>Price</label>
                  <input value={form.price || ''} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="₹50,000" />
                </div>
                <div className="ad-field ad-field-full">
                  <label>Team Members</label>
                  <div className="ad-members-selector">
                    {/* Selected Members as Chips */}
                    <div className="ad-chips-container">
                      {form.team_member_ids && form.team_member_ids.map((memberId) => {
                        const member = members.find(m => m.id === memberId);
                        return member ? (
                          <div key={memberId} className="ad-chip">
                            <span>{member.name}</span>
                            <button 
                              type="button"
                              className="ad-chip-close"
                              onClick={() => setForm({ 
                                ...form, 
                                team_member_ids: form.team_member_ids.filter(id => id !== memberId) 
                              })}
                            >
                              ✕
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                    
                    {/* Available Members to Select */}
                    <div className="ad-members-list">
                      {members.map((m) => {
                        const isSelected = form.team_member_ids && form.team_member_ids.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            className={`ad-member-btn ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              if (isSelected) {
                                setForm({
                                  ...form,
                                  team_member_ids: form.team_member_ids.filter(id => id !== m.id)
                                });
                              } else {
                                setForm({
                                  ...form,
                                  team_member_ids: [...(form.team_member_ids || []), m.id]
                                });
                              }
                            }}
                          >
                            <span className="member-name">{m.name}</span>
                            <span className="member-role">{m.role}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="ad-field ad-field-full">
                  <label>Project Image</label>
                  <div className="ad-image-upload-container">
                    {form.project_image_data && (
                      <div className="ad-image-preview">
                        <img src={`data:${form.project_image_type};base64,${form.project_image_data}`} alt="Preview" />
                        <button 
                          type="button" 
                          className="ad-image-clear"
                          onClick={() => setForm({ ...form, project_image_data: '', project_image_type: '' })}
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleProjectImageUpload}
                      className="ad-file-input"
                    />
                  </div>
                </div>
                <div className="ad-field ad-field-checkbox">
                  <label>
                    <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                    Featured project
                  </label>
                </div>
              </div>
              <div className="ad-modal-actions">
                <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="ad-btn ad-btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : modal.mode === 'add' ? 'Create Project' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          message={`Delete "${confirm.name}"? This cannot be undone.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

// ── TEAM TAB ─────────────────────────────────────────────────
const BLANK_MEMBER = {
  name: '', role: 'Frontend Developer', bio: '',
  skills: '', linkedin_url: '', portfolio_url: '',
  profile_image_data: '', profile_image_type: '', experience_level: 'junior',
};

function TeamTab({ showToast }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(BLANK_MEMBER);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setMembers(await adminTeam.list()); }
    catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(BLANK_MEMBER); setModal({ mode: 'add' }); };
  const openEdit = (m) => {
    setForm({ ...m, skills: Array.isArray(m.skills) ? m.skills.join(', ') : (m.skills || '') });
    setModal({ mode: 'edit', id: m.id });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      };
      if (modal.mode === 'add') await adminTeam.create(payload);
      else await adminTeam.update(modal.id, payload);
      showToast(`Team member ${modal.mode === 'add' ? 'added' : 'updated'}!`, 'success');
      setModal(null);
      load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const base64 = await imageToBase64(file);
      setForm({
        ...form,
        profile_image_data: base64,
        profile_image_type: getMimeType(file)
      });
    } catch (err) {
      showToast('Error uploading image', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminTeam.delete(id);
      showToast('Member removed.', 'success');
      load();
    } catch (e) { showToast(e.message, 'error'); }
    setConfirm(null);
  };

  return (
    <div className="ad-tab-section">
      <div className="ad-section-header">
        <div>
          <h2>Team Members</h2>
          <p>{members.length} members</p>
        </div>
        <button className="ad-btn ad-btn-primary" onClick={openAdd}>+ Add Member</button>
      </div>

      {loading ? <div className="ad-loading-row"><Loader /></div> : (
        <div className="ad-team-grid">
          {members.map((m) => {
            const levelColors = {
              junior: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.25)' },
              mid:    { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
              senior: { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: 'rgba(139,92,246,0.25)' },
              lead:   { bg: 'rgba(6,182,212,0.12)',  color: '#22d3ee', border: 'rgba(6,182,212,0.25)' },
            };
            const lc = levelColors[m.experience_level] || levelColors.mid;
            const initials = m.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            const skills = Array.isArray(m.skills) ? m.skills : [];
            return (
              <div key={m.id} className="ad-team-card">
                <div className="ad-team-card-accent" />
                <div className="ad-team-card-top">
                  <div className="ad-team-avatar-wrap">
                    {m.profile_image_data && m.profile_image_type
                      ? <img src={`data:${m.profile_image_type};base64,${m.profile_image_data}`} alt={m.name} className="ad-team-avatar-img" />
                      : <div className="ad-team-avatar-initials">{initials}</div>}
                  </div>
                  <div className="ad-team-card-meta">
                    <h3 className="ad-team-name">{m.name}</h3>
                    <span className="ad-team-role">{m.role}</span>
                    <span className="ad-team-level-badge" style={{ background: lc.bg, color: lc.color, border: `1px solid ${lc.border}` }}>
                      {m.experience_level?.charAt(0).toUpperCase() + m.experience_level?.slice(1)}
                    </span>
                  </div>
                </div>
                {skills.length > 0 && (
                  <div className="ad-team-skills">
                    {skills.slice(0, 4).map((s, i) => (
                      <span key={i} className="ad-team-skill-chip">{s}</span>
                    ))}
                    {skills.length > 4 && <span className="ad-team-skill-chip ad-team-skill-more">+{skills.length - 4}</span>}
                  </div>
                )}
                {m.projects && m.projects.length > 0 && (
                  <div className="ad-team-projects-line">
                    <span className="ad-team-proj-count">{m.projects.length}</span>
                    <span className="ad-team-proj-label">&nbsp;project{m.projects.length !== 1 ? 's' : ''} assigned</span>
                  </div>
                )}
                <div className="ad-team-divider" />
                <div className="ad-team-actions">
                  <button className="ad-team-btn-edit" onClick={() => openEdit(m)}>Edit</button>
                  <button className="ad-team-btn-del" onClick={() => setConfirm({ id: m.id, name: m.name })}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="ad-modal-overlay">
          <div className="ad-modal">
            <div className="ad-modal-head">
              <h3>{modal.mode === 'add' ? 'Add Team Member' : 'Edit Member'}</h3>
              <button className="ad-close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <form className="ad-form" onSubmit={handleSave}>
              <div className="ad-form-grid">
                <div className="ad-field">
                  <label>Full Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Smith" />
                </div>
                <div className="ad-field">
                  <label>Role *</label>
                  <input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Frontend Developer" />
                </div>
                <div className="ad-field">
                  <label>Experience Level</label>
                  <select value={form.experience_level} onChange={(e) => setForm({ ...form, experience_level: e.target.value })}>
                    {['junior', 'mid', 'senior', 'lead'].map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                  </select>
                </div>
                <div className="ad-field">
                  <label>Skills <span className="ad-hint">(comma-separated)</span></label>
                  <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Python, Docker" />
                </div>
                <div className="ad-field ad-field-full">
                  <label>Bio</label>
                  <textarea rows={3} value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Short bio..." />
                </div>
                <div className="ad-field">
                  <label>LinkedIn URL</label>
                  <input type="url" value={form.linkedin_url || ''} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="ad-field">
                  <label>Portfolio URL</label>
                  <input type="url" value={form.portfolio_url || ''} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="ad-field ad-field-full">
                  <label>Profile Image</label>
                  <div className="ad-image-upload-container">
                    {form.profile_image_data && (
                      <div className="ad-image-preview">
                        <img src={`data:${form.profile_image_type};base64,${form.profile_image_data}`} alt="Preview" />
                        <button 
                          type="button" 
                          className="ad-image-clear"
                          onClick={() => setForm({ ...form, profile_image_data: '', profile_image_type: '' })}
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="ad-file-input"
                    />
                  </div>
                </div>
              </div>
              <div className="ad-modal-actions">
                <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="ad-btn ad-btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : modal.mode === 'add' ? 'Add Member' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          message={`Remove "${confirm.name}" from the team?`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

// ── CLIENT PROJECTS TAB ───────────────────────────────────────
const BLANK_CLIENT = {
  client_name: '', project_title: '', description: '',
  technologies: '', outcome: '', testimonial: '',
  project_url: '', is_featured: false, completed_at: new Date().toISOString().split('T')[0],
};

function ClientProjectsTab({ showToast }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(BLANK_CLIENT);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setProjects(await adminClientProjects.list()); }
    catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(BLANK_CLIENT); setModal({ mode: 'add' }); };
  const openEdit = (p) => {
    setForm({
      ...p,
      technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies,
      completed_at: p.completed_at?.split('T')[0] || '',
    });
    setModal({ mode: 'edit', id: p.id });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        technologies: form.technologies.split(',').map((s) => s.trim()).filter(Boolean),
        completed_at: new Date(form.completed_at).toISOString(),
      };
      if (modal.mode === 'add') await adminClientProjects.create(payload);
      else await adminClientProjects.update(modal.id, payload);
      showToast(`Client project ${modal.mode === 'add' ? 'created' : 'updated'}!`, 'success');
      setModal(null);
      load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await adminClientProjects.delete(id);
      showToast('Client project deleted.', 'success');
      load();
    } catch (e) { showToast(e.message, 'error'); }
    setConfirm(null);
  };

  return (
    <div className="ad-tab-section">
      <div className="ad-section-header">
        <div>
          <h2>Client Projects</h2>
          <p>{projects.length} case studies</p>
        </div>
        <button className="ad-btn ad-btn-primary" onClick={openAdd}>+ Add Client Project</button>
      </div>

      {loading ? <div className="ad-loading-row"><Loader /></div> : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr><th>Client</th><th>Project</th><th>Completed</th><th>Featured</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.client_name}</strong></td>
                  <td>{p.project_title}</td>
                  <td>{formatDate(p.completed_at)}</td>
                  <td>{p.is_featured ? <Star size={16} color="#fbbf24" fill="#fbbf24" style={{ display: "inline-block" }} /> : '—'}</td>
                  <td>
                    <div className="ad-row-actions">
                      <button className="ad-btn-sm ad-btn-edit" onClick={() => openEdit(p)}>Edit</button>
                      <button className="ad-btn-sm ad-btn-del" onClick={() => setConfirm({ id: p.id, name: p.project_title })}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="ad-modal-overlay">
          <div className="ad-modal">
            <div className="ad-modal-head">
              <h3>{modal.mode === 'add' ? 'Add Client Project' : 'Edit Client Project'}</h3>
              <button className="ad-close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <form className="ad-form" onSubmit={handleSave}>
              <div className="ad-form-grid">
                <div className="ad-field">
                  <label>Client Name *</label>
                  <input required value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="ABC Corp" />
                </div>
                <div className="ad-field">
                  <label>Project Title *</label>
                  <input required value={form.project_title} onChange={(e) => setForm({ ...form, project_title: e.target.value })} placeholder="E-Commerce Revamp" />
                </div>
                <div className="ad-field ad-field-full">
                  <label>Description *</label>
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="ad-field ad-field-full">
                  <label>Technologies <span className="ad-hint">(comma-separated)</span></label>
                  <input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="React, Node.js, MySQL" />
                </div>
                <div className="ad-field ad-field-full">
                  <label>Outcome / Results</label>
                  <textarea rows={2} value={form.outcome || ''} onChange={(e) => setForm({ ...form, outcome: e.target.value })} placeholder="3x increase in conversions..." />
                </div>
                <div className="ad-field ad-field-full">
                  <label>Client Testimonial</label>
                  <textarea rows={2} value={form.testimonial || ''} onChange={(e) => setForm({ ...form, testimonial: e.target.value })} placeholder='"Excellent work!"' />
                </div>
                <div className="ad-field">
                  <label>Project URL</label>
                  <input type="url" value={form.project_url || ''} onChange={(e) => setForm({ ...form, project_url: e.target.value })} />
                </div>
                <div className="ad-field">
                  <label>Completed Date *</label>
                  <input required type="date" value={form.completed_at} onChange={(e) => setForm({ ...form, completed_at: e.target.value })} />
                </div>
                <div className="ad-field ad-field-checkbox">
                  <label>
                    <input type="checkbox" checked={form.is_featured || false} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                    Featured testimonial on Home page
                  </label>
                </div>
              </div>
              <div className="ad-modal-actions">
                <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="ad-btn ad-btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : modal.mode === 'add' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          message={`Delete "${confirm.name}"?`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

// ── LEADS TAB ─────────────────────────────────────────────────
function LeadsTab({ showToast }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setLeads(await adminLeads.list()); }
    catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    try {
      await adminLeads.delete(id);
      showToast('Lead deleted.', 'success');
      load();
    } catch (e) { showToast(e.message, 'error'); }
    setConfirm(null);
  };

  return (
    <div className="ad-tab-section">
      <div className="ad-section-header">
        <div>
          <h2>Contact Leads</h2>
          <p>{leads.length} inquiries received</p>
        </div>
        <button className="ad-btn ad-btn-ghost" onClick={load}><RefreshCw size={16} className="inline-icon" /> Refresh</button>
      </div>

      {loading ? <div className="ad-loading-row"><Loader /></div> : (
        leads.length === 0
          ? <div className="ad-empty">No leads yet. They'll appear here when users submit the contact form.</div>
          : (
            <div className="ad-leads-list">
              {leads.map((lead) => (
                <div key={lead.id} className="ad-lead-card">
                  <div className="ad-lead-top">
                    <div>
                      <strong className="ad-lead-name">{lead.name}</strong>
                      <a href={`mailto:${lead.email}`} className="ad-lead-email">{lead.email}</a>
                    </div>
                    <div className="ad-lead-meta">
                      {lead.service_type && <span className="ad-badge">{lead.service_type}</span>}
                      <span className="ad-lead-date">{formatDate(lead.created_at)}</span>
                      <button className="ad-btn-sm ad-btn-del" onClick={() => setConfirm({ id: lead.id, name: lead.name })}>Delete</button>
                    </div>
                  </div>
                  <p className="ad-lead-msg">"{lead.message}"</p>
                </div>
              ))}
            </div>
          )
      )}

      {confirm && (
        <ConfirmModal
          message={`Delete lead from "${confirm.name}"?`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────
const NAV_TABS = [
  { key: 'projects', label: 'Projects', icon: <Folder size={18} /> },
  { key: 'team', label: 'Team', icon: <Users size={18} /> },
  { key: 'clients', label: 'Client Projects', icon: <Handshake size={18} /> },
  { key: 'leads', label: 'Leads', icon: <Mail size={18} /> },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('projects');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) navigate('/auronix-admin');
  }, [navigate]);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, key: Date.now() });
  }, []);

  const handleLogout = () => {
    clearToken();
    navigate('/auronix-admin');
  };

  return (
    <div className="ad-layout">
      {/* Sidebar */}
      <aside className="ad-sidebar">
        <div className="ad-sidebar-brand">
          <img src="/auronix-logo.svg" alt="Auronix" style={{ height: '56px', width: 'auto', filter: 'invert(1)', display: 'block', marginBottom: '4px' }} />
          <div className="ad-sidebar-sub">Admin Panel</div>
        </div>

        <nav className="ad-nav">
          {NAV_TABS.map((t) => (
            <button
              key={t.key}
              className={`ad-nav-item ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <span className="ad-nav-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <a href="/" target="_blank" rel="noopener noreferrer" className="ad-nav-item ad-nav-site">
            <span className="ad-nav-icon"><Globe size={18} /></span>
            View Site
          </a>
          <button className="ad-nav-item ad-nav-logout" onClick={handleLogout}>
            <span className="ad-nav-icon"><LogOut size={18} /></span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ad-main">
        <div className="ad-topbar">
          <div className="ad-topbar-left">
            <h1 className="ad-topbar-title">
              {NAV_TABS.find((t) => t.key === tab)?.icon}{' '}
              {NAV_TABS.find((t) => t.key === tab)?.label}
            </h1>
          </div>
          <div className="ad-topbar-right">
            <div className="ad-admin-chip">
              <span className="ad-admin-dot" />
              Admin
            </div>
          </div>
        </div>

        <div className="ad-content">
          {tab === 'projects' && <ProjectsTab showToast={showToast} />}
          {tab === 'team' && <TeamTab showToast={showToast} />}
          {tab === 'clients' && <ClientProjectsTab showToast={showToast} />}
          {tab === 'leads' && <LeadsTab showToast={showToast} />}
        </div>
      </main>

      {/* Toast notifications */}
      {toast && (
        <Toast
          key={toast.key}
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
