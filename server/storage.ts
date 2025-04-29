import { soundPresets, type SoundPreset, type InsertSoundPreset, users, type User, type InsertUser, defaultPresets } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Sound presets methods
  getAllSoundPresets(): Promise<SoundPreset[]>;
  getSoundPreset(id: number): Promise<SoundPreset | undefined>;
  createSoundPreset(preset: InsertSoundPreset): Promise<SoundPreset>;
  updateSoundPreset(id: number, preset: Partial<InsertSoundPreset>): Promise<SoundPreset | undefined>;
  deleteSoundPreset(id: number): Promise<boolean>;
  getDefaultPresets(): Promise<SoundPreset[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private presets: Map<number, SoundPreset>;
  userCurrentId: number;
  presetCurrentId: number;

  constructor() {
    this.users = new Map();
    this.presets = new Map();
    this.userCurrentId = 1;
    this.presetCurrentId = 1;
    
    // Initialize with default presets
    this.initDefaultPresets();
  }

  private async initDefaultPresets() {
    for (const preset of defaultPresets) {
      await this.createSoundPreset({
        ...preset,
        isDefault: 1
      });
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Sound preset methods
  async getAllSoundPresets(): Promise<SoundPreset[]> {
    return Array.from(this.presets.values());
  }

  async getSoundPreset(id: number): Promise<SoundPreset | undefined> {
    return this.presets.get(id);
  }

  async createSoundPreset(insertPreset: InsertSoundPreset): Promise<SoundPreset> {
    const id = this.presetCurrentId++;
    const preset: SoundPreset = { ...insertPreset, id };
    this.presets.set(id, preset);
    return preset;
  }

  async updateSoundPreset(id: number, presetUpdate: Partial<InsertSoundPreset>): Promise<SoundPreset | undefined> {
    const existingPreset = this.presets.get(id);
    if (!existingPreset) {
      return undefined;
    }

    const updatedPreset: SoundPreset = { ...existingPreset, ...presetUpdate };
    this.presets.set(id, updatedPreset);
    return updatedPreset;
  }

  async deleteSoundPreset(id: number): Promise<boolean> {
    const preset = this.presets.get(id);
    if (!preset || preset.isDefault === 1) {
      return false;
    }
    return this.presets.delete(id);
  }

  async getDefaultPresets(): Promise<SoundPreset[]> {
    return Array.from(this.presets.values()).filter(preset => preset.isDefault === 1);
  }
}

export const storage = new MemStorage();
