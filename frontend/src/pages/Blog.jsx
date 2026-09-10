import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Tag, ArrowRight } from 'lucide-react';
import { blogAPI, imageUrl } from '../services/api';
import './pages.css';
import Loader from '../components/Loader';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <motion.div
      className="page blog-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Cleaned up Hero Section */}
      <div className="blog-hero-section">
        <span className="blog-subtitle-badge">Insights & Updates</span>
        <h1>Technical Blog</h1>
        <p className="blog-intro-desc">Deep dives, tutorials, and engineering architecture updates from our core team.</p>
      </div>

      {loading ? (
        <Loader />
      ) : posts.length === 0 ? (
        <div className="text-center no-posts-box">
          <p>No blog posts found. Check back later!</p>
        </div>
      ) : (
        <div className="blog-posts-wrapper">

          {/* Featured Post (Spotlight Banner) */}
          {featuredPost && (
            <motion.div
              className="blog-featured-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link to={`/blog/${featuredPost.slug}`} className="featured-card-inner">
                {featuredPost.has_image ? (
                  <div className="featured-img-wrapper">
                    <img
                      src={imageUrl('blog', featuredPost.slug, featuredPost.updated_at)}
                      alt={featuredPost.title}
                      className="featured-img"
                    />
                  </div>
                ) : (
                  <div className="featured-img-placeholder">
                    <span className="placeholder-pattern"></span>
                  </div>
                )}

                <div className="featured-content">
                  <span className="featured-tag-pill">Featured Article</span>
                  <h2>{featuredPost.title}</h2>
                  <div className="featured-meta">
                    <span className="meta-item">
                      <Calendar size={14} />
                      <span>{formatDate(featuredPost.published_at || featuredPost.created_at)}</span>
                    </span>
                    {featuredPost.tags && featuredPost.tags.length > 0 && (
                      <span className="meta-item">
                        <Tag size={14} />
                        <span>{featuredPost.tags[0]}</span>
                      </span>
                    )}
                  </div>
                  <p className="featured-excerpt">
                    Read the complete deep dive outlining architecture details, performance benchmarks, and core implementations.
                  </p>
                  <span className="featured-readmore-btn">
                    <span>Read Article</span>
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Remaining Posts Grid */}
          {remainingPosts.length > 0 && (
            <div className="blog-cards-grid">
              {remainingPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  className="blog-grid-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Link to={`/blog/${post.slug}`} className="grid-card-inner">
                    {post.has_image ? (
                      <div className="grid-img-wrapper">
                        <img
                          src={imageUrl('blog', post.slug, post.updated_at)}
                          alt={post.title}
                          className="grid-img"
                        />
                      </div>
                    ) : (
                      <div className="grid-img-placeholder">
                        <span className="placeholder-pattern"></span>
                      </div>
                    )}

                    <div className="grid-card-details">
                      <div className="grid-meta-row">
                        <span className="meta-date">
                          {formatDate(post.published_at || post.created_at)}
                        </span>
                      </div>
                      <h3>{post.title}</h3>

                      {post.tags && post.tags.length > 0 && (
                        <div className="grid-tags-row">
                          {post.tags.map((tag, idx) => (
                            <span key={idx} className="grid-tag-badge">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <span className="grid-read-link">
                        <span>Read More</span>
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}