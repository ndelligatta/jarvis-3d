import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Inner glowing core with multiple layers
function CoreSphere({ isSpeaking }) {
  const innerRef = useRef()
  const outerRef = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Inner core pulse
    const pulseSpeed = isSpeaking ? 12 : 3
    const pulseAmount = isSpeaking ? 0.2 : 0.08
    const innerScale = 1 + Math.sin(t * pulseSpeed) * pulseAmount
    innerRef.current.scale.setScalar(innerScale * 0.4)

    // Outer core counter-pulse
    const outerScale = 1 + Math.sin(t * pulseSpeed + Math.PI) * pulseAmount * 0.5
    outerRef.current.scale.setScalar(outerScale * 0.55)

    // Glow intensity
    const intensity = isSpeaking ? 2 + Math.sin(t * 15) * 0.8 : 1.2
    innerRef.current.material.emissiveIntensity = intensity
    glowRef.current.material.opacity = isSpeaking ? 0.4 + Math.sin(t * 10) * 0.15 : 0.25

    // Subtle rotation
    outerRef.current.rotation.y = t * 0.5
    outerRef.current.rotation.x = Math.sin(t * 0.3) * 0.2
  })

  return (
    <group>
      {/* Hot white inner core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#00ffff"
          emissiveIntensity={1.5}
          transparent
          opacity={1}
        />
      </mesh>

      {/* Cyan outer core */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Soft glow sphere */}
      <mesh ref={glowRef} scale={0.8}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.25}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

