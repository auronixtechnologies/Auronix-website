import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import './pages.css';

const services = [
  {
    title: 'MVP Web App',
    price: 'Starting at $2,500',
    description: 'Perfect for startups needing a launchable product quickly.',
    features: [
      'Custom UI/UX Design',
      'React/Vite Frontend',
      'FastAPI & PostgreSQL Backend',
      'User Authentication',
      'Cloud Deployment',
    ],
    isPopular: false,
  },
  {
    title: 'Custom LLM Agent',
    price: 'Starting at $5,000',
    description: 'Integrate OpenAI/LLMs into your business processes.',
    features: [
      'RAG Pipeline Setup',
      'Custom API Integrations',
      'Chatbot UI',
      'Vector Database Setup',
      'Prompt Engineering',
    ],
    isPopular: true,
  },
  {
    title: 'Hourly Consulting',
    price: '$80 / hour',
    description: 'Need expert advice or specific features built? Hire us on demand.',
    features: [
      'Code Review & Audits',
      'Architecture Planning',
      'Performance Optimization',
      'CI/CD Pipeline Setup',
      'Bug Fixing',
    ],
    isPopular: false,
  },
];

export default function Services() {
  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1>Services & Pricing</h1>
        <p className="intro" style={{ margin: '0 auto 40px auto' }}>
          Transparent pricing for premium software development and AI integration.
        </p>
      </motion.div>

      <div className="services-grid">
        {services.map((service, index) => (
          <motion.div
            key={index}
            className={`service-card ${service.isPopular ? 'popular' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            style={service.isPopular ? { border: '2px solid var(--accent-primary)', position: 'relative' } : {}}
          >
            {service.isPopular && (
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-primary)', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                MOST POPULAR
              </div>
            )}
            <h3>{service.title}</h3>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-secondary)', marginBottom: '16px' }}>
              {service.price}
            </div>
            <p>{service.description}</p>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0', flexGrow: 1 }}>
              {service.features.map((feature, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <Check size={16} color="var(--accent-secondary)" /> {feature}
                </li>
              ))}
            </ul>
            
            <Link to={`/contact?service=${encodeURIComponent(service.title)}`} style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary" style={{ width: '100%' }}>
                Get Started
              </button>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
