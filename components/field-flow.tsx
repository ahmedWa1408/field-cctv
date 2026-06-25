"use client"

import { useState } from "react"
import Link from "next/link"
import { SplashScreen } from "./splash-screen"
import { PlanStep, type PlanData } from "./plan-step"
import { EmployeeStep } from "./employee-step"
import { MissionScreen } from "./mission-screen"
import { startMission } from "@/app/actions/missions"

type Step = "splash" | "plan" | "employee" | "mission"

export function FieldFlow() {
  const [step, setStep] = useState<Step>("splash")
  const [plan, setPlan] = useState<NonNullable<PlanData> | null>(null)
  const [employee, setEmployee] = useState<{ id: string; name: string } | null>(null)
  const [missionId, setMissionId] = useState<number | null>(null)

  async function handleStart(id: string, name: string) {
    if (!plan) return
    const mission = await startMission(plan.plan.planNumber, id, name)
    setEmployee({ id, name })
    setMissionId(mission.id)
    setStep("mission")
  }

  if (step === "splash") {
    return (
      <>
        <SplashScreen onDone={() => setStep("plan")} />
        <div className="min-h-dvh" />
      </>
    )
  }

  if (step === "plan") {
    return (
      <div className="relative">
        <PlanStep
          onFound={(data) => {
            setPlan(data)
            setStep("employee")
          }}
        />
        <Link
          href="/admin"
          className="fixed bottom-5 left-5 z-10 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          لوحة الإدارة
        </Link>
      </div>
    )
  }

  if (step === "employee" && plan) {
    return (
      <EmployeeStep
        plan={plan}
        onBack={() => setStep("plan")}
        onStart={handleStart}
      />
    )
  }

  if (step === "mission" && plan && employee && missionId) {
    return (
      <MissionScreen
        plan={plan}
        missionId={missionId}
        employeeId={employee.id}
        employeeName={employee.name}
        onExit={() => {
          setStep("plan")
          setPlan(null)
          setEmployee(null)
          setMissionId(null)
        }}
      />
    )
  }

  return null
}
