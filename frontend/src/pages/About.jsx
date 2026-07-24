import { motion } from 'framer-motion';
import { Sparkles, Code2, Users, Rocket, ShieldCheck, HeartHandshake } from 'lucide-react';
import './pages.css';

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <motion.div
      className="page about-page-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="about-hero">
        <motion.span className="about-subtitle" variants={itemVariants}>Who We Are</motion.span>
        <motion.h1 variants={itemVariants}>Engineering Digital Excellence</motion.h1>
        <motion.p className="about-intro-desc" variants={itemVariants}>
          Auronix Technologies is a boutique software engineering studio. We build high-performance web systems, custom AI integrations, and scalable products that solve real business challenges.
        </motion.p>
      </div>

      {/* Grid: Storyboard & Stat Widget */}
      <div className="about-storyboard-row">
        <motion.div className="about-story-text" variants={itemVariants}>
          <h2>Our Philosophy</h2>
          <p>
            We believe that great software is a combination of clean architecture, intuitive design, and robust engineering. We work closely with startups and established teams to turn complex ideas into smooth, launchable digital realities.
          </p>
          <p>
            Whether it's building a custom SaaS dashboard, integrating advanced LLM agents to automate workflows, or optimizing backend database scale, we deliver clean systems designed for growth.
          </p>
        </motion.div>

        <motion.div className="about-stats-widget" variants={itemVariants}>
          <div className="stat-box">
            <span className="stat-num">25+</span>
            <span className="stat-lbl">Projects Launched</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">99.9%</span>
            <span className="stat-lbl">System Uptime</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">100%</span>
            <span className="stat-lbl">Transparent Code</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">1-on-1</span>
            <span className="stat-lbl">Partner Support</span>
          </div>
        </motion.div>
      </div>

      {/* Process Flow Cards */}
      <section className="about-process-sec">
        <motion.h2 variants={itemVariants} className="center-h2">How We Work With You</motion.h2>
        <div className="about-process-grid">
          <motion.div className="process-card" variants={itemVariants}>
            <div className="process-step-num">01</div>
            <h3>Discover</h3>
            <p>We analyze your business flow, identify technology bottlenecks, and map out the system architecture.</p>
          </motion.div>

          <motion.div className="process-card" variants={itemVariants}>
            <div className="process-step-num">02</div>
            <h3>Prototype</h3>
            <p>Rapid UX layout wireframes and frontend blueprints to validate the flow before writing database tables.</p>
          </motion.div>

          <motion.div className="process-card" variants={itemVariants}>
            <div className="process-step-num">03</div>
            <h3>Build</h3>
            <p>Writing clean, type-safe code using modular frontend components and secure high-throughput backend APIs.</p>
          </motion.div>

          <motion.div className="process-card" variants={itemVariants}>
            <div className="process-step-num">04</div>
            <h3>Optimize</h3>
            <p>Intense performance testing, database index tuning, and setting up automated CI/CD cloud hosting.</p>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us: Value Grid */}
      <section className="about-values-sec">
        <motion.h2 variants={itemVariants} className="center-h2">Why Collaborate With Us</motion.h2>
        <div className="about-values-grid">
          <motion.div className="value-card" variants={itemVariants}>
            <Sparkles className="value-icon" size={24} />
            <h3>Pixel-Perfect UIs</h3>
            <p>We deliver beautiful, accessible, and fast interfaces that look impressive and keep users engaged.</p>
          </motion.div>

          <motion.div className="value-card" variants={itemVariants}>
            <Code2 className="value-icon" size={24} />
            <h3>Maintainable Architecture</h3>
            <p>We write clean, well-documented code that makes it easy for your internal teams to scale the system later.</p>
          </motion.div>

          <motion.div className="value-card" variants={itemVariants}>
            <Users className="value-icon" size={24} />
            <h3>Direct Communication</h3>
            <p>No layers of management. You communicate directly with senior developers who understand your goals.</p>
          </motion.div>

          <motion.div className="value-card" variants={itemVariants}>
            <Rocket className="value-icon" size={24} />
            <h3>Modern AI Stack</h3>
            <p>We build production-ready integrations using LLMs, vector indexes, and semantic search systems.</p>
          </motion.div>

          <motion.div className="value-card" variants={itemVariants}>
            <ShieldCheck className="value-icon" size={24} />
            <h3>Hardened Security</h3>
            <p>We implement OAuth validation, HTTPS routing standards, and strict database protection rules.</p>
          </motion.div>

          <motion.div className="value-card" variants={itemVariants}>
            <HeartHandshake className="value-icon" size={24} />
            <h3>Bespoke Delivery</h3>
            <p>Every line of code is tailored to your business needs, giving you full ownership of the intellectual property.</p>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
