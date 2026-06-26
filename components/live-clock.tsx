"use client"

import { useEffect, useState } from "react"

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

/**
 * ساعة حيّة متحركة: تعرض الوقت بالثواني (تنبض النقطتان) + اليوم + التاريخ الميلادي والهجري.
 */
export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  if (!now) {
    return <div className="h-12 w-40 animate-pulse rounded-xl bg-white/10" aria-hidden />
  }

  const h = now.getHours()
  const hour12 = ((h + 11) % 12) + 1
  const ampm = h >= 12 ? "م" : "ص"
  const mm = String(now.getMinutes()).padStart(2, "0")
  const ss = String(now.getSeconds()).padStart(2, "0")
  const day = DAYS[now.getDay()]

  const greg = now.toLocaleDateString("ar-SA-u-ca-gregory", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  let hijri = ""
  try {
    hijri = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now)
  } catch {
    hijri = ""
  }

  return (
    <div className="flex flex-col items-center rounded-xl border border-white/15 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
      {/* الوقت */}
      <div className="tahakom-number flex items-center gap-0.5 text-xl font-extrabold leading-none text-white sm:text-2xl">
        <span>{String(hour12).padStart(2, "0")}</span>
        <span className="animate-soft-pulse text-brand-teal">:</span>
        <span>{mm}</span>
        <span className="animate-soft-pulse text-brand-teal">:</span>
        <span className="text-brand-teal">{ss}</span>
        <span className="mr-1 text-xs font-bold text-white/70">{ampm}</span>
      </div>
      {/* اليوم والتاريخ */}
      <div className="mt-0.5 flex items-center gap-2 text-[11px] font-medium text-white/80">
        <span className="font-bold text-brand-teal">{day}</span>
        <span className="text-white/40">|</span>
        <span className="tahakom-number">{greg}</span>
        {hijri && (
          <>
            <span className="text-white/40">|</span>
            <span>{hijri} هـ</span>
          </>
        )}
      </div>
    </div>
  )
}
