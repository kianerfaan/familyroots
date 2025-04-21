import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the person schema
export const persons = pgTable("persons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  gender: text("gender"),
  birthDate: date("birth_date"),
  birthPlace: text("birth_place"),
  deathDate: date("death_date"),
  notes: text("notes"),
});

// Define the relationship schema
export const relationships = pgTable("relationships", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // parent, child, spouse, sibling
  personId: integer("person_id").notNull(),
  relatedPersonId: integer("related_person_id").notNull(),
});

// Insert schemas
export const insertPersonSchema = createInsertSchema(persons).omit({
  id: true,
});

export const insertRelationshipSchema = createInsertSchema(relationships).omit({
  id: true,
});

// Extension for form validation
export const personFormSchema = insertPersonSchema.extend({
  birthDate: z.string().optional().nullable(),
  deathDate: z.string().optional().nullable(),
});

export const relationshipFormSchema = insertRelationshipSchema.extend({
  personId: z.number(),
  relatedPersonId: z.number(),
  type: z.enum(["parent", "child", "spouse", "sibling"]),
});

// Types
export type Person = typeof persons.$inferSelect;
export type InsertPerson = z.infer<typeof insertPersonSchema>;
export type PersonForm = z.infer<typeof personFormSchema>;

export type Relationship = typeof relationships.$inferSelect;
export type InsertRelationship = z.infer<typeof insertRelationshipSchema>;
export type RelationshipForm = z.infer<typeof relationshipFormSchema>;

// Additional type for tree visualization
export type FamilyTreePerson = Person & {
  children?: FamilyTreePerson[];
  spouses?: FamilyTreePerson[];
  parents?: FamilyTreePerson[];
  siblings?: FamilyTreePerson[];
};

// Export type for flattening the tree into a list with relationships
export type FamilyTreeData = {
  persons: Person[];
  relationships: Relationship[];
};
