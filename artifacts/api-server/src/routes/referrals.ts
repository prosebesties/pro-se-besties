import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { referralsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/referrals — List referrals, optionally filter by category
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    let query = db.select().from(referralsTable);
    
    if (category && typeof category === "string") {
      const referrals = await db
        .select()
        .from(referralsTable)
        .where(eq(referralsTable.category, category));

      res.json(
        referrals.map((r) => ({
          id: r.id,
          name: r.name,
          category: r.category,
          description: r.description,
          location: r.location,
          is_remote: r.isRemote,
          website: r.website,
          phone: r.phone,
          email: r.email,
          specialties: r.specialties,
          accepts_pro_se: r.acceptsProSe,
          sliding_scale: r.slidingScale,
          created_at: r.createdAt.toISOString(),
        }))
      );
      return;
    }

    const referrals = await query;

    res.json(
      referrals.map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        description: r.description,
        location: r.location,
        is_remote: r.isRemote,
        website: r.website,
        phone: r.phone,
        email: r.email,
        specialties: r.specialties,
        accepts_pro_se: r.acceptsProSe,
        sliding_scale: r.slidingScale,
        created_at: r.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error listing referrals");
    res.status(500).json({ error: "server_error", message: "Failed to list referrals" });
  }
});

// GET /api/referrals/categories — Get referral category summary
router.get("/categories", async (req, res) => {
  try {
    const categories = [
      {
        category: "lawyer",
        count: 0,
        description: "Employment attorneys who can advise on your legal rights and represent you in claims.",
      },
      {
        category: "therapist",
        count: 0,
        description: "Mental health professionals experienced in workplace trauma, burnout, and healing.",
      },
      {
        category: "consultant",
        count: 0,
        description: "Pro se consultants and legal coaches who help self-represented individuals navigate the process.",
      },
      {
        category: "community",
        count: 0,
        description: "Support groups, advocacy organizations, and peer communities for workers who've faced injustice.",
      },
    ];

    // Count referrals per category from the DB
    const all = await db.select().from(referralsTable);
    for (const cat of categories) {
      cat.count = all.filter((r) => r.category === cat.category).length;
    }

    res.json(categories);
  } catch (err) {
    req.log.error({ err }, "Error fetching referral categories");
    res.status(500).json({ error: "server_error", message: "Failed to fetch categories" });
  }
});

export default router;
