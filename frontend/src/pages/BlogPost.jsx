import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { blogAPI } from '../services/api';
import './pages.css';
import Loader from '../components/Loader';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await blogAPI.getBlogPost(slug);
      setPost(data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page"><Loader /></div>;
  
  if (!post) return (
    <div className="page">
      <h1>Post not found</h1>
      <Link to="/blog" className="btn btn-primary"><ArrowLeft size={16} /> Back to Blog</Link>
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: '800px' }}>
      <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', textDecoration: 'none', marginBottom: '32px', fontWeight: 'bold' }}>
        <ArrowLeft size={16} /> Back to Blog
      </Link>
      
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>{post.title}</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px', color: 'var(--text-secondary)' }}>
          <span>
            {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {post.tags && post.tags.map((tag, idx) => (
              <span key={idx} className="skill-badge" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>{tag}</span>
            ))}
          </div>
        </div>

        {post.image_data && post.image_type && (
          <div style={{ width: '100%', height: '400px', marginBottom: '40px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
            <img
              src={`data:${post.image_type};base64,${post.image_data}`}
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* In a real app, you would use a markdown parser here like react-markdown */}
        {/* For this demo, we'll assume the content is safe HTML or plain text */}
        <div 
          className="blog-content" 
          style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-primary)' }}
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} 
        />
      </motion.article>
    </div>
  );
}
