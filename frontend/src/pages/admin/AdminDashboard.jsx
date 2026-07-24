/**
 * AdminDashboard.jsx
 * Redesigned: hamburger sidebar, stats overview, live clock,
 * domain-colored badges, inbox-style leads, improved UX.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  isLoggedIn, clearToken,
  adminProjects, adminTeam, adminClientProjects, adminLeads,
} from '../../services/adminApi';
import './Admin.css';
import {
  Folder, Users, Handshake, Mail, Star, AlertTriangle,
  CheckCircle, XCircle, LogOut, Globe, RefreshCw, Clock,
  Plus, Edit2, Trash2, X, Menu, Hexagon, ExternalLink,
  Copy, TrendingUp,
} from 'lucide-react';
import Loader from '../../components/Loader';

// ── Utilities ──────────────────────────────────────────────────
const imageToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
  });

const getMimeType = (file) => file.type || 'image/jpeg';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return formatDate(iso);
}

function getDomainClass(domain) {
  const map = { Web: 'ad-domain-web', ML: 'ad-domain-ml', LLM: 'ad-domain-llm', MCP: 'ad-domain-mcp' };
  return map[domain] || '';
}

function getLevelStyle(level) {
  const styles = {
    junior: { background: 'rgba(99,102,241,0.1)',  color: '#818cf8', border: 'rgba(99,102,241,0.2)' },
    mid:    { background: 'rgba(212,185,106,0.1)', color: '#D4B96A', border: 'rgba(212,185,106,0.2)' },
    senior: { background: 'rgba(16,185,129,0.1)',  color: '#34d399', border: 'rgba(16,185,129,0.2)' },
    lead:   { background: 'rgba(236,72,153,0.1)',  color: '#f472b6', border: 'rgba(236,72,153,0.2)' },
  };
  return styles[level] || styles.mid;
}

// ── Live Clock ─────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="ad-clock">
      <Clock size={14} />
      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`ad-toast ad-toast-${type}`}>
      {type === 'success' ? <CheckCircle size={17} /> : <XCircle size={17} />}
      {msg}
    </div>
  );
}

// ── Confirm Modal ──────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="ad-modal-overlay">
      <div className="ad-modal ad-confirm-modal">
        <div className="ad-confirm-icon-wrap">
          <AlertTriangle size={30} />
        </div>
        <h4>Are you sure?</h4>
        <p>{message}</p>
        <div className="ad-confirm-actions">
          <button className="ad-btn ad-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="ad-btn ad-btn-danger" onClick={onConfirm}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stats Row ──────────────────────────────────────────────────
function StatsRow({ counts }) {
  const stats = [
    { key: 'projects', label: 'Projects',       icon: <Folder size={20} />,    cls: 'ad-stat-card--projects', count: counts.projects },
    { key: 'team',     label: 'Team Members',   icon: <Users size={20} />,     cls: 'ad-stat-card--team',     count: counts.team     },
    { key: 'clients',  label: 'Client Projects',icon: <Handshake size={20} />, cls: 'ad-stat-card--clients',  count: counts.clients  },
    { key: 'leads',    label: 'Leads',          icon: <Mail size={20} />,      cls: 'ad-stat-card--leads',    count: counts.leads    },
  ];
  return (
    <div className="ad-stats-row">
      {stats.map((s) => (
        <div key={s.key} className={`ad-stat-card ${s.cls}`}>
          <div className="ad-stat-icon">{s.icon}</div>
          <div className="ad-stat-body">
            <div className="ad-stat-number">{s.count ?? '—'}</div>
            <div className="ad-stat-label">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// PROJECTS TAB
// ═══════════════════════════════════════════════════════════════
const BLANK_PROJECT = {
  title: '', description: '', domain: 'Web',
  tech_stack: '', github_link: '', demo_link: '',
  price: '', is_featured: false, created_by: 1, team_member_ids: [],
  project_image_data: '', project_image_type: '',
};

function ProjectsTab({ showToast, onCountChange }) {
  const [projects, setProjects] = useState([]);
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState(BLANK_PROJECT);
  const [saving,   setSaving]   = useState(false);
  const [confirm,  setConfirm]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, m] = await Promise.all([adminProjects.list(), adminTeam.list()]);
      setProjects(p);
      setMembers(m);
      onCountChange?.('projects', p.length);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [showToast, onCountChange]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm(BLANK_PROJECT); setModal({ mode: 'add' }); };
  const openEdit = (p) => {
    setForm({
      ...p,
      tech_stack:     Array.isArray(p.tech_stack) ? p.tech_stack.join(', ') : p.tech_stack,
      team_member_ids: p.team_members ? p.team_members.map((m) => m.id) : [],
    });
    setModal({ mode: 'edit', id: p.id });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await imageToBase64(file);
      setForm((f) => ({ ...f, project_image_data: base64, project_image_type: getMimeType(file) }));
    } catch { showToast('Error uploading image', 'error'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const createdBy = form.team_member_ids?.length > 0 ? form.team_member_ids[0] : (form.created_by || 1);
      const payload = {
        ...form,
        tech_stack:     form.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
        created_by:     parseInt(createdBy),
        team_member_ids: form.team_member_ids || [],
      };
      if (modal.mode === 'add') await adminProjects.create(payload);
      else                      await adminProjects.update(modal.id, payload);
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

  const toggleMember = (id) =>
    setForm((f) => ({
      ...f,
      team_member_ids: f.team_member_ids.includes(id)
        ? f.team_member_ids.filter((x) => x !== id)
        : [...f.team_member_ids, id],
    }));

  return (
    <div className="ad-tab-section">
      <div className="ad-section-header">
        <div>
          <h2>Projects</h2>
          <p>{projects.length} portfolio {projects.length === 1 ? 'project' : 'projects'}</p>
        </div>
        <div className="ad-section-actions">
          <button className="ad-btn ad-btn-ghost" onClick={load} title="Refresh">
            <RefreshCw size={15} />
          </button>
          <button className="ad-btn ad-btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="ad-loading-row"><Loader /></div>
      ) : projects.length === 0 ? (
        <div className="ad-empty">
          <span className="ad-empty-icon"><Folder size={36} /></span>
          No projects yet. Click "Add Project" to create your first one.
        </div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Domain</th>
                <th>Tech Stack</th>
                <th>Price</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.title}</strong></td>
                  <td>
                    <span className={`ad-badge ${getDomainClass(p.domain)}`}>{p.domain}</span>
                  </td>
                  <td className="ad-tech-cell">
                    {(p.tech_stack || []).slice(0, 3).join(', ')}
                    {p.tech_stack?.length > 3 ? '…' : ''}
                  </td>
                  <td>{p.price || '—'}</td>
                  <td>
                    {p.is_featured
                      ? <span className="ad-featured-badge"><Star size={11} fill="currentColor" /> Featured</span>
                      : <span style={{ color: 'rgba(212,201,176,0.25)', fontSize: '0.8rem' }}>—</span>}
                  </td>
                  <td>
                    <div className="ad-row-actions">
                      <button className="ad-btn-sm ad-btn-edit" onClick={() => openEdit(p)}>
                        <Edit2 size={12} /> Edit
                      </button>
                      <button className="ad-btn-sm ad-btn-del" onClick={() => setConfirm({ id: p.id, name: p.title })}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div className="ad-modal-overlay">
          <div className="ad-modal">
            <div className="ad-modal-head">
              <h3>
                <Folder size={18} />
                {modal.mode === 'add' ? 'Add New Project' : 'Edit Project'}
              </h3>
              <button className="ad-close-btn" onClick={() => setModal(null)}><X size={14} /></button>
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
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does this project do?" />
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
                  <input value={form.price || ''} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="$5,000" />
                </div>
                <div className="ad-field ad-field-checkbox" style={{ alignSelf: 'flex-end', paddingBottom: '8px' }}>
                  <label>
                    <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                    Mark as Featured
                  </label>
                </div>

                {/* Team Members */}
                <div className="ad-field ad-field-full">
                  <label>Team Members</label>
                  <div className="ad-members-selector">
                    {form.team_member_ids.length > 0 && (
                      <div className="ad-chips-container">
                        {form.team_member_ids.map((id) => {
                          const m = members.find((x) => x.id === id);
                          return m ? (
                            <div key={id} className="ad-chip">
                              {m.name}
                              <button type="button" className="ad-chip-close" onClick={() => toggleMember(id)}>✕</button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                    <div className="ad-members-list">
                      {members.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          className={`ad-member-btn ${form.team_member_ids.includes(m.id) ? 'selected' : ''}`}
                          onClick={() => toggleMember(m.id)}
                        >
                          <span className="member-name">{m.name}</span>
                          <span className="member-role">{m.role}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="ad-field ad-field-full">
                  <label>Project Image</label>
                  <div className="ad-image-upload-container">
                    {form.project_image_data && (
                      <div className="ad-image-preview">
                        <img src={`data:${form.project_image_type};base64,${form.project_image_data}`} alt="Preview" />
                        <button type="button" className="ad-image-clear" onClick={() => setForm({ ...form, project_image_data: '', project_image_type: '' })}>
                          Remove Image
                        </button>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="ad-file-input" />
                  </div>
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
          message={`Delete "${confirm.name}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// TEAM TAB
// ═══════════════════════════════════════════════════════════════
const BLANK_MEMBER = {
  name: '', role: 'Frontend Developer', bio: '',
  skills: '', linkedin_url: '', portfolio_url: '',
  profile_image_data: '', profile_image_type: '', experience_level: 'junior',
};

function TeamTab({ showToast, onCountChange }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(BLANK_MEMBER);
  const [saving,  setSaving]  = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const m = await adminTeam.list();
      setMembers(m);
      onCountChange?.('team', m.length);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [showToast, onCountChange]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm(BLANK_MEMBER); setModal({ mode: 'add' }); };
  const openEdit = (m) => {
    setForm({ ...m, skills: Array.isArray(m.skills) ? m.skills.join(', ') : (m.skills || '') });
    setModal({ mode: 'edit', id: m.id });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await imageToBase64(file);
      setForm((f) => ({ ...f, profile_image_data: base64, profile_image_type: getMimeType(file) }));
    } catch { showToast('Error uploading image', 'error'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) };
      if (modal.mode === 'add') await adminTeam.create(payload);
      else                      await adminTeam.update(modal.id, payload);
      showToast(`Team member ${modal.mode === 'add' ? 'added' : 'updated'}!`, 'success');
      setModal(null);
      load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
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
          <p>{members.length} {members.length === 1 ? 'member' : 'members'} on your team</p>
        </div>
        <div className="ad-section-actions">
          <button className="ad-btn ad-btn-ghost" onClick={load} title="Refresh"><RefreshCw size={15} /></button>
          <button className="ad-btn ad-btn-primary" onClick={openAdd}><Plus size={16} /> Add Member</button>
        </div>
      </div>

      {loading ? (
        <div className="ad-loading-row"><Loader /></div>
      ) : members.length === 0 ? (
        <div className="ad-empty">
          <span className="ad-empty-icon"><Users size={36} /></span>
          No team members yet. Add your first team member to get started.
        </div>
      ) : (
        <div className="ad-team-grid">
          {members.map((m) => {
            const lc = getLevelStyle(m.experience_level);
            const initials = m.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
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
                    <span className="ad-level-badge" style={{ background: lc.background, color: lc.color, border: `1px solid ${lc.border}` }}>
                      {m.experience_level?.charAt(0).toUpperCase() + m.experience_level?.slice(1)}
                    </span>
                  </div>
                </div>
                {skills.length > 0 && (
                  <div className="ad-team-skills">
                    {skills.slice(0, 4).map((s, i) => <span key={i} className="ad-team-skill-chip">{s}</span>)}
                    {skills.length > 4 && <span className="ad-team-skill-chip ad-team-skill-more">+{skills.length - 4}</span>}
                  </div>
                )}
                {m.projects?.length > 0 && (
                  <div className="ad-team-projects-line">
                    <span className="ad-team-proj-count">{m.projects.length}</span>
                    <span className="ad-team-proj-label">&nbsp;project{m.projects.length !== 1 ? 's' : ''} assigned</span>
                  </div>
                )}
                <div className="ad-team-divider" />
                <div className="ad-team-actions">
                  <button className="ad-team-btn-edit" onClick={() => openEdit(m)}>
                    <Edit2 size={13} style={{ display: 'inline', marginRight: 5 }} />Edit
                  </button>
                  <button className="ad-team-btn-del" onClick={() => setConfirm({ id: m.id, name: m.name })}>
                    <Trash2 size={13} style={{ display: 'inline', marginRight: 5 }} />Delete
                  </button>
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
              <h3><Users size={18} />{modal.mode === 'add' ? 'Add Team Member' : 'Edit Member'}</h3>
              <button className="ad-close-btn" onClick={() => setModal(null)}><X size={14} /></button>
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
                    {['junior', 'mid', 'senior', 'lead'].map((l) => (
                      <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                    ))}
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
                        <button type="button" className="ad-image-clear" onClick={() => setForm({ ...form, profile_image_data: '', profile_image_type: '' })}>
                          Remove Image
                        </button>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="ad-file-input" />
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
          message={`Remove "${confirm.name}" from the team? This action cannot be undone.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// CLIENT PROJECTS TAB
// ═══════════════════════════════════════════════════════════════
const BLANK_CLIENT = {
  client_name: '', project_title: '', description: '',
  technologies: '', outcome: '', testimonial: '',
  project_url: '', is_featured: false,
  completed_at: new Date().toISOString().split('T')[0],
};

function ClientProjectsTab({ showToast, onCountChange }) {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState(BLANK_CLIENT);
  const [saving,   setSaving]   = useState(false);
  const [confirm,  setConfirm]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await adminClientProjects.list();
      setProjects(p);
      onCountChange?.('clients', p.length);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [showToast, onCountChange]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm(BLANK_CLIENT); setModal({ mode: 'add' }); };
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
      else                      await adminClientProjects.update(modal.id, payload);
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
          <p>{projects.length} case {projects.length === 1 ? 'study' : 'studies'}</p>
        </div>
        <div className="ad-section-actions">
          <button className="ad-btn ad-btn-ghost" onClick={load} title="Refresh"><RefreshCw size={15} /></button>
          <button className="ad-btn ad-btn-primary" onClick={openAdd}><Plus size={16} /> Add Client Project</button>
        </div>
      </div>

      {loading ? (
        <div className="ad-loading-row"><Loader /></div>
      ) : projects.length === 0 ? (
        <div className="ad-empty">
          <span className="ad-empty-icon"><Handshake size={36} /></span>
          No client projects yet. Add your first case study.
        </div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Project</th>
                <th>Technologies</th>
                <th>Completed</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.client_name}</strong></td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.project_title}</td>
                  <td className="ad-tech-cell">
                    {(Array.isArray(p.technologies) ? p.technologies : []).slice(0, 2).join(', ')}
                    {(p.technologies?.length || 0) > 2 ? '…' : ''}
                  </td>
                  <td>{formatDate(p.completed_at)}</td>
                  <td>
                    {p.is_featured
                      ? <span className="ad-featured-badge"><Star size={11} fill="currentColor" /> Featured</span>
                      : <span style={{ color: 'rgba(212,201,176,0.25)', fontSize: '0.8rem' }}>—</span>}
                  </td>
                  <td>
                    <div className="ad-row-actions">
                      <button className="ad-btn-sm ad-btn-edit" onClick={() => openEdit(p)}>
                        <Edit2 size={12} /> Edit
                      </button>
                      <button className="ad-btn-sm ad-btn-del" onClick={() => setConfirm({ id: p.id, name: p.project_title })}>
                        <Trash2 size={12} /> Delete
                      </button>
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
              <h3><Handshake size={18} />{modal.mode === 'add' ? 'Add Client Project' : 'Edit Client Project'}</h3>
              <button className="ad-close-btn" onClick={() => setModal(null)}><X size={14} /></button>
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
          message={`Delete "${confirm.name}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// LEADS TAB — Inbox style
// ═══════════════════════════════════════════════════════════════
function LeadsTab({ showToast, onCountChange }) {
  const [leads,   setLeads]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const l = await adminLeads.list();
      setLeads(l);
      onCountChange?.('leads', l.length);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [showToast, onCountChange]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    try {
      await adminLeads.delete(id);
      showToast('Lead deleted.', 'success');
      load();
    } catch (e) { showToast(e.message, 'error'); }
    setConfirm(null);
  };

  const copyEmail = (email) => {
    navigator.clipboard.writeText(email).then(() => showToast('Email copied!', 'success'));
  };

  return (
    <div className="ad-tab-section">
      <div className="ad-section-header">
        <div>
          <h2>Contact Leads</h2>
          <p>{leads.length} {leads.length === 1 ? 'inquiry' : 'inquiries'} received</p>
        </div>
        <div className="ad-section-actions">
          <button className="ad-btn ad-btn-ghost" onClick={load}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="ad-loading-row"><Loader /></div>
      ) : leads.length === 0 ? (
        <div className="ad-empty">
          <span className="ad-empty-icon"><Mail size={36} /></span>
          No leads yet. They'll appear here when users submit the contact form.
        </div>
      ) : (
        <div className="ad-leads-list">
          {leads.map((lead) => (
            <div key={lead.id} className="ad-lead-card">
              <div className="ad-lead-top">
                <div className="ad-lead-identity">
                  <div className="ad-lead-name">{lead.name}</div>
                  <div className="ad-lead-email-row">
                    <a href={`mailto:${lead.email}`} className="ad-lead-email">{lead.email}</a>
                    <button
                      title="Copy email"
                      onClick={() => copyEmail(lead.email)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(212,185,106,0.35)', padding: '2px', display: 'inline-flex' }}
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
                <div className="ad-lead-meta">
                  {lead.service_type && <span className="ad-badge">{lead.service_type}</span>}
                  <span className="ad-lead-time">{timeAgo(lead.created_at)}</span>
                  <button className="ad-btn-sm ad-btn-del" onClick={() => setConfirm({ id: lead.id, name: lead.name })}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <p className="ad-lead-msg">"{lead.message}"</p>
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <ConfirmModal
          message={`Delete lead from "${confirm.name}"? This cannot be undone.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════
const NAV_TABS = [
  { key: 'projects', label: 'Projects',        icon: <Folder size={17} />    },
  { key: 'team',     label: 'Team',            icon: <Users size={17} />     },
  { key: 'clients',  label: 'Client Projects', icon: <Handshake size={17} /> },
  { key: 'leads',    label: 'Leads',           icon: <Mail size={17} />      },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab,     setTab]     = useState('projects');
  const [toast,   setToast]   = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts,  setCounts]  = useState({ projects: null, team: null, clients: null, leads: null });

  useEffect(() => {
    if (!isLoggedIn()) navigate('/auronix-admin');
  }, [navigate]);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, key: Date.now() });
  }, []);

  const handleCountChange = useCallback((key, value) => {
    setCounts((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleLogout = () => {
    clearToken();
    navigate('/auronix-admin');
  };

  const currentTab = NAV_TABS.find((t) => t.key === tab);

  return (
    <div className="ad-layout">
      {/* Mobile overlay */}
      <div
        className={`ad-sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className={`ad-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="ad-sidebar-brand">
          <div className="ad-brand-hex">⬡</div>
          <div className="ad-brand-info">
            <div className="ad-brand-name">Auronix</div>
            <div className="ad-brand-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="ad-nav">
          <div className="ad-nav-section-label">Management</div>
          {NAV_TABS.map((t) => (
            <button
              key={t.key}
              className={`ad-nav-item ${tab === t.key ? 'active' : ''}`}
              onClick={() => { setTab(t.key); setSidebarOpen(false); }}
            >
              <span className="ad-nav-icon">{t.icon}</span>
              {t.label}
              {counts[t.key] !== null && (
                <span className="ad-nav-badge">{counts[t.key]}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <div className="ad-admin-avatar-row">
            <div className="ad-avatar-dot-wrap">
              <div className="ad-avatar-circle">A</div>
              <div className="ad-online-dot" />
            </div>
            <div className="ad-avatar-info">
              <div className="ad-avatar-name">Admin</div>
              <div className="ad-avatar-role">Super Admin</div>
            </div>
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer" className="ad-nav-item ad-nav-site">
            <span className="ad-nav-icon"><Globe size={16} /></span>
            View Site
            <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.4 }} />
          </a>
          <button className="ad-nav-item ad-nav-logout" onClick={handleLogout}>
            <span className="ad-nav-icon"><LogOut size={16} /></span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ad-main">
        {/* Topbar */}
        <div className="ad-topbar">
          <div className="ad-topbar-left">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <h1 className="ad-topbar-title">
              {currentTab?.icon}
              {currentTab?.label}
            </h1>
          </div>
          <div className="ad-topbar-right">
            <LiveClock />
            <div className="ad-admin-chip">
              <span className="ad-admin-dot" />
              Admin
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="ad-content">
          {/* Stats row — always visible */}
          <StatsRow counts={counts} />

          {/* Tab content */}
          {tab === 'projects' && <ProjectsTab showToast={showToast} onCountChange={handleCountChange} />}
          {tab === 'team'     && <TeamTab     showToast={showToast} onCountChange={handleCountChange} />}
          {tab === 'clients'  && <ClientProjectsTab showToast={showToast} onCountChange={handleCountChange} />}
          {tab === 'leads'    && <LeadsTab    showToast={showToast} onCountChange={handleCountChange} />}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
