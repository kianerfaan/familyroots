interface ConnectorProps {
  connector: {
    type: 'horizontal' | 'vertical';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export default function TreeConnector({ connector }: ConnectorProps) {
  const { type, x1, y1, x2, y2 } = connector;
  
  if (type === 'horizontal') {
    // For horizontal connectors, we place a line from left to right
    const left = Math.min(x1, x2);
    const width = Math.abs(x2 - x1);
    
    return (
      <div 
        className="tree-connector horizontal-connector absolute"
        style={{
          left: `${left}px`,
          top: `${y1}px`,
          width: `${width}px`,
          height: '2px',
          backgroundColor: '#718096',
          zIndex: 0
        }}
      />
    );
  } else {
    // For vertical connectors, we place a line from top to bottom
    const top = Math.min(y1, y2);
    const height = Math.abs(y2 - y1);
    
    return (
      <div 
        className="tree-connector vertical-connector absolute"
        style={{
          left: `${x1}px`,
          top: `${top}px`,
          width: '2px',
          height: `${height}px`,
          backgroundColor: '#718096',
          zIndex: 0
        }}
      />
    );
  }
}
