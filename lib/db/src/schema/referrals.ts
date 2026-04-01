import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const referralsTable = pgTable("referrals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // lawyer | therapist | consultant | community
  description: text("description").notNull(),
  location: text("location"),
  isRemote: boolean("is_remote").default(false).notNull(),
  website: text("website"),
  phone: text("phone"),
  email: text("email"),
  specialties: text("specialties").array().notNull(),
  acceptsProSe: boolean("accepts_pro_se"),
  slidingScale: boolean("sliding_scale"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReferralSchema = createInsertSchema(referralsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referralsTable.$inferSelect;
