import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { OrbitControls, Stars } from '@react-three/drei'
import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import JarvisCore from './components/JarvisCore'
import CodeGeneration from './components/CodeGeneration'
import TextInterface from './components/TextInterface'

// Camera angle tracker component
function CameraTracker({ onAngleChange }) {
  const { camera } = useThree()

  useFrame(() => {
    // Get spherical coordinates from camera position
    const spherical = new THREE.Spherical()
    spherical.setFromVector3(camera.position)

    // Convert to degrees
    const azimuth = THREE.MathUtils.radToDeg(spherical.theta)
    const polar = THREE.MathUtils.radToDeg(spherical.phi)
    const distance = spherical.radius

    onAngleChange({
      azimuth: azimuth.toFixed(1),
      polar: polar.toFixed(1),
      distance: distance.toFixed(2)
    })
  })

  return null
}

function App() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mode, setMode] = useState('idle') // 'idle', 'speaking', 'generating'
  const [cameraAngles, setCameraAngles] = useState({ azimuth: '0', polar: '90', distance: '5' })

  // Typewriter effect
  const speak = useCallback((text, callback) => {
    setDisplayText('')
    setIsSpeaking(true)
    setMode('speaking')

    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setIsSpeaking(false)
          if (callback) callback()
        }, 300)
      }
    }, 25)

    return () => clearInterval(interval)
  }, [])

  // Code generation sequence
  const generateCode = useCallback(() => {
    setIsGenerating(true)
    setMode('generating')
    setProgress(0)

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 1) {
          clearInterval(progressInterval)
          return 1
        }
        return p + 0.008
      })
    }, 100)

    return () => clearInterval(progressInterval)
  }, [])

  // Main sequence
  useEffect(() => {
    const sequence = async () => {
      // Initial greeting
      await new Promise(resolve => {
        speak("Good evening, sir. JARVIS online and ready.", resolve)
      })

      await new Promise(r => setTimeout(r, 2000))

      // Prompt received
      await new Promise(resolve => {
        speak("Prompt received: 'Build me an AI assistant with OpenAI integration, voice input, and text-to-speech capabilities.'", resolve)
      })

      await new Promise(r => setTimeout(r, 1500))

      // Analyzing
      await new Promise(resolve => {
        speak("Analyzing requirements... Identifying optimal architecture patterns.", resolve)
      })

      await new Promise(r => setTimeout(r, 1000))

      // Start generating
      await new Promise(resolve => {
        speak("Initiating code generation sequence. Deploying holographic workspace.", resolve)
      })

      await new Promise(r => setTimeout(r, 500))

      // Generate!
      generateCode()

      await new Promise(resolve => {
        speak("Generating OpenAI integration module... Creating React hooks... Implementing voice recognition... Configuring text-to-speech engine...", resolve)
      })

      await new Promise(r => setTimeout(r, 8000))

      await new Promise(resolve => {
        speak("Building type definitions... Setting up configuration schema... Optimizing bundle structure...", resolve)
      })

      await new Promise(r => setTimeout(r, 6000))

      // Complete
      await new Promise(resolve => {
        speak("Code generation complete. 8 files created. All modules compiled successfully. System ready for deployment.", resolve)
      })

      await new Promise(r => setTimeout(r, 3000))

      // Stop generating
      setIsGenerating(false)
      setMode('idle')
      setProgress(0)

      await new Promise(r => setTimeout(r, 2000))

      // Restart sequence
      sequence()
    }

    sequence()
  }, [speak, generateCode])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#000004']} />
        <fog attach="fog" args={['#000008', 8, 25]} />

        {/* Star field */}
        <Stars
          radius={50}
          depth={50}
          count={1500}
          factor={3}
          saturation={0}
          fade
          speed={isGenerating ? 2 : 0.5}
        />

        <Suspense fallback={null}>
          <JarvisCore isSpeaking={isSpeaking} isGenerating={isGenerating} />
          <CodeGeneration isGenerating={isGenerating} progress={progress} />
        </Suspense>

        <CameraTracker onAngleChange={setCameraAngles} />

        <EffectComposer>
          <Bloom
            intensity={isGenerating ? 2.5 : 2}
            luminanceThreshold={0.05}
            luminanceSmoothing={0.9}
            radius={0.9}
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={isGenerating ? [0.001, 0.001] : [0.0005, 0.0005]}
          />
          <Vignette
            offset={0.3}
            darkness={isGenerating ? 0.5 : 0.6}
            blendFunction={BlendFunction.NORMAL}
          />
        </EffectComposer>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={12}
          autoRotate
          autoRotateSpeed={isGenerating ? 0.5 : 0.2}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      <TextInterface
        text={displayText}
        isSpeaking={isSpeaking}
        isGenerating={isGenerating}
        progress={progress}
      />

      {/* Scanline overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px)',
        zIndex: 100,
      }} />

      {/* Debug camera angle label */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        padding: '12px 16px',
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(255, 100, 0, 0.5)',
        borderRadius: '4px',
        fontFamily: "'Roboto Mono', monospace",
        fontSize: '12px',
        color: '#ff6600',
        zIndex: 300,
        textShadow: '0 0 5px #ff6600',
        pointerEvents: 'none',
      }}>
        <div style={{ marginBottom: '4px', color: '#ff9944', fontSize: '10px', letterSpacing: '2px' }}>DEBUG</div>
        <div>AZIMUTH: <span style={{ color: '#00ffaa' }}>{cameraAngles.azimuth}°</span></div>
        <div>POLAR: <span style={{ color: '#00ffaa' }}>{cameraAngles.polar}°</span></div>
        <div>DISTANCE: <span style={{ color: '#00ffaa' }}>{cameraAngles.distance}</span></div>
      </div>

      {/* Code generation indicator */}
      {isGenerating && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          padding: '10px 25px',
          background: 'rgba(0, 255, 136, 0.1)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          borderRadius: '4px',
          zIndex: 200,
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#00ff88',
            boxShadow: '0 0 15px #00ff88',
            animation: 'pulse 0.5s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '14px',
            color: '#00ff88',
            letterSpacing: '3px',
            textShadow: '0 0 10px #00ff88',
          }}>
            GENERATING CODE
          </span>
          <span style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: '14px',
            color: '#00ff88',
          }}>
            {Math.floor(progress * 100)}%
          </span>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}

export default App
