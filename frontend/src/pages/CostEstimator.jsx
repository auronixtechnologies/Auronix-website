import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Cpu, MessageSquareCode, ShoppingCart, ShieldCheck, CreditCard, LayoutTemplate, Palette, CpuIcon, Check, ChevronRight, ChevronLeft, Send, Sparkles } from 'lucide-react';
import { contactAPI } from '../services/api';
import './pages.css';

export default function CostEstimator() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [selections, setSelections] = useState({
    projectType: '',
    features: [],
    timeline: '',
    name: '',
    email: '',
  });

  const projectTypes = [
    { id: 'web', label: 'Web Application', basePrice: 2500, icon: <Layers size={22} />, desc: 'React, Next.js, or complex dashboards' },
    { id: 'ml', label: 'AI/ML Model', basePrice: 5000, icon: <Cpu size={22} />, desc: 'Custom classification, regression or NLP models' },
    { id: 'llm', label: 'LLM Chatbot / RAG', basePrice: 4500, icon: <MessageSquareCode size={22} />, desc: 'AI Agents, Vector Search, Knowledge base setups' },
    { id: 'ecommerce', label: 'E-commerce', basePrice: 3500, icon: <ShoppingCart size={22} />, desc: 'Shopify Custom or custom headless shops' },
  ];

  const featuresList = [
    { id: 'auth', label: 'User Authentication', price: 500, icon: <ShieldCheck size={18} /> },
    { id: 'payment', label: 'Payment Integration', price: 1000, icon: <CreditCard size={18} /> },
    { id: 'admin', label: 'Admin Dashboard', price: 1500, icon: <LayoutTemplate size={18} /> },
    { id: 'design', label: 'Custom UI/UX Design', price: 2000, icon: <Palette size={18} /> },
    { id: 'api', label: 'External API Integration', price: 1000, icon: <CpuIcon size={18} /> },
  ];

  const timelines = [
    { id: 'relaxed', label: 'Relaxed (3+ months)', multiplier: 1, desc: 'Highest code review iterations' },
    { id: 'standard', label: 'Standard (1-3 months)', multiplier: 1.2, desc: 'Recommended turnaround speed' },
    { id: 'rush', label: 'Rush (Under 1 month)', multiplier: 1.5, desc: 'Fast-track engineering deployment' },
  ];

  const handleSelect = (field, value) => {
    setSelections(prev => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (featureId) => {
    setSelections(prev => {
      const isSelected = prev.features.includes(featureId);
      if (isSelected) {
        return { ...prev, features: prev.features.filter(id => id !== featureId) };
      } else {
        return { ...prev, features: [...prev.features, featureId] };
      }
    });
  };

  const calculateEstimate = () => {
    if (!selections.projectType) return 0;
    
    const base = projectTypes.find(p => p.id === selections.projectType)?.basePrice || 0;
    const featuresCost = selections.features.reduce((acc, featId) => {
      return acc + (featuresList.find(f => f.id === featId)?.price || 0);
    }, 0);
    
    const multiplier = timelines.find(t => t.id === selections.timeline)?.multiplier || 1;
    
    return Math.round((base + featuresCost) * multiplier);
  };

  const estimate = calculateEstimate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const ptLabel = projectTypes.find(p => p.id === selections.projectType)?.label;
    const tlLabel = timelines.find(t => t.id === selections.timeline)?.label;
    const feats = selections.features.map(fid => featuresList.find(f => f.id === fid)?.label).join(', ');

    const message = `Project Estimator Submission:\n\nType: ${ptLabel}\nTimeline: ${tlLabel}\nFeatures: ${feats || 'None selected'}\nEstimated Cost: ₹${estimate}`;

    try {
      await contactAPI.submitContact({
        name: selections.name,
        email: selections.email,
        service_type: 'Project Estimator',
        budget: `₹${estimate}`,
        message: message
      });
      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert('Error submitting estimate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Project Type' },
    { num: 2, title: 'Features' },
    { num: 3, title: 'Timeline' },
    { num: 4, title: 'Send Quote' }
  ];

  return (
    <div className="page estimator-page-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="estimator-hero"
      >
        <span className="estimator-subtitle-badge">Interactive Calculator</span>
        <h1>Project Cost Estimator</h1>
        <p className="estimator-intro-desc">Estimate your development cost based on specific tech features and speed.</p>
      </motion.div>

      {/* Progress Steps Header */}
      <div className="estimator-progress-header">
        <div className="progress-track-line">
          <div 
            className="progress-fill-line" 
            style={{ width: `${((step - 1) / (stepsList.length - 1)) * 100}%` }}
          />
        </div>
        {stepsList.map(s => (
          <div key={s.num} className={`progress-step-node ${step >= s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
            <div className="node-num-circle">
              {step > s.num ? <Check size={14} /> : s.num}
            </div>
            <span className="node-label-title">{s.title}</span>
          </div>
        ))}
      </div>

      <div className="estimator-form-container">
        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="estimator-success-box text-center"
          >
            <div className="success-icon-badge">
              <Sparkles size={36} />
            </div>
            <h2>Estimate Filed Successfully!</h2>
            <p>Thank you, <strong>{selections.name}</strong>. We have received your structural requirements and will contact you with a customized architecture scope soon.</p>
            <div className="estimator-success-result">
              <span className="result-lbl">Initial Budget Allocation</span>
              <span className="result-val">₹{estimate.toLocaleString()}</span>
            </div>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>Calculate Another</button>
          </motion.div>
        ) : (
          <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1); }} className="estimator-glass-form">
            <AnimatePresence mode="wait">
              
              {/* Step 1: Project Type */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 15 }} 
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="estimator-step-h3">1. Select your platform type</h3>
                  <div className="estimator-options-grid">
                    {projectTypes.map(pt => (
                      <div 
                        key={pt.id} 
                        onClick={() => handleSelect('projectType', pt.id)}
                        className={`estimator-type-card ${selections.projectType === pt.id ? 'selected' : ''}`}
                      >
                        <div className="card-icon">{pt.icon}</div>
                        <div className="card-info">
                          <strong>{pt.label}</strong>
                          <p>{pt.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Features */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 15 }} 
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="estimator-step-h3">2. Choose key architecture modules</h3>
                  <div className="estimator-features-grid">
                    {featuresList.map(f => {
                      const isSelected = selections.features.includes(f.id);
                      return (
                        <div 
                          key={f.id} 
                          onClick={() => toggleFeature(f.id)}
                          className={`estimator-feature-card ${isSelected ? 'selected' : ''}`}
                        >
                          <div className="feature-icon-wrapper">
                            {f.icon}
                          </div>
                          <span className="feature-card-label">{f.label}</span>
                          <div className={`feature-checkbox-status ${isSelected ? 'checked' : ''}`}>
                            {isSelected && <Check size={10} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Timeline */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 15 }} 
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="estimator-step-h3">3. Define engineering speed</h3>
                  <div className="estimator-timeline-list">
                    {timelines.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => handleSelect('timeline', t.id)}
                        className={`estimator-timeline-card ${selections.timeline === t.id ? 'selected' : ''}`}
                      >
                        <div className="timeline-info">
                          <strong>{t.label}</strong>
                          <p>{t.desc}</p>
                        </div>
                        {selections.timeline === t.id && (
                          <div className="timeline-checked-node">
                            <Check size={14} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Contact Info & Result */}
              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, x: 15 }} 
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="estimator-step-h3">4. Request project proposal</h3>
                  
                  <div className="estimator-price-bill-banner">
                    <span className="bill-label">Calculated Estimate</span>
                    <span className="bill-value">₹{estimate.toLocaleString()}</span>
                    <p className="bill-disclaimer">*Cost includes basic setup. Final costs are based on detailed specifications.</p>
                  </div>

                  <div className="form-group">
                    <label>Your Name</label>
                    <input 
                      type="text" 
                      placeholder="Jane Doe"
                      required 
                      value={selections.name} 
                      onChange={e => handleSelect('name', e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      placeholder="jane@company.com"
                      required 
                      value={selections.email} 
                      onChange={e => handleSelect('email', e.target.value)} 
                    />
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Stepper Navigation Row */}
            <div className="estimator-actions-row">
              {step > 1 ? (
                <button type="button" className="btn btn-secondary estimator-back-btn" onClick={() => setStep(step - 1)}>
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
              ) : <div />}

              {step < 4 ? (
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={(step === 1 && !selections.projectType) || (step === 3 && !selections.timeline)}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="btn btn-primary quote-submit-btn" 
                  disabled={loading || !selections.name || !selections.email}
                >
                  {loading ? 'Submitting...' : (
                    <>
                      <span>Submit Proposal Request</span>
                      <Send size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
