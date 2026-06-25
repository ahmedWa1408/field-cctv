"use client"

import { useState } from "react"
import { lookupEmployee, saveEmployee } from "@/app/actions/employees"
import type { PlanData } from "./plan-step"

export function EmployeeStep({
  plan,
  onBack,
  onStart,
}: {
  plan: NonNullable<PlanData>
  onBack: () => void
  onStart: (employeeId: string, name: string) => void
}) {
  const [employeeId, setEmployeeId] = useState("")
  const [name, setName] = useState("")
  const [checked, setChecked] = useState(false)
  const [knownName, setKnownName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function checkId() {
    const id = employeeId.trim()
    if (!id) return
    setLoading(true)
    const res = await lookupEmployee(id)
    setLoading(false)
    setChecked(true)
    if (res.found) {
      setKnownName(res.name)
      setName(res.name)
    } else {
      setKnownName(null)
    }
  }

  async function start(e: React.FormEvent) {
    e.preventDefault()
    const id = employeeId.trim()
    const nm = name.trim()
    if (!id) return setError("أدخل الرقم الوظيفي")
    if (!nm) return setError("أدخل اسمك")
    setLoading(true)
    await saveEmployee(id, nm)
    setLoading(false)
    onStart(id, nm)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 p-6">
      <div className="w-full animate-fade-up rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/30">
        <div className="mb-5 text-center">
          <span className="inline-block rounded-full bg-primary/15 px-4 py-1 text-sm font-bold text-primary">
            {plan.plan.route}
          </span>
          <p className="mt-2 text-xs text-muted-foreground">{plan.sites.length} موقع في هذا المسار</p>
        </div>

        <form onSubmit={start} className="flex flex-col gap-4">
          <div>
            <label htmlFor="empid" className="mb-2 block text-sm font-medium text-card-foreground">
              الرقم الوظيفي
            </label>
            <input
              id="empid"
              inputMode="numeric"
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value)
                setChecked(false)
                setKnownName(null)
              }}
              onBlur={checkId}
              placeholder="أدخل رقمك الوظيفي"
              className="h-14 w-full rounded-xl border border-input bg-background px-4 text-center text-xl font-bold text-foreground outline-none ring-primary/50 transition focus:border-primary focus:ring-2"
              autoFocus
            />
          </div>

          {checked && knownName ? (
            <div className="rounded-xl border border-success/40 bg-success/10 p-4 text-center">
              <p className="text-xs text-muted-foreground">مرحبًا بعودتك</p>
              <p className="text-xl font-bold text-success">{knownName}</p>
            </div>
          ) : checked ? (
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-card-foreground">
                الاسم (أول مرة فقط)
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اكتب اسمك الكامل"
                className="h-14 w-full rounded-xl border border-input bg-background px-4 text-center text-lg font-bold text-foreground outline-none ring-primary/50 transition focus:border-primary focus:ring-2"
                autoFocus
              />
            </div>
          ) : null}

          {error && <p className="text-center text-sm font-medium text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading || !checked}
            className="h-14 w-full rounded-xl bg-primary text-lg font-bold text-primary-foreground transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "جارٍ التحميل..." : "بدء المسار الميداني"}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="h-12 w-full rounded-xl border border-border bg-secondary text-sm font-medium text-secondary-foreground transition active:scale-[0.98]"
          >
            رجوع
          </button>
        </form>
      </div>
    </div>
  )
}
