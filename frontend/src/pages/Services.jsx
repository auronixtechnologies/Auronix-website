import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Layers, Bot, Calendar, ChevronRight } from 'lucide-react';
import './pages.css';

const services = [
  {
    id: 'mvp',
    title: 'MVP Web App',
    price: 'Starting at $2,500',
    description: 'Perfect for startups needing a launchable product quickly. We build custom full-stack solutions tailored to validate your market.',
    icon: Layers,
    timeline: '3 - 5 Weeks Delivery',
    techStack: ['React', 'Next.js', 'FastAPI', 'PostgreSQL', 'AWS'],
    features: [
      'Custom UI/UX Design',
      'React/Vite Frontend Architecture',
      'FastAPI & PostgreSQL Backend Database',
      'Secure User Authentication & Roles',
      'Production-Ready Cloud Deployment',
    ],
  },
  {
    id: 'llm',
    title: 'Custom LLM Agent',
    price: 'Starting at $5,000',
    description: 'Integrate artificial intelligence into your business workflow. From semantic search engines to custom autonomous agents.',
    icon: Bot,
    timeline: '4 - 6 Weeks Delivery',
    techStack: ['OpenAI / Gemini', 'LangChain', 'LlamaIndex', 'Pinecone', 'Python'],
    features: [
      'Retrieval Augmented Generation (RAG) Setup',
      'Custom API & Service Integrations',
      'Responsive Web Chatbot Interface',
      'Vector Database & Semantic Embedding',
      'System Prompts & Guardrail Engineering',
    ],
  },
  {
    id: 'consulting',
    title: 'Hourly Consulting',
    price: '$80 / hour',
    description: 'Hire senior engineering expertise on-demand. Perfect for troubleshooting blockers, code reviews, or architectural planning.',
    icon: Calendar,
    timeline: 'On-Demand Scheduling',
    techStack: ['Architecture Design', 'Code Audits', 'Optimization', 'CI/CD Pipelines'],
    features: [
      'Comprehensive Code Review & Audits',
      'System Architecture & Flow Planning',
      'Performance Optimization & Scalability',
      'Custom CI/CD Pipeline Automations',
      'Urgent Database & Bug Investigations',
    ],
  },
];

export default function Services() {
  const [activeTab, setActiveTab] = useState(0);

  const ActiveIcon = services[activeTab].icon;

  return (
    <div className="page services-page-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center services-hero"
      >
        <span className="services-subtitle-top">Our Offerings</span>
        <h1>Services & Pricing</h1>
        <p className="intro services-intro-text">
          Select a package to view timelines, features, and tech stacks.
        </p>
      </motion.div>

      <div className="services-dashboard">
        {/* Left Side: Selectors */}
        <div className="services-sidebar">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                className={`service-tab-btn ${activeTab === index ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                <div className="tab-icon-wrapper">
                  <Icon size={20} />
                </div>
                <div className="tab-btn-content">
                  <span className="tab-title">{service.title}</span>
                  <span className="tab-summary">{service.price}</span>
                </div>
                <ChevronRight className="tab-chevron" size={16} />
              </button>
            );
          })}
        </div>

        {/* Right Side: Detailed View */}
        <div className="services-detail-panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="panel-content-wrapper"
            >
              <div className="panel-header">
                <div className="panel-badge">
                  <ActiveIcon size={14} className="panel-badge-icon" />
                  <span>{services[activeTab].timeline}</span>
                </div>
                <h2>{services[activeTab].title}</h2>
                <div className="panel-price-badge">
                  <span>{services[activeTab].price}</span>
                </div>
              </div>

              <p className="panel-desc">{services[activeTab].description}</p>

              <div className="panel-section">
                <h4>Tech Stack</h4>
                <div className="panel-tech-grid">
                  {services[activeTab].techStack.map((tech, idx) => (
                    <span key={idx} className="panel-tech-tag">{tech}</span>
                  ))}
                </div>
              </div>

              <div className="panel-section">
                <h4>What's Included</h4>
                <ul className="panel-features-list">
                  {services[activeTab].features.map((feature, idx) => (
                    <li key={idx} className="panel-feature-item">
                      <div className="feature-check-wrap">
                        <Check size={12} />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="panel-footer">
                <Link
                  to={`/contact?service=${encodeURIComponent(services[activeTab].title)}`}
                  className="panel-cta-btn"
                >
                  Book Package Consultation
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
