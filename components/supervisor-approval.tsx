"use client"

import { useState } from "react"
import { approveMission } from "@/app/actions/missions"

export function SupervisorApproval({
  missionId,
  generalNotes,
  onNotesChange,
}: {
  missionId: number
  generalNotes: string
  onNotesChange: (v: string) => void
}) {
  const [name, setName] = useState("")
  const [id, setId] = useState("")
  const [approved, setApproved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function approve() {
    if (!name.trim() || !id.trim()) {
      setError("أدخل اسم المشرف ورقمه الوظيفي")
      return
    }
    setLoading(true)
    setError("")
    const res = await approveMission({
      missionId,
      supervisorName: name,
      supervisorId: id,
      generalNotes,
    })
    setLoading(false)
    if (res.ok) setApproved(true)
    else setError(res.error || "تعذّر الاعتماد")
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">اعتماد المشرف</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* اعتماد المشرف */}
        <div className="flex flex-col gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم المشرف"
            disabled={approved}
            className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary disabled:opacity-70"
          />
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            inputMode="numeric"
            placeholder="الرقم الوظيفي للمشرف (ID)"
            disabled={approved}
            className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary disabled:opacity-70"
          />
          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
          <button
            onClick={approve}
            disabled={loading || approved}
            className={`h-11 rounded-xl text-sm font-bold transition active:scale-95 ${
              approved
                ? "bg-success text-success-foreground"
                : "bg-accent text-accent-foreground disabled:opacity-60"
            }`}
          >
            {approved ? "تم الاعتماد" : loading ? "جارٍ الاعتماد..." : "اعتماد التقرير"}
          </button>
        </div>

        {/* ملاحظات عامة */}
        <div>
          <textarea
            value={generalNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="ملاحظات عامة على المسار..."
            rows={4}
            className="h-full min-h-[7rem] w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  )
}
