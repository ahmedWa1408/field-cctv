"use client"

import { useState } from "react"
import { getPlan } from "@/app/actions/plans"

export type PlanData = Awaited<ReturnType<typeof getPlan>>

export function PlanStep({ onFound }: { onFound: (data: NonNullable<PlanData>) => void }) {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const num = parseInt(value.trim(), 10)
    if (!num) {
      setError("الرجاء إدخال رقم خطة صحيح")
      return
    }
    setLoading(true)
    setError("")
    const data = await getPlan(num)
    setLoading(false)
    if (!data) {
      setError("لا توجد خطة بهذا الرقم")
      return
    }
    onFound(data)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-8 p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="animate-glow text-5xl font-extrabold text-primary">تحكم</h1>
        <p className="text-sm text-muted-foreground">أدخل رقم الخطة لبدء المسار الميداني</p>
      </div>

      <form onSubmit={submit} className="w-full animate-fade-up">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/30">
          <label htmlFor="plan" className="mb-2 block text-sm font-medium text-card-foreground">
            رقم الخطة
          </label>
          <input
            id="plan"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="مثال: 1"
            className="h-14 w-full rounded-xl border border-input bg-background px-4 text-center text-2xl font-bold text-foreground outline-none ring-primary/50 transition focus:border-primary focus:ring-2"
            autoFocus
          />
          {error && <p className="mt-3 text-center text-sm font-medium text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 h-14 w-full rounded-xl bg-primary text-lg font-bold text-primary-foreground transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "جارٍ البحث..." : "متابعة"}
          </button>
        </div>
      </form>
    </div>
  )
}
