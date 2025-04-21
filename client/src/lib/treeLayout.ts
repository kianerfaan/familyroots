import { FamilyTreePerson } from "@shared/schema";

// Define types for layout calculations
type TreeNode = {
  x: number;
  y: number;
  person: FamilyTreePerson;
  width: number;
  height: number;
  children?: TreeNode[];
  spouse?: TreeNode;
  level: number;
};

type Dimensions = {
  width: number;
  height: number;
};

type Connector = {
  type: 'horizontal' | 'vertical';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type TreeLayout = {
  nodes: TreeNode[];
  connectors: Connector[];
  dimensions: Dimensions;
};

// Default node dimensions
const NODE_WIDTH = 256;
const NODE_HEIGHT = 120;
const LEVEL_HEIGHT = 160;
const SIBLING_SPACING = 40;
const SPOUSE_SPACING = 32;

/**
 * Creates a hierarchical tree layout for visualization
 */
export function layoutFamilyTree(rootPersons: FamilyTreePerson[]): TreeLayout {
  const nodes: TreeNode[] = [];
  const connectors: Connector[] = [];
  let maxWidth = 0;
  let maxHeight = 0;

  // Process nodes to create a layout
  function processNode(
    person: FamilyTreePerson, 
    level: number = 0, 
    xOffset: number = 0
  ): TreeNode {
    // Create the node for this person
    const node: TreeNode = {
      x: xOffset,
      y: level * LEVEL_HEIGHT,
      person,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      level,
      children: []
    };
    
    nodes.push(node);
    
    // Process spouse if available
    let totalWidth = NODE_WIDTH;
    if (person.spouses && person.spouses.length > 0) {
      const spouse = person.spouses[0]; // Only use the first spouse for layout
      const spouseNode = {
        x: xOffset + NODE_WIDTH + SPOUSE_SPACING,
        y: level * LEVEL_HEIGHT,
        person: spouse,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        level,
      };
      
      nodes.push(spouseNode);
      node.spouse = spouseNode;
      
      // Add connector between spouses
      connectors.push({
        type: 'horizontal',
        x1: node.x + node.width,
        y1: node.y + (node.height / 2),
        x2: spouseNode.x,
        y2: spouseNode.y + (spouseNode.height / 2)
      });
      
      totalWidth += NODE_WIDTH + SPOUSE_SPACING;
    }
    
    // Process children if available
    const validChildren = person.children?.filter(
      child => !nodes.some(n => n.person.id === child.id)
    ) || [];
    
    if (validChildren.length > 0) {
      // Calculate the starting x position for children to center them
      let childXOffset = xOffset;
      
      // If there's a spouse, center children under both parents
      if (node.spouse) {
        childXOffset = node.x + ((node.spouse.x + node.spouse.width - node.x) / 2) - 
                      ((validChildren.length * NODE_WIDTH + (validChildren.length - 1) * SIBLING_SPACING) / 2);
      } else {
        childXOffset = node.x + (node.width / 2) - 
                      ((validChildren.length * NODE_WIDTH + (validChildren.length - 1) * SIBLING_SPACING) / 2);
      }
      
      // Ensure at least 0 offset
      childXOffset = Math.max(0, childXOffset);
      
      // Add vertical connector from parent to children
      const parentY = node.y + node.height;
      let centerX: number;
      
      if (node.spouse) {
        centerX = node.x + ((node.spouse.x + node.spouse.width - node.x) / 2);
      } else {
        centerX = node.x + (node.width / 2);
      }
      
      connectors.push({
        type: 'vertical',
        x1: centerX,
        y1: parentY,
        x2: centerX,
        y2: parentY + LEVEL_HEIGHT / 2
      });
      
      // Add horizontal connector to span all children
      if (validChildren.length > 1) {
        const firstChildX = childXOffset + (NODE_WIDTH / 2);
        const lastChildX = childXOffset + (validChildren.length * NODE_WIDTH) + 
                          ((validChildren.length - 1) * SIBLING_SPACING) - (NODE_WIDTH / 2);
        
        connectors.push({
          type: 'horizontal',
          x1: firstChildX,
          y1: parentY + LEVEL_HEIGHT / 2,
          x2: lastChildX,
          y2: parentY + LEVEL_HEIGHT / 2
        });
      }
      
      // Process each child
      validChildren.forEach((child, index) => {
        const childX = childXOffset + (index * (NODE_WIDTH + SIBLING_SPACING));
        const childNode = processNode(child, level + 1, childX);
        node.children?.push(childNode);
        
        // Add vertical connector from horizontal line to child
        connectors.push({
          type: 'vertical',
          x1: childX + (NODE_WIDTH / 2),
          y1: parentY + LEVEL_HEIGHT / 2,
          x2: childX + (NODE_WIDTH / 2),
          y2: childNode.y
        });
        
        // Update the maximum width and height
        maxWidth = Math.max(maxWidth, childX + NODE_WIDTH);
        maxHeight = Math.max(maxHeight, childNode.y + NODE_HEIGHT);
      });
    }
    
    // Update the maximum dimensions
    maxWidth = Math.max(maxWidth, xOffset + totalWidth);
    maxHeight = Math.max(maxHeight, level * LEVEL_HEIGHT + NODE_HEIGHT);
    
    return node;
  }

  // Process each root person
  let xPos = 0;
  rootPersons.forEach(rootPerson => {
    const node = processNode(rootPerson, 0, xPos);
    xPos = maxWidth + SIBLING_SPACING;
  });

  return {
    nodes,
    connectors,
    dimensions: {
      width: maxWidth,
      height: maxHeight
    }
  };
}
