import { useRef, useMemo, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Float, OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { GATE_SPACING, TOTAL_STEPS } from "../lib/questions"
import { getSaturation } from "../lib/game-store"

// ---------- Road spiral math ----------
const CURVE_AMPLITUDE = 8
const CURVE_FREQUENCY = 0.018
const SPIRAL_OFFSET = 0.003

function roadX(z: number): number {
  return (
    Math.sin(z * CURVE_FREQUENCY) * CURVE_AMPLITUDE +
    Math.cos(z * SPIRAL_OFFSET * 2.7) * 3
  )
}

function roadAngle(z: number): number {
  const dx =
    Math.cos(z * CURVE_FREQUENCY) * CURVE_AMPLITUDE * CURVE_FREQUENCY -
    Math.sin(z * SPIRAL_OFFSET * 2.7) * 3 * SPIRAL_OFFSET * 2.7
  return Math.atan(dx)
}

function gatePosition(step: number): [number, number, number] {
  const z = -step * GATE_SPACING
  return [roadX(z), 0, z]
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// ---------- Camera Controller ----------
function CameraController({
                            currentStep,
                            phase,
                            moving,
                            orbitRef,
                          }: {
  currentStep: number
  phase: string
  moving: boolean
  orbitRef: React.RefObject<any>
}) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(0, 3, 8))
  const targetLook = useRef(new THREE.Vector3(0, 1.5, -10))

  useEffect(() => {
    if (phase === "victory") {
      const victoryZ = -(TOTAL_STEPS - 1) * GATE_SPACING - 50
      const victoryX = roadX(victoryZ)
      targetPos.current.set(victoryX, 4.5, victoryZ + 15)
      targetLook.current.set(victoryX, 1.5, victoryZ)
    } else {
      const z = -currentStep * GATE_SPACING
      const x = roadX(z)
      const ahead = z - 12
      const lookX = roadX(ahead)
      targetPos.current.set(x, 3.2, z + 9)
      targetLook.current.set(lookX, 1.2, ahead)
    }
  }, [currentStep, phase])

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.04)
    if (orbitRef.current) {
      orbitRef.current.target.lerp(targetLook.current, 0.06)
      orbitRef.current.update()
    }
  })

  return null
}

// ---------- Curving Road ----------
function CurvingRoad() {
  const roadLength = (TOTAL_STEPS + 6) * GATE_SPACING
  const segmentLen = 3.5
  const segmentCount = Math.ceil(roadLength / segmentLen)

  const segments = useMemo(() => {
    const arr: { pos: [number, number, number]; rotY: number; key: string }[] = []
    for (let i = 0; i < segmentCount; i++) {
      const z = 10 - i * segmentLen
      const x = roadX(z)
      const angle = roadAngle(z)
      arr.push({ pos: [x, -0.51, z], rotY: angle, key: `r-${i}` })
    }
    return arr
  }, [segmentCount])

  return (
    <group>
      {segments.map((seg) => (
        <group key={seg.key} position={seg.pos} rotation={[0, seg.rotY, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[6.5, segmentLen + 0.5]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry args={[0.15, segmentLen * 0.4]} />
            <meshStandardMaterial color="#f5c542" emissive="#f5c542" emissiveIntensity={0.3} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.6, -0.005, 0]}>
            <planeGeometry args={[1, segmentLen + 0.5]} />
            <meshStandardMaterial color="#2d5a1e" roughness={1} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.6, -0.005, 0]}>
            <planeGeometry args={[1, segmentLen + 0.5]} />
            <meshStandardMaterial color="#2d5a1e" roughness={1} />
          </mesh>
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.53, -roadLength / 2 + 10]}>
        <planeGeometry args={[100, roadLength + 30]} />
        <meshStandardMaterial color="#3d2810" roughness={1} />
      </mesh>
    </group>
  )
}

// ---------- Gate ----------
function Gate({ position, index, active }: { position: [number, number, number]; index: number; active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (meshRef.current) meshRef.current.position.y = -0.3 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1
    if (glowRef.current) glowRef.current.intensity = active ? 4 + Math.sin(state.clock.elapsedTime * 3) * 1.5 : 0.5
  })

  const color = active ? "#ff6b9d" : "#4a2060"

  return (
    <group position={position}>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 2.2, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 2 : 0.3} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial color={active ? "#ff8fb8" : "#2a1040"} emissive={active ? "#ff6b9d" : "#1a0830"} emissiveIntensity={active ? 0.8 : 0.1} transparent opacity={0.4} />
      </mesh>
      <pointLight ref={glowRef} position={[0, 1, 0]} color={active ? "#ff6b9d" : "#6a3090"} intensity={active ? 4 : 0.5} distance={18} />
    </group>
  )
}

function Gates({ currentStep }: { currentStep: number }) {
  return (
    <group>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const [gx, , gz] = gatePosition(i)
        return <Gate key={i} index={i} position={[gx, 0, gz]} active={i === currentStep} />
      })}
    </group>
  )
}

