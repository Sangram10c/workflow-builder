// FILE: frontend/src/pages/CanvasPage.js
// UPDATED - Multiple config cards + Multiple connections allowed

import React, { useState, useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ComponentSidebar from '../components/ComponentSidebar';
import ConfigCard from '../components/ConfigCard';
import ChatModal from '../components/ChatModal';
import CustomNode from '../components/CustomNode';

const CanvasPage = ({ stack, onUpdateStack, onBack }) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(stack.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(stack.edges || []);
  const [openConfigCards, setOpenConfigCards] = useState([]); // Array of open cards
  const [showChat, setShowChat] = useState(false);
  const [nextZIndex, setNextZIndex] = useState(1000);

  const nodeTypes = useMemo(() => ({
    userQuery: CustomNode,
    llmEngine: CustomNode,
    knowledgeBase: CustomNode,
    webSearch: CustomNode,
    output: CustomNode,
  }), []);

  // Allow multiple connections from one node
  const onConnect = useCallback((params) => {
    const newEdges = addEdge({
      ...params,
      animated: true,
      style: { stroke: '#4CAF50', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#4CAF50',
      },
    }, edges);
    setEdges(newEdges);
    onUpdateStack(stack.id, nodes, newEdges);
  }, [edges, nodes, stack.id, onUpdateStack, setEdges]);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');

    if (!type) return;

    const position = {
      x: event.clientX - reactFlowBounds.left - 80,
      y: event.clientY - reactFlowBounds.top - 30,
    };

    const labels = {
      userQuery: 'User Query',
      llmEngine: 'LLM (OpenAI)',
      knowledgeBase: 'Knowledge Base',
      webSearch: 'Web Search',
      output: 'Output'
    };

    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { 
        label: labels[type] || type,
        config: {}
      },
    };

    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    onUpdateStack(stack.id, newNodes, edges);
  }, [nodes, edges, stack.id, onUpdateStack, setNodes]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback((event, node) => {
    // Check if card is already open for this node
    const existingCard = openConfigCards.find(card => card.nodeId === node.id);
    
    if (!existingCard) {
      // Add new card to the array
      setOpenConfigCards(prev => [
        ...prev,
        { 
          nodeId: node.id, 
          node: node,
          zIndex: nextZIndex 
        }
      ]);
      setNextZIndex(prev => prev + 1);
    } else {
      // Bring existing card to front
      setOpenConfigCards(prev => 
        prev.map(card => 
          card.nodeId === node.id 
            ? { ...card, zIndex: nextZIndex }
            : card
        )
      );
      setNextZIndex(prev => prev + 1);
    }
  }, [openConfigCards, nextZIndex]);

  const closeConfigCard = (nodeId) => {
    setOpenConfigCards(prev => prev.filter(card => card.nodeId !== nodeId));
  };

  const updateNodeConfig = (nodeId, config) => {
    const updatedNodes = nodes.map(node =>
      node.id === nodeId ? { ...node, data: { ...node.data, config } } : node
    );
    setNodes(updatedNodes);
    onUpdateStack(stack.id, updatedNodes, edges);

    // Update the node in open cards
    setOpenConfigCards(prev =>
      prev.map(card =>
        card.nodeId === nodeId
          ? { ...card, node: { ...card.node, data: { ...card.node.data, config } } }
          : card
      )
    );
  };

  const handleBuildStack = () => {
    if (nodes.length === 0) {
      alert('Please add components first');
      return;
    }
    setShowChat(true);
  };

  const handleSave = () => {
    onUpdateStack(stack.id, nodes, edges);
    alert('Stack saved successfully!');
  };

  return (
    <div className="canvas-page-dark">
      <header className="canvas-header-dark">
        <div className="header-left-dark">
          <div className="logo-icon-dark">⚡</div>
          <span className="logo-text-dark">GenAI Stack</span>
        </div>
        <div className="header-center-dark">
          <span className="stack-name-dark">{stack.name}</span>
          <button className="edit-icon-dark">✏️</button>
        </div>
        <div className="header-right-dark">
          <button className="btn-save-dark" onClick={handleSave}>💾 Save</button>
          <div className="user-avatar-dark">U</div>
        </div>
      </header>

      <div className="canvas-container-dark">
        <ComponentSidebar />

        <div className="canvas-main-dark" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="#444" gap={16} />
            <Controls />
          </ReactFlow>

          {/* Render ALL open config cards */}
          <div className="config-cards-container">
            {openConfigCards.map(card => (
              <ConfigCard
                key={card.nodeId}
                node={card.node}
                onClose={() => closeConfigCard(card.nodeId)}
                onUpdate={(config) => updateNodeConfig(card.nodeId, config)}
                zIndex={card.zIndex}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="canvas-footer-dark">
        <div className="footer-info">
          <span>{nodes.length} Components</span>
          <span>{edges.length} Connections</span>
          <span>{openConfigCards.length} Config Cards Open</span>
        </div>
        <button className="btn-build-stack-dark" onClick={handleBuildStack}>
          Build Stack
        </button>
      </div>

      {showChat && (
        <ChatModal
          stack={stack}
          nodes={nodes}
          edges={edges}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default CanvasPage;