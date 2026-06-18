import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogAPI } from '../services/api';
import './pages.css';
import Loader from '../components/Loader';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await blogAPI.getBlogPosts(0, 20);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
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
        <h1>Technical Blog</h1>
        <p className="intro">Deep dives, tutorials, and case studies from our engineering team.</p>
      </motion.div>

      {loading ? (
        <Loader />
      ) : posts.length === 0 ? (
        <p>No blog posts found. Check back later!</p>
      ) : (
        <div className="projects-grid">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              className="project-card clickable-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link to={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                {post.image_data && post.image_type && (
                  <div style={{ width: '100%', height: '180px', marginBottom: '16px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img
                      src={`data:${post.image_type};base64,${post.image_data}`}
                      alt={post.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <h3 style={{ marginBottom: '8px' }}>{post.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', marginBottom: '16px' }}>
                  {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <div className="tech-stack">
                  {post.tags && post.tags.map((tag, idx) => (
                    <span key={idx} className="tech-badge">{tag}</span>
                  ))}
                </div>
                <div style={{ marginTop: '16px', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                  Read More →
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