// ---------- Characters & Aura ----------
function Bubu({ currentStep, visible }: { currentStep: number; visible: boolean }) {
  const spriteRef = useRef<THREE.Sprite>(null)
  const tex = useMemo(() => new THREE.TextureLoader().load("/bubu.png"), [])

  useFrame(() => {
    if (!spriteRef.current) return
    const [tx, , tz] = gatePosition(currentStep)
    spriteRef.current.position.x += (tx - spriteRef.current.position.x) * 0.04
    spriteRef.current.position.z += (tz - spriteRef.current.position.z) * 0.04
    spriteRef.current.position.y = 1.25 + Math.sin(Date.now() * 0.003) * 0.08
    spriteRef.current.visible = visible
  })

  return (
    <sprite ref={spriteRef} position={[0, 1.25, 0]} scale={[2.5, 2.5, 1]}>
      <spriteMaterial map={tex} transparent alphaTest={0.1} />
    </sprite>
  )
}

function DuduGoal({ visible }: { visible: boolean }) {
  const spriteRef = useRef<THREE.Sprite>(null)
  const tex = useMemo(() => new THREE.TextureLoader().load("/dudu.png"), [])
  const [gx, , gz] = gatePosition(TOTAL_STEPS - 1)

  useFrame((state) => {
    if (spriteRef.current) {
      spriteRef.current.position.y = 1.25 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      spriteRef.current.visible = visible
    }
  })

  return (
    <Float speed={1.5} floatIntensity={0.1}>
      <sprite ref={spriteRef} position={[gx, 1.25, gz]} scale={[3, 3, 1]}>
        <spriteMaterial map={tex} transparent alphaTest={0.1} />
      </sprite>
    </Float>
  )
}

function DuduAura({ currentStep }: { currentStep: number }) {
  const lightRef = useRef<THREE.PointLight>(null)
  const sat = getSaturation(currentStep)
  const [gx, , gz] = gatePosition(TOTAL_STEPS - 1)

  useFrame((state) => {
    if (lightRef.current) {
      const base = 3 + sat * 30
      lightRef.current.intensity = base + Math.sin(state.clock.elapsedTime * 2) * 3
      lightRef.current.distance = 15 + sat * 80
    }
  })
  return <pointLight ref={lightRef} position={[gx, 3, gz]} color="#ffb6c1" intensity={3} distance={20} />
}

// ---------- Sun (Corrected) ----------
function Sun({ currentStep }: { currentStep: number }) {
  const sunRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const sat = getSaturation(currentStep)
  const victoryZ = -(TOTAL_STEPS - 1) * GATE_SPACING - 50
  const victoryX = roadX(victoryZ)

  useFrame((state) => {
    if (!sunRef.current || !glowRef.current) return
    sunRef.current.position.set(victoryX + 100, 70, victoryZ - 300)
    glowRef.current.position.set(victoryX + 100, 70, victoryZ - 300)
    const scaleFactor = 20 + sat * 15
    sunRef.current.scale.setScalar(scaleFactor)
    glowRef.current.scale.setScalar(scaleFactor * 2.5 + Math.sin(state.clock.elapsedTime) * 2)
  })

  return (
    <group renderOrder={-1}>
      <mesh ref={sunRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={sat > 0.5 ? "#fff9e6" : "#4a69bd"} transparent opacity={0.3 + sat * 0.7} depthTest={false} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color={sat > 0.5 ? "#fcd34d" : "#1e3799"} transparent opacity={sat * 0.3} depthTest={false} />
      </mesh>
    </group>
  )
}

// ---------- Victory Pair ----------
function VictoryPair() {
  const bubuRef = useRef<THREE.Sprite>(null)
  const duduRef = useRef<THREE.Sprite>(null)
  const bubuTex = useMemo(() => new THREE.TextureLoader().load("/bubu.png"), [])
  const duduTex = useMemo(() => new THREE.TextureLoader().load("/dudu.png"), [])
  const finalZ = -(TOTAL_STEPS - 1) * GATE_SPACING - 50
  const finalX = roadX(finalZ)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (bubuRef.current && duduRef.current) {
      bubuRef.current.position.set(finalX - 0.9, 1.1 + Math.sin(t * 3) * 0.05, finalZ)
      duduRef.current.position.set(finalX + 1.5, 1.2 + Math.sin(t * 3 + Math.PI) * 0.05, finalZ)
    }
  })

  return (
    <group>
      <sprite ref={bubuRef} scale={[3.8, 3.8, 1]}>
        <spriteMaterial map={bubuTex} transparent alphaTest={0.01} depthTest={false} />
      </sprite>
      <sprite ref={duduRef} scale={[4.2, 4.2, 1]}>
        <spriteMaterial map={duduTex} transparent alphaTest={0.01} depthTest={false} />
      </sprite>
      <pointLight position={[finalX, 3, finalZ]} color="#ffb6c1" intensity={30} distance={50} />
    </group>
  )
}

