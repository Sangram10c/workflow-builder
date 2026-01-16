import React from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, id, type }) => {
  const getNodeStyle = () => {
    const styles = {
      userQuery: { bg: '#4F46E5', icon: '💬' },
      knowledgeBase: { bg: '#059669', icon: '📚' },
      llmEngine: { bg: '#DC2626', icon: '🤖' },
      output: { bg: '#7C3AED', icon: '📤' }
    };
    return styles[type] || styles.userQuery;
  };

  const style = getNodeStyle();

  return (
    <div className="custom-node" style={{ borderColor: style.bg }}>
      {type !== 'userQuery' && (
        <Handle type="target" position={Position.Top} />
      )}
      
      <div className="node-header" style={{ background: style.bg }}>
        <span className="node-icon">{style.icon}</span>
        <span className="node-label">{data.label}</span>
      </div>
      
      {type !== 'output' && (
        <Handle type="source" position={Position.Bottom} />
      )}
    </div>
  );
};

export default CustomNode;