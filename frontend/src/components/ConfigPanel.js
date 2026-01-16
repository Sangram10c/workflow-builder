import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConfigPanel = ({ selectedNode, workflowNodes, setWorkflowNodes }) => {
  const [config, setConfig] = useState({});
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (selectedNode) {
      setConfig(selectedNode.data.config || {});
    }
  }, [selectedNode]);

  const updateNodeConfig = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);

    const updatedNodes = workflowNodes.map(node =>
      node.id === selectedNode.id
        ? { ...node, data: { ...node.data, config: newConfig } }
        : node
    );
    setWorkflowNodes(updatedNodes);
  };

  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);

    try {
      const res = await axios.post('http://localhost:8000/api/upload', formData);
      updateNodeConfig('documentId', res.data.document_id);
      alert('Document uploaded successfully!');
      setFile(null);
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  if (!selectedNode) {
    return (
      <div className="config-panel">
        <p className="no-selection">Select a component to configure</p>
      </div>
    );
  }

  return (
    <div className="config-panel">
      <h3>Configure: {selectedNode.data.label}</h3>

      {selectedNode.type === 'knowledgeBase' && (
        <div className="config-section">
          <label>Upload Document (PDF)</label>
          <input 
            type="file" 
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {config.documentId && (
            <p className="upload-status">Document ID: {config.documentId}</p>
          )}
          <button 
            onClick={handleFileUpload} 
            className="btn-upload"
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}

      {selectedNode.type === 'llmEngine' && (
        <div className="config-section">
          <label>LLM Model</label>
          <select 
            value={config.model || 'gpt-3.5-turbo'}
            onChange={(e) => updateNodeConfig('model', e.target.value)}
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gemini-pro">Gemini Pro</option>
          </select>

          <label>Custom Prompt (Optional)</label>
          <textarea
            value={config.prompt || ''}
            onChange={(e) => updateNodeConfig('prompt', e.target.value)}
            placeholder="Enter custom system prompt..."
            rows="4"
          />

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={config.useWebSearch || false}
              onChange={(e) => updateNodeConfig('useWebSearch', e.target.checked)}
            />
            <span>Enable Web Search</span>
          </label>
        </div>
      )}

      {selectedNode.type === 'userQuery' && (
        <div className="config-section">
          <p className="info-text">This component accepts user queries as the entry point of your workflow.</p>
        </div>
      )}

      {selectedNode.type === 'output' && (
        <div className="config-section">
          <p className="info-text">This component displays the final response to the user.</p>
        </div>
      )}
    </div>
  );
};

export default ConfigPanel;