"use client"

import { useState } from "react"
import { updateSiteStatus } from "@/app/actions/missions"
import { haversineKm, type LatLng } from "@/lib/geo"

type Site = {
  id: number
  code: string
  storage: string | null
  mapUrl: string | null
  lat?: number | null
  lng?: number | null
}

export type CustomColumn = {
  key: string
  label: string
  type: string
  options?: string[] | null
}

export type RowState = {
  status?: string
  storage?: string
  xmlStatus?: string
  faultNote?: string
  monitorStart?: string
  monitorEnd?: string
  photoCount?: number
  custom?: Record<string, string>
}

const STATUS_OPTIONS = [
  {
    value: "working_clean",
    label: "يعمل ولا توجد مخالفات",
    short: "يعمل",
    text: "text-success",
    activeBg: "bg-success text-success-foreground",
    cardBorder: "border-success/40",
    cardBg: "bg-success/5",
    accentBar: "bg-success",
  },
  {
    value: "working_violation",
    label: "يعمل وتوجد مخالفات",
    short: "مخالفة",
    text: "text-warning",
    activeBg: "bg-warning text-warning-foreground",
    cardBorder: "border-warning/45",
    cardBg: "bg-warning/5",
    accentBar: "bg-warning",
  },
  {
    value: "not_working",
    label: "لا يعمل",
    short: "لا يعمل",
    text: "text-destructive",
    activeBg: "bg-destructive text-destructive-foreground",
    cardBorder: "border-destructive/45",
    cardBg: "bg-destructive/5",
    accentBar: "bg-destructive",
  },
]

