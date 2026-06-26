"use client"

import { useEffect, useState } from "react"

type LatLng = { lat: number; lng: number }
type Prayer = { name: string; time: string; date: Date }

const NAMES: Record<string, string> = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
}

// شريط يمر بهدوء للتذكير بوقت الصلاة في موقع الموظف الحالي
export function PrayerBar({ position }: { position: LatLng | null }) {
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!position) return
    const today = new Date()
    const d = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`
    fetch(
      `https://api.aladhan.com/v1/timings/${d}?latitude=${position.lat}&longitude=${position.lng}&method=4`,
    )
      .then((r) => r.json())
      .then((data) => {
        const timings = data?.data?.timings
        if (!timings) return
        const list: Prayer[] = Object.keys(NAMES).map((k) => {
          const [h, m] = String(timings[k]).split(":").map(Number)
          const dt = new Date()
          dt.setHours(h, m, 0, 0)
          return { name: NAMES[k], time: timings[k], date: dt }
        })
        setPrayers(list)
      })
      .catch(() => {})
  }, [position])

  if (!prayers.length) return null

  // أقرب صلاة قادمة وحالة "حان الوقت" خلال آخر 25 دقيقة
  const upcoming = prayers.find((p) => p.date.getTime() > now) ?? prayers[0]
  const recent = prayers.find((p) => {
    const diff = now - p.date.getTime()
    return diff >= 0 && diff <= 25 * 60 * 1000
  })

  const message = recent
    ? `حان الآن وقت صلاة ${recent.name} — تقبّل الله طاعتكم`
    : `الصلاة القادمة: ${upcoming.name} الساعة ${upcoming.time}`

  return (
    <div
      className={`overflow-hidden rounded-xl border ${
        recent ? "border-accent/50 bg-accent/10" : "border-border bg-secondary"
      }`}
    >
      <div className="flex whitespace-nowrap py-2" style={{ animation: "prayer-marquee 18s linear infinite" }}>
        <span className={`px-6 text-sm font-bold ${recent ? "text-accent" : "text-secondary-foreground"}`}>
          {message}
        </span>
        <span className={`px-6 text-sm font-bold ${recent ? "text-accent" : "text-secondary-foreground"}`}>
          {message}
        </span>
        <span className={`px-6 text-sm font-bold ${recent ? "text-accent" : "text-secondary-foreground"}`}>
          {message}
        </span>
      </div>
      <style jsx>{`
        @keyframes prayer-marquee {
          0% {
            transform: translateX(-33.33%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
