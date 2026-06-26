"use server"

import { db } from "@/lib/db"
import { missions, siteStatuses } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

// بدء مسار ميداني جديد مع بيانات السيارة والمعدات
export async function startMission(
  planNumber: number,
  employeeId: string,
  employeeName: string,
  vehicle?: {
    plateLetters?: string
    plateNumbers?: string
    laptopNumber?: string
    flashCount?: number
    hddCount?: number
  },
) {
  // إنهاء أي مهمة نشطة سابقة لنفس الموظف
  await db
    .update(missions)
    .set({ active: false, endedAt: new Date() })
    .where(and(eq(missions.employeeId, employeeId), eq(missions.active, true)))

  const [row] = await db
    .insert(missions)
    .values({
      planNumber,
      employeeId,
      employeeName,
      plateLetters: vehicle?.plateLetters,
      plateNumbers: vehicle?.plateNumbers,
      laptopNumber: vehicle?.laptopNumber,
      flashCount: vehicle?.flashCount,
      hddCount: vehicle?.hddCount,
      active: true,
    })
    .returning()
  return row
}

// اعتماد المشرف + ملاحظات عامة
export async function approveMission(input: {
  missionId: number
  supervisorName: string
  supervisorId: string
  generalNotes?: string
}) {
  if (!input.supervisorName.trim() || !input.supervisorId.trim()) {
    return { ok: false, error: "أدخل اسم المشرف ورقمه الوظيفي" }
  }
  await db
    .update(missions)
    .set({
      supervisorName: input.supervisorName.trim(),
      supervisorId: input.supervisorId.trim(),
      generalNotes: input.generalNotes,
      approved: true,
      approvedAt: new Date(),
    })
    .where(eq(missions.id, input.missionId))
  return { ok: true }
}

// حفظ الملاحظات العامة فقط
export async function saveGeneralNotes(missionId: number, notes: string) {
  await db.update(missions).set({ generalNotes: notes }).where(eq(missions.id, missionId))
  return { ok: true }
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
  status?: string
  storage?: string
  xmlStatus?: string
  faultNote?: string
  photoTaken?: boolean
  monitorStartAt?: string | null
  monitorEndAt?: string | null
}) {
  const existing = await db
    .select()
    .from(siteStatuses)
    .where(and(eq(siteStatuses.missionId, input.missionId), eq(siteStatuses.siteCode, input.siteCode)))
    .limit(1)

  const startAt = input.monitorStartAt !== undefined ? (input.monitorStartAt ? new Date(input.monitorStartAt) : null) : undefined
  const endAt = input.monitorEndAt !== undefined ? (input.monitorEndAt ? new Date(input.monitorEndAt) : null) : undefined

  if (existing.length) {
    await db
      .update(siteStatuses)
      .set({
        status: input.status ?? existing[0].status,
        storage: input.storage ?? existing[0].storage,
        xmlStatus: input.xmlStatus ?? existing[0].xmlStatus,
        faultNote: input.faultNote ?? existing[0].faultNote,
        photoTaken: input.photoTaken ?? existing[0].photoTaken,
        monitorStartAt: startAt !== undefined ? startAt : existing[0].monitorStartAt,
        monitorEndAt: endAt !== undefined ? endAt : existing[0].monitorEndAt,
        visitedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(siteStatuses.id, existing[0].id))
  } else {
    await db.insert(siteStatuses).values({
      missionId: input.missionId,
      planNumber: input.planNumber,
      siteCode: input.siteCode,
      status: input.status ?? "pending",
      storage: input.storage,
      xmlStatus: input.xmlStatus,
      faultNote: input.faultNote,
      photoTaken: input.photoTaken ?? false,
      monitorStartAt: startAt ?? null,
      monitorEndAt: endAt ?? null,
      visitedAt: new Date(),
    })
  }
  return { ok: true }
}

// جلب حالات المواقع لمهمة
export async function getMissionStatuses(missionId: number) {
  return db.select().from(siteStatuses).where(eq(siteStatuses.missionId, missionId))
}
