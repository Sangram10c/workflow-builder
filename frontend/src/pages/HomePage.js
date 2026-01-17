// FILE: frontend/src/pages/HomePage.js
// Image 1 - Initial home page with "Create New Stack"

import React from 'react';

const HomePage = ({ onCreateStack, stacks }) => {
  return (
    <div className="home-page">
      <header className="home-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">⚡</div>
            <h1>GenAI Stack</h1>
          </div>
          <div className="user-avatar">
            <span>U</span>
          </div>
        </div>
      </header>

      <div className="home-content">
        <div className="content-header">
          <h2 className='font-bold'>My Stacks</h2>
          <button className="btn-new-stack rounded-full" onClick={onCreateStack}>
            + New Stack
          </button>
        </div>

        <div className="empty-state" >
          <div className="empty-state-content">
            <h3>Create New Stack</h3>
            <p>Start building your generative AI apps with<br />the essential tools and frameworks</p>
            <button className="btn-create" onClick={onCreateStack}>
              + New Stack
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;