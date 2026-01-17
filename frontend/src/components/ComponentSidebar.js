// FILE: frontend/src/components/ComponentSidebar.js
// Image 5 - Left sidebar with components

import React from 'react';

const ComponentSidebar = () => {
  const components = [
    { id: 'userQuery', label: 'User Query', icon: '💬', description: 'Enter point for query' },
    { id: 'llmEngine', label: 'LLM (OpenAI)', icon: '🤖', description: 'Run a query with OpenAI LLM' },
    { id: 'knowledgeBase', label: 'Knowledge Base', icon: '📚', description: 'File for Knowledge Base' },
    { id: 'webSearch', label: 'Web Search', icon: '🔍', description: 'Search the web' },
    { id: 'output', label: 'Output', icon: '📤', description: 'Output of the result' }
  ];

  const onDragStart = (event, componentId) => {
    event.dataTransfer.setData('application/reactflow', componentId);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="component-sidebar">
      <div className="sidebar-header">
        <h3>Components</h3>
      </div>

      <div className="component-list">
        {components.map(comp => (
          <div
            key={comp.id}
            className="sidebar-component"
            draggable
            onDragStart={(e) => onDragStart(e, comp.id)}
          >
            <div className="component-icon-wrapper">
              <span className="component-icon">{comp.icon}</span>
            </div>
            <div className="component-details">
              <h4>{comp.label}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentSidebar;