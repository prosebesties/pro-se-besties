import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { insightsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/insights — List all insights
router.get("/", async (req, res) => {
  try {
    const insights = await db
      .select()
      .from(insightsTable)
      .orderBy(insightsTable.createdAt);

    res.json(
      insights.map((i) => ({
        id: i.id,
        question: i.question,
        answer: i.answer,
        category: i.category,
        contributor_name: i.contributorName,
        contributor_title: i.contributorTitle,
        is_featured: i.isFeatured,
        created_at: i.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error listing insights");
    res.status(500).json({ error: "server_error", message: "Failed to list insights" });
  }
});

// GET /api/insights/featured — Get featured insights
router.get("/featured", async (req, res) => {
  try {
    const insights = await db
      .select()
      .from(insightsTable)
      .where(eq(insightsTable.isFeatured, true))
      .orderBy(insightsTable.createdAt);

    res.json(
      insights.map((i) => ({
        id: i.id,
        question: i.question,
        answer: i.answer,
        category: i.category,
        contributor_name: i.contributorName,
        contributor_title: i.contributorTitle,
        is_featured: i.isFeatured,
        created_at: i.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error fetching featured insights");
    res.status(500).json({ error: "server_error", message: "Failed to fetch featured insights" });
  }
});

// POST /api/insights — Submit a question
router.post("/", async (req, res) => {
  try {
    const { question, category, submitter_name } = req.body;

    if (!question) {
      res.status(400).json({ error: "validation_error", message: "Question is required" });
      return;
    }

    // TODO: In production, send to a moderation queue or vetted contributor review
    // For now, insert as a pending question without an answer
    const [record] = await db
      .insert(insightsTable)
      .values({
        question,
        answer: null,
        category: category || null,
        contributorName: submitter_name || null,
        contributorTitle: null,
        isFeatured: false,
      })
      .returning();

    res.status(201).json({
      id: record.id,
      question: record.question,
      answer: record.answer,
      category: record.category,
      contributor_name: record.contributorName,
      contributor_title: record.contributorTitle,
      is_featured: record.isFeatured,
      created_at: record.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error submitting insight question");
    res.status(500).json({ error: "server_error", message: "Failed to submit question" });
  }
});

export default router;
