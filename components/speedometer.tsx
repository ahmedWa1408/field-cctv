"use client"

export function Speedometer({
  speed,
  roadLimit,
}: {
  speed: number
  roadLimit: number | null
}) {
  const over = roadLimit != null && speed > roadLimit * 1.2

  return (
    <div className="flex items-stretch gap-3">
      {/* سرعة السيارة */}
      <div
        className={`flex flex-1 flex-col items-center justify-center rounded-2xl border p-4 transition-colors ${
          over
            ? "border-destructive bg-destructive/15"
            : "border-border bg-card"
        }`}
      >
        <span className="text-xs font-medium text-muted-foreground">سرعة السيارة</span>
        <span
          className={`text-4xl font-extrabold tabular-nums ${
            over ? "text-destructive" : "text-primary"
          }`}
        >
          {speed}
        </span>
        <span className="text-[10px] text-muted-foreground">كم/س</span>
      </div>

      {/* حد سرعة الطريق */}
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-border bg-card p-4">
        <span className="text-xs font-medium text-muted-foreground">حد سرعة الطريق</span>
        <span className="text-4xl font-extrabold tabular-nums text-accent">
          {roadLimit ?? "—"}
        </span>
        <span className="text-[10px] text-muted-foreground">كم/س</span>
      </div>
    </div>
  )
}
