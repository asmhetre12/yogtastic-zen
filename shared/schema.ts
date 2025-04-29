import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  displayName: text("display_name"),
  preferences: jsonb("preferences"),
  lastLogin: timestamp("last_login"),
});

export const userMixes = pgTable("user_mixes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  settings: jsonb("settings").notNull(),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const soundPresets = pgTable("sound_presets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  settings: jsonb("settings").notNull(),
  isDefault: integer("is_default").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).pick({
  userId: true,
  displayName: true,
  preferences: true,
});

export const insertUserMixSchema = createInsertSchema(userMixes).pick({
  userId: true,
  name: true,
  description: true,
  settings: true,
  isPublic: true,
});

export const insertSoundPresetSchema = createInsertSchema(soundPresets).pick({
  name: true,
  description: true,
  settings: true,
  isDefault: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

export type InsertUserMix = z.infer<typeof insertUserMixSchema>;
export type UserMix = typeof userMixes.$inferSelect;

export type InsertSoundPreset = z.infer<typeof insertSoundPresetSchema>;
export type SoundPreset = typeof soundPresets.$inferSelect;

export const soundTracks = [
  { id: "rainfall", name: "Rainfall", icon: "water_drop" },
  { id: "ocean", name: "Ocean Waves", icon: "waves" },
  { id: "birds", name: "Birds Chirping", icon: "flutter_dash" },
  { id: "wind", name: "Wind Blowing", icon: "air" },
  { id: "thunder", name: "Thunderstorm", icon: "thunderstorm" },
  { id: "river", name: "River Stream", icon: "shower" },
  { id: "fire", name: "Camp Fire", icon: "local_fire_department" },
  { id: "insects", name: "Night Insects", icon: "pest_control" },
  { id: "bowl", name: "Tibetan Bowl", icon: "music_note" },
  { id: "chimes", name: "Wind Chimes", icon: "wind_power" },
  { id: "space", name: "Space Ambience", icon: "public" },
  { id: "flute", name: "Flute", icon: "audio_file" }
];

export const defaultPresets: Omit<InsertSoundPreset, "isDefault">[] = [
  {
    name: "Deep Sleep",
    description: "Perfect for falling asleep 💤",
    settings: {
      rainfall: 65,
      thunder: 30,
      insects: 30,
      flute: 20,
      ocean: 0,
      birds: 0,
      wind: 0,
      river: 0,
      fire: 0,
      bowl: 0,
      chimes: 0,
      space: 0
    }
  },
  {
    name: "Zen Meditation",
    description: "Find your inner peace 🧘",
    settings: {
      bowl: 60,
      chimes: 30,
      flute: 25,
      river: 55,
      rainfall: 0,
      thunder: 0,
      ocean: 0,
      birds: 0,
      wind: 0,
      fire: 0,
      insects: 0,
      space: 0
    }
  },
  {
    name: "Forest Retreat",
    description: "Immerse yourself in nature 🌲",
    settings: {
      birds: 60,
      wind: 5,
      river: 100,
      chimes: 25,
      rainfall: 0,
      thunder: 0,
      bowl: 0,
      ocean: 0,
      fire: 0,
      insects: 0,
      space: 0,
      flute: 0
    }
  },
  {
    name: "Cosmic Chill",
    description: "Journey through space 🌌",
    settings: {
      space: 90,
      flute: 25,
      bowl: 30,
      rainfall: 0,
      thunder: 0,
      ocean: 0,
      birds: 0,
      wind: 0,
      river: 0,
      fire: 0,
      insects: 0,
      chimes: 0
    }
  },
  {
    name: "Focus",
    description: "Enhanced concentration 📚",
    settings: {
      bowl: 50,
      wind: 15,
      flute: 60,
      rainfall: 20,
      thunder: 0,
      ocean: 0,
      birds: 0,
      river: 0,
      fire: 0,
      insects: 0,
      chimes: 0,
      space: 0
    }
  },
  {
    name: "Campfire Dreams",
    description: "Cozy evening by the fire 🔥",
    settings: {
      fire: 70,
      insects: 30,
      flute: 5,
      wind: 5,
      rainfall: 0,
      thunder: 0,
      bowl: 0,
      ocean: 0,
      birds: 0,
      river: 0,
      chimes: 0,
      space: 0
    }
  }
];
