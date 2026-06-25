"use client"

import { useState } from "react"
import { updateSiteStatus } from "@/app/actions/missions"

type Site = {
  id: number
  code: string
  storage: string | null
  mapUrl: string | null
}

const STATUS_OPTIONS = [
  { value: "working_clean", label: "يعمل ولا توجد مخالفات", color: "text-success border-success/50 bg-success/10" },
  { value: "working_violation", label: "يعمل وتوجد مخالفات", color: "text-warning border-warning/50 bg-warning/10" },
  { value: "not_working", label: "لا يعمل", color: "text-destructive border-destructive/50 bg-destructive/10" },
]

function statusLabel(v: string) {
  return STATUS_OPTIONS.find((s) => s.value === v)?.label ?? "غير محدد"
}

function openTimestampCamera() {
  // محاولة فتح تطبيق Timestamp Camera على أندرويد عبر intent
  const ua = navigator.userAgent || ""
  if (/android/i.test(ua)) {
    window.location.href =
      "intent://#Intent;package=com.jeyluta.timestampcamerafree;action=android.media.action.IMAGE_CAPTURE;end"
  } else {
    // iOS / سطح المكتب: لا يمكن فتح التطبيق الخارجي مباشرة
    alert(
      "تم نسخ رمز الموقع والحالة. افتح تطبيق Timestamp Camera والصق العلامة المائية يدويًا.",
    )
  }
}

export function FieldTable({
  sites,
  missionId,
  planNumber,
  statuses,
  onStatusChange,
}: {
  sites: Site[]
  missionId: number
  planNumber: number
  statuses: Record<string, string>
  onStatusChange: (code: string, status: string) => void
}) {
  const [copied, setCopied] = useState<string | null>(null)

  async function handleCamera(site: Site) {
    const status = statuses[site.code] || "غير محدد"
    const text = `${site.code} - ${statusLabel(status)}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(site.code)
      setTimeout(() => setCopied((c) => (c === site.code ? null : c)), 1800)
    } catch {
      // تجاهل
    }
    // تعليم أن صورة قد التُقطت
    updateSiteStatus({ missionId, planNumber, siteCode: site.code, status: status === "غير محدد" ? "working_clean" : status, photoTaken: true })
    openTimestampCamera()
  }

  async function setStatus(site: Site, value: string) {
    onStatusChange(site.code, value)
    await updateSiteStatus({ missionId, planNumber, siteCode: site.code, status: value })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* رأس الجدول — يظهر على الشاشات المتوسطة فأكبر */}
      <div className="hidden grid-cols-[2.5rem_1fr_5rem_4rem_1fr] gap-2 border-b border-border bg-secondary px-3 py-3 text-xs font-bold text-secondary-foreground md:grid">
        <span className="text-center">#</span>
        <span>رمز الموقع</span>
        <span className="text-center">الكاميرا</span>
        <span className="text-center">الخريطة</span>
        <span className="text-center">الحالة</span>
      </div>

      <ul className="divide-y divide-border">
        {sites.map((site, idx) => {
          const current = statuses[site.code]
          return (
            <li
              key={site.id}
              className="grid grid-cols-1 gap-3 p-3 md:grid-cols-[2.5rem_1fr_5rem_4rem_1fr] md:items-center md:gap-2"
            >
              {/* الترتيب + الرمز (سطر علوي على الجوال) */}
              <div className="flex items-center gap-3 md:contents">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary md:mx-auto">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-foreground">{site.code}</p>
                  {site.storage && (
                    <p className="text-xs text-muted-foreground">التخزين: {site.storage}</p>
                  )}
                </div>
              </div>

              {/* أزرار الكاميرا والخريطة (سطر على الجوال) */}
              <div className="flex items-center gap-2 md:contents">
                <button
                  onClick={() => handleCamera(site)}
                  className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-2 text-sm font-bold text-primary transition active:scale-95 md:mx-auto md:w-full md:flex-none"
                >
                  {copied === site.code ? "تم النسخ" : "صورة"}
                </button>

                {site.mapUrl ? (
                  <a
                    href={site.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 flex-1 items-center justify-center rounded-xl border border-border bg-secondary px-2 text-sm font-medium text-secondary-foreground transition active:scale-95 md:mx-auto md:w-full md:flex-none"
                  >
                    خريطة
                  </a>
                ) : (
                  <span className="flex h-11 flex-1 items-center justify-center rounded-xl border border-border bg-background px-2 text-xs text-muted-foreground md:mx-auto md:w-full md:flex-none">
                    —
                  </span>
                )}
              </div>

              {/* محدد الحالة */}
              <div className="flex flex-col gap-1.5 md:flex-row md:flex-wrap md:justify-center">
                {STATUS_OPTIONS.map((opt) => {
                  const active = current === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setStatus(site, opt.value)}
                      className={`h-9 rounded-lg border px-2 text-xs font-bold transition active:scale-95 ${
                        active ? opt.color : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
