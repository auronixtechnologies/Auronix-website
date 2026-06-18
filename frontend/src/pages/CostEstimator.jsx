import { useState } from 'react';
import { motion } from 'framer-motion';
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
    { id: 'web', label: 'Web Application', basePrice: 2500 },
    { id: 'ml', label: 'AI/ML Model', basePrice: 5000 },
    { id: 'llm', label: 'LLM Chatbot/RAG', basePrice: 4500 },
    { id: 'ecommerce', label: 'E-commerce', basePrice: 3500 },
  ];

  const featuresList = [
    { id: 'auth', label: 'User Authentication', price: 500 },
    { id: 'payment', label: 'Payment Integration', price: 1000 },
    { id: 'admin', label: 'Admin Dashboard', price: 1500 },
    { id: 'design', label: 'Custom UI/UX Design', price: 2000 },
    { id: 'api', label: 'External API Integration', price: 1000 },
  ];

  const timelines = [
    { id: 'relaxed', label: 'Relaxed (3+ months)', multiplier: 1 },
    { id: 'standard', label: 'Standard (1-3 months)', multiplier: 1.2 },
    { id: 'rush', label: 'Rush (Under 1 month)', multiplier: 1.5 },
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
    if (!selections.projectType || !selections.timeline) return 0;
    
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

  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Project Cost Estimator</h1>
        <p className="intro">Get a rough estimate for your project instantly.</p>
      </motion.div>

      <div className="contact-form" style={{ maxWidth: '800px' }}>
        {success ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <h2 style={{ color: 'var(--accent-secondary)' }}>Estimate Sent!</h2>
            <p>Thank you, {selections.name}. We have received your request and will follow up with a detailed proposal soon.</p>
            <div style={{ fontSize: '2rem', margin: '20px 0', fontWeight: 'bold' }}>
              Estimated: ₹{estimate.toLocaleString()}
            </div>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>Calculate Another</button>
          </motion.div>
        ) : (
          <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1); }}>
            
            {/* Step 1: Project Type */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3>1. What type of project are you building?</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
                  {projectTypes.map(pt => (
                    <div 
                      key={pt.id} 
                      onClick={() => handleSelect('projectType', pt.id)}
                      style={{
                        padding: '20px',
                        border: `2px solid ${selections.projectType === pt.id ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: selections.projectType === pt.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <strong style={{ fontSize: '1.1rem' }}>{pt.label}</strong>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Features */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3>2. Select the features you need</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                  {featuresList.map(f => (
                    <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid var(--glass-border)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selections.features.includes(f.id)}
                        onChange={() => toggleFeature(f.id)}
                        style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }}
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Timeline */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3>3. What is your expected timeline?</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                  {timelines.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => handleSelect('timeline', t.id)}
                      style={{
                        padding: '16px',
                        border: `2px solid ${selections.timeline === t.id ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: selections.timeline === t.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                      }}
                    >
                      <strong>{t.label}</strong>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Contact Info & Result */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3>4. Your Estimate</h3>
                <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '24px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                  <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Estimated Cost Range</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                    ₹{estimate.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    *This is a rough estimate. Final cost depends on specific requirements.
                  </div>
                </div>

                <div className="form-group">
                  <label>Name</label>
                  <input type="text" required value={selections.name} onChange={e => handleSelect('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" required value={selections.email} onChange={e => handleSelect('email', e.target.value)} />
                </div>
              </motion.div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
              {step > 1 ? (
                <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--text-secondary)' }} onClick={() => setStep(step - 1)}>
                  Back
                </button>
              ) : <div></div>}

              {step < 4 ? (
                <button type="submit" className="btn btn-primary" disabled={step === 1 && !selections.projectType}>
                  Next
                </button>
              ) : (
                <button type="submit" className="btn btn-primary" disabled={loading || !selections.name || !selections.email}>
                  {loading ? 'Sending...' : 'Send Detailed Quote'}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
