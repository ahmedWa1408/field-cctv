"use client"

import { useState } from "react"
import type { PlanData } from "./plan-step"

export type VehicleData = {
  plateLetters: string
  plateNumbers: string
  laptopNumber: string
  flashCount: number
  hddCount: number
}

export function VehicleStep({
  plan,
  employeeName,
  onBack,
  onStart,
}: {
  plan: NonNullable<PlanData>
  employeeName: string
  onBack: () => void
  onStart: (vehicle: VehicleData) => void
}) {
  const [plateLetters, setPlateLetters] = useState("")
  const [plateNumbers, setPlateNumbers] = useState("")
  const [laptopNumber, setLaptopNumber] = useState("")
  const [flashCount, setFlashCount] = useState("")
  const [hddCount, setHddCount] = useState("")
  const [loading, setLoading] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    onStart({
      plateLetters: plateLetters.trim(),
      plateNumbers: plateNumbers.trim(),
      laptopNumber: laptopNumber.trim(),
      flashCount: parseInt(flashCount, 10) || 0,
      hddCount: parseInt(hddCount, 10) || 0,
    })
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 p-6">
      <div className="w-full animate-fade-up rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/10">
        <div className="mb-5 text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-bold text-primary">
            {plan.plan.route}
          </span>
          <p className="mt-2 text-xs text-muted-foreground">{employeeName} · بيانات السيارة والمعدات</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {/* رقم السيارة: حروف + أرقام */}
          <div>
            <label className="mb-2 block text-sm font-medium text-card-foreground">رقم السيارة</label>
            <div className="flex gap-2">
              <input
                value={plateLetters}
                onChange={(e) => setPlateLetters(e.target.value.slice(0, 3))}
                placeholder="أ ب د"
                maxLength={3}
                className="h-14 w-1/2 rounded-xl border border-input bg-background px-3 text-center text-lg font-bold text-foreground outline-none ring-primary/40 transition focus:border-primary focus:ring-2"
                autoFocus
              />
              <input
                value={plateNumbers}
                onChange={(e) => setPlateNumbers(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                placeholder="1234"
                maxLength={4}
                className="h-14 w-1/2 rounded-xl border border-input bg-background px-3 text-center text-lg font-bold text-foreground outline-none ring-primary/40 transition focus:border-primary focus:ring-2"
              />
            </div>
          </div>

          {/* رقم اللابتوب */}
          <div>
            <label className="mb-2 block text-sm font-medium text-card-foreground">رقم اللابتوب</label>
            <input
              value={laptopNumber}
              onChange={(e) => setLaptopNumber(e.target.value)}
              placeholder="LT-2023-045"
              className="h-14 w-full rounded-xl border border-input bg-background px-4 text-center text-base font-bold text-foreground outline-none ring-primary/40 transition focus:border-primary focus:ring-2"
            />
          </div>

          {/* عدد الفلاشات والهاردسكات */}
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="mb-2 block text-sm font-medium text-card-foreground">عدد الفلاشات</label>
              <input
                value={flashCount}
                onChange={(e) => setFlashCount(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="5"
                className="h-14 w-full rounded-xl border border-input bg-background px-3 text-center text-lg font-bold text-foreground outline-none ring-primary/40 transition focus:border-primary focus:ring-2"
              />
            </div>
            <div className="w-1/2">
              <label className="mb-2 block text-sm font-medium text-card-foreground">عدد الهاردسكات</label>
              <input
                value={hddCount}
                onChange={(e) => setHddCount(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="3"
                className="h-14 w-full rounded-xl border border-input bg-background px-3 text-center text-lg font-bold text-foreground outline-none ring-primary/40 transition focus:border-primary focus:ring-2"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 h-14 w-full rounded-xl bg-primary text-lg font-bold text-primary-foreground transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "جارٍ بدء المهمة..." : "بدء المسار الميداني"}
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
