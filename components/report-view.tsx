"use client"

import { useMemo, useState } from "react"

const VIO_LABELS: Record<string, string> = {
  overspeed: "سرعة زائدة",
  not_arrived: "عدم الوصول للموقع",
  exit_system: "الخروج من النظام",
  tampering: "محاولة العبث بالنظام",
  off_route_long: "تواجد خارج المسار +ساعتين",
}

type Violation = {
  id: number
  employeeName: string
  employeeId: string
  type: string
  detail: string | null
  createdAt: string | Date
}
type Fault = {
  id: number
  siteCode: string
  faultNote: string | null
  updatedAt: string | Date
}
type Mission = {
  id: number
  employeeName: string
  employeeId: string
  startedAt: string | Date
  endedAt: string | Date | null
}

function fmt(d: string | Date) {
  return new Date(d).toLocaleString("ar-SA", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

export function ReportView({
  violations,
  faults,
  missions,
}: {
  violations: Violation[]
  faults: Fault[]
  missions: Mission[]
}) {
  const [tab, setTab] = useState<"violations" | "faults" | "missions">("violations")
  const [emp, setEmp] = useState("")

  const employees = useMemo(
    () => Array.from(new Set(violations.map((v) => v.employeeName))),
    [violations],
  )

  const filteredVios = emp ? violations.filter((v) => v.employeeName === emp) : violations

  return (
    <div className="flex flex-col gap-4">
      {/* بطاقات ملخصة */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="مخالفات" value={violations.length} tone="destructive" />
        <Stat label="أعطال" value={faults.length} tone="warning" />
        <Stat label="مهام" value={missions.length} tone="primary" />
      </div>

      {/* التبويبات */}
      <div className="flex gap-2 rounded-xl border border-border bg-card p-1.5">
        {[
          { k: "violations", l: "المخالفات" },
          { k: "faults", l: "الأعطال" },
          { k: "missions", l: "المهام" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as typeof tab)}
            className={`h-10 flex-1 rounded-lg text-sm font-bold transition ${
              tab === t.k ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {tab === "violations" && (
        <>
          {employees.length > 0 && (
            <select
              value={emp}
              onChange={(e) => setEmp(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-primary"
            >
              <option value="">كل الموظفين</option>
              {employees.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          )}
          {filteredVios.length === 0 ? (
            <Empty text="لا توجد مخالفات مسجّلة" />
          ) : (
            <ul className="flex flex-col gap-2">
              {filteredVios.map((v) => (
                <li key={v.id} className="rounded-xl border border-destructive/30 bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-bold text-destructive">
                      {VIO_LABELS[v.type] ?? v.type}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{fmt(v.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-foreground">{v.employeeName}</p>
                  {v.detail && <p className="text-xs text-muted-foreground">{v.detail}</p>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {tab === "faults" &&
        (faults.length === 0 ? (
          <Empty text="لا توجد أعطال مسجّلة" />
        ) : (
          <ul className="flex flex-col gap-2">
            {faults.map((f) => (
              <li key={f.id} className="rounded-xl border border-warning/30 bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-foreground">الموقع {f.siteCode}</p>
                  <span className="text-[11px] text-muted-foreground">{fmt(f.updatedAt)}</span>
                </div>
                <p className="text-xs text-warning">لا يعمل</p>
                {f.faultNote && <p className="text-xs text-muted-foreground">{f.faultNote}</p>}
              </li>
            ))}
          </ul>
        ))}

      {tab === "missions" &&
        (missions.length === 0 ? (
          <Empty text="لا توجد مهام مسجّلة" />
        ) : (
          <ul className="flex flex-col gap-2">
            {missions.map((m) => (
              <li key={m.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-foreground">{m.employeeName}</p>
                  <span className="text-[11px] text-muted-foreground">
                    {m.endedAt ? "منتهية" : "نشطة"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  البداية: {fmt(m.startedAt)}
                  {m.endedAt ? ` · النهاية: ${fmt(m.endedAt)}` : ""}
                </p>
              </li>
            ))}
          </ul>
        ))}
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  const color =
    tone === "destructive" ? "text-destructive" : tone === "warning" ? "text-warning" : "text-primary"
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-4">
      <span className={`text-3xl font-extrabold tabular-nums ${color}`}>{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  )
}
