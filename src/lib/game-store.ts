import { QUESTIONS, TOTAL_STEPS } from "./questions"
import type { Question } from "./questions"

export type GamePhase = "intro" | "playing" | "victory"

export function getProgress(currentStep: number): number {
  return currentStep / TOTAL_STEPS
}

export function getFogDensity(currentStep: number): number {
  const maxFog = 0.08
  const minFog = 0.002
  return maxFog - (maxFog - minFog) * (currentStep / TOTAL_STEPS)
}

export function getSaturation(currentStep: number): number {
  // Exponential curve so the last few steps get dramatically brighter
  const linear = currentStep / TOTAL_STEPS
  return Math.pow(linear, 0.6)
}

export function getCurrentQuestion(currentStep: number): Question | null {
  if (currentStep >= TOTAL_STEPS) return null
  return QUESTIONS[currentStep]
}
