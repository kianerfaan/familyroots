import { 
  persons, relationships, 
  type Person, type InsertPerson, 
  type Relationship, type InsertRelationship,
  type FamilyTreeData
} from "@shared/schema";

export interface IStorage {
  // Person operations
  getPerson(id: number): Promise<Person | undefined>;
  getAllPersons(): Promise<Person[]>;
  createPerson(person: InsertPerson): Promise<Person>;
  updatePerson(id: number, person: InsertPerson): Promise<Person | undefined>;
  deletePerson(id: number): Promise<boolean>;
  
  // Relationship operations
  getRelationship(id: number): Promise<Relationship | undefined>;
  getRelationshipsByPerson(personId: number): Promise<Relationship[]>;
  createRelationship(relationship: InsertRelationship): Promise<Relationship>;
  deleteRelationship(id: number): Promise<boolean>;
  
  // Family tree operations
  getFamilyTreeData(): Promise<FamilyTreeData>;
}

export class MemStorage implements IStorage {
  private persons: Map<number, Person>;
  private relationships: Map<number, Relationship>;
  private currentPersonId: number;
  private currentRelationshipId: number;

  constructor() {
    this.persons = new Map();
    this.relationships = new Map();
    this.currentPersonId = 1;
    this.currentRelationshipId = 1;
  }

  // Person operations
  async getPerson(id: number): Promise<Person | undefined> {
    return this.persons.get(id);
  }

  async getAllPersons(): Promise<Person[]> {
    return Array.from(this.persons.values());
  }

  async createPerson(insertPerson: InsertPerson): Promise<Person> {
    const id = this.currentPersonId++;
    const person: Person = { ...insertPerson, id };
    this.persons.set(id, person);
    return person;
  }

  async updatePerson(id: number, updatePerson: InsertPerson): Promise<Person | undefined> {
    const existingPerson = this.persons.get(id);
    if (!existingPerson) return undefined;
    
    const updatedPerson: Person = { ...updatePerson, id };
    this.persons.set(id, updatedPerson);
    return updatedPerson;
  }

  async deletePerson(id: number): Promise<boolean> {
    // First delete all relationships for this person
    const allRelationships = Array.from(this.relationships.values());
    const personRelationships = allRelationships.filter(
      r => r.personId === id || r.relatedPersonId === id
    );
    
    for (const rel of personRelationships) {
      await this.deleteRelationship(rel.id);
    }
    
    return this.persons.delete(id);
  }

  // Relationship operations
  async getRelationship(id: number): Promise<Relationship | undefined> {
    return this.relationships.get(id);
  }

  async getRelationshipsByPerson(personId: number): Promise<Relationship[]> {
    return Array.from(this.relationships.values()).filter(
      rel => rel.personId === personId || rel.relatedPersonId === personId
    );
  }

  async createRelationship(insertRelationship: InsertRelationship): Promise<Relationship> {
    const id = this.currentRelationshipId++;
    const relationship: Relationship = { ...insertRelationship, id };
    this.relationships.set(id, relationship);
    
    // If adding a spouse relationship, create the reciprocal relationship as well
    if (insertRelationship.type === 'spouse') {
      const reciprocal: Relationship = {
        id: this.currentRelationshipId++,
        type: 'spouse',
        personId: insertRelationship.relatedPersonId,
        relatedPersonId: insertRelationship.personId
      };
      this.relationships.set(reciprocal.id, reciprocal);
    }
    
    // If adding a parent relationship, create the child relationship as well
    if (insertRelationship.type === 'parent') {
      const reciprocal: Relationship = {
        id: this.currentRelationshipId++,
        type: 'child',
        personId: insertRelationship.relatedPersonId,
        relatedPersonId: insertRelationship.personId
      };
      this.relationships.set(reciprocal.id, reciprocal);
    }
    
    // If adding a child relationship, create the parent relationship as well
    if (insertRelationship.type === 'child') {
      const reciprocal: Relationship = {
        id: this.currentRelationshipId++,
        type: 'parent',
        personId: insertRelationship.relatedPersonId,
        relatedPersonId: insertRelationship.personId
      };
      this.relationships.set(reciprocal.id, reciprocal);
    }
    
    // If adding a sibling relationship, create the reciprocal relationship as well
    if (insertRelationship.type === 'sibling') {
      const reciprocal: Relationship = {
        id: this.currentRelationshipId++,
        type: 'sibling',
        personId: insertRelationship.relatedPersonId,
        relatedPersonId: insertRelationship.personId
      };
      this.relationships.set(reciprocal.id, reciprocal);
    }
    
    return relationship;
  }

  async deleteRelationship(id: number): Promise<boolean> {
    const relationship = this.relationships.get(id);
    if (!relationship) return false;
    
    // Also delete the reciprocal relationship if it exists
    const reciprocalRelationships = Array.from(this.relationships.values()).filter(
      rel => 
        rel.personId === relationship.relatedPersonId && 
        rel.relatedPersonId === relationship.personId && 
        rel.type === this.getReciprocalType(relationship.type)
    );
    
    for (const rel of reciprocalRelationships) {
      this.relationships.delete(rel.id);
    }
    
    return this.relationships.delete(id);
  }
  
  // Helper method to get the reciprocal relationship type
  private getReciprocalType(type: string): string {
    switch (type) {
      case 'parent': return 'child';
      case 'child': return 'parent';
      case 'spouse': return 'spouse';
      case 'sibling': return 'sibling';
      default: return type;
    }
  }

  // Family tree operations
  async getFamilyTreeData(): Promise<FamilyTreeData> {
    return {
      persons: Array.from(this.persons.values()),
      relationships: Array.from(this.relationships.values())
    };
  }
}

export const storage = new MemStorage();
