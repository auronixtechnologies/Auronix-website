import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageSquare, Clock, Send, CheckCircle2 } from 'lucide-react';
import { contactAPI } from '../services/api';
import './pages.css';

export default function Contact() {
  const [formData, setFormData] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const proj = searchParams.get('project');
    const msg = proj ? `I am interested in buying the project: ${proj}. Let's discuss!` : '';
    
    const rawService = searchParams.get('service');
    let service = '';
    if (rawService === 'Web') service = 'Web Development';
    else if (rawService === 'ML') service = 'AI/ML Solutions';
    else if (rawService === 'LLM') service = 'LLM Integration';
    else if (rawService === 'MCP') service = 'Custom Development';

    return {
      name: '',
      email: '',
      message: msg,
      service_type: service,
    };
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const services = [
    'Web Development',
    'AI/ML Solutions',
    'LLM Integration',
    'Custom Development'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceSelect = (service) => {
    setFormData((prev) => ({
      ...prev,
      service_type: service === prev.service_type ? '' : service,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSubmitSuccess(false);

    try {
      await contactAPI.submitContact(formData);
      setSubmitSuccess(true);
      setMessage('Thank you! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        message: '',
        service_type: '',
      });
    } catch (error) {
      setSubmitSuccess(false);
      setMessage('Error submitting form. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="page contact-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="contact-grid-layout">
        
        {/* Left Side: Contact Information Cards */}
        <div className="contact-details-panel">
          <span className="contact-subtitle">Get In Touch</span>
          <h1>Let's build something grand.</h1>
          <p className="contact-lead-desc">
            Have a project in mind, a query about AI integrations, or just want to chat about custom platforms? Drop a message and let's get started.
          </p>

          <div className="contact-info-cards">
            <div className="info-card">
              <Mail className="info-icon" />
              <div className="info-text">
                <h4>Email Us</h4>
                <a href="mailto:auronixtechnologies@gmail.com">auronixtechnologies@gmail.com</a>
              </div>
            </div>

            <div className="info-card">
              <MessageSquare className="info-icon" />
              <div className="info-text">
                <h4>Instant Connect</h4>
                <p>Available on Slack & Teams for client projects</p>
              </div>
            </div>

            <div className="info-card">
              <Clock className="info-icon" />
              <div className="info-text">
                <h4>Response SLA</h4>
                <p>Usually within 12 Hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive glass form */}
        <div className="contact-form-panel">
          <form className="contact-glass-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Creative Capsule Selection instead of plain dropdown */}
            <div className="form-group">
              <label>Service Interest</label>
              <div className="service-capsules">
                {services.map((srv) => (
                  <button
                    key={srv}
                    type="button"
                    className={`service-capsule-btn ${formData.service_type === srv ? 'selected' : ''}`}
                    onClick={() => handleServiceSelect(srv)}
                  >
                    {srv}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Project Scope / Details</label>
              <textarea
                id="message"
                name="message"
                placeholder="Tell us about what you want to construct..."
                rows="4"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary cta-send-btn" disabled={loading}>
              {loading ? 'Sending...' : (
                <>
                  <span>Send Message</span>
                  <Send size={16} />
                </>
              )}
            </button>

            {/* Animated Feedback Messages */}
            <AnimatePresence>
              {message && (
                <motion.div 
                  className={`form-response-alert ${submitSuccess ? 'success-alert' : 'error-alert'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {submitSuccess && <CheckCircle2 size={18} />}
                  <span>{message}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

      </div>
    </motion.div>
  );
}
