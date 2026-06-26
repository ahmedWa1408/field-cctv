"use client"

import { useRef, useState } from "react"
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
  // ثلاث خانات منفصلة لحروف اللوحة
  const [letters, setLetters] = useState<string[]>(["", "", ""])
  const [plateNumbers, setPlateNumbers] = useState("")
  const [laptopNumber, setLaptopNumber] = useState("")
  const [flashCount, setFlashCount] = useState("")
  const [hddCount, setHddCount] = useState("")
  const [loading, setLoading] = useState(false)
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  function setLetter(i: number, v: string) {
    // حرف واحد فقط لكل خانة، مع التقدّم التلقائي
    const ch = v.replace(/[0-9\s]/g, "").slice(-1)
    const next = [...letters]
    next[i] = ch
    setLetters(next)
    if (ch && i < 2) refs[i + 1].current?.focus()
  }

  function onLetterKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !letters[i] && i > 0) refs[i - 1].current?.focus()
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    onStart({
      plateLetters: letters.filter(Boolean).join(" ").trim(),
      plateNumbers: plateNumbers.trim(),
      laptopNumber: laptopNumber.trim(),
      flashCount: parseInt(flashCount, 10) || 0,
      hddCount: parseInt(hddCount, 10) || 0,
    })
  }

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-0 h-56 w-56 rounded-full bg-brand-teal/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-brand-plum/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full animate-fade-up rounded-2xl border border-brand-plum/15 bg-card p-6 shadow-xl shadow-brand-plum/10">
        <div className="mb-5 text-center">
          <span className="tahakom-gradient inline-block rounded-full px-4 py-1 text-sm font-bold text-white">
            {plan.plan.route}
          </span>
          <p className="mt-2 text-xs text-muted-foreground">{employeeName} · بيانات السيارة والمعدات</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {/* رقم السيارة: 3 خانات حروف + خانة أرقام */}
          <div>
            <label className="mb-2 block text-sm font-medium text-card-foreground">رقم السيارة</label>
            <div className="flex items-center gap-2" dir="rtl">
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <input
                    key={i}
                    ref={refs[i]}
                    value={letters[i]}
                    onChange={(e) => setLetter(i, e.target.value)}
                    onKeyDown={(e) => onLetterKey(i, e)}
                    placeholder={["أ", "ب", "د"][i]}
                    maxLength={1}
                    className="h-16 w-14 rounded-xl border-2 border-brand-plum/25 bg-background text-center text-2xl font-extrabold text-primary outline-none ring-brand-teal/40 transition focus:border-brand-teal focus:ring-2"
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <div className="mx-1 h-10 w-px bg-border" />
              <input
                value={plateNumbers}
                onChange={(e) => setPlateNumbers(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                placeholder="1234"
                maxLength={4}
                className="tahakom-number h-16 flex-1 rounded-xl border-2 border-brand-teal/25 bg-background px-3 text-center text-2xl font-extrabold tracking-widest text-accent outline-none ring-brand-plum/40 transition focus:border-brand-plum focus:ring-2"
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
              className="h-14 w-full rounded-xl border border-input bg-background px-4 text-center text-base font-bold text-foreground outline-none ring-brand-teal/40 transition focus:border-brand-teal focus:ring-2"
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
                className="tahakom-number h-14 w-full rounded-xl border border-input bg-background px-3 text-center text-lg font-bold text-foreground outline-none ring-brand-teal/40 transition focus:border-brand-teal focus:ring-2"
              />
            </div>
            <div className="w-1/2">
              <label className="mb-2 block text-sm font-medium text-card-foreground">عدد الهاردسكات</label>
              <input
                value={hddCount}
                onChange={(e) => setHddCount(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="3"
                className="tahakom-number h-14 w-full rounded-xl border border-input bg-background px-3 text-center text-lg font-bold text-foreground outline-none ring-brand-teal/40 transition focus:border-brand-teal focus:ring-2"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="tahakom-gradient relative mt-1 h-14 w-full overflow-hidden rounded-xl text-lg font-bold text-white shadow-lg shadow-brand-plum/25 transition active:scale-[0.98] disabled:opacity-60"
          >
            <span className="relative z-10">{loading ? "جارٍ بدء المهمة..." : "بدء المسار الميداني"}</span>
            <span className="absolute inset-y-0 left-0 z-0 w-1/3 animate-shine bg-white/25 blur-md" />
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
