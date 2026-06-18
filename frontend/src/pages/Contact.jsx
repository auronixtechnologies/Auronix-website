/**
 * Contact Page Component
 */

import { useState } from 'react';
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
    else if (rawService === 'ML') service = 'AI/ML';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await contactAPI.submitContact(formData);
      setMessage('Thank you! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        message: '',
        service_type: '',
      });
    } catch (error) {
      setMessage('Error submitting form. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Contact Us</h1>
      <p className="intro">Get in touch with our team</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="service_type">Service Interest</label>
          <select
            id="service_type"
            name="service_type"
            value={formData.service_type}
            onChange={handleChange}
          >
            <option value="">Select a service</option>
            <option value="Web Development">Web Development</option>
            <option value="AI/ML">AI/ML Solutions</option>
            <option value="LLM Integration">LLM Integration</option>
            <option value="Custom Development">Custom Development</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}
    </div>
  );
}
