"use client"

import { useState } from "react"
import Link from "next/link"
import { verifyAdmin, addPlan } from "@/app/actions/admin"
import { AdminPlanCard } from "./admin-plan-card"

type Plan = {
  id: number
  planNumber: number
  route: string
  speedLimit: number | null
}

export function AdminPanel({ initialPlans }: { initialPlans: Plan[] }) {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState("")
  const [err, setErr] = useState("")
  const [plans, setPlans] = useState<Plan[]>(initialPlans)

  // نموذج إضافة خطة
  const [newRoute, setNewRoute] = useState("")
  const [copyFrom, setCopyFrom] = useState("")
  const [adding, setAdding] = useState(false)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    const res = await verifyAdmin(pass)
    if (res.ok) {
      setAuthed(true)
      setErr("")
    } else {
      setErr("رمز الدخول غير صحيح")
    }
  }

  async function createPlan(e: React.FormEvent) {
    e.preventDefault()
    if (!newRoute.trim()) return
    setAdding(true)
    const res = await addPlan({
      route: newRoute,
      copyFromPlan: copyFrom ? parseInt(copyFrom, 10) : undefined,
    })
    setAdding(false)
    if (res.ok && res.planNumber) {
      setPlans((p) => [
        ...p,
        { id: Date.now(), planNumber: res.planNumber!, route: newRoute.trim(), speedLimit: 120 },
      ].sort((a, b) => a.planNumber - b.planNumber))
      setNewRoute("")
      setCopyFrom("")
    }
  }

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center gap-6 p-6">
        <h1 className="animate-glow text-4xl font-extrabold text-primary">لوحة الإدارة</h1>
        <form onSubmit={login} className="w-full rounded-2xl border border-border bg-card p-6">
          <label htmlFor="pass" className="mb-2 block text-sm font-medium">
            رمز الدخول
          </label>
          <input
            id="pass"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="h-14 w-full rounded-xl border border-input bg-background px-4 text-center text-xl font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
            autoFocus
          />
          {err && <p className="mt-3 text-center text-sm font-medium text-destructive">{err}</p>}
          <button className="mt-5 h-14 w-full rounded-xl bg-primary text-lg font-bold text-primary-foreground active:scale-[0.98]">
            دخول
          </button>
        </form>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          العودة للرئيسية
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-4 pb-16">
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-primary">لوحة الإدارة</h1>
        <Link
          href="/"
          className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          الرئيسية
        </Link>
      </header>

      {/* إضافة خطة جديدة */}
      <form onSubmit={createPlan} className="mb-6 rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-bold text-foreground">إضافة خطة جديدة</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={newRoute}
            onChange={(e) => setNewRoute(e.target.value)}
            placeholder="اسم المسار الجديد"
            className="h-12 flex-1 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
          />
          <select
            value={copyFrom}
            onChange={(e) => setCopyFrom(e.target.value)}
            className="h-12 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="">بدون نسخ مواقع</option>
            {plans.map((p) => (
              <option key={p.id} value={p.planNumber}>
                نسخ مواقع خطة {p.planNumber}
              </option>
            ))}
          </select>
          <button
            disabled={adding}
            className="h-12 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground active:scale-95 disabled:opacity-60"
          >
            {adding ? "..." : "إضافة"}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          تُضاف الخطة برقم تلقائي وتُرتّب تلقائيًا. يمكنك نسخ مواقع خطة موجودة.
        </p>
      </form>

      {/* قائمة الخطط */}
      <div className="flex flex-col gap-4">
        {plans.map((plan) => (
          <AdminPlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  )
}
