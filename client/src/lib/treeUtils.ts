import { Person, Relationship, FamilyTreePerson, FamilyTreeData } from "@shared/schema";

/**
 * Builds a hierarchical tree structure from flat person and relationship data
 * @param data The family tree data with persons and relationships arrays
 * @returns The root person or undefined if no data
 */
export function buildFamilyTree(data: FamilyTreeData): FamilyTreePerson[] {
  const { persons, relationships } = data;
  if (!persons.length) return [];

  // Create a map of all persons by ID for quick lookup
  const personsMap = new Map<number, FamilyTreePerson>();
  persons.forEach(person => {
    personsMap.set(person.id, {
      ...person,
      children: [],
      parents: [],
      spouses: [],
      siblings: []
    });
  });

  // Process all relationships to build connections
  relationships.forEach(relationship => {
    const person = personsMap.get(relationship.personId);
    const relatedPerson = personsMap.get(relationship.relatedPersonId);

    if (!person || !relatedPerson) return;

    switch (relationship.type) {
      case 'parent':
        person.children?.push(relatedPerson);
        break;
      case 'child':
        person.parents?.push(relatedPerson);
        break;
      case 'spouse':
        person.spouses?.push(relatedPerson);
        break;
      case 'sibling':
        person.siblings?.push(relatedPerson);
        break;
    }
  });

  // Find the root persons (those who have no parents or have the most descendants)
  const personsWithParents = new Set<number>();
  relationships
    .filter(r => r.type === 'child')
    .forEach(r => personsWithParents.add(r.personId));

  // Persons without parents are potential roots
  const rootCandidates = persons.filter(p => !personsWithParents.has(p.id));
  
  // Return the root candidates, sorted by ID (typically the oldest persons first)
  return rootCandidates.map(p => personsMap.get(p.id)!).sort((a, b) => a.id - b.id);
}

/**
 * Gets a flat list of relationships from a hierarchical tree
 * @param tree The hierarchical family tree
 * @returns A flat list of relationships
 */
export function getRelationshipsFromTree(tree: FamilyTreePerson[]): Relationship[] {
  const relationships: Relationship[] = [];
  const processedPairs = new Set<string>();

  function traverseTree(person: FamilyTreePerson) {
    // Process children relationships
    person.children?.forEach(child => {
      const pairKey = `${person.id}-${child.id}-parent`;
      if (!processedPairs.has(pairKey)) {
        relationships.push({
          id: 0, // ID will be assigned by storage
          type: 'parent',
          personId: person.id,
          relatedPersonId: child.id
        });
        processedPairs.add(pairKey);
      }
      traverseTree(child);
    });

    // Process spouse relationships
    person.spouses?.forEach(spouse => {
      const pairKey = `${person.id}-${spouse.id}-spouse`;
      const reversePairKey = `${spouse.id}-${person.id}-spouse`;
      if (!processedPairs.has(pairKey) && !processedPairs.has(reversePairKey)) {
        relationships.push({
          id: 0,
          type: 'spouse',
          personId: person.id,
          relatedPersonId: spouse.id
        });
        processedPairs.add(pairKey);
      }
    });

    // Process sibling relationships
    person.siblings?.forEach(sibling => {
      const pairKey = `${person.id}-${sibling.id}-sibling`;
      const reversePairKey = `${sibling.id}-${person.id}-sibling`;
      if (!processedPairs.has(pairKey) && !processedPairs.has(reversePairKey)) {
        relationships.push({
          id: 0,
          type: 'sibling',
          personId: person.id,
          relatedPersonId: sibling.id
        });
        processedPairs.add(pairKey);
      }
    });
  }

  tree.forEach(person => traverseTree(person));
  return relationships;
}

/**
 * Helper to flatten tree data for export
 */
export function flattenTreeForExport(data: FamilyTreeData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Helper to parse imported tree data
 */
export function parseImportedTreeData(jsonData: string): FamilyTreeData | null {
  try {
    const data = JSON.parse(jsonData);
    if (!data.persons || !data.relationships) {
      throw new Error("Invalid data format");
    }
    return data as FamilyTreeData;
  } catch (error) {
    console.error("Failed to parse imported data:", error);
    return null;
  }
}

/**
 * Helper to determine the gender class for styling person cards
 */
export function getGenderClass(gender?: string): string {
  switch (gender?.toLowerCase()) {
    case 'male':
      return 'border-blue-500';
    case 'female':
      return 'border-pink-500';
    default:
      return 'border-purple-500';
  }
}

/**
 * Format date for display
 */
export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
