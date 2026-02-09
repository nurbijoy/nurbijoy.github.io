import { useState, useEffect, useRef, useCallback } from 'react'
import GameLayout from './GameLayout'
import { useInputDevice } from '../../hooks/useInputDevice'

const FlappyGame = () => {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('flappyHighScore')) || 0
  })
  const [gameState, setGameState] = useState('ready')
  const { showTouchControls, toggleTouchControls } = useInputDevice()

  const gameRef = useRef({
    bird: { y: 0, velocity: 0 },
    pipes: [],
    frameCount: 0,
    gravity: 0.5,
    jumpStrength: -9,
    pipeGap: 150,
    pipeWidth: 60,
    pipeSpeed: 3
  })

  const jump = useCallback(() => {
    if (gameState === 'ready') {
      setGameState('playing')
    }
    if (gameState === 'playing') {
      gameRef.current.bird.velocity = gameRef.current.jumpStrength
    }
  }, [gameState])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0) return
    const ctx = canvas.getContext('2d')

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#0a192f')
    gradient.addColorStop(1, '#112240')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Ground line
    ctx.strokeStyle = 'rgba(100, 255, 218, 0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, canvas.height - 50)
    ctx.lineTo(canvas.width, canvas.height - 50)
    ctx.stroke()

    // Pipes
    gameRef.current.pipes.forEach(pipe => {
      ctx.fillStyle = 'rgba(100, 255, 218, 0.2)'
      ctx.strokeStyle = '#64ffda'
      ctx.lineWidth = 3
      ctx.shadowBlur = 15
      ctx.shadowColor = '#64ffda'
      
      // Top pipe
      ctx.fillRect(pipe.x, 0, gameRef.current.pipeWidth, pipe.top)
      ctx.strokeRect(pipe.x, 0, gameRef.current.pipeWidth, pipe.top)
      
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.bottom, gameRef.current.pipeWidth, canvas.height - pipe.bottom)
      ctx.strokeRect(pipe.x, pipe.bottom, gameRef.current.pipeWidth, canvas.height - pipe.bottom)
    })
    ctx.shadowBlur = 0

    // Bird
    const { bird } = gameRef.current
    const birdSize = 30
    const birdX = 100
    
    ctx.save()
    ctx.translate(birdX, bird.y)
    const rotation = Math.min(Math.max(bird.velocity * 0.05, -0.5), 0.5)
    ctx.rotate(rotation)
    
    ctx.shadowBlur = 20
    ctx.shadowColor = '#fbbf24'
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(0, 0, birdSize / 2, 0, Math.PI * 2)
    ctx.fill()
    
    // Eye
    ctx.fillStyle = '#0a192f'
    ctx.beginPath()
    ctx.arc(5, -5, 4, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.restore()
    ctx.shadowBlur = 0
  }, [])

  const update = useCallback(() => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return

    const { bird, pipes, pipeGap, pipeWidth, pipeSpeed, gravity } = gameRef.current
    
    // Update bird
    bird.velocity += gravity
    bird.y += bird.velocity

    // Check ground collision
    if (bird.y > canvas.height - 50 - 15 || bird.y < 15) {
      setGameState('gameOver')
      return
    }

    // Update pipes
    gameRef.current.frameCount++
    if (gameRef.current.frameCount % 90 === 0) {
      const minTop = 80
      const maxTop = canvas.height - 50 - pipeGap - 80
      const top = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop
      pipes.push({
        x: canvas.width,
        top: top,
        bottom: top + pipeGap,
        scored: false
      })
    }

    pipes.forEach((pipe, index) => {
      pipe.x -= pipeSpeed

      // Check collision
      const birdX = 100
      const birdSize = 30
      if (
        pipe.x < birdX + birdSize / 2 &&
        pipe.x + pipeWidth > birdX - birdSize / 2 &&
        (bird.y - birdSize / 2 < pipe.top || bird.y + birdSize / 2 > pipe.bottom)
      ) {
        setGameState('gameOver')
      }

      // Score
      if (!pipe.scored && pipe.x + pipeWidth < birdX) {
        pipe.scored = true
        const newScore = score + 1
        setScore(newScore)
        if (newScore > highScore) {
          setHighScore(newScore)
          localStorage.setItem('flappyHighScore', newScore)
        }
      }

      // Remove off-screen pipes
      if (pipe.x + pipeWidth < 0) {
        pipes.splice(index, 1)
      }
    })

    draw()
  }, [gameState, score, highScore, draw])

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(update, 1000 / 60)
      return () => clearInterval(interval)
    }
  }, [gameState, update])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault()
        jump()
      }
    }
    
    const handleClick = () => {
      jump()
    }
    
    const canvas = canvasRef.current
    window.addEventListener('keydown', handleKeyDown)
    if (canvas) {
      canvas.addEventListener('click', handleClick)
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (canvas) {
        canvas.removeEventListener('click', handleClick)
      }
    }
  }, [jump])

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const container = canvas.parentElement
      if (!container) return
      const rect = container.getBoundingClientRect()
      const width = Math.min(rect.width - 16, 600)
      const height = Math.min(rect.height - 16, 500)
      if (width > 50 && height > 50) {
        canvas.width = width
        canvas.height = height
        gameRef.current.bird.y = height / 2
        draw()
      }
    }
    const timer = setTimeout(updateCanvasSize, 50)
    window.addEventListener('resize', updateCanvasSize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [draw])

  const startGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    gameRef.current.bird = { y: canvas.height / 2, velocity: 0 }
    gameRef.current.pipes = []
    gameRef.current.frameCount = 0
    setScore(0)
    setGameState('playing')
  }

  const resetGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    gameRef.current.bird = { y: canvas.height / 2, velocity: 0 }
    gameRef.current.pipes = []
    gameRef.current.frameCount = 0
    setScore(0)
    setGameState('ready')
    draw()
  }

  return (
    <GameLayout title="🐦 Flappy Bird">
      <div className="h-[calc(100vh-73px)] flex flex-col lg:flex-row gap-4 p-4">
        <div className="hidden lg:flex lg:w-64 xl:w-80 flex-col gap-4 overflow-y-auto">
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Controls</h3>
            <div className="space-y-2">
              <button onClick={startGame} className="w-full px-4 py-2.5 bg-success hover:bg-success/80 text-white font-semibold rounded-lg transition-all">Start Game</button>
              <button onClick={resetGame} className="w-full px-4 py-2.5 bg-danger hover:bg-danger/80 text-white font-semibold rounded-lg transition-all">Reset</button>
              <button onClick={toggleTouchControls} className="w-full px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-dark font-semibold rounded-lg transition-all">
                {showTouchControls ? '🎮 Hide Touch Controls' : '🎮 Show Touch Controls'}
              </button>
            </div>
          </div>
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">How to Play</h3>
            <div className="space-y-2 text-sm text-gray">
              <p><span className="text-secondary font-semibold">Click/Tap:</span> Flap</p>
              <p><span className="text-secondary font-semibold">Space/↑:</span> Flap</p>
              <p className="pt-2 border-t border-gray-700 mt-2">Navigate through pipes without hitting them!</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {showTouchControls && (
            <div className="flex gap-1 flex-shrink-0">
              <div className="flex-1 bg-[#112240] rounded p-1 border border-gray-700 text-center">
                <p className="text-[10px] text-gray">Score</p>
                <p className="text-sm font-bold text-secondary">{score}</p>
              </div>
              <div className="flex-1 bg-[#112240] rounded p-1 border border-gray-700 text-center">
                <p className="text-[10px] text-gray">Best</p>
                <p className="text-sm font-bold text-warning">{highScore}</p>
              </div>
              <button onClick={startGame} className="px-2 py-1 bg-success text-white text-xs font-semibold rounded">▶</button>
              <button onClick={resetGame} className="px-2 py-1 bg-danger text-white text-xs font-semibold rounded">↻</button>
            </div>
          )}
          <div className="flex-1 flex items-center justify-center min-h-0 relative">
            <canvas ref={canvasRef} className="border-4 border-secondary/30 rounded-xl shadow-2xl max-w-full max-h-full cursor-pointer" style={{ boxShadow: '0 0 60px rgba(100, 255, 218, 0.3)' }} />
            
            <button 
              onClick={toggleTouchControls}
              className="lg:hidden absolute top-2 right-2 p-2 bg-secondary/80 hover:bg-secondary text-dark rounded-lg shadow-lg z-10 text-xs font-semibold"
              title={showTouchControls ? 'Hide touch controls' : 'Show touch controls'}
            >
              🎮
            </button>

            {gameState === 'ready' && (
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <h2 className="text-2xl md:text-4xl font-bold text-secondary mb-2 md:mb-4">Ready?</h2>
                  <p className="text-sm md:text-base text-gray mb-4">Click or press Space to start</p>
                  <button onClick={startGame} className="px-6 md:px-8 py-2 md:py-3 bg-secondary hover:bg-secondary/80 text-dark font-bold rounded-lg transition-all">Start</button>
                </div>
              </div>
            )}
            {gameState === 'gameOver' && (
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <h2 className="text-2xl md:text-4xl font-bold text-danger mb-2 md:mb-4">Game Over!</h2>
                  <p className="text-xl md:text-2xl text-secondary mb-1">Score: {score}</p>
                  <p className="text-lg md:text-xl text-gray mb-4">Best: {highScore}</p>
                  <button onClick={resetGame} className="px-6 md:px-8 py-2 md:py-3 bg-secondary hover:bg-secondary/80 text-dark font-bold rounded-lg transition-all">Play Again</button>
                </div>
              </div>
            )}
          </div>
          {showTouchControls && (
            <button 
              onClick={jump}
              className="py-8 bg-secondary/20 active:bg-secondary/40 text-secondary font-bold rounded text-2xl flex-shrink-0"
            >
              TAP TO FLAP
            </button>
          )}
        </div>
        <div className="hidden lg:flex lg:w-64 xl:w-80 flex-col gap-4 overflow-y-auto">
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Statistics</h3>
            <div className="space-y-3">
              <div className="bg-dark/50 rounded-lg p-3">
                <p className="text-gray text-sm mb-1">Score</p>
                <p className="text-3xl font-bold text-secondary">{score}</p>
              </div>
              <div className="bg-dark/50 rounded-lg p-3">
                <p className="text-gray text-sm mb-1">High Score</p>
                <p className="text-3xl font-bold text-warning">{highScore}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  )
}

export default FlappyGame
