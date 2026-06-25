"use client"

import { useCallback, useState } from "react"
import type { PlanData } from "./plan-step"
import { Speedometer } from "./speedometer"
import { FieldTable } from "./field-table"
import { ViolationsBox, type ViolationItem } from "./violations-box"
import { useFieldTracking } from "@/lib/use-field-tracking"
import { endMission } from "@/app/actions/missions"
import { logViolation } from "@/app/actions/violations"

export function MissionScreen({
  plan,
  missionId,
  employeeId,
  employeeName,
  onExit,
}: {
  plan: NonNullable<PlanData>
  missionId: number
  employeeId: string
  employeeName: string
  onExit: () => void
}) {
  const [statuses, setStatuses] = useState<Record<string, string>>({})
  const [violations, setViolations] = useState<ViolationItem[]>([])

  const onViolation = useCallback((type: string, detail: string) => {
    setViolations((prev) => [{ type, detail, at: Date.now() }, ...prev])
  }, [])

  const { speed, roadLimit, gpsError } = useFieldTracking({
    missionId,
    planNumber: plan.plan.planNumber,
    employeeId,
    employeeName,
    sites: plan.sites,
    planSpeedLimit: plan.plan.speedLimit,
    enabled: true,
    onViolation,
  })

  function handleStatusChange(code: string, status: string) {
    setStatuses((prev) => ({ ...prev, [code]: status }))
  }

  async function finish() {
    // تسجيل عدم الوصول للمواقع غير المزارة
    const notVisited = plan.sites.filter((s) => !statuses[s.code])
    for (const s of notVisited) {
      await logViolation({
        missionId,
        planNumber: plan.plan.planNumber,
        employeeId,
        employeeName,
        type: "not_arrived",
        detail: `لم يتم الوصول للموقع ${s.code}`,
      })
    }
    await endMission(missionId)
    onExit()
  }

  const done = plan.sites.filter((s) => statuses[s.code]).length

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-4 p-4 pb-28">
      {/* رأس الصفحة */}
      <header className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-primary">{plan.plan.route}</p>
          <p className="text-xs text-muted-foreground">
            {employeeName} · {done}/{plan.sites.length} موقع
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
          خطة {plan.plan.planNumber}
        </span>
      </header>

      {/* العداد */}
      <Speedometer speed={speed} roadLimit={roadLimit ?? plan.plan.speedLimit} />
      {gpsError && (
        <p className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-center text-xs text-warning">
          {gpsError} — فعّل إذن الموقع لرصد السرعة بدقة
        </p>
      )}

      {/* الجدول الميداني */}
      <FieldTable
        sites={plan.sites}
        missionId={missionId}
        planNumber={plan.plan.planNumber}
        statuses={statuses}
        onStatusChange={handleStatusChange}
      />

      {/* مربع المخالفات */}
      <ViolationsBox items={violations} />

      {/* شريط سفلي ثابت */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl gap-3">
          <button
            onClick={finish}
            className="h-12 flex-1 rounded-xl bg-primary text-base font-bold text-primary-foreground transition active:scale-[0.98]"
          >
            إنهاء المسار
          </button>
        </div>
      </div>
    </div>
  )
}
