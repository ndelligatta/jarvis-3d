import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
import * as THREE from 'three'

// Floating code panel
function CodePanel({ position, rotation, code, delay, isGenerating }) {
  const meshRef = useRef()
  const [visible, setVisible] = useState(false)
  const [displayCode, setDisplayCode] = useState('')

  useEffect(() => {
    if (isGenerating) {
      const timer = setTimeout(() => setVisible(true), delay)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
      setDisplayCode('')
    }
  }, [isGenerating, delay])

  useEffect(() => {
    if (visible && isGenerating) {
      let index = 0
      const interval = setInterval(() => {
        if (index < code.length) {
          setDisplayCode(code.slice(0, index + 1))
          index++
        }
      }, 15)
      return () => clearInterval(interval)
    }
  }, [visible, code, isGenerating])

  useFrame((state) => {
    if (meshRef.current && visible) {
      const t = state.clock.elapsedTime
      meshRef.current.position.y = position[1] + Math.sin(t * 0.5 + delay) * 0.1
      meshRef.current.material.opacity = 0.85 + Math.sin(t * 2) * 0.1
    }
  })

  if (!visible) return null

  return (
    <group position={position} rotation={rotation}>
      <mesh ref={meshRef}>
        <planeGeometry args={[1.8, 1.2]} />
        <meshBasicMaterial
          color="#001a2e"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Border glow */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.85, 1.25]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Code text */}
      <Html
        position={[-0.8, 0.5, 0.01]}
        transform
        scale={0.08}
        style={{
          width: '400px',
          height: '280px',
          overflow: 'hidden',
        }}
      >
        <pre style={{
          fontFamily: "'Fira Code', 'Roboto Mono', monospace",
          fontSize: '11px',
          color: '#00ffaa',
          margin: 0,
          textShadow: '0 0 10px #00ffaa',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.4,
        }}>
          {displayCode}
          <span style={{ opacity: 0.7, color: '#00d4ff' }}>|</span>
        </pre>
      </Html>
    </group>
  )
}

// Holographic file icon
function FileIcon({ position, fileName, delay, isGenerating }) {
  const groupRef = useRef()
  const [visible, setVisible] = useState(false)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    if (isGenerating) {
      const timer = setTimeout(() => {
        setVisible(true)
        setScale(0)
      }, delay)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
      setScale(0)
    }
  }, [isGenerating, delay])

  useFrame((state) => {
    if (groupRef.current && visible) {
      const t = state.clock.elapsedTime
      // Grow animation
      if (scale < 1) {
        setScale(Math.min(scale + 0.05, 1))
      }
      groupRef.current.scale.setScalar(scale)
      groupRef.current.rotation.y = t * 0.5
      groupRef.current.position.y = position[1] + Math.sin(t + delay) * 0.15
    }
  })

  if (!visible) return null

  const ext = fileName.split('.').pop()
  const color = ext === 'jsx' ? '#61dafb' : ext === 'ts' ? '#3178c6' : ext === 'json' ? '#f7df1e' : '#00ffaa'

  return (
    <group ref={groupRef} position={position}>
      {/* File body */}
      <mesh>
        <boxGeometry args={[0.15, 0.2, 0.02]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Folded corner */}
      <mesh position={[0.05, 0.08, 0.015]}>
        <boxGeometry args={[0.05, 0.05, 0.01]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* File name label */}
      <Html position={[0, -0.18, 0]} center scale={0.1}>
        <div style={{
          fontFamily: "'Roboto Mono', monospace",
          fontSize: '8px',
          color: color,
          textShadow: `0 0 10px ${color}`,
          whiteSpace: 'nowrap',
        }}>
          {fileName}
        </div>
      </Html>
    </group>
  )
}

