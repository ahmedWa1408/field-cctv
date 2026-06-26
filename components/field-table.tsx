"use client"

import { useState } from "react"
import { updateSiteStatus } from "@/app/actions/missions"

type Site = {
  id: number
  code: string
  storage: string | null
  mapUrl: string | null
}

export type RowState = {
  status?: string
  storage?: string
  xmlStatus?: string
  faultNote?: string
  monitorStart?: string // datetime-local
  monitorEnd?: string
  photoCount?: number
}

const STATUS_OPTIONS = [
  { value: "working_clean", label: "يعمل ولا توجد مخالفات", short: "يعمل", dot: "bg-success", ring: "ring-success" },
  { value: "working_violation", label: "يعمل وتوجد مخالفات", short: "مخالفة", dot: "bg-warning", ring: "ring-warning" },
  { value: "not_working", label: "لا يعمل", short: "لا يعمل", dot: "bg-destructive", ring: "ring-destructive" },
]

const STORAGE_OPTIONS = ["فلاش", "هاردسك"]
const XML_OPTIONS = ["يوجد", "لا يوجد"]

function fmtDuration(start?: string, end?: string) {
  if (!start || !end) return "—"
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (isNaN(s) || isNaN(e) || e <= s) return "—"
  const mins = Math.round((e - s) / 60000)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h ? `${h} س ${m ? m + " د" : ""}`.trim() : `${m} د`
}

