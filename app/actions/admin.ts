"use server"

import { db } from "@/lib/db"
import { plans, sites } from "@/lib/db/schema"
import { asc, eq, max } from "drizzle-orm"
import { parseCoordsFromUrl, smartOrder, findInsertIndex } from "@/lib/geo"
import { revalidatePath } from "next/cache"

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "1234"

export async function verifyAdmin(passcode: string) {
  return { ok: passcode.trim() === ADMIN_PASSCODE }
}

// إضافة خطة جديدة (نسخة) — تترتب تلقائيًا برقم الخطة
export async function addPlan(input: { route: string; speedLimit?: number; copyFromPlan?: number }) {
  const route = input.route.trim()
  if (!route) return { ok: false, error: "أدخل اسم المسار" }

  const maxRow = await db.select({ m: max(plans.planNumber) }).from(plans)
  const nextNumber = (maxRow[0]?.m ?? 0) + 1

  await db.insert(plans).values({
    planNumber: nextNumber,
    route,
    speedLimit: input.speedLimit ?? 120,
  })

  // نسخ مواقع خطة موجودة إن طُلب ذلك
  if (input.copyFromPlan) {
    const src = await db.select().from(sites).where(eq(sites.planNumber, input.copyFromPlan))
    if (src.length) {
      await db.insert(sites).values(
        src.map((s) => ({
          planNumber: nextNumber,
          code: s.code,
          storage: s.storage,
          mapUrl: s.mapUrl,
          lat: s.lat,
          lng: s.lng,
          orderIndex: s.orderIndex,
        })),
      )
    }
  }

  revalidatePath("/admin")
  return { ok: true, planNumber: nextNumber }
}

// إضافة موقع جديد (نسخة) — يُدرج ذكيًا بين موقعين حسب GPS
export async function addSite(input: {
  planNumber: number
  code: string
  storage?: string
  mapUrl?: string
}) {
  const code = input.code.trim()
  if (!code) return { ok: false, error: "أدخل رمز الموقع" }

  const coords = input.mapUrl ? parseCoordsFromUrl(input.mapUrl) : null

  const current = await db
    .select()
    .from(sites)
    .where(eq(sites.planNumber, input.planNumber))
    .orderBy(asc(sites.orderIndex))

  let orderIndex: number
  if (coords && current.length >= 1) {
    const insertAt = findInsertIndex(current, coords)
    const before = current[insertAt - 1]
    const after = current[insertAt]
    if (before && after) orderIndex = (before.orderIndex + after.orderIndex) / 2
    else if (before) orderIndex = before.orderIndex + 1
    else orderIndex = (after?.orderIndex ?? 1) - 0.5
  } else {
    const maxIdx = current.reduce((m, s) => Math.max(m, s.orderIndex), 0)
    orderIndex = maxIdx + 1
  }

  await db.insert(sites).values({
    planNumber: input.planNumber,
    code,
    storage: input.storage,
    mapUrl: input.mapUrl,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    orderIndex,
  })

  revalidatePath("/admin")
  return { ok: true }
}

// إعادة ترتيب كل مواقع الخطة ترتيبًا ذكيًا حسب GPS من البداية للنهاية
export async function reorderSitesSmart(planNumber: number) {
  const rows = await db
    .select()
    .from(sites)
    .where(eq(sites.planNumber, planNumber))
    .orderBy(asc(sites.orderIndex))

  const ordered = smartOrder(rows)
  for (let i = 0; i < ordered.length; i++) {
    await db.update(sites).set({ orderIndex: i + 1 }).where(eq(sites.id, ordered[i].id))
  }
  revalidatePath("/admin")
  return { ok: true }
}

// تحديث إحداثيات موقع من رابط الخريطة (لتفعيل الترتيب الذكي)
export async function updateSiteCoords(siteId: number, mapUrl: string) {
  const coords = parseCoordsFromUrl(mapUrl)
  await db
    .update(sites)
    .set({ mapUrl, lat: coords?.lat ?? null, lng: coords?.lng ?? null })
    .where(eq(sites.id, siteId))
  revalidatePath("/admin")
  return { ok: true, coords }
}

export async function deleteSite(siteId: number) {
  await db.delete(sites).where(eq(sites.id, siteId))
  revalidatePath("/admin")
  return { ok: true }
}