// Wireframe shell with scan effect
function WireframeShell({ isSpeaking }) {
  const meshRef = useRef()
  const scanRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    meshRef.current.rotation.x = t * 0.15
    meshRef.current.rotation.y = t * 0.1

    // Scan line effect
    const scanPos = ((t * 0.5) % 2) - 1
    scanRef.current.position.y = scanPos * 0.7
    scanRef.current.material.opacity = isSpeaking ? 0.6 : 0.3
  })

  return (
    <group ref={meshRef}>
      <mesh>
        <icosahedronGeometry args={[0.72, 2]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#0088ff"
          emissiveIntensity={0.4}
          transparent
          opacity={isSpeaking ? 0.35 : 0.2}
          wireframe
        />
      </mesh>

      {/* Scan line */}
      <mesh ref={scanRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 0.75, 64]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

// Holographic ring with segments
function HoloRing({ radius, rotationAxis, speed, thickness, segments = 1, isSpeaking }) {
  const groupRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const speedMult = isSpeaking ? 2.5 : 1

    const rotation = t * speed * speedMult
    if (rotationAxis === 'x') {
      groupRef.current.rotation.x = rotation
      groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.4
    } else if (rotationAxis === 'y') {
      groupRef.current.rotation.y = rotation
      groupRef.current.rotation.x = Math.cos(t * 0.3) * 0.3
    } else {
      groupRef.current.rotation.z = rotation
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.35
    }
  })

  const ringSegments = useMemo(() => {
    if (segments === 1) return [{ start: 0, end: Math.PI * 2 }]
    const gap = 0.3
    const segmentAngle = (Math.PI * 2 - gap * segments) / segments
    return Array.from({ length: segments }, (_, i) => ({
      start: i * (segmentAngle + gap),
      end: i * (segmentAngle + gap) + segmentAngle
    }))
  }, [segments])

  return (
    <group ref={groupRef}>
      {ringSegments.map((seg, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, seg.start]}>
          <torusGeometry args={[radius, thickness, 8, 64, seg.end - seg.start]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00aaff"
            emissiveIntensity={isSpeaking ? 1.2 : 0.6}
            transparent
            opacity={isSpeaking ? 0.8 : 0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

// Hexagonal grid pattern
function HexGrid({ radius, isSpeaking }) {
  const groupRef = useRef()
  const hexesRef = useRef([])

  const hexPositions = useMemo(() => {
    const positions = []
    const hexSize = 0.15
    const rows = 5
    const cols = 8

    for (let row = -rows; row <= rows; row++) {
      for (let col = -cols; col <= cols; col++) {
        const x = col * hexSize * 1.8 + (row % 2) * hexSize * 0.9
        const y = row * hexSize * 1.55
        const dist = Math.sqrt(x * x + y * y)
        if (dist < radius && dist > radius * 0.5) {
          positions.push({ x, y, dist, delay: Math.random() })
        }
      }
    }
    return positions
  }, [radius])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    groupRef.current.rotation.z = t * 0.05

    hexesRef.current.forEach((hex, i) => {
      if (hex) {
        const data = hexPositions[i]
        const wave = Math.sin(t * 3 + data.dist * 2 + data.delay * 5)
        hex.material.opacity = isSpeaking
          ? 0.3 + wave * 0.2 + Math.random() * 0.1
          : 0.1 + wave * 0.05
        hex.scale.setScalar(isSpeaking ? 1 + wave * 0.1 : 1)
      }
    })
  })

  return (
    <group ref={groupRef} position={[0, 0, -0.5]}>
      {hexPositions.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => (hexesRef.current[i] = el)}
          position={[pos.x, pos.y, 0]}
        >
          <circleGeometry args={[0.06, 6]} />
          <meshBasicMaterial
            color="#00d4ff"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

// Orbital particles with trails
function OrbitalParticles({ count, radius, isSpeaking }) {
  const pointsRef = useRef()

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const velocities = []

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius + (Math.random() - 0.5) * 0.8

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
      sizes[i] = 0.02 + Math.random() * 0.03

      velocities.push({
        theta: (Math.random() - 0.5) * 0.03,
        phi: (Math.random() - 0.5) * 0.03,
        r: radius + (Math.random() - 0.5) * 0.8,
        phase: Math.random() * Math.PI * 2
      })
    }

    return { positions, sizes, velocities }
  }, [count, radius])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const positions = pointsRef.current.geometry.attributes.position.array
    const speedMult = isSpeaking ? 4 : 1.5

    for (let i = 0; i < count; i++) {
      const vel = particles.velocities[i]
      const theta = t * vel.theta * 10 * speedMult + vel.phase
      const phi = t * vel.phi * 10 * speedMult + vel.phase * 0.5
      const r = vel.r + Math.sin(t * 3 + vel.phase) * 0.15

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.material.size = isSpeaking ? 0.04 : 0.025
  })

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
        size={0.025}
        color="#00ffff"
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Energy pulses radiating outward
function EnergyPulses({ isSpeaking }) {
  const pulsesRef = useRef([])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    pulsesRef.current.forEach((pulse, i) => {
      if (pulse) {
        const phase = (t * 0.8 + i * 0.33) % 1
        const scale = 0.6 + phase * 2
        pulse.scale.setScalar(scale)
        pulse.material.opacity = isSpeaking
          ? (1 - phase) * 0.5
          : (1 - phase) * 0.15
        pulse.rotation.z = t * 0.2 + i
      }
    })
  })

  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => (pulsesRef.current[i] = el)}>
          <ringGeometry args={[0.95, 1.0, 6]} />
          <meshBasicMaterial
            color="#00d4ff"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

