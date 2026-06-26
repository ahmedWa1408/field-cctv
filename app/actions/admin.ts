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

// تحريك موقع لأعلى/أسفل بتبديل ترتيبه مع جاره
export async function moveSite(planNumber: number, siteId: number, direction: "up" | "down") {
  const rows = await db
    .select()
    .from(sites)
    .where(eq(sites.planNumber, planNumber))
    .orderBy(asc(sites.orderIndex))

  const idx = rows.findIndex((s) => s.id === siteId)
  if (idx === -1) return { ok: false }
  const swapWith = direction === "up" ? idx - 1 : idx + 1
  if (swapWith < 0 || swapWith >= rows.length) return { ok: true } // عند الطرف

  const a = rows[idx]
  const b = rows[swapWith]
  await db.update(sites).set({ orderIndex: b.orderIndex }).where(eq(sites.id, a.id))
  await db.update(sites).set({ orderIndex: a.orderIndex }).where(eq(sites.id, b.id))
  revalidatePath("/admin")
  return { ok: true }
}

// إعادة تسمية موقع
export async function renameSite(siteId: number, code: string) {
  const trimmed = code.trim()
  if (!trimmed) return { ok: false, error: "أدخل رمز الموقع" }
  await db.update(sites).set({ code: trimmed }).where(eq(sites.id, siteId))
  revalidatePath("/admin")
  return { ok: true }
}

// إعادة تسمية مسار وتعديل حد السرعة
export async function renamePlan(planNumber: number, route: string, speedLimit?: number) {
  const trimmed = route.trim()
  if (!trimmed) return { ok: false, error: "أدخل اسم المسار" }
  await db
    .update(plans)
    .set({ route: trimmed, ...(speedLimit ? { speedLimit } : {}) })
    .where(eq(plans.planNumber, planNumber))
  revalidatePath("/admin")
  return { ok: true }
}

// حذف مسار كامل بكل مواقعه
export async function deletePlan(planNumber: number) {
  await db.delete(sites).where(eq(sites.planNumber, planNumber))
  await db.delete(plans).where(eq(plans.planNumber, planNumber))
  revalidatePath("/admin")
  return { ok: true }
}

// لصق مسار كامل: يحلّل النص (رمز + رابط لكل موقع) وينشئ مسارًا جديدًا مرتبًا ذكيًا
export async function addPlanFromPaste(input: { route: string; text: string; speedLimit?: number }) {
  const route = input.route.trim()
  if (!route) return { ok: false, error: "أدخل اسم المسار" }
  const parsed = parsePastedSites(input.text)
  if (!parsed.length) return { ok: false, error: "تعذّر استخراج أي موقع من النص" }

  const maxRow = await db.select({ m: max(plans.planNumber) }).from(plans)
  const nextNumber = (maxRow[0]?.m ?? 0) + 1

  await db.insert(plans).values({ planNumber: nextNumber, route, speedLimit: input.speedLimit ?? 120 })

  // رتّب ذكيًا حسب الإحداثيات المتوفرة
  const ordered = smartOrder(
    parsed.map((p) => ({ ...p, lat: p.lat ?? null, lng: p.lng ?? null })) as never[],
  ) as Array<{ code: string; mapUrl?: string; lat: number | null; lng: number | null }>

  await db.insert(sites).values(
    ordered.map((s, i) => ({
      planNumber: nextNumber,
      code: s.code,
      storage: null,
      mapUrl: s.mapUrl ?? null,
      lat: s.lat,
      lng: s.lng,
      orderIndex: i + 1,
    })),
  )

  revalidatePath("/admin")
  return { ok: true, planNumber: nextNumber, count: ordered.length }
}

// محلّل نص ملصوق: يلتقط أسطر الرموز وروابط الخرائط التي تليها
function parsePastedSites(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  const result: Array<{ code: string; mapUrl?: string; lat: number | null; lng: number | null }> = []
  let pendingCode: string | null = null

  const isUrl = (l: string) => /https?:\/\//i.test(l)

  for (const line of lines) {
    if (isUrl(line)) {
      const coords = parseCoordsFromUrl(line)
      if (pendingCode) {
        result.push({ code: pendingCode, mapUrl: line, lat: coords?.lat ?? null, lng: coords?.lng ?? null })
        pendingCode = null
      } else if (result.length && !result[result.length - 1].mapUrl) {
        result[result.length - 1].mapUrl = line
        result[result.length - 1].lat = coords?.lat ?? null
        result[result.length - 1].lng = coords?.lng ?? null
      }
    } else {
      // سطر يحوي رمزًا (احتمالًا مع وصف). نأخذ أول رمز معقول
      const clean = line.replace(/[🚨❌⚪️✅👇🏻*]/gu, "").trim()
      if (!clean) continue
      if (pendingCode) {
        // الرمز السابق لم يجد رابطًا — أضِفه بدون إحداثيات
        result.push({ code: pendingCode, lat: null, lng: null })
      }
      pendingCode = clean.slice(0, 60)
    }
  }
  if (pendingCode) result.push({ code: pendingCode, lat: null, lng: null })
  return result
}
