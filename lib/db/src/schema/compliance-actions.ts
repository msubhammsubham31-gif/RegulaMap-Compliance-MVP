import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const complianceActions = pgTable("regulamap_compliance_actions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  regulationId: text("regulation_id").notNull(),
  facilityId: text("facility_id"),
  assignedTo: text("assigned_to").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull(),
  dueDate: text("due_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
