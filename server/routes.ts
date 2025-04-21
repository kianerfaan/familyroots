import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { personFormSchema, relationshipFormSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Person endpoints
  app.get("/api/persons", async (req, res) => {
    const persons = await storage.getAllPersons();
    res.json(persons);
  });

  app.get("/api/persons/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const person = await storage.getPerson(id);
    if (!person) {
      return res.status(404).json({ message: "Person not found" });
    }
    res.json(person);
  });

  app.post("/api/persons", async (req, res) => {
    try {
      const personData = personFormSchema.parse(req.body);
      const newPerson = await storage.createPerson(personData);
      res.status(201).json(newPerson);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create person" });
    }
  });

  app.put("/api/persons/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
      const personData = personFormSchema.parse(req.body);
      const updatedPerson = await storage.updatePerson(id, personData);
      if (!updatedPerson) {
        return res.status(404).json({ message: "Person not found" });
      }
      res.json(updatedPerson);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update person" });
    }
  });

  app.delete("/api/persons/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const success = await storage.deletePerson(id);
    if (!success) {
      return res.status(404).json({ message: "Person not found" });
    }
    res.status(204).end();
  });

  // Relationship endpoints
  app.get("/api/relationships/person/:personId", async (req, res) => {
    const personId = parseInt(req.params.personId);
    if (isNaN(personId)) {
      return res.status(400).json({ message: "Invalid person ID format" });
    }

    const relationships = await storage.getRelationshipsByPerson(personId);
    res.json(relationships);
  });

  app.post("/api/relationships", async (req, res) => {
    try {
      const relationshipData = relationshipFormSchema.parse(req.body);
      const newRelationship = await storage.createRelationship(relationshipData);
      res.status(201).json(newRelationship);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create relationship" });
    }
  });

  app.delete("/api/relationships/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const success = await storage.deleteRelationship(id);
    if (!success) {
      return res.status(404).json({ message: "Relationship not found" });
    }
    res.status(204).end();
  });

  // Family tree data endpoint
  app.get("/api/familytree", async (req, res) => {
    const familyTreeData = await storage.getFamilyTreeData();
    res.json(familyTreeData);
  });

  const httpServer = createServer(app);

  return httpServer;
}
