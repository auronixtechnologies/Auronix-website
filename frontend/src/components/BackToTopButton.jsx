import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ArrowUp } from 'lucide-react';

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    // Show button when scrolled past 300px
    const scrolled = window.scrollY;
    setIsVisible(scrolled > 300);

    // Calculate scroll progress percentage
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;
    setScrollProgress(progress);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) {
    return null;
  }

  // Circular progress math (r=20, circumference=125.6)
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <StyledWrapper onClick={scrollToTop} aria-label="Back to Top">
      <svg className="progress-ring" width="56" height="56">
        <circle
          className="progress-ring-bg"
          cx="28"
          cy="28"
          r={radius}
          strokeWidth="3"
        />
        <circle
          className="progress-ring-indicator"
          cx="28"
          cy="28"
          r={radius}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="arrow-container">
        <ArrowUp className="arrow-icon" size={18} />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.button`
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 1000;
  width: 56px;
  height: 56px;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--card-shadow);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 0;

  .progress-ring {
    position: absolute;
    top: 0;
    left: 0;
    transform: rotate(-90deg);
  }

  .progress-ring-bg {
    fill: transparent;
    stroke: var(--border-color);
  }

  .progress-ring-indicator {
    fill: transparent;
    stroke: var(--primary);
    stroke-linecap: round;
    transition: stroke-dashoffset 0.1s ease-out;
  }

  .arrow-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  .arrow-icon {
    color: var(--text-primary);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  &:hover {
    border-color: var(--primary);
    box-shadow: 0 8px 24px var(--accent-glow);
    transform: translateY(-4px);
  }

  &:hover .arrow-icon {
    animation: launchArrow 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    color: var(--primary);
  }

  @keyframes launchArrow {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    49% {
      transform: translateY(-30px);
      opacity: 0;
    }
    50% {
      transform: translateY(30px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;

    .progress-ring {
      width: 48px;
      height: 48px;
    }
    
    /* Adjust radius for smaller width */
    .progress-ring-bg,
    .progress-ring-indicator {
      cx: 24;
      cy: 24;
      r: 16;
    }
  }
`;

export default BackToTopButton;
