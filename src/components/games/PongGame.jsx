import { useState, useEffect, useRef, useCallback } from 'react'
import GameLayout from './GameLayout'

const PongGame = () => {
  const canvasRef = useRef(null)
  const [scoreLeft, setScoreLeft] = useState(0)
  const [scoreRight, setScoreRight] = useState(0)
  const [gameState, setGameState] = useState('ready')
  const [mode, setMode] = useState('ai') // 'ai' or '2player'
  const [difficulty, setDifficulty] = useState('normal')
  
  const difficultyMap = { easy: 0.03, normal: 0.06, hard: 0.1 }
  
  const gameRef = useRef({
    paddleLeft: { y: 0, height: 100, speed: 8 },
    paddleRight: { y: 0, height: 100, speed: 8 },
    ball: { x: 0, y: 0, dx: 0, dy: 0, radius: 8, speed: 5 },
    keys: {}
  })

  const resetBall = useCallback((toLeft = false) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { ball } = gameRef.current
    ball.x = canvas.width / 2
    ball.y = canvas.height / 2
    const angle = (Math.random() - 0.5) * Math.PI / 3
    const direction = toLeft ? -1 : 1
    ball.dx = Math.cos(angle) * ball.speed * direction
    ball.dy = Math.sin(angle) * ball.speed
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0) return
    const ctx = canvas.getContext('2d')
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#0a192f')
    gradient.addColorStop(1, '#112240')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.setLineDash([10, 10])
    ctx.strokeStyle = 'rgba(100, 255, 218, 0.2)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()
    ctx.setLineDash([])

    const { paddleLeft, paddleRight, ball } = gameRef.current
    
    ctx.shadowBlur = 20
    ctx.shadowColor = '#64ffda'
    ctx.fillStyle = '#64ffda'
    ctx.fillRect(20, paddleLeft.y, 10, paddleLeft.height)
    
    ctx.shadowColor = '#fbb6ce'
    ctx.fillStyle = '#fbb6ce'
    ctx.fillRect(canvas.width - 30, paddleRight.y, 10, paddleRight.height)
    
    ctx.shadowBlur = 25
    ctx.shadowColor = '#fbbf24'
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }, [])

  const update = useCallback(() => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return

    const { paddleLeft, paddleRight, ball, keys } = gameRef.current
    
    // Only use keyboard for left paddle if no mouse movement (keyboard takes priority when pressed)
    if (keys['w'] && paddleLeft.y > 0) paddleLeft.y -= paddleLeft.speed
    if (keys['s'] && paddleLeft.y < canvas.height - paddleLeft.height) paddleLeft.y += paddleLeft.speed
    
    if (mode === '2player') {
      if ((keys['ArrowUp'] || keys['arrowup']) && paddleRight.y > 0) paddleRight.y -= paddleRight.speed
      if ((keys['ArrowDown'] || keys['arrowdown']) && paddleRight.y < canvas.height - paddleRight.height) paddleRight.y += paddleRight.speed
    } else {
      const aiSpeed = difficultyMap[difficulty]
      const targetY = ball.y - paddleRight.height / 2
      const diff = targetY - paddleRight.y
      paddleRight.y += diff * aiSpeed
      paddleRight.y = Math.max(0, Math.min(canvas.height - paddleRight.height, paddleRight.y))
    }
    
    ball.x += ball.dx
    ball.y += ball.dy
    
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
      ball.dy *= -1
    }
    
    if (ball.x - ball.radius < 30 && ball.y > paddleLeft.y && ball.y < paddleLeft.y + paddleLeft.height) {
      ball.dx = Math.abs(ball.dx)
      const hitPos = (ball.y - paddleLeft.y) / paddleLeft.height - 0.5
      ball.dy = hitPos * ball.speed * 2
    }
    
    if (ball.x + ball.radius > canvas.width - 30 && ball.y > paddleRight.y && ball.y < paddleRight.y + paddleRight.height) {
      ball.dx = -Math.abs(ball.dx)
      const hitPos = (ball.y - paddleRight.y) / paddleRight.height - 0.5
      ball.dy = hitPos * ball.speed * 2
    }
    
    if (ball.x < 0) {
      setScoreRight(prev => prev + 1)
      resetBall(false)
    } else if (ball.x > canvas.width) {
      setScoreLeft(prev => prev + 1)
      resetBall(true)
    }
    
    draw()
  }, [gameState, mode, difficulty, difficultyMap, resetBall, draw])

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(update, 1000 / 60)
      return () => clearInterval(interval)
    }
  }, [gameState, update])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['w', 's', 'W', 'S', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault()
      }
      gameRef.current.keys[e.key.toLowerCase()] = true
      if (gameState === 'ready' && ['w', 's', 'W', 'S', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        startGame()
      }
      if (e.key === ' ') {
        if (gameState === 'playing') setGameState('paused')
        else if (gameState === 'paused') setGameState('playing')
      }
    }
    const handleKeyUp = (e) => {
      gameRef.current.keys[e.key.toLowerCase()] = false
    }
    
    const handleMouseMove = (e) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      
      // Check if mouse is over the canvas
      if (e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom) {
        const mouseY = e.clientY - rect.top
        const canvasHeight = rect.height
        const paddleHeight = gameRef.current.paddleLeft.height
        
        // Convert mouse position to canvas coordinates
        const scale = canvas.height / canvasHeight
        const targetY = mouseY * scale - paddleHeight / 2
        
        // Clamp to canvas bounds
        const clampedY = Math.max(0, Math.min(canvas.height - paddleHeight, targetY))
        
        // In 2-player mode, left half controls left paddle, right half controls right paddle
        if (mode === '2player') {
          const mouseX = e.clientX - rect.left
          if (mouseX < rect.width / 2) {
            gameRef.current.paddleLeft.y = clampedY
          } else {
            gameRef.current.paddleRight.y = clampedY
          }
        } else {
          // In AI mode, mouse controls left paddle only
          gameRef.current.paddleLeft.y = clampedY
        }
        
        // Start game on mouse move if in ready state
        if (gameState === 'ready') {
          startGame()
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [gameState, mode])

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const container = canvas.parentElement
      if (!container) return
      const rect = container.getBoundingClientRect()
      const width = Math.min(rect.width - 16, 800)
      const height = Math.min(rect.height - 16, 600)
      if (width > 50 && height > 50) {
        canvas.width = width
        canvas.height = height
        gameRef.current.paddleLeft.y = height / 2 - 50
        gameRef.current.paddleRight.y = height / 2 - 50
        if (gameState === 'ready') resetBall()
        draw()
      }
    }
    const timer = setTimeout(updateCanvasSize, 50)
    window.addEventListener('resize', updateCanvasSize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [draw, resetBall, gameState])

  const startGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    gameRef.current.paddleLeft.y = canvas.height / 2 - 50
    gameRef.current.paddleRight.y = canvas.height / 2 - 50
    gameRef.current.keys = {}
    resetBall()
    setScoreLeft(0)
    setScoreRight(0)
    setGameState('playing')
  }

  const resetGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    gameRef.current.paddleLeft.y = canvas.height / 2 - 50
    gameRef.current.paddleRight.y = canvas.height / 2 - 50
    gameRef.current.keys = {}
    resetBall()
    setScoreLeft(0)
    setScoreRight(0)
    setGameState('ready')
    draw()
  }

  return (
    <GameLayout title="🏓 Pong">
      <div className="h-[calc(100vh-73px)] flex flex-col lg:flex-row gap-4 p-4">
        <div className="hidden lg:flex lg:w-64 xl:w-80 flex-col gap-4 overflow-y-auto">
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Controls</h3>
            <div className="space-y-2">
              <button onClick={startGame} className="w-full px-4 py-2.5 bg-success hover:bg-success/80 text-white font-semibold rounded-lg transition-all">Start Game</button>
              <button onClick={resetGame} className="w-full px-4 py-2.5 bg-danger hover:bg-danger/80 text-white font-semibold rounded-lg transition-all">Reset</button>
            </div>
          </div>
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              {['ai', '2player'].map(m => (
                <button key={m} onClick={() => setMode(m)} className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${mode === m ? 'bg-secondary text-dark' : 'bg-dark/50 text-gray hover:bg-dark'}`}>
                  {m === 'ai' ? 'vs AI' : '2 Player'}
                </button>
              ))}
            </div>
          </div>
          {mode === 'ai' && (
            <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
              <h3 className="text-secondary font-bold text-lg mb-3">Difficulty</h3>
              <div className="grid grid-cols-3 gap-2">
                {['easy', 'normal', 'hard'].map(d => (
                  <button key={d} onClick={() => setDifficulty(d)} className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${difficulty === d ? 'bg-secondary text-dark' : 'bg-dark/50 text-gray hover:bg-dark'}`}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">How to Play</h3>
            <div className="space-y-2 text-sm text-gray">
              {mode === '2player' ? (
                <>
                  <p><span className="text-secondary font-semibold">Mouse Left:</span> Left Paddle</p>
                  <p><span className="text-secondary font-semibold">Mouse Right:</span> Right Paddle</p>
                  <p><span className="text-secondary font-semibold">W/S:</span> Left Paddle (Alt)</p>
                  <p><span className="text-secondary font-semibold">↑/↓:</span> Right Paddle (Alt)</p>
                </>
              ) : (
                <>
                  <p><span className="text-secondary font-semibold">Mouse:</span> Move Paddle</p>
                  <p><span className="text-secondary font-semibold">W/S:</span> Move Paddle (Alt)</p>
                </>
              )}
              <p><span className="text-secondary font-semibold">Space:</span> Pause</p>
              <p className="pt-2 border-t border-gray-700 mt-2">First to 11 wins!</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="lg:hidden flex gap-2 flex-shrink-0">
            <div className="flex-1 bg-[#112240] rounded-lg p-2 border border-gray-700 text-center">
              <p className="text-xs text-gray">Player 1</p>
              <p className="text-2xl font-bold text-secondary">{scoreLeft}</p>
            </div>
            <div className="flex-1 bg-[#112240] rounded-lg p-2 border border-gray-700 text-center">
              <p className="text-xs text-gray">{mode === 'ai' ? 'AI' : 'Player 2'}</p>
              <p className="text-2xl font-bold text-warning">{scoreRight}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-0 relative">
            <canvas ref={canvasRef} className="border-4 border-secondary/30 rounded-xl shadow-2xl max-w-full max-h-full" style={{ boxShadow: '0 0 60px rgba(100, 255, 218, 0.3)' }} />
            {gameState === 'ready' && (
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <h2 className="text-2xl md:text-4xl font-bold text-secondary mb-2 md:mb-4">Ready?</h2>
                  <p className="text-sm md:text-base text-gray mb-4">Move mouse or press W/S to start</p>
                  <button onClick={startGame} className="px-6 md:px-8 py-2 md:py-3 bg-secondary hover:bg-secondary/80 text-dark font-bold rounded-lg transition-all">Start</button>
                </div>
              </div>
            )}
            {gameState === 'paused' && (
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <h2 className="text-2xl md:text-4xl font-bold text-warning mb-2">Paused</h2>
                  <p className="text-sm md:text-base text-gray">Press Space</p>
                </div>
              </div>
            )}
          </div>
          <div className="lg:hidden flex gap-2 flex-shrink-0">
            <button onClick={startGame} className="flex-1 px-4 py-2.5 bg-success hover:bg-success/80 text-white font-semibold rounded-lg transition-all">Start</button>
            <button onClick={resetGame} className="flex-1 px-4 py-2.5 bg-danger hover:bg-danger/80 text-white font-semibold rounded-lg transition-all">Reset</button>
            <button onClick={() => setMode(mode === 'ai' ? '2player' : 'ai')} className="px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-dark font-semibold rounded-lg transition-all text-sm">
              {mode === 'ai' ? 'AI' : '2P'}
            </button>
          </div>
          {mode === '2player' && (
            <div className="lg:hidden grid grid-cols-2 gap-2 flex-shrink-0">
              <div className="space-y-2">
                <p className="text-xs text-center text-gray">Player 1</p>
                <button 
                  onTouchStart={() => gameRef.current.keys['w'] = true}
                  onTouchEnd={() => gameRef.current.keys['w'] = false}
                  onMouseDown={() => gameRef.current.keys['w'] = true}
                  onMouseUp={() => gameRef.current.keys['w'] = false}
                  onMouseLeave={() => gameRef.current.keys['w'] = false}
                  className="w-full px-4 py-3 bg-secondary/20 hover:bg-secondary/30 text-secondary font-semibold rounded-lg transition-all active:bg-secondary/40"
                >
                  ▲
                </button>
                <button 
                  onTouchStart={() => gameRef.current.keys['s'] = true}
                  onTouchEnd={() => gameRef.current.keys['s'] = false}
                  onMouseDown={() => gameRef.current.keys['s'] = true}
                  onMouseUp={() => gameRef.current.keys['s'] = false}
                  onMouseLeave={() => gameRef.current.keys['s'] = false}
                  className="w-full px-4 py-3 bg-secondary/20 hover:bg-secondary/30 text-secondary font-semibold rounded-lg transition-all active:bg-secondary/40"
                >
                  ▼
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-center text-gray">Player 2</p>
                <button 
                  onTouchStart={() => gameRef.current.keys['arrowup'] = true}
                  onTouchEnd={() => gameRef.current.keys['arrowup'] = false}
                  onMouseDown={() => gameRef.current.keys['arrowup'] = true}
                  onMouseUp={() => gameRef.current.keys['arrowup'] = false}
                  onMouseLeave={() => gameRef.current.keys['arrowup'] = false}
                  className="w-full px-4 py-3 bg-warning/20 hover:bg-warning/30 text-warning font-semibold rounded-lg transition-all active:bg-warning/40"
                >
                  ▲
                </button>
                <button 
                  onTouchStart={() => gameRef.current.keys['arrowdown'] = true}
                  onTouchEnd={() => gameRef.current.keys['arrowdown'] = false}
                  onMouseDown={() => gameRef.current.keys['arrowdown'] = true}
                  onMouseUp={() => gameRef.current.keys['arrowdown'] = false}
                  onMouseLeave={() => gameRef.current.keys['arrowdown'] = false}
                  className="w-full px-4 py-3 bg-warning/20 hover:bg-warning/30 text-warning font-semibold rounded-lg transition-all active:bg-warning/40"
                >
                  ▼
                </button>
              </div>
            </div>
          )}
          {mode === 'ai' && (
            <div className="lg:hidden space-y-2 flex-shrink-0">
              <p className="text-xs text-center text-gray">Your Controls</p>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onTouchStart={() => gameRef.current.keys['w'] = true}
                  onTouchEnd={() => gameRef.current.keys['w'] = false}
                  onMouseDown={() => gameRef.current.keys['w'] = true}
                  onMouseUp={() => gameRef.current.keys['w'] = false}
                  onMouseLeave={() => gameRef.current.keys['w'] = false}
                  className="px-4 py-3 bg-secondary/20 hover:bg-secondary/30 text-secondary font-semibold rounded-lg transition-all active:bg-secondary/40"
                >
                  ▲ Up
                </button>
                <button 
                  onTouchStart={() => gameRef.current.keys['s'] = true}
                  onTouchEnd={() => gameRef.current.keys['s'] = false}
                  onMouseDown={() => gameRef.current.keys['s'] = true}
                  onMouseUp={() => gameRef.current.keys['s'] = false}
                  onMouseLeave={() => gameRef.current.keys['s'] = false}
                  className="px-4 py-3 bg-secondary/20 hover:bg-secondary/30 text-secondary font-semibold rounded-lg transition-all active:bg-secondary/40"
                >
                  ▼ Down
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="hidden lg:flex lg:w-64 xl:w-80 flex-col gap-4 overflow-y-auto">
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Score</h3>
            <div className="space-y-3">
              <div className="bg-dark/50 rounded-lg p-3">
                <p className="text-gray text-sm mb-1">Player 1</p>
                <p className="text-5xl font-bold text-secondary text-center">{scoreLeft}</p>
              </div>
              <div className="bg-dark/50 rounded-lg p-3">
                <p className="text-gray text-sm mb-1">{mode === 'ai' ? 'AI' : 'Player 2'}</p>
                <p className="text-5xl font-bold text-warning text-center">{scoreRight}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  )
}

export default PongGame
