import { useState, useEffect, useRef } from "react";
import { useFamilyTree } from "@/context/FamilyTreeContext";
import { buildFamilyTree } from "@/lib/treeUtils";
import { layoutFamilyTree } from "@/lib/treeLayout";
import { FamilyTreePerson, Person } from "@shared/schema";
import PersonCard from "./PersonCard";
import TreeConnector from "./TreeConnector";

interface FamilyTreeViewProps {
  onPersonClick: (person: Person) => void;
}

export default function FamilyTreeView({ onPersonClick }: FamilyTreeViewProps) {
  const { data } = useFamilyTree();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Build the tree from the flat data
  const treeRoots: FamilyTreePerson[] = buildFamilyTree(data);
  
  // Generate the layout for visualization
  const treeLayout = layoutFamilyTree(treeRoots);
  
  // Handle zoom in
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };
  
  // Handle zoom out
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };
  
  // Handle reset view
  const handleResetView = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };
  
  // Mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Also handle mouse leaving the container
  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  
  // Wheel event for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoomLevel(prev => Math.max(0.5, Math.min(prev + delta, 2)));
  };
  
  // Add event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('wheel', handleWheel as unknown as EventListener, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel as unknown as EventListener);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="family-tree-container relative w-full h-full"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 bg-white shadow-md rounded-md p-2 flex space-x-2">
        <button 
          className="text-accent hover:text-primary p-1" 
          title="Zoom in"
          onClick={handleZoomIn}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button 
          className="text-accent hover:text-primary p-1" 
          title="Zoom out"
          onClick={handleZoomOut}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button 
          className="text-accent hover:text-primary p-1" 
          title="Reset view"
          onClick={handleResetView}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {/* The actual tree visualization with zoom and pan */}
      <div 
        className="family-tree relative ml-8 mt-16" 
        style={{
          transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: 'top left',
          width: treeLayout.dimensions.width + 200,
          height: treeLayout.dimensions.height + 100
        }}
      >
        {/* Render all the connectors first so they appear behind person cards */}
        {treeLayout.connectors.map((connector, index) => (
          <TreeConnector key={index} connector={connector} />
        ))}
        
        {/* Render all the person nodes */}
        {treeLayout.nodes.map((node) => (
          <div 
            key={`person-${node.person.id}`}
            style={{
              position: 'absolute',
              left: `${node.x}px`,
              top: `${node.y}px`
            }}
          >
            <PersonCard 
              person={node.person} 
              onClick={() => onPersonClick(node.person)}
            />
          </div>
        ))}
      </div>
      
      {/* Empty tree state */}
      {treeRoots.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="text-xl font-medium mb-2">No Family Tree Yet</h3>
            <p className="max-w-md">
              Start by adding family members and creating relationships between them.
              Click the "+" button in the sidebar to add your first person.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
