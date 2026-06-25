"use client"

import { useState } from "react"
import Link from "next/link"
import { getPlan } from "@/app/actions/plans"
import { addSite, reorderSitesSmart, deleteSite, updateSiteCoords } from "@/app/actions/admin"

type Plan = { planNumber: number; route: string; speedLimit: number | null }
type Site = {
  id: number
  code: string
  storage: string | null
  mapUrl: string | null
  lat: number | null
  lng: number | null
}

export function AdminPlanCard({ plan }: { plan: Plan }) {
  const [open, setOpen] = useState(false)
  const [sites, setSites] = useState<Site[] | null>(null)
  const [loading, setLoading] = useState(false)

  const [code, setCode] = useState("")
  const [storage, setStorage] = useState("")
  const [mapUrl, setMapUrl] = useState("")
  const [busy, setBusy] = useState(false)

  async function load() {
    setLoading(true)
    const data = await getPlan(plan.planNumber)
    setLoading(false)
    setSites((data?.sites as Site[]) ?? [])
  }

  function toggle() {
    const next = !open
    setOpen(next)
    if (next && sites === null) load()
  }

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setBusy(true)
    await addSite({ planNumber: plan.planNumber, code, storage, mapUrl })
    await load()
    setBusy(false)
    setCode("")
    setStorage("")
    setMapUrl("")
  }

  async function reorder() {
    setBusy(true)
    await reorderSitesSmart(plan.planNumber)
    await load()
    setBusy(false)
  }

  async function remove(id: number) {
    setBusy(true)
    await deleteSite(id)
    await load()
    setBusy(false)
  }

  async function fixCoords(site: Site) {
    if (!site.mapUrl) return
    setBusy(true)
    await updateSiteCoords(site.id, site.mapUrl)
    await load()
    setBusy(false)
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between gap-2 p-4 text-right"
      >
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-foreground">{plan.route}</p>
          <p className="text-xs text-muted-foreground">خطة رقم {plan.planNumber}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/reports/${plan.planNumber}`}
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent"
          >
            التقارير
          </Link>
          <span className="text-muted-foreground">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-border p-4">
          {/* إضافة موقع */}
          <form onSubmit={add} className="mb-4 flex flex-col gap-2 rounded-xl border border-border bg-background p-3">
            <p className="text-xs font-bold text-foreground">إضافة موقع جديد (إدراج ذكي حسب GPS)</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="رمز الموقع"
                className="h-11 flex-1 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-primary"
              />
              <input
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                placeholder="التخزين"
                className="h-11 flex-1 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <input
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              placeholder="رابط خريطة جوجل (للترتيب الذكي)"
              className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <button
                disabled={busy}
                className="h-11 flex-1 rounded-lg bg-primary text-sm font-bold text-primary-foreground active:scale-95 disabled:opacity-60"
              >
                {busy ? "..." : "إضافة الموقع"}
              </button>
              <button
                type="button"
                onClick={reorder}
                disabled={busy}
                className="h-11 rounded-lg border border-border bg-secondary px-4 text-sm font-medium text-secondary-foreground active:scale-95 disabled:opacity-60"
              >
                ترتيب ذكي
              </button>
            </div>
          </form>

          {/* قائمة المواقع */}
          {loading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">جارٍ التحميل...</p>
          ) : sites && sites.length ? (
            <ul className="flex flex-col gap-2">
              {sites.map((s, i) => (
                <li
                  key={s.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background p-2.5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">{s.code}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.lat != null ? "إحداثيات ✓" : "بدون إحداثيات"}
                      {s.storage ? ` · ${s.storage}` : ""}
                    </p>
                  </div>
                  {s.mapUrl && s.lat == null && (
                    <button
                      onClick={() => fixCoords(s)}
                      className="rounded-md border border-warning/40 bg-warning/10 px-2 py-1 text-[11px] font-bold text-warning"
                    >
                      استخراج الموقع
                    </button>
                  )}
                  <button
                    onClick={() => remove(s.id)}
                    className="rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-[11px] font-bold text-destructive"
                  >
                    حذف
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">لا توجد مواقع بعد</p>
          )}
        </div>
      )}
    </div>
  )
}
