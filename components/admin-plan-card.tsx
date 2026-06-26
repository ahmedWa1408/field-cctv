"use client"

import { useState } from "react"
import Link from "next/link"
import { getPlan } from "@/app/actions/plans"
import {
  addSite,
  reorderSitesSmart,
  deleteSite,
  updateSiteCoords,
  moveSite,
  renameSite,
  renamePlan,
  deletePlan,
} from "@/app/actions/admin"

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

  const [editingName, setEditingName] = useState(false)
  const [routeName, setRouteName] = useState(plan.route)
  const [editingSite, setEditingSite] = useState<number | null>(null)
  const [editCode, setEditCode] = useState("")

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

  async function move(id: number, direction: "up" | "down") {
    setBusy(true)
    await moveSite(plan.planNumber, id, direction)
    await load()
    setBusy(false)
  }

  async function saveSiteName(id: number) {
    if (!editCode.trim()) return
    setBusy(true)
    await renameSite(id, editCode)
    setEditingSite(null)
    await load()
    setBusy(false)
  }

  async function savePlanName() {
    if (!routeName.trim()) return
    setBusy(true)
    await renamePlan(plan.planNumber, routeName)
    setEditingName(false)
    setBusy(false)
  }

  async function removePlan() {
    if (!confirm(`حذف "${plan.route}" بالكامل مع كل مواقعه؟`)) return
    setBusy(true)
    await deletePlan(plan.planNumber)
    setBusy(false)
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex w-full items-center justify-between gap-2 p-4">
        <button onClick={toggle} className="min-w-0 flex-1 text-right">
          <p className="truncate text-base font-bold text-foreground">{plan.route}</p>
          <p className="text-xs text-muted-foreground">خطة رقم {plan.planNumber}</p>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => {
              setRouteName(plan.route)
              setEditingName((v) => !v)
            }}
            className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground"
          >
            تسمية
          </button>
          <Link
            href={`/reports/${plan.planNumber}`}
            className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent"
          >
            التقارير
          </Link>
          <button onClick={toggle} className="px-1 text-muted-foreground" aria-label="فتح">
            {open ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {editingName && (
        <div className="flex flex-col gap-2 border-t border-border p-4 sm:flex-row">
          <input
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            className="h-11 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button
              onClick={savePlanName}
              disabled={busy}
              className="h-11 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              حفظ الاسم
            </button>
            <button
              onClick={removePlan}
              disabled={busy}
              className="h-11 rounded-lg border border-destructive/40 bg-destructive/10 px-4 text-sm font-bold text-destructive disabled:opacity-60"
            >
              حذف المسار
            </button>
          </div>
        </div>
      )}

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
                placeholder="التخزين (اختياري)"
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

                  {/* أزرار التحريك */}
                  <div className="flex shrink-0 flex-col">
                    <button
                      onClick={() => move(s.id, "up")}
                      disabled={busy || i === 0}
                      className="px-1 text-xs leading-none text-muted-foreground disabled:opacity-30"
                      aria-label="تحريك لأعلى"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => move(s.id, "down")}
                      disabled={busy || i === sites.length - 1}
                      className="px-1 text-xs leading-none text-muted-foreground disabled:opacity-30"
                      aria-label="تحريك لأسفل"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    {editingSite === s.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          value={editCode}
                          onChange={(e) => setEditCode(e.target.value)}
                          className="h-9 min-w-0 flex-1 rounded-md border border-input bg-card px-2 text-sm outline-none focus:border-primary"
                        />
                        <button
                          onClick={() => saveSiteName(s.id)}
                          className="rounded-md bg-primary px-2 py-1 text-[11px] font-bold text-primary-foreground"
                        >
                          حفظ
                        </button>
                        <button
                          onClick={() => setEditingSite(null)}
                          className="rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="truncate text-sm font-bold text-foreground">{s.code}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {s.lat != null ? "إحداثيات ✓" : "بدون إحداثيات"}
                          {s.storage ? ` · ${s.storage}` : ""}
                        </p>
                      </>
                    )}
                  </div>

                  {editingSite !== s.id && (
                    <>
                      <button
                        onClick={() => {
                          setEditingSite(s.id)
                          setEditCode(s.code)
                        }}
                        className="rounded-md border border-border bg-secondary px-2 py-1 text-[11px] font-bold text-secondary-foreground"
                      >
                        تعديل
                      </button>
                      {s.mapUrl && s.lat == null && (
                        <button
                          onClick={() => fixCoords(s)}
                          className="rounded-md border border-warning/40 bg-warning/10 px-2 py-1 text-[11px] font-bold text-warning"
                        >
                          استخراج
                        </button>
                      )}
                      <button
                        onClick={() => remove(s.id)}
                        className="rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-[11px] font-bold text-destructive"
                      >
                        حذف
                      </button>
                    </>
                  )}
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
