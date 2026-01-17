// FILE: frontend/src/components/ChatModal.js
// Clean minimal design matching Images 2-3

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatModal = ({ stack, nodes, edges, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      role: 'user', 
      content: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/api/execute', {
        query: input,
        nodes: nodes,
        edges: edges
      });

      const assistantMessage = { 
        role: 'assistant', 
        content: res.data.response
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = { 
        role: 'assistant', 
        content: 'Error: ' + (err.response?.data?.detail || 'Failed to process request')
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-modal-overlay-clean" onClick={onClose}>
      <div className="chat-modal-clean" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header-clean">
          <div className="chat-logo-clean">⚡</div>
          <span className="chat-title-clean">GenAI Stack Chat</span>
          <button className="chat-close-clean" onClick={onClose}>✕</button>
        </div>

        <div className="chat-messages-clean">
          {messages.length === 0 && !loading && (
            <div className="chat-empty-clean">
              <div className="empty-logo-clean">⚡</div>
              <h3>GenAI Stack Chat</h3>
              <p>Start a conversation to test your stack</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg-clean ${msg.role}`}>
              <div className="msg-avatar-clean">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="msg-bubble-clean">
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-msg-clean assistant">
              <div className="msg-avatar-clean">🤖</div>
              <div className="msg-bubble-clean">
                <div className="typing-dots-clean">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-clean">
          <input
            type="text"
            placeholder="Send a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button 
            className="send-btn-clean" 
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;