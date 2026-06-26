"use server"

import { db } from "@/lib/db"
import { appSettings } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// جلب إعدادات النظام (موقع الإدارة ونطاقات السماح)
export async function getSettings() {
  const rows = await db.select().from(appSettings).where(eq(appSettings.id, 1)).limit(1)
  if (!rows.length) {
    const [created] = await db
      .insert(appSettings)
      .values({ id: 1, hqRadiusKm: 2, siteRadiusKm: 3 })
      .returning()
    return created
  }
  return rows[0]
}

// تحديث موقع الإدارة والنطاقات
export async function saveSettings(input: {
  hqLat?: number | null
  hqLng?: number | null
  hqRadiusKm?: number
  siteRadiusKm?: number
}) {
  await getSettings() // يضمن وجود السطر
  await db
    .update(appSettings)
    .set({
      hqLat: input.hqLat,
      hqLng: input.hqLng,
      hqRadiusKm: input.hqRadiusKm ?? 2,
      siteRadiusKm: input.siteRadiusKm ?? 3,
      updatedAt: new Date(),
    })
    .where(eq(appSettings.id, 1))
  revalidatePath("/admin")
  return { ok: true }
}
