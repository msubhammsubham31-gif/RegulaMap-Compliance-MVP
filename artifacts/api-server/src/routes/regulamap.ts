import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  CreateComplianceActionBody,
  CreateComplianceActionResponse,
  GetRegulaMapOverviewResponse,
  QueryComplianceAssistantBody,
  QueryComplianceAssistantResponse,
  UpdateComplianceActionBody,
  UpdateComplianceActionParams,
  UpdateComplianceActionResponse,
} from "@workspace/api-zod";
import { db, complianceActions } from "@workspace/db";
import { logger } from "../lib/logger";
import {
  buildRisks,
  changeTrend,
  changes,
  facilities,
  getSeedActions,
  regulations,
} from "./regulamap-data";

const router: IRouter = Router();
const regulationById = new Map<string, (typeof regulations)[number]>(
  regulations.map((regulation) => [regulation.id, regulation]),
);
const facilityIds = new Set<string>(facilities.map((facility) => facility.id));

const toAction = (row: typeof complianceActions.$inferSelect) =>
  CreateComplianceActionResponse.parse({
    ...row,
    createdAt: row.createdAt.toISOString(),
  });

async function listActions() {
  const rows = await db.select().from(complianceActions);
  return rows.map(toAction);
}

async function ensureSeedActions() {
  const existing = await db.select({ id: complianceActions.id }).from(complianceActions).limit(1);
  if (existing.length > 0) return;
  const seeds = getSeedActions();
  await db
    .insert(complianceActions)
    .values(
      seeds.map((action) => ({
        ...action,
        createdAt: new Date(action.createdAt),
      })),
    )
    .onConflictDoNothing();
}

async function getWorkspace() {
  await ensureSeedActions();
  const actions = await listActions();
  const deadlines = actions
    .filter((action) => action.status !== "COMPLETED")
    .map((action) => {
      const regulation = regulationById.get(action.regulationId);
      return {
        id: `deadline-${action.id}`,
        title: action.title,
        regulationId: action.regulationId,
        regulationTitle: regulation?.title ?? "Unknown demo regulation",
        actionId: action.id,
        actionTitle: action.title,
        dueDate: action.dueDate,
        riskLevel: regulation?.riskLevel ?? "MEDIUM",
      };
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return GetRegulaMapOverviewResponse.parse({
      organization: "Apex Industrial Systems",
      regulations,
      changes,
      facilities,
      actions,
      deadlines,
      risks: buildRisks(),
      changeTrend,
    });
}

router.get("/regulamap/overview", async (_req, res): Promise<void> => {
  try {
    const payload = await getWorkspace();
    res.json(payload);
  } catch (error) {
    logger.error({ err: error }, "Failed to load RegulaMap workspace");
    res.status(500).json({ error: "Unable to load the demo workspace." });
  }
});

router.post("/regulamap/actions", async (req, res): Promise<void> => {
  try {
    const input = CreateComplianceActionBody.parse(req.body);
    if (!regulationById.has(input.regulationId)) {
      res.status(400).json({ error: "Choose a regulation from the demo workspace." });
      return;
    }
    if (input.facilityId && !facilityIds.has(input.facilityId)) {
      res.status(400).json({ error: "Choose a facility from the demo workspace." });
      return;
    }
    const id = `action-${randomUUID()}`;
    const [created] = await db
      .insert(complianceActions)
      .values({ id, ...input })
      .returning();
    if (!created) {
      res.status(500).json({ error: "The action could not be saved." });
      return;
    }
    res.status(201).json(toAction(created));
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      res.status(400).json({ error: "Check the action details and try again." });
      return;
    }
    req.log.error({ err: error }, "Failed to create compliance action");
    res.status(500).json({ error: "The action could not be saved." });
  }
});

router.patch("/regulamap/actions/:id", async (req, res): Promise<void> => {
  try {
    const params = UpdateComplianceActionParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid action identifier." });
      return;
    }
    const input = UpdateComplianceActionBody.parse(req.body);
    const [existing] = await db
      .select()
      .from(complianceActions)
      .where(eq(complianceActions.id, params.data.id))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "Action not found." });
      return;
    }
    const [updated] = await db
      .update(complianceActions)
      .set(input)
      .where(eq(complianceActions.id, params.data.id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Action not found." });
      return;
    }
    res.json(UpdateComplianceActionResponse.parse(toAction(updated)));
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      res.status(400).json({ error: "Check the action details and try again." });
      return;
    }
    req.log.error({ err: error }, "Failed to update compliance action");
    res.status(500).json({ error: "The action could not be updated." });
  }
});