// Matrix code rain
function CodeRain({ isGenerating }) {
  const pointsRef = useRef()
  const count = 500

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = []

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8
      positions[i * 3 + 1] = Math.random() * 6 - 3
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8
      velocities.push(0.02 + Math.random() * 0.03)
    }

    return { positions, velocities }
  }, [])

  useFrame(() => {
    if (!pointsRef.current || !isGenerating) return

    const positions = pointsRef.current.geometry.attributes.position.array

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] -= particles.velocities[i]
      if (positions[i * 3 + 1] < -3) {
        positions[i * 3 + 1] = 3
        positions[i * 3] = (Math.random() - 0.5) * 8
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  if (!isGenerating) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#00ff88"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Circular progress ring
function ProgressRing({ progress, isGenerating }) {
  const ringRef = useRef()

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 2
    }
  })

  if (!isGenerating) return null

  return (
    <group position={[0, 0, -1]}>
      <mesh ref={ringRef}>
        <ringGeometry args={[1.8, 1.85, 64, 1, 0, Math.PI * 2 * progress]} />
        <meshBasicMaterial
          color="#00ffaa"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Background ring */}
      <mesh>
        <ringGeometry args={[1.78, 1.87, 64]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// Data stream lines
function DataStreams({ isGenerating }) {
  const linesRef = useRef([])

  const streams = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5,
      length: 0.5 + Math.random() * 1,
    }))
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    linesRef.current.forEach((line, i) => {
      if (line && isGenerating) {
        const stream = streams[i]
        const pulse = (t * stream.speed) % 1
        line.scale.y = stream.length * (0.5 + pulse * 0.5)
        line.material.opacity = 0.3 + pulse * 0.4
      }
    })
  })

  if (!isGenerating) return null

  return (
    <group>
      {streams.map((stream, i) => (
        <mesh
          key={i}
          ref={(el) => (linesRef.current[i] = el)}
          position={[
            Math.cos(stream.angle) * 2.2,
            0,
            Math.sin(stream.angle) * 2.2,
          ]}
          rotation={[0, 0, stream.angle + Math.PI / 2]}
        >
          <planeGeometry args={[0.02, 1]} />
          <meshBasicMaterial
            color="#00ffaa"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

// Holographic grid floor
function HoloGrid({ isGenerating }) {
  const gridRef = useRef()

  useFrame((state) => {
    if (gridRef.current && isGenerating) {
      const t = state.clock.elapsedTime
      gridRef.current.material.opacity = 0.15 + Math.sin(t * 2) * 0.05
    }
  })

  if (!isGenerating) return null

  return (
    <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[10, 10, 20, 20]} />
      <meshBasicMaterial
        color="#00d4ff"
        wireframe
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// Code snippets to generate
const codeSnippets = [
  `// api/openai.ts
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY
})

export async function chat(msg: string) {
  const response = await client
    .chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user",
        content: msg }]
    })
  return response.choices[0]
}`,

  `// hooks/useJarvis.ts
import { useState, useCallback } from 'react'
import { chat } from '../api/openai'

export function useJarvis() {
  const [response, setResponse] =
    useState('')
  const [loading, setLoading] =
    useState(false)

  const ask = useCallback(async (q) => {
    setLoading(true)
    const res = await chat(q)
    setResponse(res.message.content)
    setLoading(false)
  }, [])

  return { response, loading, ask }
}`,

  `// components/VoiceInput.tsx
import { useEffect, useRef } from 'react'

export function VoiceInput({ onResult }) {
  const recognition = useRef(null)

  useEffect(() => {
    recognition.current =
      new webkitSpeechRecognition()
    recognition.current.continuous = true
    recognition.current.onresult = (e) => {
      const text = e.results[0][0]
      onResult(text.transcript)
    }
  }, [])

  return <button onClick={() =>
    recognition.current.start()}>
    🎤 Speak
  </button>
}`,

  `// utils/textToSpeech.ts
export function speak(text: string) {
  const utterance =
    new SpeechSynthesisUtterance(text)
  utterance.rate = 1.0
  utterance.pitch = 0.9
  utterance.voice = speechSynthesis
    .getVoices()
    .find(v => v.name.includes('UK'))
  speechSynthesis.speak(utterance)
}`,

  `// config/jarvis.config.json
{
  "name": "J.A.R.V.I.S",
  "version": "2.0.0",
  "model": "gpt-4-turbo",
  "voice": {
    "enabled": true,
    "accent": "british",
    "speed": 1.0
  },
  "features": {
    "codeGen": true,
    "analysis": true,
    "automation": true
  }
}`
]

const fileNames = [
  'openai.ts',
  'useJarvis.ts',
  'VoiceInput.tsx',
  'textToSpeech.ts',
  'jarvis.config.json',
  'types.d.ts',
  'constants.ts',
  'utils.ts'
]

export default function CodeGeneration({ isGenerating, progress }) {
  const panelPositions = [
    { pos: [-2.5, 0.5, 0], rot: [0, 0.4, 0] },
    { pos: [2.5, 0.3, 0], rot: [0, -0.4, 0] },
    { pos: [-1.5, -0.5, 1.5], rot: [0, 0.6, 0] },
    { pos: [1.5, 0.8, 1.5], rot: [0, -0.6, 0] },
    { pos: [0, 1.5, -1], rot: [0.2, 0, 0] },
  ]

  const filePositions = [
    [-3, 1.5, 1], [3, 1.2, 0.5], [-2.5, -1, 1.5],
    [2.8, -0.8, 1], [0, 2, 1], [-1, 1.8, 2],
    [1.5, 1.5, 1.8], [-0.5, -1.5, 2]
  ]

  return (
    <group>
      {/* Code panels */}
      {panelPositions.map((panel, i) => (
        <CodePanel
          key={i}
          position={panel.pos}
          rotation={panel.rot}
          code={codeSnippets[i % codeSnippets.length]}
          delay={i * 400}
          isGenerating={isGenerating}
        />
      ))}

      {/* File icons */}
      {filePositions.map((pos, i) => (
        <FileIcon
          key={i}
          position={pos}
          fileName={fileNames[i % fileNames.length]}
          delay={200 + i * 300}
          isGenerating={isGenerating}
        />
      ))}

      {/* Code rain */}
      <CodeRain isGenerating={isGenerating} />

      {/* Progress ring */}
      <ProgressRing progress={progress} isGenerating={isGenerating} />

      {/* Data streams */}
      <DataStreams isGenerating={isGenerating} />

      {/* Holographic grid */}
      <HoloGrid isGenerating={isGenerating} />
    </group>
  )
}
