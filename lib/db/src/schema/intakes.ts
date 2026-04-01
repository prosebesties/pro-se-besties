import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const intakesTable = pgTable("intakes", {
  id: serial("id").primaryKey(),
  whatHappened: text("what_happened").notNull(),
  issueType: text("issue_type").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  employerName: text("employer_name").notNull(),
  employerLocation: text("employer_location").notNull(),
  incidentDate: text("incident_date").notNull(),
  lastDayOfEmployment: text("last_day_of_employment"),
  reportedInternally: boolean("reported_internally").notNull(),
  hasDocumentation: boolean("has_documentation").notNull(),
  additionalContext: text("additional_context"),
  caseSummary: text("case_summary").notNull(),
  issueCategories: text("issue_categories").array().notNull(),
  nextSteps: text("next_steps").notNull(),
  attorneyQuestions: text("attorney_questions").array().notNull(),
  relevantAgencies: text("relevant_agencies").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertIntakeSchema = createInsertSchema(intakesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertIntake = z.infer<typeof insertIntakeSchema>;
export type Intake = typeof intakesTable.$inferSelect;
