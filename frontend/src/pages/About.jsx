/**
 * About Page Component
 */

import './pages.css';

export default function About() {
  return (
    <div className="page">
      <h1>About Auronix Technologies</h1>

      <section className="about-section">
        <h2>Who We Are</h2>
        <p>
          Auronix Technologies is a creative team of developers and designers dedicated to 
          building innovative web applications, AI/ML solutions, and custom software for 
          businesses of all sizes.
        </p>
      </section>

      <section className="about-section">
        <h2>What We Do</h2>
        <div className="services-grid">
          <div className="service-card">
            <h3>Web Development</h3>
            <p>Modern, responsive web applications built with React and FastAPI</p>
          </div>
          <div className="service-card">
            <h3>AI & Machine Learning</h3>
            <p>Custom ML models and AI solutions for data-driven applications</p>
          </div>
          <div className="service-card">
            <h3>LLM Integration</h3>
            <p>Integrate advanced language models into your applications</p>
          </div>
          <div className="service-card">
            <h3>Custom Development</h3>
            <p>Tailored solutions for your specific business needs</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Why Choose Us?</h2>
        <ul className="benefits">
          <li>Experienced team with 50+ projects delivered</li>
          <li>Clean, scalable code following industry best practices</li>
          <li>Quick turnaround without compromising quality</li>
          <li>Full-stack expertise across multiple frameworks</li>
          <li>Transparent communication throughout the project</li>
        </ul>
      </section>
    </div>
  );
}