const STORAGE_OPTIONS = ["فلاش", "هاردسك"]
const XML_OPTIONS = ["يوجد", "لا يوجد"]
const SITE_RADIUS_KM = 3

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
  position,
  customColumns = [],
}: {
  sites: Site[]
  missionId: number
  planNumber: number
  rows: Record<string, RowState>
  onRowChange: (code: string, patch: Partial<RowState>) => void
  routeName: string
  position?: LatLng | null
  customColumns?: CustomColumn[]
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
    const statusLabel = STATUS_OPTIONS.find((s) => s.value === r.status)?.label ?? "بدون عطل"
    const fault = r.faultNote || statusLabel
    // العلامة المائية المطلوبة: اسم المسار + رقم الموقع + نوع العطل
    const watermark = `المسار: ${routeName} | الموقع: ${site.code} | العطل: ${fault}`
    try {
      await navigator.clipboard.writeText(watermark)
      setCopied(site.code)
      setTimeout(() => setCopied((c) => (c === site.code ? null : c)), 2000)
    } catch {}
    persist(site.code, { photoCount: (r.photoCount || 0) + 1 })
    openTimestampCamera(watermark)
  }

  return (
    <div className="flex flex-col gap-3">
      {sites.map((site, idx) => {
        const r = rows[site.code] || {}
        const statusOpt = STATUS_OPTIONS.find((s) => s.value === r.status)
        // المسافة والقفل: تُفتح الخانات فقط ضمن 3 كم من الموقع
        let distKm: number | null = null
        if (position && site.lat != null && site.lng != null) {
          distKm = haversineKm(position, { lat: site.lat, lng: site.lng })
        }
        const locked = distKm != null && distKm > SITE_RADIUS_KM
        const inRange = distKm != null && distKm <= SITE_RADIUS_KM

        return (
          <div
            key={site.id}
            className={`relative overflow-hidden rounded-2xl border-2 bg-card transition ${
              statusOpt ? `${statusOpt.cardBorder} ${statusOpt.cardBg}` : "border-border"
            }`}
          >
            {/* الشريط الجانبي الملوّن حسب الحالة */}
            <span
              className={`absolute inset-y-0 right-0 w-1.5 ${statusOpt ? statusOpt.accentBar : "bg-muted"}`}
              aria-hidden
            />

            <div className={`flex flex-col gap-3 p-4 pr-5 ${locked ? "opacity-60" : ""}`}>
              {/* رأس البطاقة: رقم + رمز الموقع + المسافة */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-extrabold text-primary-foreground tahakom-number">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-base font-extrabold text-foreground">{site.code}</p>
                    {distKm != null && (
                      <p className={`text-[11px] font-medium ${inRange ? "text-success" : "text-muted-foreground"}`}>
                        {inRange ? "داخل النطاق" : "خارج النطاق"} · {distKm.toFixed(1)} كم
                      </p>
                    )}
                  </div>
                </div>
                {site.mapUrl && (
                  <a
                    href={site.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-brand-teal/40 bg-brand-teal/10 px-3 text-xs font-bold text-accent"
                  >
                    <PinIcon /> فتح الموقع
                  </a>
                )}
              </div>

              {locked && (
                <div className="flex items-center gap-1.5 rounded-lg border border-warning/40 bg-warning/10 px-3 py-1.5 text-[11px] font-bold text-warning-foreground">
                  <LockIcon /> الخانات مقفلة — يجب الاقتراب لمسافة {SITE_RADIUS_KM} كم من الموقع
                </div>
              )}

              {/* شريط الحالة المجزّأ الملوّن */}
              <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-secondary/60 p-1">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    disabled={locked}
                    onClick={() => persist(site.code, { status: opt.value })}
                    className={`h-10 rounded-lg text-[12px] font-bold transition active:scale-95 disabled:cursor-not-allowed ${
                      r.status === opt.value ? opt.activeBg + " shadow" : `bg-card ${opt.text} hover:bg-card/70`
                    }`}
                  >
                    {opt.short}
                  </button>
                ))}
              </div>

              {/* صف الحقول المنسدلة */}
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
                <FieldWrap label="نوع الوحدة">
                  <select
                    aria-label="نوع الوحدة"
                    disabled={locked}
                    value={r.storage ?? site.storage ?? ""}
                    onChange={(e) => persist(site.code, { storage: e.target.value })}
                    className="h-10 w-full rounded-lg border border-input bg-background px-2 text-xs font-bold outline-none focus:border-brand-teal disabled:opacity-50"
                  >
                    <option value="">اختر</option>
                    {STORAGE_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </FieldWrap>

                <FieldWrap label="XML">
                  <select
                    aria-label="حالة XML"
                    disabled={locked}
                    value={r.xmlStatus ?? ""}
                    onChange={(e) => persist(site.code, { xmlStatus: e.target.value })}
                    className={`h-10 w-full rounded-lg border border-input bg-background px-2 text-xs font-bold outline-none focus:border-brand-teal disabled:opacity-50 ${
                      r.xmlStatus === "يوجد" ? "text-success" : r.xmlStatus === "لا يوجد" ? "text-destructive" : ""
                    }`}
                  >
                    <option value="">—</option>
                    {XML_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </FieldWrap>

                <FieldWrap label="مدة الرصد">
                  <div className="flex h-10 items-center justify-center rounded-lg border border-input bg-background text-xs font-extrabold text-foreground tahakom-number">
                    {fmtDuration(r.monitorStart, r.monitorEnd)}
                  </div>
                </FieldWrap>

                {/* الأعمدة المخصّصة من لوحة الإدارة */}
                {customColumns.map((col) => (
                  <FieldWrap key={col.key} label={col.label}>
                    {col.type === "dropdown" ? (
                      <select
                        aria-label={col.label}
                        disabled={locked}
                        value={r.custom?.[col.key] ?? ""}
                        onChange={(e) =>
                          persist(site.code, { custom: { ...(r.custom || {}), [col.key]: e.target.value } })
                        }
                        className="h-10 w-full rounded-lg border border-input bg-background px-2 text-xs font-bold outline-none focus:border-brand-teal disabled:opacity-50"
                      >
                        <option value="">اختر</option>
                        {(col.options || []).map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        aria-label={col.label}
                        disabled={locked}
                        value={r.custom?.[col.key] ?? ""}
                        onChange={(e) =>
                          persist(site.code, { custom: { ...(r.custom || {}), [col.key]: e.target.value } })
                        }
                        className="h-10 w-full rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-brand-teal disabled:opacity-50"
                      />
                    )}
                  </FieldWrap>
                ))}
              </div>

              {/* بداية/نهاية المجلد */}
              <div className="grid grid-cols-2 gap-2.5">
                <FieldWrap label="بداية المجلد (تاريخ ووقت)">
                  <input
                    type="datetime-local"
                    aria-label="بداية المجلد"
                    disabled={locked}
                    value={r.monitorStart ?? ""}
                    onChange={(e) => persist(site.code, { monitorStart: e.target.value })}
                    className="h-10 w-full rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-brand-teal disabled:opacity-50"
                  />
                </FieldWrap>
                <FieldWrap label="نهاية المجلد (تاريخ ووقت)">
                  <input
                    type="datetime-local"
                    aria-label="نهاية المجلد"
                    disabled={locked}
                    value={r.monitorEnd ?? ""}
                    onChange={(e) => persist(site.code, { monitorEnd: e.target.value })}
                    className="h-10 w-full rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-brand-teal disabled:opacity-50"
                  />
                </FieldWrap>
              </div>

              {/* ملاحظة العطل + زر التصوير */}
              <div className="flex items-end gap-2.5">
                <FieldWrap label="نوع العطل / ملاحظة" className="flex-1">
                  <input
                    disabled={locked}
                    value={r.faultNote ?? ""}
                    onChange={(e) => persist(site.code, { faultNote: e.target.value })}
                    placeholder="اكتب نوع العطل"
                    className="h-10 w-full rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-brand-teal disabled:opacity-50"
                  />
                </FieldWrap>
                <button
                  onClick={() => handleCamera(site)}
                  disabled={locked}
                  className="tahakom-gradient flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50"
                >
                  <CameraIcon />
                  {copied === site.code ? "تم النسخ" : `تصوير ${r.photoCount || 0}`}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FieldWrap({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-1 text-[11px] font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

function openTimestampCamera(watermark: string) {
  const ua = navigator.userAgent || ""
  if (/android/i.test(ua)) {
    // فتح تطبيق Timestamp Camera (إن كان مثبتًا) لالتقاط صورة بعلامة مائية
    window.location.href =
      "intent://#Intent;package=com.jeyluta.timestampcamerafree;action=android.media.action.IMAGE_CAPTURE;end"
  } else {
    alert(`تم نسخ بيانات العلامة المائية:\n${watermark}\n\nافتح تطبيق Timestamp Camera والصقها فوق الصورة.`)
  }
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function CameraIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}
function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
