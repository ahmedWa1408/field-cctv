"use client"

export type ViolationItem = {
  type: string
  detail: string
  at: number
}

const LABELS: Record<string, string> = {
  overspeed: "سرعة زائدة",
  not_arrived: "عدم الوصول للموقع",
  exit_system: "الخروج من النظام",
  tampering: "محاولة العبث بالنظام",
  off_route_long: "تواجد خارج المسار +ساعتين",
}

export function ViolationsBox({ items }: { items: ViolationItem[] }) {
  return (
    <div className="rounded-2xl border border-destructive/40 bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-destructive">مخالفات الموظف</h3>
        <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-bold text-destructive">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="py-3 text-center text-xs text-muted-foreground">لا توجد مخالفات مسجّلة</p>
      ) : (
        <ul className="flex max-h-48 flex-col gap-2 overflow-y-auto">
          {items.map((v, i) => (
            <li
              key={i}
              className="flex items-start justify-between gap-2 rounded-xl border border-border bg-background p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">{LABELS[v.type] ?? v.type}</p>
                <p className="truncate text-xs text-muted-foreground">{v.detail}</p>
              </div>
              <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                {new Date(v.at).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
