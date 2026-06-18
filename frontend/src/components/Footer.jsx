/**
 * Footer Component (Restored columns with backdrop watermark)
 */

import './Footer.css';
import { FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <img src="/auronix-logo.svg" alt="Auronix Technologies" className="footer-logo-img" />
          <p style={{ marginTop: '12px' }}>Creative Solutions for your Digital Presence.</p>
        </div>

        <div className="footer-section">
          <h4>Services</h4>
          <ul>
            <li><a href="#web">Web Development</a></li>
            <li><a href="#ml">AI/ML Solutions</a></li>
            <li><a href="#llm">LLM Integration</a></li>
            <li><a href="#custom">Custom Development</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/team">Team</a></li>
            <li><a href="/portfolio">Portfolio</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: auronixtechnologies@gmail.com</p>
          <p>Phone: +91 9843464180</p>

          <div className="social-links">
            <a
              href="#linkedin"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={18} />
            </a>

            <a
              href="#github"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FaGithub size={18} />
            </a>

            <a
              href="#twitter"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <FaTwitter size={18} />
            </a>
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