router.post("/regulamap/assistant/query", async (req, res): Promise<void> => {
  try {
    const { question } = QueryComplianceAssistantBody.parse(req.body);
    const workspace = await getWorkspace();
    const normalized = question.toLowerCase();
    const sources: string[] = [];
    let answer = "Insufficient source evidence.";
    let insufficientEvidence = true;

    if (/\b(emission|emissions|carbon|co2)\b/.test(normalized)) {
      const emissionChanges = workspace.changes
        .filter((change) => /emission|carbon|co2/i.test(`${change.regulationTitle} ${change.summary}`))
        .slice(0, 5);
      if (emissionChanges.length > 0) {
        answer = emissionChanges.map((change) => `${change.regulationTitle}: ${change.summary}`).join("\n");
        sources.push(...emissionChanges.map((change) => change.regulationTitle));
        insufficientEvidence = false;
      }
    } else if (/\b(deadlines?|due dates?|upcoming|overdue|coming up)\b/.test(normalized)) {
      const upcoming = workspace.deadlines.slice(0, 5);
      answer =
        upcoming.length > 0
          ? upcoming.map((deadline) => `${deadline.title} — due ${deadline.dueDate} (${deadline.riskLevel})`).join("\n")
          : "There are no open deadlines in the demo workspace.";
      sources.push(...upcoming.map((deadline) => deadline.title));
      insufficientEvidence = false;
    } else if (/\b(regulations?|obligations?)\b/.test(normalized) && /\b(apply|applicable|applies)\b/.test(normalized)) {
      const facility = workspace.facilities.find((item) =>
        [item.name, item.city].some((term) => normalized.includes(term.toLowerCase())),
      );
      if (facility) {
        const applicable = workspace.regulations.filter((regulation) => facility.regulationIds.includes(regulation.id));
        if (applicable.length > 0) {
          answer = `${facility.name} (${facility.city}): ${applicable.map((regulation) => regulation.title).join("; ")}`;
          sources.push(facility.name, ...applicable.map((regulation) => regulation.title));
          insufficientEvidence = false;
        }
      } else {
        answer = "Name a facility or city so I can check its recorded regulatory applicability.";
      }
    } else if (/\b(facility|facilities|plant|site)\b/.test(normalized)) {
      const highestRisk = [...workspace.facilities].sort((a, b) => b.riskScore - a.riskScore)[0];
      if (highestRisk) {
        answer = `${highestRisk.name} has the highest facility risk score at ${highestRisk.riskScore}/100 (${highestRisk.riskLevel}).`;
        sources.push(highestRisk.name);
        insufficientEvidence = false;
      }
    } else if (/\b(changes?|updates?)\b/.test(normalized) && /\b(risk|critical|high)\b/.test(normalized)) {
      const highRiskChanges = workspace.changes
        .filter((change) => change.riskLevel === "HIGH" || change.riskLevel === "CRITICAL")
        .slice(0, 5);
      if (highRiskChanges.length > 0) {
        answer = highRiskChanges.map((change) => `${change.regulationTitle}: ${change.summary} (${change.riskLevel})`).join("\n");
        sources.push(...highRiskChanges.map((change) => change.regulationTitle));
        insufficientEvidence = false;
      }
    } else if (/\b(risk|critical|high)\b/.test(normalized)) {
      const highRisk = workspace.regulations
        .filter((regulation) => regulation.riskLevel === "HIGH" || regulation.riskLevel === "CRITICAL")
        .slice(0, 5);
      if (highRisk.length > 0) {
        answer = highRisk.map((regulation) => `${regulation.title} — ${regulation.riskScore}/100 (${regulation.riskLevel})`).join("\n");
        sources.push(...highRisk.map((regulation) => regulation.title));
        insufficientEvidence = false;
      }
    } else if (/\b(change|changed|recent|update|updates)\b/.test(normalized)) {
      const recent = workspace.changes.slice(0, 3);
      answer = recent.map((change) => `${change.regulationTitle}: ${change.summary}`).join("\n");
      sources.push(...recent.map((change) => change.regulationTitle));
      insufficientEvidence = recent.length === 0;
    }

    res.json(
      QueryComplianceAssistantResponse.parse({
        answer,
        sources,
        insufficientEvidence,
      }),
    );
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      res.status(400).json({ error: "Enter a question about workspace regulations, risks, facilities, or deadlines." });
      return;
    }
    req.log.error({ err: error }, "Failed to answer RegulaMap assistant query");
    res.status(500).json({ error: "The assistant could not answer right now." });
  }
});

export default router;
