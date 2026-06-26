"use server"

import { db } from "@/lib/db"
import { employees } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type Role = "field" | "supervisor" | "manager"

export const ROLE_LABELS: Record<Role, string> = {
  field: "موظف ميداني",
  supervisor: "مشرف",
  manager: "مدير",
}

// جلب كل المستخدمين
export async function getUsers() {
  return db.select().from(employees).orderBy(asc(employees.name))
}

// جلب المشرفين والمدراء المعتمدين (لاعتماد التقارير)
export async function getSupervisors() {
  const rows = await db.select().from(employees).orderBy(asc(employees.name))
  return rows.filter((r) => r.role === "supervisor" || r.role === "manager")
}

// إضافة/تحديث مستخدم
export async function upsertUser(input: { employeeId: string; name: string; role: Role }) {
  const id = input.employeeId.trim()
  const name = input.name.trim()
  if (!id || !name) return { ok: false, error: "أدخل الرقم الوظيفي والاسم" }

  const existing = await db.select().from(employees).where(eq(employees.employeeId, id)).limit(1)
  if (existing.length) {
    await db.update(employees).set({ name, role: input.role }).where(eq(employees.employeeId, id))
  } else {
    await db.insert(employees).values({ employeeId: id, name, role: input.role })
  }
  revalidatePath("/admin")
  return { ok: true }
}

// تغيير دور مستخدم
export async function setUserRole(employeeId: string, role: Role) {
  await db.update(employees).set({ role }).where(eq(employees.employeeId, employeeId))
  revalidatePath("/admin")
  return { ok: true }
}

// حذف مستخدم
export async function deleteUser(employeeId: string) {
  await db.delete(employees).where(eq(employees.employeeId, employeeId))
  revalidatePath("/admin")
  return { ok: true }
}

// التحقق من صلاحية اعتماد المشرف
export async function verifySupervisor(supervisorId: string) {
  const rows = await db.select().from(employees).where(eq(employees.employeeId, supervisorId.trim())).limit(1)
  if (!rows.length) return { ok: false, error: "الرقم الوظيفي غير مسجّل" }
  const u = rows[0]
  if (u.role !== "supervisor" && u.role !== "manager") {
    return { ok: false, error: "هذا المستخدم ليس له صلاحية اعتماد" }
  }
  return { ok: true, name: u.name, role: u.role }
}
