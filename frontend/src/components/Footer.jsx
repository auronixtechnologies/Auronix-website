/**
 * Footer Component (Restored columns with backdrop watermark)
 */

import './Footer.css';
import { FiLinkedin, FiGithub, FiTwitter, FiMail, FiPhone } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section brand-card">
          <div className="footer-logo-wrapper">
            <img src="/auronix-logo.svg" alt="Auronix Technologies" className="footer-logo-img" />
            <div className="status-pulse-badge">
              <span className="pulse-dot"></span>
              <span className="pulse-text">Open for Collaborations</span>
            </div>
          </div>
          <p className="footer-description">
            Crafting premium digital experiences, AI-driven solutions, and next-generation web platforms.
          </p>
          <div className="footer-quote">
            <span className="quote-mark">“</span>
            <span>Design is intelligence made visible.</span>
          </div>
        </div>

        <div className="footer-section links-card">
          <h4>Services</h4>
          <div className="services-grid">
            <a href="#web" className="service-pill-link">
              <span className="pill-dot"></span>
              <span>Web Development</span>
            </a>
            <a href="#ml" className="service-pill-link">
              <span className="pill-dot"></span>
              <span>AI/ML Solutions</span>
            </a>
            <a href="#llm" className="service-pill-link">
              <span className="pill-dot"></span>
              <span>LLM Integration</span>
            </a>
            <a href="#custom" className="service-pill-link">
              <span className="pill-dot"></span>
              <span>Custom Dev</span>
            </a>
          </div>
        </div>

        <div className="footer-section links-card">
          <h4>Explore</h4>
          <ul className="creative-links-list">
            <li>
              <a href="/about" className="creative-link">
                <span className="link-number">01</span>
                <span className="link-text">About Us</span>
              </a>
            </li>
            <li>
              <a href="/team" className="creative-link">
                <span className="link-number">02</span>
                <span className="link-text">Our Team</span>
              </a>
            </li>
            <li>
              <a href="/portfolio" className="creative-link">
                <span className="link-number">03</span>
                <span className="link-text">Portfolio</span>
              </a>
            </li>
            <li>
              <a href="/contact" className="creative-link">
                <span className="link-number">04</span>
                <span className="link-text">Get in Touch</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section footer-contact-section contact-card">
          <h4>Let's Connect</h4>
          <div className="footer-contact-details">
            <a href="mailto:auronixtechnologies@gmail.com" className="contact-item-link creative-contact-item">
              <div className="contact-icon-wrapper">
                <FiMail className="contact-icon" size={16} />
              </div>
              <div className="contact-info">
                <span className="contact-label">Email Us</span>
                <span className="contact-val">auronixtechnologies@gmail.com</span>
              </div>
            </a>
            <a href="tel:+919843464180" className="contact-item-link creative-contact-item">
              <div className="contact-icon-wrapper">
                <FiPhone className="contact-icon" size={16} />
              </div>
              <div className="contact-info">
                <span className="contact-label">Call Us</span>
                <span className="contact-val">+91 9843464180</span>
              </div>
            </a>
          </div>

          <div className="social-links-wrapper">
            <span className="social-links-title">Follow the Journey</span>
            <div className="social-links">
              <a
                href="#linkedin"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="social-icon-btn"
              >
                <FiLinkedin size={18} />
              </a>

              <a
                href="#github"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="social-icon-btn"
              >
                <FiGithub size={18} />
              </a>

              <a
                href="#twitter"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="social-icon-btn"
              >
                <FiTwitter size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright-text">&copy; {currentYear} Auronix Technologies. All rights reserved. &nbsp;|&nbsp; <a href="/privacy" className="privacy-link">Privacy Policy</a></p>
      </div>

      {/* Large Backdrop Watermark Text */}
      <div className="footer-watermark">
        AURONIX
      </div>
    </footer>
  );
}