"use client"

import { useEffect, useState } from "react"
import { TahakomLogo } from "./tahakom-logo"

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1400)
    const t2 = setTimeout(() => setPhase(2), 2400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-card">
      {/* توهج خلفي متحرك بألوان الهوية */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="absolute h-72 w-72 rounded-full bg-brand-teal/20 blur-3xl animate-glow" />
        <div className="absolute h-80 w-80 rounded-full bg-brand-plum/15 blur-3xl animate-glow" style={{ animationDelay: "0.8s" }} />
        <div className="absolute h-96 w-96 animate-ring rounded-full border border-brand-teal/40" />
        <div
          className="absolute h-96 w-96 animate-ring rounded-full border border-brand-plum/40"
          style={{ animationDelay: "1.1s" }}
        />
      </div>

      {/* الشعار المتحرك */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div className="animate-scale-in animate-brand-glow">
          <TahakomLogo size={200} />
        </div>

        {/* رسالة الترحيب */}
        <div
          className="mt-8 transition-all duration-700"
          style={{ opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "translateY(0)" : "translateY(16px)" }}
        >
          <h1 className="text-2xl font-extrabold text-primary text-balance sm:text-3xl">
            أهلًا بك في الحركة الميدانية
          </h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">قسم تشغيل المراقبة CCTV</p>
        </div>

        {/* زر الدخول الفخم */}
        <button
          onClick={onDone}
          className="tahakom-gradient relative mt-10 h-14 overflow-hidden rounded-2xl px-12 text-lg font-bold text-white shadow-xl shadow-brand-plum/30 transition-all duration-700 active:scale-95"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(16px)",
            pointerEvents: phase >= 2 ? "auto" : "none",
          }}
        >
          <span className="relative z-10">دخول النظام</span>
          <span className="absolute inset-y-0 left-0 z-0 w-1/3 animate-shine bg-white/30 blur-md" />
        </button>
      </div>

      <p className="absolute bottom-6 z-10 text-xs text-muted-foreground">نظام سحب الفلاشات والهاردسكات الميداني</p>
    </div>
  )
}
