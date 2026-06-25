"use client"

import { useEffect, useState } from "react"

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 2400)
    const t2 = setTimeout(() => onDone(), 3100)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-700 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* إطار متوهج محيط */}
      <div className="pointer-events-none absolute inset-3 rounded-3xl border-2 border-primary/40 animate-glow" />
      <div className="pointer-events-none absolute inset-6 rounded-3xl border border-accent/20" />

      <div className="relative flex flex-col items-center gap-6 animate-scale-in">
        {/* الشعار المضيء */}
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-full bg-primary/30 blur-3xl" />
          <h1 className="animate-glow text-7xl font-extrabold tracking-tight text-primary sm:text-8xl">
            تحكم
          </h1>
        </div>

        <div className="h-px w-48 bg-gradient-to-l from-transparent via-primary to-transparent" />

        <p className="text-center text-sm font-medium text-muted-foreground sm:text-base">
          نظام المراقبة الميدانية
          <br />
          قسم التشغيل CCTV
        </p>

        {/* مؤشر تحميل */}
        <div className="mt-4 flex gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:200ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:400ms]" />
        </div>
      </div>
    </div>
  )
}
