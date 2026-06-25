"use server"

import { db } from "@/lib/db"
import { missions, siteStatuses } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

// بدء مسار ميداني جديد
export async function startMission(planNumber: number, employeeId: string, employeeName: string) {
  // إنهاء أي مهمة نشطة سابقة لنفس الموظف
  await db
    .update(missions)
    .set({ active: false, endedAt: new Date() })
    .where(and(eq(missions.employeeId, employeeId), eq(missions.active, true)))

  const [row] = await db
    .insert(missions)
    .values({ planNumber, employeeId, employeeName, active: true })
    .returning()
  return row
}

// إنهاء المهمة
export async function endMission(missionId: number) {
  await db
    .update(missions)
    .set({ active: false, endedAt: new Date() })
    .where(eq(missions.id, missionId))
  return { ok: true }
}

// تحديث حالة موقع داخل مهمة (يعمل/لا يعمل/مخالفات)
export async function updateSiteStatus(input: {
  missionId: number
  planNumber: number
  siteCode: string
  status: string
  storage?: string
  faultNote?: string
  photoTaken?: boolean
}) {
  const existing = await db
    .select()
    .from(siteStatuses)
    .where(and(eq(siteStatuses.missionId, input.missionId), eq(siteStatuses.siteCode, input.siteCode)))
    .limit(1)

  if (existing.length) {
    await db
      .update(siteStatuses)
      .set({
        status: input.status,
        storage: input.storage ?? existing[0].storage,
        faultNote: input.faultNote ?? existing[0].faultNote,
        photoTaken: input.photoTaken ?? existing[0].photoTaken,
        visitedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(siteStatuses.id, existing[0].id))
  } else {
    await db.insert(siteStatuses).values({
      missionId: input.missionId,
      planNumber: input.planNumber,
      siteCode: input.siteCode,
      status: input.status,
      storage: input.storage,
      faultNote: input.faultNote,
      photoTaken: input.photoTaken ?? false,
      visitedAt: new Date(),
    })
  }
  return { ok: true }
}

// جلب حالات المواقع لمهمة
export async function getMissionStatuses(missionId: number) {
  return db.select().from(siteStatuses).where(eq(siteStatuses.missionId, missionId))
}
