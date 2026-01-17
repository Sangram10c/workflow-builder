// FILE: frontend/src/components/ConfigCard.js
// DRAGGABLE version - Can move cards with mouse

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ConfigCard = ({ node, onClose, onUpdate, zIndex }) => {
  const [config, setConfig] = useState(node.data.config || {});
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [position, setPosition] = useState({
    x: node.position.x + 200,
    y: node.position.y - 20
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  useEffect(() => {
    setConfig(node.data.config || {});
  }, [node]);

  const handleChange = (key, value) => {
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
      handleChange('documentId', res.data.document_id);
      handleChange('fileName', file.name);
      alert('File uploaded successfully!');
      setFile(null);
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  // Dragging handlers
  const handleMouseDown = (e) => {
    // Only drag from header
    if (e.target.closest('.config-card-header') && !e.target.closest('.config-card-close')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const cardStyle = {
    position: 'absolute',
    top: `${position.y}px`,
    left: `${position.x}px`,
    zIndex: zIndex,
    cursor: isDragging ? 'grabbing' : 'default'
  };

  return (
    <div 
      ref={cardRef}
      className="config-card" 
      style={cardStyle}
      onMouseDown={handleMouseDown}
    >
      <div className="config-card-header" style={{ cursor: 'grab' }}>
        <div className="config-icon-circle">⚙️</div>
        <h3>{node.data.label}</h3>
        <button className="config-card-close" onClick={onClose}>✕</button>
      </div>

      <div className="config-card-body">
        {node.type === 'userQuery' && (
          <>
            <label>User Query</label>
            <textarea
              placeholder="Enter point for querys"
              value={config.query || ''}
              onChange={(e) => handleChange('query', e.target.value)}
              rows="2"
            />
            <button className="config-btn" disabled>Query</button>
          </>
        )}

        {node.type === 'knowledgeBase' && (
          <>
            <label>Let LLM search this in your file</label>
            <input
              type="text"
              placeholder="File for Knowledge Base"
              value={config.searchQuery || ''}
              onChange={(e) => handleChange('searchQuery', e.target.value)}
            />
            
            <label>File for Knowledge Base</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="file-input-custom"
            />
            
            {config.fileName && (
              <div className="uploaded-file-info">
                <span>✓ {config.fileName}</span>
              </div>
            )}

            <button 
              className="config-btn-upload" 
              onClick={handleFileUpload}
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>

            <label>Chunk Size</label>
            <input
              type="number"
              value={config.chunkSize || 500}
              onChange={(e) => handleChange('chunkSize', e.target.value)}
            />

            <label>API Key</label>
            <input
              type="password"
              placeholder="******************"
              value={config.apiKey || ''}
              onChange={(e) => handleChange('apiKey', e.target.value)}
            />

            <label>Embedding Model</label>
            <select
              value={config.embeddingModel || 'text-embedding-ada-002'}
              onChange={(e) => handleChange('embeddingModel', e.target.value)}
            >
              <option value="text-embedding-3-small">text-embedding-3-small</option>
              <option value="text-embedding-3-large">text-embedding-3-large</option>
              <option value="text-embedding-ada-002">text-embedding-ada-002</option>
            </select>

            <button className="config-btn-add">+ Context</button>
            <button className="config-btn">Query</button>
          </>
        )}

        {node.type === 'llmEngine' && (
          <>
            <label>Run a query with OpenAI LLM</label>
            
            <label>Model</label>
            <select
              value={config.model || 'GPT-4o-Mini'}
              onChange={(e) => handleChange('model', e.target.value)}
            >
              <option value="GPT-4o-Mini">GPT-4o-Mini</option>
              <option value="GPT-4o">GPT-4o</option>
              <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
              <option value="gpt-4">gpt-4</option>
            </select>

            <label>API Key</label>
            <input
              type="password"
              placeholder="******************"
              value={config.apiKey || ''}
              onChange={(e) => handleChange('apiKey', e.target.value)}
            />

            <label>Prompt</label>
            <textarea
              placeholder="You are a helpful PDF assistant. Use web search if the PDF lacks content. CONTEXT: {{context}} USER QUERY: {{user_query}}"
              value={config.prompt || ''}
              onChange={(e) => handleChange('prompt', e.target.value)}
              rows="4"
            />

            <label>Temperature</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={config.temperature || 0.75}
              onChange={(e) => handleChange('temperature', e.target.value)}
            />

            <div className="toggle-row">
              <label>WebSearch Tool</label>
              <label className="switch-dark">
                <input
                  type="checkbox"
                  checked={config.webSearch || false}
                  onChange={(e) => handleChange('webSearch', e.target.checked)}
                />
                <span className="slider-dark"></span>
              </label>
            </div>

            <label>SERP API</label>
            <input
              type="password"
              placeholder="******************"
              value={config.serpApi || ''}
              onChange={(e) => handleChange('serpApi', e.target.value)}
            />

            <button className="config-btn-add">+ Context</button>
            <button className="config-btn-primary">Output →</button>
          </>
        )}

        {node.type === 'webSearch' && (
          <>
            <label>Search Query</label>
            <input
              type="text"
              placeholder="Enter search query"
              value={config.searchQuery || ''}
              onChange={(e) => handleChange('searchQuery', e.target.value)}
            />

            <label>SERP API Key</label>
            <input
              type="password"
              placeholder="******************"
              value={config.serpApi || ''}
              onChange={(e) => handleChange('serpApi', e.target.value)}
            />

            <button className="config-btn">Query</button>
          </>
        )}

        {node.type === 'output' && (
          <>
            <label>Output of the result shown as text</label>
            <textarea
              placeholder="Output Text"
              value={config.outputText || ''}
              disabled
              rows="2"
            />
            <label>Output Test</label>
            <div className="output-info">
              Output will be generated based on query
            </div>
            <button className="config-btn-primary">Output</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfigCard;