import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogAPI } from '../services/api';
import Loader from '../components/Loader';
import './pages.css';

/* Gradient domain patterns for placeholder cards */
const GRADIENTS = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
  'linear-gradient(135deg, #1c1c1c 0%, #2d1b2e 50%, #1a0533 100%)',
  'linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #0a2342 100%)',
  'linear-gradient(135deg, #1a1200 0%, #2a1e00 50%, #3d2b00 100%)',
];

const ICONS = [
  // Code icon
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(161,143,104,0.5)" strokeWidth="1.2" key="code">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>,
  // Brain/AI icon
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(161,143,104,0.5)" strokeWidth="1.2" key="brain">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>,
  // Layers icon
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(161,143,104,0.5)" strokeWidth="1.2" key="layers">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
  </svg>,
];

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    blogAPI.getBlogPosts(0, 20)
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(err => { console.error(err); setFailed(true); })
      .finally(() => setLoading(false));
  }, []);

  const fmt = (d) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const featured = posts[0] || null;
  const rest = posts.slice(1);

  return (
    <div className="blg-page">

      {/* ══ Hero ══ */}
      <motion.div
        className="blg-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <div className="blg-hero-eyebrow">
          <span className="blg-eyebrow-dot" />
          <span>Engineering Insights</span>
        </div>
        <h1 className="blg-title">
          Technical Blog
        </h1>
        <p className="blg-subtitle">
          Deep dives, architecture breakdowns, tutorials and real-world case studies from the Auronix engineering team.
        </p>

        {/* Stats bar */}
        <div className="blg-stats-bar">
          <div className="blg-stat-item">
            <span className="blg-stat-num">{posts.length || '–'}</span>
            <span className="blg-stat-lbl">Articles</span>
          </div>
          <span className="blg-stat-div" />
          <div className="blg-stat-item">
            <span className="blg-stat-num">5</span>
            <span className="blg-stat-lbl">Min Avg. Read</span>
          </div>
          <span className="blg-stat-div" />
          <div className="blg-stat-item">
            <span className="blg-stat-num">3+</span>
            <span className="blg-stat-lbl">Categories</span>
          </div>
        </div>
      </motion.div>

      {/* ══ Loading / Error / Empty ══ */}
      {loading && <div className="blg-loader-wrap"><Loader /></div>}

      {!loading && failed && (
        <div className="blg-empty">
          <span className="blg-empty-icon">⚠️</span>
          <p>Could not load posts. Please check the backend connection.</p>
        </div>
      )}

      {!loading && !failed && posts.length === 0 && (
        <div className="blg-empty">
          <span className="blg-empty-icon">📝</span>
          <p>No blog posts yet — check back soon!</p>
        </div>
      )}

      {/* ══ Content ══ */}
      {!loading && !failed && posts.length > 0 && (
        <div className="blg-content">

          {/* ─ Featured Spotlight ─ */}
          {featured && (
            <motion.div
              className="blg-featured"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <Link to={`/blog/${featured.slug}`} className="blg-featured-link">

                {/* Visual side */}
                <div className="blg-feat-visual" style={{ background: GRADIENTS[0] }}>
                  {featured.image_data && featured.image_type ? (
                    <img
                      src={`data:${featured.image_type};base64,${featured.image_data}`}
                      alt={featured.title}
                      className="blg-feat-img"
                    />
                  ) : (
                    <div className="blg-feat-artwork">
                      {/* Decorative orbs */}
                      <div className="feat-orb feat-orb-1" />
                      <div className="feat-orb feat-orb-2" />
                      <div className="feat-orb feat-orb-3" />
                      {/* Grid lines */}
                      <div className="feat-grid-lines" />
                      {/* Center icon */}
                      <div className="feat-center-icon">
                        {ICONS[0]}
                      </div>
                      {/* Tag label on image */}
                      <div className="feat-visual-label">
                        {(featured.tags || []).slice(0, 1).map((t, i) => (
                          <span key={i}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Text side */}
                <div className="blg-feat-text">
                  <div className="blg-feat-top-row">
                    <span className="blg-feat-badge">✦ Featured</span>
                    <span className="blg-feat-readtime">5 min read</span>
                  </div>

                  <div className="blg-feat-tags">
                    {(featured.tags || []).map((t, i) => (
                      <span key={i} className="blg-tag">{t}</span>
                    ))}
                  </div>

                  <h2 className="blg-feat-h2">{featured.title}</h2>

                  <p className="blg-feat-date">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {fmt(featured.published_at || featured.created_at)}
                  </p>

                  <p className="blg-feat-excerpt">
                    Explore architecture insights, engineering decisions, and code-level breakdowns from the team that built it.
                  </p>

                  <div className="blg-feat-cta">
                    <span>Read Full Article</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Section divider */}
          {rest.length > 0 && (
            <div className="blg-section-head">
              <span className="blg-section-line" />
              <span className="blg-section-label">More Articles</span>
              <span className="blg-section-line" />
            </div>
          )}

          {/* ─ Cards Grid ─ */}
          {rest.length > 0 && (
            <div className="blg-grid">
              {rest.map((post, i) => (
                <motion.div
                  key={post.id}
                  className="blg-card"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.45 }}
                >
                  <Link to={`/blog/${post.slug}`} className="blg-card-link">

                    {/* Card visual */}
                    <div className="blg-card-visual" style={{ background: GRADIENTS[(i + 1) % GRADIENTS.length] }}>
                      {post.image_data && post.image_type ? (
                        <img
                          src={`data:${post.image_type};base64,${post.image_data}`}
                          alt={post.title}
                          className="blg-card-img"
                        />
                      ) : (
                        <div className="blg-card-artwork">
                          <div className="card-orb card-orb-1" />
                          <div className="card-orb card-orb-2" />
                          <div className="card-center-icon">
                            {ICONS[(i + 1) % ICONS.length]}
                          </div>
                        </div>
                      )}
                      <span className="blg-card-readtime-badge">5 min</span>
                    </div>

                    <div className="blg-card-body">
                      <div className="blg-card-tags">
                        {(post.tags || []).slice(0, 2).map((t, ti) => (
                          <span key={ti} className="blg-tag">{t}</span>
                        ))}
                      </div>
                      <h3 className="blg-card-h3">{post.title}</h3>
                      <p className="blg-card-date">{fmt(post.published_at || post.created_at)}</p>
                      <span className="blg-card-readmore">
                        Read Article
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
