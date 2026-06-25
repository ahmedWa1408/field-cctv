"use server"

import { db } from "@/lib/db"
import { plans, sites } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm"

// جلب خطة حسب رقمها + مواقعها مرتبة
export async function getPlan(planNumber: number) {
  const planRows = await db.select().from(plans).where(eq(plans.planNumber, planNumber)).limit(1)
  if (!planRows.length) return null
  const siteRows = await db
    .select()
    .from(sites)
    .where(eq(sites.planNumber, planNumber))
    .orderBy(asc(sites.orderIndex))
  return { plan: planRows[0], sites: siteRows }
}

// جلب كل الخطط مرتبة برقم الخطة
export async function getAllPlans() {
  return db.select().from(plans).orderBy(asc(plans.planNumber))
}
