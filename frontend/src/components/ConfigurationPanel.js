// FILE: frontend/src/components/ConfigurationPanel.js
// Images 6-7 - Right side configuration panel

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConfigurationPanel = ({ node, onClose, onUpdate }) => {
  const [config, setConfig] = useState(node.data.config || {});
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setConfig(node.data.config || {});
  }, [node]);

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdate(newConfig);
  };

  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);

    try {
      const res = await axios.post('http://localhost:8000/api/upload', formData);
      handleConfigChange('documentId', res.data.document_id);
      handleConfigChange('fileName', file.name);
      alert('File uploaded successfully!');
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="config-panel-overlay">
      <div className="config-panel">
        <div className="config-header">
          <h3>{node.data.label}</h3>
          <button className="config-close" onClick={onClose}>
            <span className="gear-icon">⚙️</span>
          </button>
        </div>

        <div className="config-body">
          {node.type === 'userQuery' && (
            <div className="config-section">
              <label>User Query</label>
              <textarea
                placeholder="Enter point for query..."
                value={config.query || ''}
                onChange={(e) => handleConfigChange('query', e.target.value)}
                rows="3"
              />
              <button className="btn-query" disabled>Query</button>
            </div>
          )}

          {node.type === 'llmEngine' && (
            <div className="config-section">
              <label>Embedding Model</label>
              <select
                value={config.embeddingModel || 'text-embedding-3-large'}
                onChange={(e) => handleConfigChange('embeddingModel', e.target.value)}
              >
                <option value="text-embedding-3-large">text-embedding-3-large</option>
                <option value="text-embedding-ada-002">text-embedding-ada-002</option>
              </select>

              <label>File for Knowledge Base</label>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <button className="btn-upload-file" onClick={handleFileUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>

              <label>Prompt</label>
              <textarea
                placeholder="You are a helpful PDF assistant..."
                value={config.prompt || ''}
                onChange={(e) => handleConfigChange('prompt', e.target.value)}
                rows="3"
              />

              <label>Temperature</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature || 0.75}
                onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
              />

              <div className="toggle-section">
                <label>WebSearch Tool</label>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={config.webSearch || false}
                    onChange={(e) => handleConfigChange('webSearch', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <label>SERP API</label>
              <input
                type="password"
                placeholder="Enter API key..."
                value={config.serpApi || ''}
                onChange={(e) => handleConfigChange('serpApi', e.target.value)}
              />

              <button className="btn-context">+ Context</button>
              <button className="btn-output">Output →</button>
            </div>
          )}

          {node.type === 'knowledgeBase' && (
            <div className="config-section">
              <label>Let LLM search this in your file</label>
              <textarea
                placeholder="File for Knowledge Base..."
                value={config.searchQuery || ''}
                onChange={(e) => handleConfigChange('searchQuery', e.target.value)}
                rows="2"
              />

              <label>Upload File</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
              />
              {config.fileName && (
                <p className="file-name">Uploaded: {config.fileName}</p>
              )}
              <button className="btn-upload-file" onClick={handleFileUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>

              <label>Chunk Size</label>
              <input
                type="number"
                value={config.chunkSize || 500}
                onChange={(e) => handleConfigChange('chunkSize', parseInt(e.target.value))}
              />

              <label>API Key</label>
              <input
                type="password"
                placeholder="Enter API key..."
                value={config.apiKey || ''}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
              />

              <label>Embedding Model</label>
              <select
                value={config.embeddingModel || 'text-embedding-ada-002'}
                onChange={(e) => handleConfigChange('embeddingModel', e.target.value)}
              >
                <option value="text-embedding-ada-002">GPT-4o-Mini</option>
                <option value="text-embedding-3-large">GPT-4o</option>
              </select>

              <button className="btn-context">+ Context</button>
              <button className="btn-query">Query</button>
            </div>
          )}

          {node.type === 'webSearch' && (
            <div className="config-section">
              <label>Search Query</label>
              <input
                type="text"
                placeholder="Enter search query..."
                value={config.searchQuery || ''}
                onChange={(e) => handleConfigChange('searchQuery', e.target.value)}
              />

              <label>Prompt</label>
              <textarea
                placeholder="Search prompt..."
                value={config.prompt || ''}
                onChange={(e) => handleConfigChange('prompt', e.target.value)}
                rows="3"
              />

              <button className="btn-query">Query</button>
            </div>
          )}

          {node.type === 'output' && (
            <div className="config-section">
              <label>Output Text</label>
              <textarea
                placeholder="Output of the result shown as text"
                value={config.outputText || ''}
                onChange={(e) => handleConfigChange('outputText', e.target.value)}
                rows="3"
                disabled
              />

              <label>Output Test</label>
              <p className="output-test">Output will be generated based on query</p>

              <button className="btn-output">Output</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;