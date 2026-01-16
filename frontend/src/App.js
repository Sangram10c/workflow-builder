import React, { useState } from 'react';
import WorkflowCanvas from './components/WorkflowCanvas';
import ComponentPanel from './components/ComponentPanel';
import ConfigPanel from './components/ConfigPanel';
import ChatModal from './components/ChatModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [workflowNodes, setWorkflowNodes] = useState([]);
  const [workflowEdges, setWorkflowEdges] = useState([]);

  const validateWorkflow = () => {
    if (workflowNodes.length === 0) {
      toast.error('Add components to build a workflow');
      return false;
    }

    const hasUserQuery = workflowNodes.some(n => n.type === 'userQuery');
    const hasLLM = workflowNodes.some(n => n.type === 'llmEngine');
    const hasOutput = workflowNodes.some(n => n.type === 'output');

    if (!hasUserQuery || !hasLLM || !hasOutput) {
      toast.error('Workflow must have User Query, LLM Engine, and Output components');
      return false;
    }

    return true;
  };

  const handleBuildStack = () => {
    if (validateWorkflow()) {
      toast.success('Workflow validated successfully!');
    }
  };

  const handleChatWithStack = () => {
    if (validateWorkflow()) {
      setShowChat(true);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Workflow Builder</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleBuildStack}>
            Build Stack
          </button>
          <button className="btn-secondary" onClick={handleChatWithStack}>
            Chat with Stack
          </button>
        </div>
      </header>

      <div className="app-content">
        <ComponentPanel />
        
        <WorkflowCanvas 
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          workflowNodes={workflowNodes}
          setWorkflowNodes={setWorkflowNodes}
          workflowEdges={workflowEdges}
          setWorkflowEdges={setWorkflowEdges}
        />
        
        <ConfigPanel 
          selectedNode={selectedNode}
          workflowNodes={workflowNodes}
          setWorkflowNodes={setWorkflowNodes}
        />
      </div>

      {showChat && (
        <ChatModal 
          onClose={() => setShowChat(false)}
          workflowNodes={workflowNodes}
          workflowEdges={workflowEdges}
        />
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;