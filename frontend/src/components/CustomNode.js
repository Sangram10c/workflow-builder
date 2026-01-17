// FILE: frontend/src/components/CustomNode.js

import React from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, type }) => {
  const icons = {
    userQuery: '💬',
    llmEngine: '🤖',
    knowledgeBase: '📚',
    webSearch: '🔍',
    output: '📤'
  };

  return (
    <div className="custom-node">
      {type !== 'userQuery' && (
        <Handle type="target" position={Position.Top} />
      )}
      
      <div className="node-header">
        <span className="node-icon">{icons[type]}</span>
        <span className="node-label">{data.label}</span>
      </div>
      
      {type !== 'output' && (
        <Handle type="source" position={Position.Bottom} />
      )}
    </div>
  );
};

export default CustomNode;