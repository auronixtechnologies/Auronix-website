import React from 'react';
import './Loader.css';

const Loader = () => {
  return (
    <div className="loader-wrapper fade-in">
      <div className="loader-container">
        <div className="loader-dot" />
        <div className="loader-dot delay-1" />
        <div className="loader-dot delay-2" />
      </div>
    </div>
  );
}

export default Loader;
