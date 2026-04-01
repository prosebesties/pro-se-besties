import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const insightsTable = pgTable("insights", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer"),
  category: text("category"),
  contributorName: text("contributor_name"),
  contributorTitle: text("contributor_title"),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInsightSchema = createInsertSchema(insightsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type Insight = typeof insightsTable.$inferSelect;
