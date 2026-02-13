import { useState, useCallback, useRef, Suspense } from "react"
import type { GamePhase } from "./lib/game-store"
import { TOTAL_STEPS } from "./lib/questions"
import JourneyCanvas from "./components/journey-canvas"
import UIOverlay from "./components/ui-overlay"

export default function App() {
  const [phase, setPhase] = useState<GamePhase>("intro")
  const [currentStep, setCurrentStep] = useState(0)
  const [shaking, setShaking] = useState(false)
  const [moving, setMoving] = useState(false)
  const moveTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleStart = useCallback(() => {
    setPhase("playing")
  }, [])

  const moveToStep = useCallback((step: number) => {
    setMoving(true)
    setCurrentStep(step)
    // Lock orbit during camera movement, unlock after
    if (moveTimeout.current) clearTimeout(moveTimeout.current)
    moveTimeout.current = setTimeout(() => setMoving(false), 2200)
  }, [])

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (correct) {
        const nextStep = currentStep + 1
        if (nextStep >= TOTAL_STEPS) {
          moveToStep(nextStep)
          setTimeout(() => setPhase("victory"), 2500)
        } else {
          moveToStep(nextStep)
        }
      } else {
        setShaking(true)
        setTimeout(() => setShaking(false), 600)
      }
    },
    [currentStep, moveToStep]
  )

  const handleGoToStep = useCallback(
    (step: number) => {
      if (step < currentStep) {
        moveToStep(step)
      }
    },
    [currentStep, moveToStep]
  )

  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#0a0612]">
      <Suspense fallback={null}>
        <JourneyCanvas currentStep={currentStep} phase={phase} moving={moving} />
      </Suspense>
      <UIOverlay
        phase={phase}
        currentStep={currentStep}
        shaking={shaking}
        onStart={handleStart}
        onAnswer={handleAnswer}
        onGoToStep={handleGoToStep}
      />
    </main>
  )
}