// ---------- Scenery & Particles ----------
function Particles({ currentStep }: { currentStep: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 700
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const roadLen = (TOTAL_STEPS + 6) * GATE_SPACING
    for (let i = 0; i < count; i++) {
      const z = 10 - Math.random() * roadLen
      arr[i * 3] = roadX(z) + (Math.random() - 0.5) * 30
      arr[i * 3 + 1] = Math.random() * 14
      arr[i * 3 + 2] = z
    }
    return arr
  }, [])
  const sat = getSaturation(currentStep)
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.12} color={new THREE.Color(0.4 + sat * 0.6, 0.15 + sat * 0.5, 0.5 + sat * 0.3)} transparent opacity={0.75} sizeAttenuation />
    </points>
  )
}

// Scenery Logic (simplified for brevity, keeps yours)
function Scenery() {
  const items = useMemo(() => {
    const trees: { pos: [number, number, number]; seed: number; key: string }[] = []
    const roadLen = (TOTAL_STEPS + 3) * GATE_SPACING
    for (let z = 10; z > -roadLen; z -= 10) {
      const xC = roadX(z)
      trees.push({ pos: [xC - 10, -0.5, z], seed: z, key: `t-${z}` })
      trees.push({ pos: [xC + 10, -0.5, z], seed: z + 1, key: `t2-${z}` })
    }
    return { trees }
  }, [])
  return <group>{items.trees.map(t => (
    <group key={t.key} position={t.pos}>
      <mesh position={[0, 1, 0]}><cylinderGeometry args={[0.2, 0.3, 2]} /><meshStandardMaterial color="#4a2f1a" /></mesh>
      <mesh position={[0, 2.5, 0]}><sphereGeometry args={[1.5]} /><meshStandardMaterial color="#1a5c1a" /></mesh>
    </group>
  ))}</group>
}

const SKY_TIMELINE = [
  "#0a0612", // Step 0: Pitch Black / Deep Midnight
  "#0d111a", // Step 1: Very Dark Blue
  "#111827", // Step 2: Slate Night
  "#1e293b", // Step 3: Dark Steel
  "#334155", // Step 4: Muted Morning Grey-Blue
  "#475569", // Step 5: Twilight Blue
  "#64748b", // Step 6: Overcast Blue (Sun starts peeking)
  "#94a3b8", // Step 7: Pale Sky
  "#bae6fd", // Step 8: Light Morning Blue
  "#38bdf8", // Step 9: Sky Blue
  "#7dd3fc", // Step 10: Bright Day
  "#bae6fd", // Step 11: High Noon (Near Victory)
  "#bae6fd", // Step 12: Pure Victory Day
]
// ---------- Main Canvas ----------
export default function JourneyCanvas({ currentStep, phase, moving }: { currentStep: number; phase: string; moving: boolean }) {
  const isVictory = phase === "victory"
  const sat = getSaturation(currentStep)
  const orbitRef = useRef<any>(null)

  const fogColor = useMemo(() => {
    // 1. Get the starting color for this step
    const currentIndex = Math.min(currentStep, SKY_TIMELINE.length - 1)
    const nextIndex = Math.min(currentStep + 1, SKY_TIMELINE.length - 1)

    const startColor = new THREE.Color(SKY_TIMELINE[currentIndex])
    const endColor = new THREE.Color(isVictory ? "#bae6fd" : SKY_TIMELINE[nextIndex])

    // 2. Calculate local progress between this step and the next
    // This makes the color change smoothly WHILE moving, not just a "jump"
    // If your game only updates step by step, 'sat' works fine here too
    return startColor.lerp(endColor, sat)
  }, [currentStep, isVictory, sat])

  return (
    <div className="fixed inset-0 h-screen w-full">
      <Canvas camera={{ position: [0, 3.2, 9], fov: 58, near: 0.1, far: 1000 }}
              gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 + sat * 1.2 }}>
        <fog attach="fog" args={[fogColor, 1, isVictory ? 8000 : 55 + currentStep * 15]}/>
        <color attach="background" args={[fogColor]}/>

        <OrbitControls ref={orbitRef} enabled={!moving} enableZoom={false} enablePan={false}
                       maxPolarAngle={Math.PI / 2.1} minPolarAngle={0.4}/>

        <CameraController currentStep={currentStep} phase={phase} moving={moving} orbitRef={orbitRef}/>
        <ambientLight intensity={0.2 + sat * 0.8} color={fogColor}/>
        <directionalLight position={[20, 50, 20]} intensity={sat * 1.5} color="#fffbeb"/>
        <Sun currentStep={currentStep}/>

        <CurvingRoad/>
        <Scenery/>
        <Gates currentStep={currentStep}/>
        <Particles currentStep={currentStep}/>

        <Bubu currentStep={currentStep} visible={!isVictory}/>
        <DuduGoal visible={!isVictory}/>
        <DuduAura currentStep={currentStep}/>

        {isVictory && <VictoryPair/>}
      </Canvas>
    </div>
  )
}