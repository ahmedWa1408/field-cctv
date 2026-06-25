import Link from "next/link"
import { getPlan } from "@/app/actions/plans"
import { getPlanReport } from "@/app/actions/reports"
import { ReportView } from "@/components/report-view"

export const dynamic = "force-dynamic"

export default async function ReportPage({
  params,
}: {
  params: Promise<{ planNumber: string }>
}) {
  const { planNumber } = await params
  const num = parseInt(planNumber, 10)
  const planData = await getPlan(num)
  const report = await getPlanReport(num)

  return (
    <div className="mx-auto w-full max-w-3xl p-4 pb-16">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-primary">تقرير المسار</h1>
          <p className="text-sm text-muted-foreground">
            {planData?.plan.route ?? `خطة رقم ${num}`}
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          رجوع
        </Link>
      </header>

      <ReportView
        violations={report.violations}
        faults={report.faults}
        missions={report.missions}
      />
    </div>
  )
}
