import { useState, useEffect } from 'react'

// HUD data readouts
function HudReadouts({ isSpeaking, isGenerating }) {
  const [data, setData] = useState({
    cpu: 23,
    memory: 47,
    network: 99,
    power: 100,
    files: 0,
    modules: 0
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        cpu: Math.floor(20 + Math.random() * (isGenerating ? 60 : isSpeaking ? 40 : 15)),
        memory: Math.floor(45 + Math.random() * (isGenerating ? 30 : 10)),
        network: Math.floor(95 + Math.random() * 5),
        power: 100,
        files: isGenerating ? Math.min(prev.files + (Math.random() > 0.7 ? 1 : 0), 8) : 0,
        modules: isGenerating ? Math.min(prev.modules + (Math.random() > 0.8 ? 1 : 0), 12) : 0
      }))
    }, 200)
    return () => clearInterval(interval)
  }, [isSpeaking, isGenerating])

  const readoutStyle = {
    fontFamily: "'Roboto Mono', monospace",
    fontSize: '10px',
    color: 'rgba(0, 212, 255, 0.7)',
    letterSpacing: '1px',
  }

  return (
    <>
      {/* Left side readouts */}
      <div style={{
        position: 'absolute',
        left: '30px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        pointerEvents: 'none',
      }}>
        <div style={readoutStyle}>
          <div style={{ marginBottom: '4px', opacity: 0.5 }}>CPU LOAD</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '60px',
              height: '4px',
              background: 'rgba(0, 212, 255, 0.2)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${data.cpu}%`,
                height: '100%',
                background: data.cpu > 50 ? '#00ffaa' : '#00d4ff',
                boxShadow: `0 0 10px ${data.cpu > 50 ? '#00ffaa' : '#00d4ff'}`,
                transition: 'width 0.2s',
              }} />
            </div>
            <span>{data.cpu}%</span>
          </div>
        </div>

        <div style={readoutStyle}>
          <div style={{ marginBottom: '4px', opacity: 0.5 }}>MEMORY</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '60px',
              height: '4px',
              background: 'rgba(0, 212, 255, 0.2)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${data.memory}%`,
                height: '100%',
                background: '#00d4ff',
                boxShadow: '0 0 10px #00d4ff',
                transition: 'width 0.2s',
              }} />
            </div>
            <span>{data.memory}%</span>
          </div>
        </div>

        <div style={readoutStyle}>
          <div style={{ marginBottom: '4px', opacity: 0.5 }}>NETWORK</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '60px',
              height: '4px',
              background: 'rgba(0, 212, 255, 0.2)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${data.network}%`,
                height: '100%',
                background: '#00ffaa',
                boxShadow: '0 0 10px #00ffaa',
                transition: 'width 0.2s',
              }} />
            </div>
            <span>{data.network}%</span>
          </div>
        </div>
      </div>

      {/* Right side readouts */}
      <div style={{
        position: 'absolute',
        right: '30px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}>
        <div style={{
          ...readoutStyle,
          textAlign: 'right',
        }}>
          <div style={{ opacity: 0.5, marginBottom: '2px' }}>SYSTEM</div>
          <div style={{ color: '#00ffaa' }}>ONLINE</div>
        </div>

        <div style={{
          ...readoutStyle,
          textAlign: 'right',
        }}>
          <div style={{ opacity: 0.5, marginBottom: '2px' }}>POWER</div>
          <div>{data.power}%</div>
        </div>

        <div style={{
          ...readoutStyle,
          textAlign: 'right',
        }}>
          <div style={{ opacity: 0.5, marginBottom: '2px' }}>UPTIME</div>
          <div>99.97%</div>
        </div>

        <div style={{
          ...readoutStyle,
          textAlign: 'right',
        }}>
          <div style={{ opacity: 0.5, marginBottom: '2px' }}>SECURITY</div>
          <div style={{ color: '#00ffaa' }}>ACTIVE</div>
        </div>

        {isGenerating && (
          <>
            <div style={{
              ...readoutStyle,
              textAlign: 'right',
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(0, 255, 136, 0.2)',
            }}>
              <div style={{ opacity: 0.5, marginBottom: '2px', color: '#00ff88' }}>FILES</div>
              <div style={{ color: '#00ff88', fontSize: '14px' }}>{data.files}</div>
            </div>

            <div style={{
              ...readoutStyle,
              textAlign: 'right',
            }}>
              <div style={{ opacity: 0.5, marginBottom: '2px', color: '#00ff88' }}>MODULES</div>
              <div style={{ color: '#00ff88', fontSize: '14px' }}>{data.modules}</div>
            </div>
          </>
        )}
      </div>

      {/* Top center time/date */}
      <div style={{
        position: 'absolute',
        top: '25px',
        left: '50%',
        transform: 'translateX(-50%)',
        ...readoutStyle,
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: '24px', color: '#00d4ff', letterSpacing: '4px' }}>
          {new Date().toLocaleTimeString('en-US', { hour12: false })}
        </div>
        <div style={{ opacity: 0.5, marginTop: '4px' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
        </div>
      </div>
    </>
  )
}

export default function TextInterface({ text, isSpeaking, isGenerating = false, progress = 0 }) {
  const [cursorVisible, setCursorVisible] = useState(true)
  const [time, setTime] = useState(new Date())

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <HudReadouts isSpeaking={isSpeaking} isGenerating={isGenerating} />

      <div style={{
        position: 'absolute',
        bottom: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        maxWidth: '700px',
        pointerEvents: 'none',
      }}>
        {/* JARVIS label */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: isSpeaking
              ? 'radial-gradient(circle, #00ffff 0%, #0088ff 100%)'
              : 'radial-gradient(circle, #006688 0%, #003344 100%)',
            boxShadow: isSpeaking
              ? '0 0 15px #00d4ff, 0 0 30px #00d4ff'
              : '0 0 8px #006688',
            animation: isSpeaking ? 'pulse 0.5s ease-in-out infinite' : 'none',
          }} />
          <span style={{
            fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
            fontSize: '13px',
            color: '#00d4ff',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            textShadow: '0 0 10px #00d4ff',
          }}>
            J.A.R.V.I.S
          </span>
          {isSpeaking && (
            <div style={{
              display: 'flex',
              gap: '2px',
              marginLeft: '8px',
            }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '2px',
                    height: '12px',
                    background: '#00d4ff',
                    animation: `soundBar 0.4s ease-in-out infinite`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Text container */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(0, 15, 30, 0.85) 0%, rgba(0, 30, 50, 0.75) 100%)',
          border: '1px solid rgba(0, 212, 255, 0.25)',
          borderRadius: '6px',
          padding: '20px 25px',
          backdropFilter: 'blur(15px)',
          boxShadow: `
            0 0 40px rgba(0, 212, 255, 0.08),
            inset 0 0 40px rgba(0, 212, 255, 0.03)
          `,
        }}>
          {/* Decorative corners */}
          {[
            { top: '-1px', left: '-1px', borderTop: '2px solid #00d4ff', borderLeft: '2px solid #00d4ff' },
            { top: '-1px', right: '-1px', borderTop: '2px solid #00d4ff', borderRight: '2px solid #00d4ff' },
            { bottom: '-1px', left: '-1px', borderBottom: '2px solid #00d4ff', borderLeft: '2px solid #00d4ff' },
            { bottom: '-1px', right: '-1px', borderBottom: '2px solid #00d4ff', borderRight: '2px solid #00d4ff' },
          ].map((style, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: '15px',
              height: '15px',
              ...style,
            }} />
          ))}

          {/* The actual text */}
          <p style={{
            fontFamily: "'Rajdhani', 'Roboto Mono', monospace",
            fontSize: '18px',
            color: '#e0f7ff',
            margin: 0,
            lineHeight: 1.5,
            letterSpacing: '0.5px',
            textShadow: '0 0 8px rgba(0, 212, 255, 0.4)',
            minHeight: '27px',
          }}>
            {text}
            <span style={{
              opacity: cursorVisible ? 1 : 0,
              color: '#00d4ff',
              marginLeft: '2px',
              fontWeight: 'bold',
            }}>|</span>
          </p>
        </div>

        {/* Status bar */}
        <div style={{
          marginTop: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 5px',
        }}>
          <span style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: '10px',
            color: isSpeaking ? 'rgba(0, 255, 170, 0.8)' : 'rgba(0, 212, 255, 0.5)',
            letterSpacing: '2px',
          }}>
            {isSpeaking ? '● PROCESSING' : '○ READY'}
          </span>
          <span style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: '10px',
            color: 'rgba(0, 212, 255, 0.5)',
            letterSpacing: '2px',
          }}>
            STARK INDUSTRIES
          </span>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@400;500;600&family=Roboto+Mono:wght@400;500&display=swap');

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }

        @keyframes soundBar {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </>
  )
}
