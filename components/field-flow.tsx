"use client"

import { useState } from "react"
import Link from "next/link"
import { SplashScreen } from "./splash-screen"
import { IdStep } from "./id-step"
import { PlanStep, type PlanData } from "./plan-step"
import { VehicleStep, type VehicleData } from "./vehicle-step"
import { MissionScreen } from "./mission-screen"
import { startMission } from "@/app/actions/missions"

type Step = "splash" | "id" | "plan" | "vehicle" | "mission"

export function FieldFlow() {
  const [step, setStep] = useState<Step>("splash")
  const [employee, setEmployee] = useState<{ id: string; name: string } | null>(null)
  const [plan, setPlan] = useState<NonNullable<PlanData> | null>(null)
  const [vehicle, setVehicle] = useState<VehicleData | null>(null)
  const [missionId, setMissionId] = useState<number | null>(null)

  async function handleStart(v: VehicleData) {
    if (!plan || !employee) return
    const mission = await startMission(plan.plan.planNumber, employee.id, employee.name, v)
    setVehicle(v)
    setMissionId(mission.id)
    setStep("mission")
  }

  if (step === "splash") {
    return <SplashScreen onDone={() => setStep("id")} />
  }

  if (step === "id") {
    return (
      <div className="relative">
        <IdStep
          onNext={(id, name) => {
            setEmployee({ id, name })
            setStep("plan")
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

  if (step === "plan" && employee) {
    return (
      <PlanStep
        employeeName={employee.name}
        onBack={() => setStep("id")}
        onFound={(data) => {
          setPlan(data)
          setStep("vehicle")
        }}
      />
    )
  }

  if (step === "vehicle" && plan && employee) {
    return (
      <VehicleStep
        plan={plan}
        employeeName={employee.name}
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
        vehicle={vehicle}
        onExit={() => {
          setStep("id")
          setPlan(null)
          setVehicle(null)
          setMissionId(null)
        }}
      />
    )
  }

  return null
}
