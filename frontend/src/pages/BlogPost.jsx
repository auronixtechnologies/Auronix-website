import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogAPI, imageUrl } from '../services/api';
import Loader from '../components/Loader';
import './pages.css';

/**
 * Escape every HTML-significant character in the raw post body.
 *
 * This runs BEFORE the markdown substitutions below, so any tag an author (or
 * an attacker) writes into a post becomes inert text rather than live markup.
 * The only HTML in the output is the tags this function itself emits.
 *
 * Consequence: literal HTML in a post is displayed, not rendered. If you later
 * want authors to embed real HTML, swap this for DOMPurify.sanitize() instead
 * of removing the escaping.
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPostBody(content) {
  if (!content) return '';

  // Pull fenced code blocks out first so their contents are never touched by
  // the inline rules below, then put them back at the end.
  //
  // The sentinel is randomised per render so an author cannot type the
  // placeholder text into a post and have it substituted for a code block.
  const sentinel = `CODEBLOCK${Math.random().toString(36).slice(2, 12)}`;
  const codeBlocks = [];
  const withPlaceholders = content.replace(
    /```[\w]*\n?([\s\S]*?)```/g,
    (_match, code) => {
      codeBlocks.push(code);
      return `${sentinel}${codeBlocks.length - 1}${sentinel}`;
    }
  );

  const html = escapeHtml(withPlaceholders)
    .replace(/^#{3} (.+)$/gm, '<h3>$1</h3>')
    .replace(/^#{2} (.+)$/gm, '<h2>$1</h2>')
    .replace(/^#{1} (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');

  return html.replace(
    new RegExp(`${sentinel}(\\d+)${sentinel}`, 'g'),
    (_match, i) => `<pre><code>${escapeHtml(codeBlocks[Number(i)])}</code></pre>`
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setPost(null);
    setFailed(false);
    blogAPI.getBlogPost(slug)
      .then(data => {
        if (data && data.title) setPost(data);
        else setFailed(true);
      })
      .catch(err => { console.error(err); setFailed(true); })
      .finally(() => setLoading(false));
  }, [slug]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="bpp-loading">
        <Loader />
      </div>
    );
  }

  /* ── Error / Not Found ── */
  if (failed || !post) {
    return (
      <div className="bpp-notfound">
        <span className="bpp-nf-icon">📄</span>
        <h2>Article Not Found</h2>
        <p>The post you're looking for doesn't exist or has been archived.</p>
        <Link to="/blog" className="bpp-back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Blog
        </Link>
      </div>
    );
  }

  const pubDate = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const twitterHref = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;

  const bodyHtml = renderPostBody(post.content);

  return (
    <motion.div
      className="bpp-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Back link ── */}
      <Link to="/blog" className="bpp-back-link">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Articles
      </Link>

      <div className="bpp-layout">
        {/* ═══════════ ARTICLE ═══════════ */}
        <article className="bpp-article">

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="bpp-tag-row">
              {post.tags.map((t, i) => (
                <span key={i} className="bpp-tag">{t}</span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="bpp-h1">{post.title}</h1>

          {/* Meta */}
          <div className="bpp-meta">
            <span className="bpp-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Auronix Team
            </span>
            <span className="bpp-meta-sep">·</span>
            <span className="bpp-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {pubDate}
            </span>
            <span className="bpp-meta-sep">·</span>
            <span className="bpp-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              5 min read
            </span>
          </div>

          {/* Cover image */}
          {post.has_image && (
            <div className="bpp-cover">
              <img
                src={imageUrl('blog', post.slug, post.updated_at)}
                alt={post.title}
                className="bpp-cover-img"
              />
            </div>
          )}

          {/* Body */}
          <div
            className="bpp-body"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </article>

        {/* ═══════════ SIDEBAR ═══════════ */}
        <aside className="bpp-sidebar">
          <div className="bpp-sidebar-sticky">

            {/* Author */}
            <div className="bpp-widget">
              <div className="bpp-author">
                <div className="bpp-author-avi">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                </div>
                <div>
                  <h4 className="bpp-author-name">Auronix Team</h4>
                  <p className="bpp-author-bio">Full-stack, AI &amp; systems engineering specialists.</p>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="bpp-widget">
              <p className="bpp-widget-label">Share Article</p>
              <div className="bpp-share-row">
                {/* X / Twitter */}
                <a href={twitterHref} target="_blank" rel="noopener noreferrer" className="bpp-share-btn" title="Share on X">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.4 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.261 5.638 5.902-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href={linkedinHref} target="_blank" rel="noopener noreferrer" className="bpp-share-btn" title="Share on LinkedIn">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                {/* Copy Link */}
                <button onClick={copyLink} className={`bpp-share-btn${copied ? ' bpp-copied' : ''}`} title="Copy link">
                  {copied ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  )}
                </button>
              </div>
              {copied && <span className="bpp-copied-note">✓ Copied!</span>}
            </div>

            {/* CTA */}
            <div className="bpp-widget bpp-cta-widget">
              <h4 className="bpp-cta-heading">Need a Custom Build?</h4>
              <p className="bpp-cta-desc">We build scalable web apps, AI pipelines &amp; full-stack platforms.</p>
              <Link to="/contact" className="bpp-cta-link">
                Hire Us
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>

          </div>
        </aside>
      </div>
    </motion.div>
  );
}
