import React from 'react';

const ComponentPanel = () => {
  const components = [
    {
      type: 'userQuery',
      label: 'User Query',
      icon: '💬',
      description: 'Entry point for user input'
    },
    {
      type: 'knowledgeBase',
      label: 'Knowledge Base',
      icon: '📚',
      description: 'Upload and process documents'
    },
    {
      type: 'llmEngine',
      label: 'LLM Engine',
      icon: '🤖',
      description: 'AI processing with GPT/Gemini'
    },
    {
      type: 'output',
      label: 'Output',
      icon: '📤',
      description: 'Display final response'
    }
  ];

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="component-panel">
      <h3>Components</h3>
      <div className="component-list">
        {components.map((comp) => (
          <div
            key={comp.type}
            className="component-item"
            draggable
            onDragStart={(e) => onDragStart(e, comp.type)}
          >
            <span className="component-icon">{comp.icon}</span>
            <div className="component-info">
              <h4>{comp.label}</h4>
              <p>{comp.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentPanel;