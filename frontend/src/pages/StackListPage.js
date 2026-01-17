// FILE: frontend/src/pages/StackListPage.js
// Images 2-4 - Stack list with modal

import React, { useState } from 'react';
import CreateStackModal from '../components/CreateStackModal';

const StackListPage = ({ stacks, onCreateStack, onEditStack, onBack }) => {
  const [showModal, setShowModal] = useState(false);

  const handleCreate = (stackData) => {
    onCreateStack(stackData);
    setShowModal(false);
  };

  return (
    <div className="stack-list-page">
      <header className="page-header">
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

      <div className="page-content">
        <div className="content-header">
          <h2>My Stacks</h2>
          <button className="btn-new-stack" onClick={() => setShowModal(true)}>
            + New Stack
          </button>
        </div>

        {stacks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <h3>Create New Stack</h3>
              <p>Start building your generative AI apps with<br />the essential tools and frameworks</p>
              <button className="btn-create" onClick={() => setShowModal(true)}>
                + New Stack
              </button>
            </div>
          </div>
        ) : (
          <div className="stacks-grid">
            {stacks.map(stack => (
              <div key={stack.id} className="stack-card">
                <h3>{stack.name}</h3>
                <p>{stack.description}</p>
                <button className="btn-edit-stack" onClick={() => onEditStack(stack)}>
                  Edit Stack →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateStackModal 
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
};

export default StackListPage;