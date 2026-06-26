"use client"

import { useCallback, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { PlanData } from "./plan-step"
import type { VehicleData } from "./vehicle-step"
import { Speedometer } from "./speedometer"
import { FieldTable, type RowState } from "./field-table"
import { ViolationsBox, type ViolationItem } from "./violations-box"
import { PrayerBar } from "./prayer-bar"
import { SupervisorApproval } from "./supervisor-approval"
import { useFieldTracking } from "@/lib/use-field-tracking"
import { endMission, saveGeneralNotes } from "@/app/actions/missions"
import { logViolation } from "@/app/actions/violations"

export function MissionScreen({
  plan,
  missionId,
  employeeId,
  employeeName,
  vehicle,
  onExit,
}: {
  plan: NonNullable<PlanData>
  missionId: number
  employeeId: string
  employeeName: string
  vehicle?: VehicleData | null
  onExit: () => void
}) {
  const [rows, setRows] = useState<Record<string, RowState>>({})
  const [violations, setViolations] = useState<ViolationItem[]>([])
  const [generalNotes, setGeneralNotes] = useState("")
  const [finishing, setFinishing] = useState(false)

  const onViolation = useCallback((type: string, detail: string) => {
    setViolations((prev) => [{ type, detail, at: Date.now() }, ...prev])
  }, [])

  const { speed, roadLimit, position, gpsError } = useFieldTracking({
    missionId,
    planNumber: plan.plan.planNumber,
    employeeId,
    employeeName,
    sites: plan.sites,
    planSpeedLimit: plan.plan.speedLimit,
    enabled: true,
    onViolation,
  })

  const handleRowChange = useCallback((code: string, patch: Partial<RowState>) => {
    setRows((prev) => ({ ...prev, [code]: { ...prev[code], ...patch } }))
  }, [])

  const stats = useMemo(() => {
    const total = plan.sites.length
    const done = plan.sites.filter((s) => rows[s.code]?.status).length
    return { total, done, pending: total - done, pct: total ? Math.round((done / total) * 100) : 0 }
  }, [plan.sites, rows])

  async function finish() {
    setFinishing(true)
    // مخالفة لكل صف لم يُعبّأ
    const empties = plan.sites.filter((s) => !rows[s.code]?.status)
    for (const s of empties) {
      await logViolation({
        missionId,
        planNumber: plan.plan.planNumber,
        employeeId,
        employeeName,
        type: "not_arrived",
        detail: `لم يتم تعبئة صف الموقع ${s.code}`,
      })
    }
    await saveGeneralNotes(missionId, generalNotes)
    await endMission(missionId)
    onExit()
  }

  return (
    <div className="min-h-dvh bg-background pb-24">
      {/* الهيدر الكحلي */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-primary px-4 py-3 text-primary-foreground shadow-lg">
        <button
          onClick={finish}
          className="flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-medium transition active:scale-95"
        >
          <LogoutIcon />
          تسجيل خروج
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 text-center">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 text-sm font-extrabold">
            {plan.plan.planNumber}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold">{plan.plan.route}</p>
            <p className="text-[11px] opacity-80">نظام سحب الفلاشات والهاردسكات الميداني</p>
          </div>
        </div>
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white">
          <Image src="/tahakom-logo.jpg" alt="تحكم" fill className="object-contain p-0.5" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
        {/* شريط تذكير الصلاة */}
        <PrayerBar position={position} />

        {/* العداد + حد السرعة */}
        <Speedometer speed={speed} roadLimit={roadLimit ?? plan.plan.speedLimit} />
        {gpsError && (
          <p className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-center text-xs text-warning-foreground">
            {gpsError} — فعّل إذن الموقع لرصد السرعة وأوقات الصلاة
          </p>
        )}

        {/* بطاقات الإنجاز */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ProgressCard pct={stats.pct} done={stats.done} total={stats.total} />
          <StatCard label="الموقع الإجمالية" value={stats.total} tone="primary" />
          <StatCard label="تم الإنجاز" value={stats.done} tone="success" />
          <StatCard label="لم يتم الإنجاز" value={stats.pending} tone="destructive" />
        </div>

        {/* بيانات الموظف والسيارة */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-bold text-foreground">بيانات الموظف</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Field label="اسم الموظف" value={employeeName} />
            <Field label="الرقم الوظيفي" value={employeeId} />
            <Field
              label="رقم السيارة"
              value={vehicle ? `${vehicle.plateLetters} ${vehicle.plateNumbers}`.trim() || "—" : "—"}
            />
            <Field label="رقم اللابتوب" value={vehicle?.laptopNumber || "—"} />
            <Field label="عدد الفلاشات" value={vehicle?.flashCount ?? "—"} />
            <Field label="عدد الهاردسكات" value={vehicle?.hddCount ?? "—"} />
          </div>
        </section>

        {/* الجدول الميداني */}
        <section>
          <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-foreground">جدول المواقع</h2>
          <FieldTable
            sites={plan.sites}
            missionId={missionId}
            planNumber={plan.plan.planNumber}
            rows={rows}
            onRowChange={handleRowChange}
            routeName={plan.plan.route}
          />
          {/* مفتاح الحالات */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium">
            <span className="font-bold text-muted-foreground">حالة الإنجاز:</span>
            <Legend dot="bg-success" label="يعمل ولا توجد مخالفات" />
            <Legend dot="bg-warning" label="يعمل وتوجد مخالفات" />
            <Legend dot="bg-destructive" label="لا يعمل" />
          </div>
        </section>

        {/* مربع المخالفات */}
        <ViolationsBox items={violations} />

        {/* اعتماد المشرف + ملاحظات عامة */}
        <SupervisorApproval missionId={missionId} generalNotes={generalNotes} onNotesChange={setGeneralNotes} />
      </main>

      {/* شريط الأدوات السفلي */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl gap-2">
          <button
            onClick={finish}
            disabled={finishing}
            className="h-12 flex-1 rounded-xl bg-accent text-sm font-bold text-accent-foreground transition active:scale-[0.98] disabled:opacity-60"
          >
            {finishing ? "جارٍ الحفظ..." : "حفظ التقرير وإنهاء"}
          </button>
          <Link
            href={`/reports/${plan.plan.planNumber}`}
            className="flex h-12 items-center justify-center rounded-xl border border-border bg-secondary px-4 text-sm font-bold text-secondary-foreground transition active:scale-[0.98]"
          >
            السجلات
          </Link>
        </div>
      </div>
    </div>
  )
}

function ProgressCard({ pct, done, total }: { pct: number; done: number; total: number }) {
  const r = 26
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="relative h-16 w-16 shrink-0">
        <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="var(--color-secondary)" strokeWidth="7" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke="var(--color-success)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-foreground">
          {pct}%
        </span>
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground">تم إنجاز</p>
        <p className="text-lg font-extrabold tabular-nums text-foreground">
          {done} / {total}
        </p>
        <p className="text-[11px] text-muted-foreground">موقع</p>
      </div>
    </div>
  )
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "primary" | "success" | "destructive" }) {
  const toneMap = {
    primary: "text-primary",
    success: "text-success",
    destructive: "text-destructive",
  }
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card p-3 text-center">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className={`text-2xl font-extrabold tabular-nums ${toneMap[tone]}`}>{value}</span>
      <span className="text-[11px] text-muted-foreground">موقع</span>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-bold text-foreground">{value}</p>
    </div>
  )
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