export function FieldTable({
  sites,
  missionId,
  planNumber,
  rows,
  onRowChange,
  routeName,
}: {
  sites: Site[]
  missionId: number
  planNumber: number
  rows: Record<string, RowState>
  onRowChange: (code: string, patch: Partial<RowState>) => void
  routeName: string
}) {
  const [copied, setCopied] = useState<string | null>(null)

  function persist(code: string, patch: Partial<RowState>) {
    onRowChange(code, patch)
    const r = { ...rows[code], ...patch }
    updateSiteStatus({
      missionId,
      planNumber,
      siteCode: code,
      status: r.status,
      storage: r.storage,
      xmlStatus: r.xmlStatus,
      faultNote: r.faultNote,
      monitorStartAt: r.monitorStart ? r.monitorStart : undefined,
      monitorEndAt: r.monitorEnd ? r.monitorEnd : undefined,
    })
  }

  async function handleCamera(site: Site) {
    const r = rows[site.code] || {}
    const statusLabel = STATUS_OPTIONS.find((s) => s.value === r.status)?.label ?? "غير محدد"
    // العلامة المائية: اسم الموقع + اسم المسار + نوع العطل
    const watermark = [site.code, routeName, r.faultNote || statusLabel].filter(Boolean).join(" | ")
    try {
      await navigator.clipboard.writeText(watermark)
      setCopied(site.code)
      setTimeout(() => setCopied((c) => (c === site.code ? null : c)), 1800)
    } catch {}
    persist(site.code, { photoCount: (r.photoCount || 0) + 1 })
    openTimestampCamera()
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[920px] border-collapse text-right text-sm">
        <thead>
          <tr className="bg-primary text-primary-foreground">
            <Th>#</Th>
            <Th>رمز الموقع</Th>
            <Th>نوع الوحدة</Th>
            <Th>الموقع</Th>
            <Th>XML</Th>
            <Th>بداية الرصد</Th>
            <Th>نهاية الرصد</Th>
            <Th>مدة الرصد</Th>
            <Th>صور العطل</Th>
            <Th>ملاحظات</Th>
            <Th>الحالة</Th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site, idx) => {
            const r = rows[site.code] || {}
            const statusOpt = STATUS_OPTIONS.find((s) => s.value === r.status)
            return (
              <tr key={site.id} className="border-b border-border last:border-0 odd:bg-background/40">
                <Td className="text-center font-bold text-muted-foreground">{idx + 1}</Td>
                <Td className="whitespace-nowrap font-bold text-foreground">{site.code}</Td>

                {/* نوع الوحدة */}
                <Td>
                  <select
                    aria-label="نوع الوحدة"
                    value={r.storage ?? site.storage ?? ""}
                    onChange={(e) => persist(site.code, { storage: e.target.value })}
                    className="h-9 w-24 rounded-lg border border-input bg-background px-2 text-xs font-medium outline-none focus:border-primary"
                  >
                    <option value="">اختر</option>
                    {STORAGE_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </Td>

                {/* الموقع / الخريطة */}
                <Td>
                  {site.mapUrl ? (
                    <a
                      href={site.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-input bg-background px-3 text-xs font-medium text-primary"
                    >
                      فتح الموقع
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </Td>

                {/* XML منسدلة */}
                <Td>
                  <select
                    aria-label="حالة XML"
                    value={r.xmlStatus ?? ""}
                    onChange={(e) => persist(site.code, { xmlStatus: e.target.value })}
                    className={`h-9 w-20 rounded-lg border border-input bg-background px-2 text-xs font-bold outline-none focus:border-primary ${
                      r.xmlStatus === "يوجد" ? "text-success" : r.xmlStatus === "لا يوجد" ? "text-destructive" : ""
                    }`}
                  >
                    <option value="">—</option>
                    {XML_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </Td>

                {/* بداية الرصد */}
                <Td>
                  <input
                    type="datetime-local"
                    aria-label="بداية المجلد"
                    value={r.monitorStart ?? ""}
                    onChange={(e) => persist(site.code, { monitorStart: e.target.value })}
                    className="h-9 w-40 rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-primary"
                  />
                </Td>

                {/* نهاية الرصد */}
                <Td>
                  <input
                    type="datetime-local"
                    aria-label="نهاية المجلد"
                    value={r.monitorEnd ?? ""}
                    onChange={(e) => persist(site.code, { monitorEnd: e.target.value })}
                    className="h-9 w-40 rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-primary"
                  />
                </Td>

                {/* مدة الرصد */}
                <Td className="whitespace-nowrap text-center text-xs font-bold text-foreground">
                  {fmtDuration(r.monitorStart, r.monitorEnd)}
                </Td>

                {/* صور العطل + زر التصوير */}
                <Td>
                  <button
                    onClick={() => handleCamera(site)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 text-xs font-bold text-primary transition active:scale-95"
                  >
                    {copied === site.code ? "تم النسخ" : `صورة ${r.photoCount || 0}`}
                  </button>
                </Td>

                {/* ملاحظات / نوع العطل */}
                <Td>
                  <input
                    value={r.faultNote ?? ""}
                    onChange={(e) => persist(site.code, { faultNote: e.target.value })}
                    placeholder="نوع العطل / ملاحظة"
                    className="h-9 w-36 rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-primary"
                  />
                </Td>

                {/* حالة الإنجاز */}
                <Td>
                  <div className="flex flex-col gap-1">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => persist(site.code, { status: opt.value })}
                        className={`flex h-7 items-center gap-1.5 rounded-md border px-2 text-[11px] font-bold transition ${
                          r.status === opt.value
                            ? "border-foreground/20 bg-secondary"
                            : "border-transparent text-muted-foreground hover:bg-secondary/50"
                        }`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${opt.dot}`} />
                        {opt.short}
                      </button>
                    ))}
                  </div>
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-3 text-center text-xs font-bold">{children}</th>
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2.5 align-middle ${className}`}>{children}</td>
}

function openTimestampCamera() {
  const ua = navigator.userAgent || ""
  if (/android/i.test(ua)) {
    window.location.href =
      "intent://#Intent;package=com.jeyluta.timestampcamerafree;action=android.media.action.IMAGE_CAPTURE;end"
  } else {
    alert("تم نسخ بيانات العلامة المائية (الموقع | المسار | العطل). افتح تطبيق Timestamp Camera والصقها.")
  }
}
