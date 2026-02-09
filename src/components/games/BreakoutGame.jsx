import { useState, useEffect, useRef, useCallback } from 'react'
import GameLayout from './GameLayout'
import { useInputDevice } from '../../hooks/useInputDevice'

const BreakoutGame = () => {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('breakoutHighScore')) || 0
  })
  const [gameState, setGameState] = useState('ready')
  const { showTouchControls, toggleTouchControls } = useInputDevice()

  const gameRef = useRef({
    paddle: { x: 0, width: 100, height: 15, speed: 8 },
    ball: { x: 0, y: 0, dx: 0, dy: 0, radius: 8, speed: 5 },
    bricks: [],
    keys: {},
    mouseX: 0
  })

  const createBricks = useCallback((canvas, levelNum) => {
    const bricks = []
    const rows = 5 + Math.floor(levelNum / 2)
    const cols = 8
    const brickWidth = (canvas.width - 40) / cols
    const brickHeight = 20
    const colors = ['#64ffda', '#fbb6ce', '#fbbf24', '#a78bfa', '#60a5fa']
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        bricks.push({
          x: col * brickWidth + 20,
          y: row * brickHeight + 50,
          width: brickWidth - 4,
          height: brickHeight - 4,
          color: colors[row % colors.length],
          visible: true
        })
      }
    }
    return bricks
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0) return
    const ctx = canvas.getContext('2d')

    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#0a192f')
    gradient.addColorStop(1, '#112240')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Bricks
    gameRef.current.bricks.forEach(brick => {
      if (brick.visible) {
        ctx.fillStyle = brick.color
        ctx.shadowBlur = 10
        ctx.shadowColor = brick.color
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height)
      }
    })
    ctx.shadowBlur = 0

    // Paddle
    const { paddle } = gameRef.current
    ctx.fillStyle = '#64ffda'
    ctx.shadowBlur = 20
    ctx.shadowColor = '#64ffda'
    ctx.fillRect(paddle.x, canvas.height - 40, paddle.width, paddle.height)
    ctx.shadowBlur = 0

    // Ball
    const { ball } = gameRef.current
    ctx.fillStyle = '#fbbf24'
    ctx.shadowBlur = 25
    ctx.shadowColor = '#fbbf24'
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }, [])

  const update = useCallback(() => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return

    const { paddle, ball, bricks, keys, mouseX } = gameRef.current
    
    // Move paddle with keyboard
    if (keys['arrowleft'] && paddle.x > 0) paddle.x -= paddle.speed
    if (keys['arrowright'] && paddle.x < canvas.width - paddle.width) paddle.x += paddle.speed
    
    // Move paddle with mouse
    if (mouseX > 0) {
      paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, mouseX - paddle.width / 2))
    }
    
    // Move ball
    ball.x += ball.dx
    ball.y += ball.dy
    
    // Wall collision
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
      ball.dx *= -1
    }
    if (ball.y - ball.radius < 0) {
      ball.dy *= -1
    }
    
    // Paddle collision
    if (
      ball.y + ball.radius > canvas.height - 40 &&
      ball.y + ball.radius < canvas.height - 40 + paddle.height &&
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.width
    ) {
      ball.dy = -Math.abs(ball.dy)
      const hitPos = (ball.x - paddle.x) / paddle.width - 0.5
      ball.dx = hitPos * ball.speed * 2
    }
    
    // Brick collision
    bricks.forEach(brick => {
      if (brick.visible) {
        if (
          ball.x + ball.radius > brick.x &&
          ball.x - ball.radius < brick.x + brick.width &&
          ball.y + ball.radius > brick.y &&
          ball.y - ball.radius < brick.y + brick.height
        ) {
          brick.visible = false
          ball.dy *= -1
          const newScore = score + 10
          setScore(newScore)
          if (newScore > highScore) {
            setHighScore(newScore)
            localStorage.setItem('breakoutHighScore', newScore)
          }
        }
      }
    })
    
    // Check if all bricks destroyed
    if (bricks.every(brick => !brick.visible)) {
      setLevel(prev => prev + 1)
      gameRef.current.bricks = createBricks(canvas, level + 1)
      ball.x = canvas.width / 2
      ball.y = canvas.height - 60
      ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1)
      ball.dy = -ball.speed
    }
    
    // Ball out of bounds
    if (ball.y - ball.radius > canvas.height) {
      setLives(prev => {
        const newLives = prev - 1
        if (newLives <= 0) {
          setGameState('gameOver')
        } else {
          ball.x = canvas.width / 2
          ball.y = canvas.height - 60
          ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1)
          ball.dy = -ball.speed
        }
        return newLives
      })
    }
    
    draw()
  }, [gameState, score, highScore, level, draw, createBricks])

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(update, 1000 / 60)
      return () => clearInterval(interval)
    }
  }, [gameState, update])

  useEffect(() => {
    const handleKeyDown = (e) => {
      gameRef.current.keys[e.key.toLowerCase()] = true
      if (gameState === 'ready' && ['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        startGame()
      }
    }
    const handleKeyUp = (e) => {
      gameRef.current.keys[e.key.toLowerCase()] = false
    }
    
    const handleMouseMove = (e) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      if (e.clientX >= rect.left && e.clientX <= rect.right) {
        gameRef.current.mouseX = e.clientX - rect.left
        if (gameState === 'ready') startGame()
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
  }, [gameState])

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const container = canvas.parentElement
      if (!container) return
      const rect = container.getBoundingClientRect()
      const width = Math.min(rect.width - 16, 700)
      const height = Math.min(rect.height - 16, 600)
      if (width > 50 && height > 50) {
        canvas.width = width
        canvas.height = height
        gameRef.current.paddle.x = width / 2 - 50
        gameRef.current.ball.x = width / 2
        gameRef.current.ball.y = height - 60
        gameRef.current.bricks = createBricks(canvas, level)
        draw()
      }
    }
    const timer = setTimeout(updateCanvasSize, 50)
    window.addEventListener('resize', updateCanvasSize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [draw, level, createBricks])

  const startGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    gameRef.current.paddle.x = canvas.width / 2 - 50
    gameRef.current.ball = {
      x: canvas.width / 2,
      y: canvas.height - 60,
      dx: gameRef.current.ball.speed * (Math.random() > 0.5 ? 1 : -1),
      dy: -gameRef.current.ball.speed,
      radius: 8,
      speed: 5
    }
    gameRef.current.bricks = createBricks(canvas, level)
    gameRef.current.keys = {}
    setGameState('playing')
  }

  const resetGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    gameRef.current.paddle.x = canvas.width / 2 - 50
    gameRef.current.ball = {
      x: canvas.width / 2,
      y: canvas.height - 60,
      dx: 0,
      dy: 0,
      radius: 8,
      speed: 5
    }
    gameRef.current.bricks = createBricks(canvas, 1)
    gameRef.current.keys = {}
    gameRef.current.mouseX = 0
    setScore(0)
    setLives(3)
    setLevel(1)
    setGameState('ready')
    draw()
  }

  return (
    <GameLayout title="🧱 Brick Breaker">
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
              <p><span className="text-secondary font-semibold">Mouse:</span> Move Paddle</p>
              <p><span className="text-secondary font-semibold">← →:</span> Move Paddle</p>
              <p className="pt-2 border-t border-gray-700 mt-2">Break all bricks to advance!</p>
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
                <p className="text-[10px] text-gray">Lives</p>
                <p className="text-sm font-bold text-danger">{lives}</p>
              </div>
              <div className="flex-1 bg-[#112240] rounded p-1 border border-gray-700 text-center">
                <p className="text-[10px] text-gray">Level</p>
                <p className="text-sm font-bold text-warning">{level}</p>
              </div>
              <button onClick={startGame} className="px-2 py-1 bg-success text-white text-xs font-semibold rounded">▶</button>
              <button onClick={resetGame} className="px-2 py-1 bg-danger text-white text-xs font-semibold rounded">↻</button>
            </div>
          )}
          <div className="flex-1 flex items-center justify-center min-h-0 relative">
            <canvas ref={canvasRef} className="border-4 border-secondary/30 rounded-xl shadow-2xl max-w-full max-h-full" style={{ boxShadow: '0 0 60px rgba(100, 255, 218, 0.3)' }} />
            
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
                  <p className="text-sm md:text-base text-gray mb-4">Move mouse or arrows to start</p>
                  <button onClick={startGame} className="px-6 md:px-8 py-2 md:py-3 bg-secondary hover:bg-secondary/80 text-dark font-bold rounded-lg transition-all">Start</button>
                </div>
              </div>
            )}
            {gameState === 'gameOver' && (
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <h2 className="text-2xl md:text-4xl font-bold text-danger mb-2 md:mb-4">Game Over!</h2>
                  <p className="text-xl md:text-2xl text-secondary mb-1">Score: {score}</p>
                  <p className="text-lg md:text-xl text-gray mb-4">Level: {level}</p>
                  <button onClick={resetGame} className="px-6 md:px-8 py-2 md:py-3 bg-secondary hover:bg-secondary/80 text-dark font-bold rounded-lg transition-all">Play Again</button>
                </div>
              </div>
            )}
          </div>
          {showTouchControls && (
            <div className="flex gap-1 flex-shrink-0">
              <button 
                onTouchStart={() => gameRef.current.keys['arrowleft'] = true}
                onTouchEnd={() => gameRef.current.keys['arrowleft'] = false}
                onMouseDown={() => gameRef.current.keys['arrowleft'] = true}
                onMouseUp={() => gameRef.current.keys['arrowleft'] = false}
                onMouseLeave={() => gameRef.current.keys['arrowleft'] = false}
                className="flex-1 py-4 bg-secondary/20 active:bg-secondary/40 text-secondary font-bold rounded text-xl"
              >
                ◄ Left
              </button>
              <button 
                onTouchStart={() => gameRef.current.keys['arrowright'] = true}
                onTouchEnd={() => gameRef.current.keys['arrowright'] = false}
                onMouseDown={() => gameRef.current.keys['arrowright'] = true}
                onMouseUp={() => gameRef.current.keys['arrowright'] = false}
                onMouseLeave={() => gameRef.current.keys['arrowright'] = false}
                className="flex-1 py-4 bg-secondary/20 active:bg-secondary/40 text-secondary font-bold rounded text-xl"
              >
                Right ►
              </button>
            </div>
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
              <div className="bg-dark/50 rounded-lg p-3">
                <p className="text-gray text-sm mb-1">Lives</p>
                <p className="text-3xl font-bold text-danger">{lives}</p>
              </div>
              <div className="bg-dark/50 rounded-lg p-3">
                <p className="text-gray text-sm mb-1">Level</p>
                <p className="text-3xl font-bold text-light">{level}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  )
}

export default BreakoutGame
