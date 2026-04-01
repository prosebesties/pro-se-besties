import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { intakesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Helper: Generate case analysis based on intake data
// TODO: Replace with AI integration (e.g. OpenAI GPT-4) for dynamic analysis
function generateCaseAnalysis(submission: {
  whatHappened: string;
  issueType: string;
  state: string;
  reportedInternally: boolean;
  hasDocumentation: boolean;
}) {
  const issueLabels: Record<string, string> = {
    discrimination: "Employment Discrimination",
    harassment: "Workplace Harassment",
    retaliation: "Employer Retaliation",
    wrongful_termination: "Wrongful Termination",
    hostile_work_environment: "Hostile Work Environment",
    wage_theft: "Wage Theft / Labor Violations",
    other: "Employment Law Violation",
  };

  const issueLabel = issueLabels[submission.issueType] || "Employment Issue";

  const caseSummary = `Based on the information you've shared, your situation may involve ${issueLabel} under federal and ${submission.state} state employment law. ${
    submission.reportedInternally
      ? "You took an important step by reporting this issue internally, which is often required before pursuing external remedies."
      : "You have not yet reported this internally — depending on your situation, internal reporting may be a necessary first step or could affect your legal options."
  } ${
    submission.hasDocumentation
      ? "Having documentation to support your account is a significant asset in any employment law claim."
      : "Gathering documentation now — including emails, messages, and dates — can strengthen your position going forward."
  } This summary is for educational purposes only and is not legal advice. Please consult with a licensed employment attorney.`;

  const issueCategories = [issueLabel];
  if (submission.issueType === "harassment") issueCategories.push("Potential Title VII Claim");
  if (submission.issueType === "discrimination") issueCategories.push("Civil Rights Violation");
  if (submission.issueType === "retaliation") issueCategories.push("Protected Activity Retaliation");
  if (submission.issueType === "wrongful_termination") issueCategories.push("At-Will Exception");

  const nextSteps = [
    {
      title: "Document Everything",
      description: "Write down every incident with dates, times, witnesses, and what was said or done. Save copies of all relevant emails, texts, and performance reviews. Store them somewhere your employer cannot access.",
      priority: "immediate",
      link: null,
    },
    {
      title: "File a Charge with the EEOC",
      description: "For federal discrimination or harassment claims, you typically must file with the Equal Employment Opportunity Commission (EEOC) before filing a lawsuit. There are strict deadlines — often 180 or 300 days from the discriminatory act.",
      priority: "immediate",
      link: "https://www.eeoc.gov/filing-charge-discrimination",
    },
    {
      title: "Contact Your State Labor Agency",
      description: `${submission.state} may have a state civil rights or labor agency that handles employment claims, sometimes with longer filing windows or broader protections than federal law.`,
      priority: "immediate",
      link: null,
    },
    {
      title: "Consult an Employment Attorney",
      description: "Many employment attorneys offer free initial consultations and work on contingency (no upfront cost). They can evaluate the strength of your claim and advise on strategy.",
      priority: "short_term",
      link: null,
    },
    {
      title: "Review Your Employee Handbook",
      description: "Your employer's policies, anti-harassment/discrimination procedures, and complaint process may affect your options and timeline.",
      priority: "short_term",
      link: null,
    },
    {
      title: "Consider Your Support System",
      description: "Employment disputes are emotionally draining. Connecting with a therapist familiar with workplace trauma and finding community support can make a significant difference in your ability to navigate the process.",
      priority: "long_term",
      link: null,
    },
  ];

  const attorneyQuestions = [
    "Based on the facts I've described, what employment laws may apply to my situation?",
    "What is the statute of limitations for my claim, and what deadlines do I need to meet?",
    "Do I need to file with the EEOC or a state agency before taking any other action?",
    "What evidence will be most important to support my claim?",
    "Have you handled cases similar to mine in my state? What were the outcomes?",
    "What are the potential remedies available to me (back pay, reinstatement, damages)?",
    "What is your fee structure — do you work on contingency?",
    "What are the realistic chances of success based on what you know so far?",
  ];

  const relevantAgencies = [
    {
      name: "Equal Employment Opportunity Commission",
      acronym: "EEOC",
      description: "Federal agency that enforces laws against workplace discrimination based on race, color, religion, sex, national origin, age, disability, or genetic information.",
      url: "https://www.eeoc.gov",
      filingDeadlineNote: "You must file a charge within 180 days (or 300 days in states with their own EEO agencies) of the discriminatory act.",
    },
    {
      name: "Department of Labor — Wage and Hour Division",
      acronym: "DOL/WHD",
      description: "Handles claims related to unpaid wages, overtime, and other violations of the Fair Labor Standards Act.",
      url: "https://www.dol.gov/agencies/whd",
      filingDeadlineNote: "Typically 2–3 years depending on whether the violation was willful.",
    },
    {
      name: "National Labor Relations Board",
      acronym: "NLRB",
      description: "Handles retaliation for protected concerted activity (e.g., discussing wages with coworkers, organizing).",
      url: "https://www.nlrb.gov",
      filingDeadlineNote: "Charges must be filed within 6 months of the alleged violation.",
    },
  ];

  return { caseSummary, issueCategories, nextSteps, attorneyQuestions, relevantAgencies };
}

// POST /api/intake — Submit intake form
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    const {
      what_happened,
      issue_type,
      state,
      zip_code,
      employer_name,
      employer_location,
      incident_date,
      last_day_of_employment,
      reported_internally,
      has_documentation,
      additional_context,
    } = body;

    if (!what_happened || !issue_type || !state || !zip_code || !employer_name || !employer_location || !incident_date) {
      res.status(400).json({ error: "validation_error", message: "Missing required fields" });
      return;
    }

    // TODO: Replace this with an AI analysis call (e.g., OpenAI API) for dynamic, personalized case analysis
    const analysis = generateCaseAnalysis({
      whatHappened: what_happened,
      issueType: issue_type,
      state,
      reportedInternally: !!reported_internally,
      hasDocumentation: !!has_documentation,
    });

    const [record] = await db
      .insert(intakesTable)
      .values({
        whatHappened: what_happened,
        issueType: issue_type,
        state,
        zipCode: zip_code,
        employerName: employer_name,
        employerLocation: employer_location,
        incidentDate: incident_date,
        lastDayOfEmployment: last_day_of_employment || null,
        reportedInternally: !!reported_internally,
        hasDocumentation: !!has_documentation,
        additionalContext: additional_context || null,
        caseSummary: analysis.caseSummary,
        issueCategories: analysis.issueCategories,
        nextSteps: JSON.stringify(analysis.nextSteps),
        attorneyQuestions: analysis.attorneyQuestions,
        relevantAgencies: JSON.stringify(analysis.relevantAgencies),
      })
      .returning();

    const result = {
      id: record.id,
      submission: {
        what_happened: record.whatHappened,
        issue_type: record.issueType,
        state: record.state,
        zip_code: record.zipCode,
        employer_name: record.employerName,
        employer_location: record.employerLocation,
        incident_date: record.incidentDate,
        last_day_of_employment: record.lastDayOfEmployment,
        reported_internally: record.reportedInternally,
        has_documentation: record.hasDocumentation,
        additional_context: record.additionalContext,
      },
      case_summary: record.caseSummary,
      issue_categories: record.issueCategories,
      next_steps: JSON.parse(record.nextSteps),
      attorney_questions: record.attorneyQuestions,
      relevant_agencies: JSON.parse(record.relevantAgencies),
      created_at: record.createdAt.toISOString(),
    };

    res.status(201).json(result);
  } catch (err) {
    req.log.error({ err }, "Error submitting intake");
    res.status(500).json({ error: "server_error", message: "Failed to submit intake" });
  }
});

// GET /api/intake/:id — Retrieve intake result
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "invalid_id", message: "Invalid intake ID" });
      return;
    }

    const [record] = await db.select().from(intakesTable).where(eq(intakesTable.id, id));

    if (!record) {
      res.status(404).json({ error: "not_found", message: "Intake not found" });
      return;
    }

    const result = {
      id: record.id,
      submission: {
        what_happened: record.whatHappened,
        issue_type: record.issueType,
        state: record.state,
        zip_code: record.zipCode,
        employer_name: record.employerName,
        employer_location: record.employerLocation,
        incident_date: record.incidentDate,
        last_day_of_employment: record.lastDayOfEmployment,
        reported_internally: record.reportedInternally,
        has_documentation: record.hasDocumentation,
        additional_context: record.additionalContext,
      },
      case_summary: record.caseSummary,
      issue_categories: record.issueCategories,
      next_steps: JSON.parse(record.nextSteps),
      attorney_questions: record.attorneyQuestions,
      relevant_agencies: JSON.parse(record.relevantAgencies),
      created_at: record.createdAt.toISOString(),
    };

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error fetching intake result");
    res.status(500).json({ error: "server_error", message: "Failed to retrieve intake" });
  }
});

export default router;
