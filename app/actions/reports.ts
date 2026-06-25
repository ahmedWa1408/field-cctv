"use server"

import { db } from "@/lib/db"
import { violations, siteStatuses, missions } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"

// تقرير مسار: المخالفات + الأعطال + المهام
export async function getPlanReport(planNumber: number) {
  const [vios, faults, missionRows] = await Promise.all([
    db
      .select()
      .from(violations)
      .where(eq(violations.planNumber, planNumber))
      .orderBy(desc(violations.createdAt)),
    db
      .select()
      .from(siteStatuses)
      .where(eq(siteStatuses.planNumber, planNumber))
      .orderBy(desc(siteStatuses.updatedAt)),
    db
      .select()
      .from(missions)
      .where(eq(missions.planNumber, planNumber))
      .orderBy(desc(missions.startedAt)),
  ])

  // الأعطال = المواقع التي حالتها "لا يعمل"
  const faultsOnly = faults.filter((f) => f.status === "not_working")

  return { violations: vios, faults: faultsOnly, allStatuses: faults, missions: missionRows }
}
