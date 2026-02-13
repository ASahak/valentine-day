import { useState, useEffect, useCallback, useRef } from "react"
import { TOTAL_STEPS } from "../lib/questions"
import { getCurrentQuestion, getProgress } from "../lib/game-store"
import type { GamePhase } from "../lib/game-store"
import type { Question } from "../lib/questions"
import confetti from "canvas-confetti"

// ---------- Typing Effect Hook ----------
function useTypingEffect(text: string, speed: number = 40) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed("")
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        setDone(true)
        clearInterval(interval)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return { displayed, done }
}

// ---------- Hint Modal ----------
function HintModal({
                     question,
                     open,
                     onClose,
                   }: {
  question: Question
  open: boolean
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-lg rounded-2xl border border-amber-400/40 bg-[#12091e]/95 p-6 shadow-2xl shadow-amber-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-pink-400/40 bg-pink-600/20 text-pink-200 transition-all hover:bg-pink-500/40 hover:text-white"
          aria-label="Close hint"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="mb-4 flex items-center gap-3">
          <img src="/helper-dog.png" alt="Helper Dog" className="h-12 w-12 object-contain" />
          <div>
            <h3 className="font-mono text-sm font-bold tracking-widest text-amber-200">BUDDY SAYS...</h3>
            <p className="font-mono text-[10px] tracking-wider text-amber-400/60">QUEST {question.id} HINT</p>
          </div>
        </div>

        {(question.hintType === "text" || question.hintType === "icon") && (
          <div className="rounded-xl border border-amber-500/20 bg-black/30 p-4">
            <p className="font-mono text-sm leading-relaxed text-pink-100/90">
              {question.hintValue}
            </p>
          </div>
        )}

        {question.hintType === "images" && question.hintImages && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-amber-500/20 bg-black/30 p-3">
              <p className="font-mono text-sm text-pink-100/90">{question.hintValue}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {question.hintImages.map((img) => (
                <div
                  key={img.label}
                  className="overflow-hidden rounded-xl border border-pink-500/20 bg-black/40 transition-all hover:border-pink-400/50 hover:shadow-lg hover:shadow-pink-500/10"
                >
                  <img
                    src={img.src}
                    alt={img.label}
                    className="aspect-video w-full object-cover"
                  />
                  <p className="px-2 py-2 text-center font-mono text-xs font-medium text-pink-200">
                    {img.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------- Helper Dog Companion ----------
function HelperDog({
                     question,
                     hintOpen,
                     onOpenHint,
                   }: {
  question: Question | null
  hintOpen: boolean
  onOpenHint: () => void
}) {
  const [showBubble, setShowBubble] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const hasHint = question && question.hintType !== "none"

  useEffect(() => {
    setShowBubble(false)
    setDismissed(false)
    if (!hasHint) return

    const timer = setTimeout(() => {
      setShowBubble(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [question?.id, hasHint])

  useEffect(() => {
    if (hintOpen) setShowBubble(false)
  }, [hintOpen])

  if (!hasHint) return null

  return (
    <div className="flex flex-col items-center relative top-5">
      <button
        onClick={() => {
          if (hintOpen) return
          if (showBubble) {
            onOpenHint()
          } else {
            setDismissed(false)
            setShowBubble(true)
          }
        }}
        className="group relative transition-transform hover:scale-110"
        aria-label="Ask helper dog for a hint"
      >
        <img
          src="/helper-dog.png"
          alt="Buddy the helper dog"
          className="h-14 w-14 object-contain drop-shadow-lg transition-all group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] sm:h-16 sm:w-16"
          style={{ animation: "dog-bounce 2s ease-in-out infinite" }}
        />
      </button>
    </div>
  )
}

// ---------- Progress Bar ----------
function ProgressBar({ currentStep }: { currentStep: number }) {
  const progress = getProgress(currentStep)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between font-mono text-xs tracking-widest">
        <span className="text-pink-300">LVL {currentStep + 1}</span>
        <span className="text-pink-300/70">
          {currentStep} / {TOTAL_STEPS}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full border border-pink-500/30 bg-black/60">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, #ff6b9d, #c084fc, #ff6b9d)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s ease infinite",
          }}
        />
      </div>
    </div>
  )
}

// ---------- Quest Box ----------
function QuestBox({
                    currentStep,
                    onAnswer,
                    shaking,
                    question,
                    hintOpen,
                    onOpenHint
                  }: {
  currentStep: number
  onAnswer: (correct: boolean) => void
  shaking: boolean
  question: Question | null
  hintOpen: boolean
  onOpenHint: () => void
}) {
  const [textInput, setTextInput] = useState("")
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { displayed, done } = useTypingEffect(question?.question ?? "", 30)

  useEffect(() => {
    setTextInput("")
    setSelectedOption(null)
    setFeedback(null)
  }, [currentStep])

  const handleSubmit = useCallback(
    (answer: string) => {
      if (!question) return
      const isCorrect = answer.trim().toLowerCase() === question.answer.toLowerCase()
      setFeedback(isCorrect ? "correct" : "wrong")

      if (isCorrect) {
        setTimeout(() => onAnswer(true), 600)
      } else {
        onAnswer(false)
        setTimeout(() => {
          setFeedback(null)
          setSelectedOption(null)
        }, 800)
      }
    },
    [question, onAnswer]
  )

  if (!question) return null

  const isInput = question.type === "input"

  return (
    <div
      className={`relative rounded-2xl border border-pink-500/30 bg-black/75 p-5 backdrop-blur-xl transition-transform ${
        shaking ? "animate-shake" : ""
      }`}
    >
      <div className="absolute -top-12 -right-4 z-50">
        <HelperDog
          question={question}
          hintOpen={hintOpen}
          onOpenHint={onOpenHint}
        />
      </div>
      <div className="absolute -top-3.5 left-4">
        <span
          className="rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-1 font-mono text-xs tracking-wider text-white shadow-lg shadow-pink-500/20">
          QUEST {currentStep + 1}
        </span>
      </div>

      <p className="mt-3 min-h-[3rem] font-mono text-sm leading-relaxed text-pink-100">
        {displayed}
        {!done && <span className="animate-pulse text-pink-400">|</span>}
      </p>

      {done && (
        <div className="mt-5">
          {isInput ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit(textInput)
              }}
              className="flex flex-col gap-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your answer..."
                className="rounded-xl border border-pink-500/40 bg-black/50 px-4 py-3 font-mono text-sm text-pink-100 placeholder-pink-300/30 outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/50"
                autoFocus
              />
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 py-2.5 font-mono text-sm tracking-wider text-white shadow-lg shadow-pink-500/20 transition-all hover:from-pink-500 hover:to-purple-500 hover:shadow-pink-400/30"
              >
                SUBMIT
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {question.options?.map((opt) => {
                let btnClass =
                  "border border-pink-500/30 bg-black/40 text-pink-200 hover:bg-pink-600/25 hover:border-pink-400/60"
                if (selectedOption === opt && feedback === "correct") {
                  btnClass = "border border-emerald-400 bg-emerald-600/30 text-emerald-200"
                } else if (selectedOption === opt && feedback === "wrong") {
                  btnClass = "border border-red-400 bg-red-600/30 text-red-200"
                }
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedOption(opt)
                      handleSubmit(opt)
                    }}
                    disabled={feedback !== null}
                    className={`rounded-xl px-3 py-3 font-mono text-xs tracking-wide transition-all ${btnClass} disabled:cursor-not-allowed`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {feedback === "correct" && (
        <div className="pointer-events-none absolute inset-0 animate-pulse rounded-2xl bg-emerald-400/10"/>
      )}
      {feedback === "wrong" && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-red-400/10"/>
      )}
    </div>
  )
}

// ---------- Dudu Indicator ----------
function DuduIndicator({ currentStep }: { currentStep: number }) {
  const remaining = TOTAL_STEPS - currentStep
  const sat = currentStep / TOTAL_STEPS

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative flex items-center justify-center"
        style={{
          filter: `drop-shadow(0 0 ${10 + sat * 25}px rgba(255, 107, 157, ${0.3 + sat * 0.7}))`,
        }}
      >
        <img
          src="/dudu.png"
          alt="Dudu"
          className="h-16 w-16 object-contain transition-all duration-700"
          style={{
            filter: `brightness(${0.5 + sat * 0.7}) saturate(${0.3 + sat * 0.9})`,
          }}
        />
        <div
          className="absolute inset-0 rounded-full border-2 border-pink-400/40 animate-ping"
          style={{ animationDuration: `${3 - sat * 1.5}s` }}
        />
      </div>
      <span className="font-mono text-[10px] tracking-widest text-pink-300/70">
        {remaining > 0 ? `${remaining} STEPS LEFT` : "REACHED"}
      </span>
    </div>
  )
}

// ---------- Step Bullets ----------
function StepBullets({
                       currentStep,
                       onGoToStep,
                     }: {
  currentStep: number
  onGoToStep: (step: number) => void
}) {
  return (
    <div className="absolute left-3 top-1/2 flex -translate-y-1/2 flex-col gap-1.5">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const completed = i < currentStep
        const active = i === currentStep
        const future = i > currentStep

        return (
          <button
            key={i}
            onClick={() => {
              if (completed) onGoToStep(i)
            }}
            disabled={future}
            title={completed ? `Go back to Quest ${i + 1}` : active ? `Current: Quest ${i + 1}` : `Quest ${i + 1}`}
            className={`flex h-4 w-4 items-center justify-center rounded-full transition-all duration-500 ${
              completed
                ? "scale-100 cursor-pointer border border-pink-400/60 bg-pink-500 hover:scale-125 hover:bg-pink-400 hover:shadow-lg hover:shadow-pink-400/40"
                : active
                  ? "scale-110 animate-pulse border border-pink-400 bg-pink-600 shadow-lg shadow-pink-500/40"
                  : "scale-75 cursor-not-allowed border border-pink-900/30 bg-pink-900/20"
            }`}
            aria-label={`Quest ${i + 1}`}
          >
            {completed && (
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ---------- Intro Screen ----------
function IntroScreen({ onStart }: { onStart: () => void }) {
  const { displayed, done } = useTypingEffect(
    "Bubu... the world has gone dark. Only you can bring back the light. Answer the 12 questions to find your way to Dudu.",
    40
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="mx-4 max-w-md text-center">
        <h1
          className="mb-2 text-4xl font-bold tracking-wider"
          style={{
            background: "linear-gradient(135deg, #ff6b9d, #c084fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {"VALENTINE'S QUEST"}
        </h1>
        <p className="mb-8 font-mono text-xs tracking-widest text-pink-400/60">A JOURNEY OF LOVE</p>
        <div className="mb-6 flex justify-center gap-6">
          <img src="/bubu.png" alt="Bubu" className="h-20 w-20 object-contain opacity-80" />
          <div className="flex items-center">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
          <img
            src="/dudu.png"
            alt="Dudu"
            className="h-20 w-20 object-contain opacity-40"
            style={{ filter: "brightness(0.5) saturate(0.3)" }}
          />
        </div>
        <p className="mb-8 min-h-[4rem] font-mono text-sm leading-relaxed text-pink-200/80">
          {displayed}
          {!done && <span className="animate-pulse text-pink-400">|</span>}
        </p>
        {done && (
          <button
            onClick={onStart}
            className="rounded-full border border-pink-400/30 bg-gradient-to-r from-pink-600 to-purple-600 px-10 py-3 font-mono text-sm tracking-widest text-white shadow-lg shadow-pink-500/30 transition-all hover:scale-105 hover:from-pink-500 hover:to-purple-500"
          >
            BEGIN QUEST
          </button>
        )}
      </div>
    </div>
  )
}

// ---------- Victory Screen ----------
function VictoryScreen() {
  useEffect(() => {
    const duration = 5000
    const end = Date.now() + duration
    const colors = ["#ff6b9d", "#c084fc", "#ff8fb8", "#fbbf24"]

    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors })
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center pt-24">
      {/* Changed items-center/end to items-start and added pt-24 */}
      <div className="text-center animate-fadeInUp px-4">
        <h1
          className="mb-4 text-5xl md:text-6xl font-bold tracking-wider drop-shadow-[0_0_15px_rgba(255,107,157,0.5)]"
          style={{
            background: "linear-gradient(135deg, #ff6b9d, #fbbf24, #c084fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          TOGETHER AT LAST
        </h1>
        <p className="font-mono text-lg text-pink-200 drop-shadow-md">
          The world is bright again.
        </p>
        <p className="mt-4 font-mono text-2xl tracking-wide text-pink-300 drop-shadow-md">
          {"Happy Valentine's Day, Bubu"}
        </p>
      </div>
    </div>
  )
}

// ---------- Drag instruction ----------
function DragHint() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 6000)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div
      className="pointer-events-none absolute right-4 bottom-28 animate-pulse font-mono text-[10px] tracking-wider text-pink-400/50">
      <div className="flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
             className="text-pink-400/50">
          <path d="M4 12h16m0 0l-6-6m6 6l-6 6"/>
        </svg>
        DRAG TO LOOK AROUND
      </div>
    </div>
  )
}

// ---------- Main UI Overlay ----------
export default function UIOverlay({
                                    phase,
                                    currentStep,
                                    shaking,
                                    onStart,
                                    onAnswer,
                                    onGoToStep,
                                  }: {
  phase: GamePhase
  currentStep: number
  shaking: boolean
  onStart: () => void
  onAnswer: (correct: boolean) => void
  onGoToStep: (step: number) => void
}) {
  const [hintOpen, setHintOpen] = useState(false)
  const question = getCurrentQuestion(currentStep)

  if (phase === "intro") return <IntroScreen onStart={onStart} />
  if (phase === "victory") return <VictoryScreen />

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      {question && (
        <div className="pointer-events-auto">
          <HintModal question={question} open={hintOpen} onClose={() => setHintOpen(false)} />
        </div>
      )}

      <div className="pointer-events-auto absolute left-0 right-0 top-0 p-4">
        <div className="mx-auto max-w-md">
          <div className="mb-3 flex justify-center">
            <DuduIndicator currentStep={currentStep} />
          </div>
          <ProgressBar currentStep={currentStep} />
        </div>
      </div>

      <div className="pointer-events-auto absolute bottom-0 left-0 right-0 p-4 pb-6">
        <div className="mx-auto max-w-md">
          <QuestBox currentStep={currentStep} onAnswer={onAnswer} shaking={shaking}
                    question={question}
                    hintOpen={hintOpen}
                    onOpenHint={() => setHintOpen(true)}
          />
        </div>
      </div>


      <div className="pointer-events-auto">
        <StepBullets currentStep={currentStep} onGoToStep={onGoToStep} />
      </div>

      <DragHint />
    </div>
  )
}
