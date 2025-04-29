import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSoundPresetSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sound Presets API
  app.get("/api/presets", async (_req, res) => {
    try {
      const presets = await storage.getAllSoundPresets();
      res.json(presets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sound presets" });
    }
  });

  app.get("/api/presets/default", async (_req, res) => {
    try {
      const defaultPresets = await storage.getDefaultPresets();
      res.json(defaultPresets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch default presets" });
    }
  });

  app.get("/api/presets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid preset ID" });
      }

      const preset = await storage.getSoundPreset(id);
      if (!preset) {
        return res.status(404).json({ message: "Preset not found" });
      }

      res.json(preset);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch preset" });
    }
  });

  app.post("/api/presets", async (req, res) => {
    try {
      const validatedData = insertSoundPresetSchema.parse(req.body);
      const preset = await storage.createSoundPreset({
        ...validatedData,
        isDefault: 0 // User-created presets are never default
      });
      res.status(201).json(preset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid preset data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create preset" });
    }
  });

  app.put("/api/presets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid preset ID" });
      }

      const preset = await storage.getSoundPreset(id);
      if (!preset) {
        return res.status(404).json({ message: "Preset not found" });
      }

      // Don't allow updating default presets
      if (preset.isDefault === 1) {
        return res.status(403).json({ message: "Cannot update default preset" });
      }

      const validatedData = insertSoundPresetSchema.partial().parse(req.body);
      const updatedPreset = await storage.updateSoundPreset(id, validatedData);
      res.json(updatedPreset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid preset data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update preset" });
    }
  });

  app.delete("/api/presets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid preset ID" });
      }

      const success = await storage.deleteSoundPreset(id);
      if (!success) {
        return res.status(404).json({ message: "Preset not found or cannot be deleted" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete preset" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
