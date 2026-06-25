"use server"

import { db } from "@/lib/db"
import { employees } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

// جلب اسم الموظف حسب الرقم الوظيفي (يُملأ تلقائيًا في المرات القادمة)
export async function lookupEmployee(employeeId: string) {
  const id = employeeId.trim()
  if (!id) return { found: false as const }
  const rows = await db.select().from(employees).where(eq(employees.employeeId, id)).limit(1)
  if (rows.length) return { found: true as const, name: rows[0].name }
  return { found: false as const }
}

// تسجيل/تحديث اسم الموظف (أول مرة)
export async function saveEmployee(employeeId: string, name: string) {
  const id = employeeId.trim()
  const nm = name.trim()
  if (!id || !nm) return { ok: false, error: "الرجاء إدخال الرقم الوظيفي والاسم" }

  const existing = await db.select().from(employees).where(eq(employees.employeeId, id)).limit(1)
  if (existing.length) {
    await db.update(employees).set({ name: nm }).where(eq(employees.employeeId, id))
  } else {
    await db.insert(employees).values({ employeeId: id, name: nm })
  }
  return { ok: true, name: nm }
}
