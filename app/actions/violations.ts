"use server"

import { db } from "@/lib/db"
import { violations } from "@/lib/db/schema"
import { and, desc, eq, gte } from "drizzle-orm"

export type ViolationType =
  | "overspeed"
  | "not_arrived"
  | "exit_system"
  | "tampering"
  | "off_route_long"

// تسجيل مخالفة تلقائيًا (مع منع التكرار المفرط لنفس النوع خلال دقيقة)
export async function logViolation(input: {
  missionId: number | null
  planNumber: number
  employeeId: string
  employeeName: string
  type: ViolationType
  detail?: string
}) {
  // منع التكرار: لا نسجل نفس النوع لنفس المهمة خلال آخر 60 ثانية
  if (input.missionId) {
    const oneMinAgo = new Date(Date.now() - 60_000)
    const recent = await db
      .select()
      .from(violations)
      .where(
        and(
          eq(violations.missionId, input.missionId),
          eq(violations.type, input.type),
          gte(violations.createdAt, oneMinAgo),
        ),
      )
      .limit(1)
    if (recent.length) return { ok: true, skipped: true }
  }

  await db.insert(violations).values({
    missionId: input.missionId,
    planNumber: input.planNumber,
    employeeId: input.employeeId,
    employeeName: input.employeeName,
    type: input.type,
    detail: input.detail,
  })
  return { ok: true }
}

// جلب مخالفات مهمة معينة
export async function getMissionViolations(missionId: number) {
  return db
    .select()
    .from(violations)
    .where(eq(violations.missionId, missionId))
    .orderBy(desc(violations.createdAt))
}
