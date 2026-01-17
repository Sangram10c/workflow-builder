
import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import StackListPage from './pages/StackListPage';
import CanvasPage from './pages/CanvasPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [stacks, setStacks] = useState([]);
  const [selectedStack, setSelectedStack] = useState(null);

  const handleCreateStack = (stackData) => {
    const newStack = {
      id: Date.now(),
      name: stackData.name,
      description: stackData.description,
      nodes: [],
      edges: [],
      createdAt: new Date()
    };
    setStacks([...stacks, newStack]);
    setCurrentPage('stacks');
  };

  const handleEditStack = (stack) => {
    setSelectedStack(stack);
    setCurrentPage('canvas');
  };

  const handleUpdateStack = (stackId, nodes, edges) => {
    setStacks(stacks.map(stack => 
      stack.id === stackId 
        ? { ...stack, nodes, edges }
        : stack
    ));
  };

  const handleBackToStacks = () => {
    setCurrentPage('stacks');
    setSelectedStack(null);
  };

  return (
    <div className="app">
      {currentPage === 'home' && (
        <HomePage 
          onCreateStack={() => setCurrentPage('stacks')}
        />
      )}
      
      {currentPage === 'stacks' && (
        <StackListPage 
          stacks={stacks}
          onCreateStack={handleCreateStack}
          onEditStack={handleEditStack}
        />
      )}
      
      {currentPage === 'canvas' && selectedStack && (
        <CanvasPage 
          stack={selectedStack}
          onUpdateStack={handleUpdateStack}
          onBack={handleBackToStacks}
        />
      )}
    </div>
  );
}

export default App;