// Arc connectors between elements
function ArcConnectors({ isSpeaking }) {
  const groupRef = useRef()
  const arcsRef = useRef([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    groupRef.current.rotation.z = t * 0.1

    arcsRef.current.forEach((arc, i) => {
      if (arc) {
        arc.material.opacity = isSpeaking
          ? 0.6 + Math.sin(t * 8 + i * 2) * 0.3
          : 0.2 + Math.sin(t * 2 + i) * 0.1
      }
    })
  })

  return (
    <group ref={groupRef}>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(el) => (arcsRef.current[i] = el)}
          rotation={[0, 0, (i * Math.PI) / 2]}
        >
          <torusGeometry args={[1.3, 0.008, 8, 32, Math.PI / 3]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

// Floating data nodes
function DataNodes({ isSpeaking }) {
  const nodesRef = useRef([])

  const nodes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2
      const radius = 2 + Math.random() * 0.5
      return {
        x: Math.cos(angle) * radius,
        y: (Math.random() - 0.5) * 2,
        z: Math.sin(angle) * radius,
        speed: 0.5 + Math.random() * 0.5,
        size: 0.03 + Math.random() * 0.02
      }
    })
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    nodesRef.current.forEach((node, i) => {
      if (node) {
        const data = nodes[i]
        node.position.y = data.y + Math.sin(t * data.speed + i) * 0.3
        node.rotation.x = t * 2
        node.rotation.y = t * 1.5
        node.material.emissiveIntensity = isSpeaking ? 2 + Math.sin(t * 10 + i) : 0.8
      }
    })
  })

  return (
    <group>
      {nodes.map((node, i) => (
        <mesh
          key={i}
          ref={(el) => (nodesRef.current[i] = el)}
          position={[node.x, node.y, node.z]}
        >
          <octahedronGeometry args={[node.size]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00ffff"
            emissiveIntensity={0.8}
            transparent
            opacity={isSpeaking ? 0.9 : 0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

// Vertical light beams
function LightBeams({ isSpeaking }) {
  const beamsRef = useRef([])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    beamsRef.current.forEach((beam, i) => {
      if (beam) {
        beam.material.opacity = isSpeaking
          ? 0.15 + Math.sin(t * 5 + i * 2) * 0.1
          : 0.05
        beam.scale.y = 1 + Math.sin(t * 2 + i) * 0.2
      }
    })
  })

  return (
    <group>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(el) => (beamsRef.current[i] = el)}
          position={[0, 0, 0]}
          rotation={[0, (i * Math.PI) / 2, 0]}
        >
          <planeGeometry args={[0.02, 6]} />
          <meshBasicMaterial
            color="#00d4ff"
            transparent
            opacity={0.08}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

// Main JARVIS Core component
export default function JarvisCore({ isSpeaking, isGenerating = false }) {
  const groupRef = useRef()
  const active = isSpeaking || isGenerating

  useFrame((state) => {
    const t = state.clock.elapsedTime
    // Subtle breathing motion - more active when generating
    const breathAmount = isGenerating ? 0.1 : 0.05
    const breathSpeed = isGenerating ? 1 : 0.5
    groupRef.current.position.y = Math.sin(t * breathSpeed) * breathAmount

    // Slight rotation when generating
    if (isGenerating) {
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#00d4ff" distance={8} decay={2} />
      <pointLight position={[3, 3, 3]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-3, -2, -3]} intensity={0.5} color="#0066ff" />
      <pointLight position={[0, 3, 0]} intensity={0.4} color="#00ffff" />

      {/* Core elements */}
      <CoreSphere isSpeaking={isSpeaking} />
      <WireframeShell isSpeaking={isSpeaking} />

      {/* Hexagonal background */}
      <HexGrid radius={2.5} isSpeaking={isSpeaking} />

      {/* Rotating rings - varied segments */}
      <HoloRing radius={0.9} rotationAxis="x" speed={0.8} thickness={0.015} segments={3} isSpeaking={isSpeaking} />
      <HoloRing radius={1.1} rotationAxis="y" speed={-0.5} thickness={0.012} segments={1} isSpeaking={isSpeaking} />
      <HoloRing radius={1.3} rotationAxis="z" speed={0.6} thickness={0.01} segments={4} isSpeaking={isSpeaking} />
      <HoloRing radius={1.5} rotationAxis="x" speed={-0.4} thickness={0.008} segments={2} isSpeaking={isSpeaking} />
      <HoloRing radius={1.7} rotationAxis="y" speed={0.3} thickness={0.006} segments={5} isSpeaking={isSpeaking} />

      {/* Arc connectors */}
      <ArcConnectors isSpeaking={isSpeaking} />

      {/* Particles */}
      <OrbitalParticles count={300} radius={1.9} isSpeaking={isSpeaking} />
      <OrbitalParticles count={150} radius={2.4} isSpeaking={isSpeaking} />

      {/* Energy pulses */}
      <EnergyPulses isSpeaking={isSpeaking} />

      {/* Data nodes */}
      <DataNodes isSpeaking={isSpeaking} />

      {/* Light beams */}
      <LightBeams isSpeaking={isSpeaking} />
    </group>
  )
}
