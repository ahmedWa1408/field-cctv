import { getAllPlans } from "@/app/actions/plans"
import { AdminPanel } from "@/components/admin-panel"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const plans = await getAllPlans()
  return <AdminPanel initialPlans={plans} />
}
