"use client"

import { useState } from "react"
import { lookupEmployee, saveEmployee } from "@/app/actions/employees"
import { TahakomLogo } from "./tahakom-logo"

export function IdStep({ onNext }: { onNext: (employeeId: string, name: string) => void }) {
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

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const id = employeeId.trim()
    const nm = name.trim()
    if (!id) return setError("أدخل الرقم الوظيفي")
    if (!nm) return setError("أدخل اسمك")
    setLoading(true)
    await saveEmployee(id, nm)
    setLoading(false)
    onNext(id, nm)
  }

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 overflow-hidden p-6">
      {/* توهج خلفي فخم بألوان الهوية */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 right-0 h-64 w-64 rounded-full bg-brand-plum/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-brand-teal/15 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-3 text-center">
        <div className="animate-brand-glow">
          <TahakomLogo size={120} showText={false} />
        </div>
        <h1 className="text-2xl font-extrabold tahakom-gradient-text">تسجيل الدخول</h1>
        <p className="text-sm text-muted-foreground">أدخل رقمك الوظيفي للمتابعة</p>
      </div>

      <form
        onSubmit={submit}
        className="relative z-10 w-full animate-fade-up rounded-2xl border border-brand-plum/15 bg-card p-6 shadow-xl shadow-brand-plum/10"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="empid" className="mb-2 block text-sm font-medium text-card-foreground">
              الرقم الوظيفي (ID)
            </label>
            <input
              id="empid"
              inputMode="numeric"
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value)
                setChecked(false)
                setKnownName(null)
                setError("")
              }}
              onBlur={checkId}
              placeholder="أدخل رقمك الوظيفي"
              className="tahakom-number h-16 w-full rounded-xl border-2 border-brand-plum/25 bg-background px-4 text-center text-3xl font-extrabold tracking-widest text-primary outline-none ring-brand-teal/40 transition focus:border-brand-teal focus:ring-2"
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
                className="h-14 w-full rounded-xl border border-input bg-background px-4 text-center text-lg font-bold text-foreground outline-none ring-primary/40 transition focus:border-primary focus:ring-2"
                autoFocus
              />
            </div>
          ) : null}

          {error && <p className="text-center text-sm font-medium text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading || !checked}
            className="tahakom-gradient relative h-14 w-full overflow-hidden rounded-xl text-lg font-bold text-white shadow-lg shadow-brand-plum/25 transition active:scale-[0.98] disabled:opacity-50"
          >
            <span className="relative z-10">{loading ? "جارٍ التحقق..." : "متابعة"}</span>
            {checked && <span className="absolute inset-y-0 left-0 z-0 w-1/3 animate-shine bg-white/25 blur-md" />}
          </button>
        </div>
      </form>
    </div>
  )
}
