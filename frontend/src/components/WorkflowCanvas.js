// import React, { useCallback, useRef } from 'react';
// import ReactFlow, {
//   addEdge,
//   Background,
//   Controls,
//   MiniMap,
//   useNodesState,
//   useEdgesState,
// } from 'reactflow';
// import 'reactflow/dist/style.css';
// import CustomNode from './CustomNode';

// const nodeTypes = {
//   userQuery: CustomNode,
//   knowledgeBase: CustomNode,
//   llmEngine: CustomNode,
//   output: CustomNode,
// };

// const WorkflowCanvas = ({ 
//   selectedNode, 
//   setSelectedNode, 
//   workflowNodes, 
//   setWorkflowNodes, 
//   workflowEdges, 
//   setWorkflowEdges 
// }) => {
//   const reactFlowWrapper = useRef(null);
//   const [nodes, setNodes, onNodesChange] = useNodesState(workflowNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState(workflowEdges);

//   const onConnect = useCallback((params) => {
//     const newEdges = addEdge(params, edges);
//     setEdges(newEdges);
//     setWorkflowEdges(newEdges);
//   }, [edges, setEdges, setWorkflowEdges]);

//   const onDrop = useCallback((event) => {
//     event.preventDefault();
//     const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
//     const type = event.dataTransfer.getData('application/reactflow');

//     if (!type) return;

//     const position = {
//       x: event.clientX - reactFlowBounds.left - 75,
//       y: event.clientY - reactFlowBounds.top - 40,
//     };

//     const newNode = {
//       id: `${type}-${Date.now()}`,
//       type,
//       position,
//       data: { 
//         label: type.replace(/([A-Z])/g, ' $1').trim(),
//         config: {}
//       },
//     };

//     const newNodes = [...nodes, newNode];
//     setNodes(newNodes);
//     setWorkflowNodes(newNodes);
//   }, [nodes, setNodes, setWorkflowNodes]);

//   const onDragOver = useCallback((event) => {
//     event.preventDefault();
//     event.dataTransfer.dropEffect = 'move';
//   }, []);

//   const onNodeClick = useCallback((event, node) => {
//     setSelectedNode(node);
//   }, [setSelectedNode]);

//   React.useEffect(() => {
//     setNodes(workflowNodes);
//   }, [workflowNodes, setNodes]);

//   React.useEffect(() => {
//     setEdges(workflowEdges);
//   }, [workflowEdges, setEdges]);

//   return (
//     <div className="workflow-canvas" ref={reactFlowWrapper}>
//       <ReactFlow
//         nodes={nodes}
//         edges={edges}
//         onNodesChange={onNodesChange}
//         onEdgesChange={onEdgesChange}
//         onConnect={onConnect}
//         onDrop={onDrop}
//         onDragOver={onDragOver}
//         onNodeClick={onNodeClick}
//         nodeTypes={nodeTypes}
//         fitView
//       >
//         <Background />
//         <Controls />
//         <MiniMap />
//       </ReactFlow>
//     </div>
//   );
// };

// export default WorkflowCanvas;


// FILE: frontend/src/components/WorkflowCanvas.js
import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';

const WorkflowCanvas = ({ 
  selectedNode, 
  setSelectedNode, 
  workflowNodes, 
  setWorkflowNodes, 
  workflowEdges, 
  setWorkflowEdges 
}) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(workflowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflowEdges);

  // Memoize nodeTypes to prevent React Flow warning
  const nodeTypes = useMemo(() => ({
    userQuery: CustomNode,
    knowledgeBase: CustomNode,
    llmEngine: CustomNode,
    output: CustomNode,
  }), []);

  const onConnect = useCallback((params) => {
    const newEdges = addEdge(params, edges);
    setEdges(newEdges);
    setWorkflowEdges(newEdges);
  }, [edges, setEdges, setWorkflowEdges]);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');

    if (!type) return;

    const position = {
      x: event.clientX - reactFlowBounds.left - 75,
      y: event.clientY - reactFlowBounds.top - 40,
    };

    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { 
        label: type.replace(/([A-Z])/g, ' $1').trim(),
        config: {}
      },
    };

    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    setWorkflowNodes(newNodes);
  }, [nodes, setNodes, setWorkflowNodes]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  useEffect(() => {
    setNodes(workflowNodes);
  }, [workflowNodes, setNodes]);

  useEffect(() => {
    setEdges(workflowEdges);
  }, [workflowEdges, setEdges]);

  return (
    <div className="workflow-canvas" ref={reactFlowWrapper}>
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
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;