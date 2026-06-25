"use client"

import { useEffect, useRef, useState } from "react"
import { haversineKm, type LatLng } from "@/lib/geo"
import { logViolation, type ViolationType } from "@/app/actions/violations"

type TrackingArgs = {
  missionId: number | null
  planNumber: number
  employeeId: string
  employeeName: string
  sites: { lat: number | null; lng: number | null }[]
  planSpeedLimit: number | null
  enabled: boolean
  onViolation?: (type: ViolationType, detail: string) => void
}

// المسافة القصوى (كم) لاعتبار الموظف "داخل المسار" قرب أي موقع
const ON_ROUTE_RADIUS_KM = 3
// مدة التواجد خارج المسار قبل اعتبارها مخالفة (ساعتان)
const OFF_ROUTE_LIMIT_MS = 2 * 60 * 60 * 1000

export function useFieldTracking(args: TrackingArgs) {
  const [speed, setSpeed] = useState(0) // كم/س
  const [roadLimit, setRoadLimit] = useState<number | null>(null)
  const [position, setPosition] = useState<LatLng | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)

  const lastFixRef = useRef<{ pos: LatLng; t: number } | null>(null)
  const lastOsmRef = useRef<{ pos: LatLng; t: number } | null>(null)
  const offRouteSinceRef = useRef<number | null>(null)
  const argsRef = useRef(args)
  argsRef.current = args

  function report(type: ViolationType, detail: string) {
    const a = argsRef.current
    logViolation({
      missionId: a.missionId,
      planNumber: a.planNumber,
      employeeId: a.employeeId,
      employeeName: a.employeeName,
      type,
      detail,
    })
    a.onViolation?.(type, detail)
  }

  // كشف الخروج من النظام / محاولة العبث
  useEffect(() => {
    if (!args.enabled) return
    function onHide() {
      if (document.visibilityState === "hidden") {
        report("exit_system", "خروج من النظام أو تصغير التطبيق أثناء المهمة")
      }
    }
    function onBlur() {
      report("tampering", "محاولة العبث / مغادرة شاشة التطبيق")
    }
    document.addEventListener("visibilitychange", onHide)
    window.addEventListener("blur", onBlur)
    return () => {
      document.removeEventListener("visibilitychange", onHide)
      window.removeEventListener("blur", onBlur)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [args.enabled])

  // تتبّع الموقع والسرعة
  useEffect(() => {
    if (!args.enabled) return
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsError("الجهاز لا يدعم تحديد الموقع")
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsError(null)
        const now = pos.timestamp || Date.now()
        const cur: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPosition(cur)

        // السرعة: من الجهاز إن توفرت (م/ث -> كم/س)، وإلا نحسبها من الإزاحة
        let kmh = 0
        if (pos.coords.speed != null && pos.coords.speed >= 0) {
          kmh = pos.coords.speed * 3.6
        } else if (lastFixRef.current) {
          const dt = (now - lastFixRef.current.t) / 1000
          if (dt > 0) {
            const dKm = haversineKm(lastFixRef.current.pos, cur)
            kmh = (dKm / dt) * 3600
          }
        }
        kmh = Math.max(0, Math.round(kmh))
        setSpeed(kmh)
        lastFixRef.current = { pos: cur, t: now }

        // حد سرعة الطريق من OSM (استعلام كل ~150م أو 20ث)
        maybeFetchRoadLimit(cur)

        // كشف السرعة الزائدة
        const limit = roadLimitRef.current ?? argsRef.current.planSpeedLimit
        if (limit && kmh > limit + 10) {
          report("overspeed", `سرعة ${kmh} كم/س على طريق حده ${limit} كم/س`)
        }

        // كشف التواجد خارج المسار لأكثر من ساعتين
        const sitesWithCoords = argsRef.current.sites.filter(
          (s) => s.lat != null && s.lng != null,
        ) as LatLng[]
        if (sitesWithCoords.length) {
          const nearAny = sitesWithCoords.some((s) => haversineKm(cur, s) <= ON_ROUTE_RADIUS_KM)
          if (nearAny) {
            offRouteSinceRef.current = null
          } else {
            if (offRouteSinceRef.current == null) {
              offRouteSinceRef.current = now
            } else if (now - offRouteSinceRef.current >= OFF_ROUTE_LIMIT_MS) {
              report("off_route_long", "تواجد خارج مواقع المسار لأكثر من ساعتين")
              offRouteSinceRef.current = now // إعادة ضبط لتجنب التكرار المستمر
            }
          }
        }
      },
      (err) => {
        setGpsError(err.message || "تعذّر الوصول للموقع")
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [args.enabled])

  const roadLimitRef = useRef<number | null>(null)

  async function maybeFetchRoadLimit(cur: LatLng) {
    const last = lastOsmRef.current
    const now = Date.now()
    if (last) {
      const moved = haversineKm(last.pos, cur) * 1000 // متر
      if (moved < 150 && now - last.t < 20000) return
    }
    lastOsmRef.current = { pos: cur, t: now }
    try {
      // Overpass: أقرب طريق بحد سرعة ضمن 60م
      const q = `[out:json][timeout:10];way(around:60,${cur.lat},${cur.lng})[highway][maxspeed];out tags 1;`
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: "data=" + encodeURIComponent(q),
      })
      if (!res.ok) return
      const data = await res.json()
      const way = data?.elements?.[0]
      const ms = way?.tags?.maxspeed
      if (ms) {
        const n = parseInt(String(ms).replace(/[^\d]/g, ""), 10)
        if (n) {
          roadLimitRef.current = n
          setRoadLimit(n)
        }
      }
    } catch {
      // تجاهل أخطاء الشبكة
    }
  }

  return { speed, roadLimit, position, gpsError, reportManual: report }
}
