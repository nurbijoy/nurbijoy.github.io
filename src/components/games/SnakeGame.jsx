import { useState, useEffect, useRef, useCallback } from 'react'
import GameLayout from './GameLayout'
import { FiPlay, FiPause, FiRotateCcw } from 'react-icons/fi'

const SnakeGame = () => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snakeHighScore')) || 0
  })
  const [length, setLength] = useState(1)
  const [gameRunning, setGameRunning] = useState(false)
  const [gamePaused, setGamePaused] = useState(false)
  const [gameSpeed, setGameSpeed] = useState('normal')
  const [logs, setLogs] = useState([{ time: '[System]', message: 'Ready to play!' }])
  const [gameOver, setGameOver] = useState(false)
  const [canvasSize, setCanvasSize] = useState(800)

  const gameStateRef = useRef({
    snake: [{ x: 15, y: 15 }],
    food: { x: 10, y: 10 },
    dx: 0,
    dy: 0,
    gridSize: 25,
    tileCount: 32
  })
  
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const container = containerRef.current
        const maxSize = Math.min(container.clientWidth - 40, container.clientHeight - 40, 800)
        setCanvasSize(Math.floor(maxSize))
        gameStateRef.current.gridSize = Math.floor(maxSize / 32)
      }
    }
    
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  const speedMap = { slow: 150, normal: 100, fast: 50 }
  const gameLoopRef = useRef(null)

  const addLog = useCallback((message) => {
    const now = new Date()
    const timeString = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`
    setLogs(prev => [...prev.slice(-9), { time: timeString, message }])
  }, [])

  const generateFood = useCallback(() => {
    const { snake, tileCount } = gameStateRef.current
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      }
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const { snake, food, dx, dy, gridSize, tileCount } = gameStateRef.current

    // Clear canvas
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = '#1a202c'
    ctx.lineWidth = 1
    for (let i = 0; i <= tileCount; i++) {
      ctx.beginPath()
      ctx.moveTo(i * gridSize, 0)
      ctx.lineTo(i * gridSize, canvas.height)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * gridSize)
      ctx.lineTo(canvas.width, i * gridSize)
      ctx.stroke()
    }

    // Draw snake
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Head with gradient
        const gradient = ctx.createRadialGradient(
          segment.x * gridSize + gridSize / 2,
          segment.y * gridSize + gridSize / 2,
          0,
          segment.x * gridSize + gridSize / 2,
          segment.y * gridSize + gridSize / 2,
          gridSize / 2
        )
        gradient.addColorStop(0, '#48bb78')
        gradient.addColorStop(1, '#38a169')
        ctx.fillStyle = gradient
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2)

        // Eyes
        ctx.fillStyle = '#000'
        const eyeSize = 4
        const eyeOffset = 8
        if (dx === 1) {
          ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset, segment.y * gridSize + 6, eyeSize, eyeSize)
          ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset, segment.y * gridSize + gridSize - 10, eyeSize, eyeSize)
        } else if (dx === -1) {
          ctx.fillRect(segment.x * gridSize + eyeOffset - eyeSize, segment.y * gridSize + 6, eyeSize, eyeSize)
          ctx.fillRect(segment.x * gridSize + eyeOffset - eyeSize, segment.y * gridSize + gridSize - 10, eyeSize, eyeSize)
        } else if (dy === -1) {
          ctx.fillRect(segment.x * gridSize + 6, segment.y * gridSize + eyeOffset - eyeSize, eyeSize, eyeSize)
          ctx.fillRect(segment.x * gridSize + gridSize - 10, segment.y * gridSize + eyeOffset - eyeSize, eyeSize, eyeSize)
        } else if (dy === 1) {
          ctx.fillRect(segment.x * gridSize + 6, segment.y * gridSize + gridSize - eyeOffset, eyeSize, eyeSize)
          ctx.fillRect(segment.x * gridSize + gridSize - 10, segment.y * gridSize + gridSize - eyeOffset, eyeSize, eyeSize)
        }
      } else {
        // Body with gradient
        const gradient = ctx.createLinearGradient(
          segment.x * gridSize, segment.y * gridSize,
          segment.x * gridSize + gridSize, segment.y * gridSize + gridSize
        )
        gradient.addColorStop(0, '#2f855a')
        gradient.addColorStop(1, '#38a169')
        ctx.fillStyle = gradient
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2)
      }
    })

    // Draw food with glow effect
    ctx.shadowBlur = 15
    ctx.shadowColor = '#e53e3e'
    ctx.fillStyle = '#e53e3e'
    ctx.beginPath()
    ctx.arc(
      food.x * gridSize + gridSize / 2,
      food.y * gridSize + gridSize / 2,
      gridSize / 2 - 2,
      0,
      Math.PI * 2
    )
    ctx.fill()
    ctx.shadowBlur = 0

    // Food highlight
    ctx.fillStyle = '#fc8181'
    ctx.beginPath()
    ctx.arc(
      food.x * gridSize + gridSize / 2 - 4,
      food.y * gridSize + gridSize / 2 - 4,
      4,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }, [])

  const update = useCallback(() => {
    if (gamePaused) return

    const { snake, food, dx, dy, tileCount } = gameStateRef.current
    const head = { x: snake[0].x + dx, y: snake[0].y + dy }

    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      setGameOver(true)
      setGameRunning(false)
      addLog(`Game Over! Final score: ${score}, Length: ${snake.length}`)
      return
    }

    // Check self collision
    for (let i = 0; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        setGameOver(true)
        setGameRunning(false)
        addLog(`Game Over! Final score: ${score}, Length: ${snake.length}`)
        return
      }
    }

    snake.unshift(head)

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
      const newScore = score + 10
      setScore(newScore)
      setLength(snake.length)
      gameStateRef.current.food = generateFood()
      addLog(`Food eaten! Score: ${newScore}, Length: ${snake.length}`)

      if (newScore > highScore) {
        setHighScore(newScore)
        localStorage.setItem('snakeHighScore', newScore)
        addLog(`New high score: ${newScore}!`)
      }
    } else {
      snake.pop()
    }

    draw()
  }, [gamePaused, score, highScore, draw, generateFood, addLog])

  useEffect(() => {
    if (gameRunning && !gamePaused) {
      gameLoopRef.current = setInterval(update, speedMap[gameSpeed])
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [gameRunning, gamePaused, gameSpeed, update])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const { dx, dy } = gameStateRef.current

      if (!gameRunning && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D'].includes(e.key)) {
        startGame()
      }

      if (e.key === ' ') {
        e.preventDefault()
        togglePause()
        return
      }

      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && dy === 0) {
        gameStateRef.current.dx = 0
        gameStateRef.current.dy = -1
      } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && dy === 0) {
        gameStateRef.current.dx = 0
        gameStateRef.current.dy = 1
      } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && dx === 0) {
        gameStateRef.current.dx = -1
        gameStateRef.current.dy = 0
      } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && dx === 0) {
        gameStateRef.current.dx = 1
        gameStateRef.current.dy = 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameRunning])

  useEffect(() => {
    draw()
  }, [draw])

  const startGame = () => {
    if (!gameRunning) {
      if (gameStateRef.current.dx === 0 && gameStateRef.current.dy === 0) {
        gameStateRef.current.dx = 1
        gameStateRef.current.dy = 0
      }
      setGameRunning(true)
      setGamePaused(false)
      setGameOver(false)
      addLog('Game started!')
    }
  }

  const togglePause = () => {
    if (gameRunning) {
      setGamePaused(!gamePaused)
      addLog(gamePaused ? 'Game resumed' : 'Game paused')
    }
  }

  const resetGame = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    gameStateRef.current = {
      snake: [{ x: 15, y: 15 }],
      food: generateFood(),
      dx: 0,
      dy: 0,
      gridSize: 25,
      tileCount: 32
    }
    setScore(0)
    setLength(1)
    setGameRunning(false)
    setGamePaused(false)
    setGameOver(false)
    addLog('Game reset')
    draw()
  }

  const changeSpeed = (speed) => {
    setGameSpeed(speed)
    addLog(`Speed changed to ${speed}`)
  }

  const leftPanel = (
    <>
      <div className="bg-[#112240] p-4 rounded-lg">
        <h3 className="text-secondary font-semibold mb-3">Controls</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={startGame}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-success hover:bg-success/80 text-white rounded-lg transition-all"
          >
            <FiPlay /> Start Game
          </button>
          <button
            onClick={togglePause}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-warning hover:bg-warning/80 text-white rounded-lg transition-all"
          >
            <FiPause /> {gamePaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={resetGame}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-danger hover:bg-danger/80 text-white rounded-lg transition-all"
          >
            <FiRotateCcw /> Reset
          </button>
        </div>
      </div>

      <div className="bg-[#112240] p-4 rounded-lg">
        <h3 className="text-secondary font-semibold mb-3">Speed</h3>
        <div className="flex flex-col gap-2">
          {['slow', 'normal', 'fast'].map(speed => (
            <button
              key={speed}
              onClick={() => changeSpeed(speed)}
              className={`px-4 py-2 rounded-lg transition-all ${
                gameSpeed === speed
                  ? 'bg-secondary text-dark'
                  : 'bg-[#1e3a5f] hover:bg-[#2a4a7f] text-light'
              }`}
            >
              {speed.charAt(0).toUpperCase() + speed.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#112240] p-4 rounded-lg">
        <h3 className="text-secondary font-semibold mb-3">How to Play</h3>
        <div className="text-sm text-gray space-y-2">
          <p><strong className="text-light">Arrow Keys</strong> or <strong className="text-light">WASD</strong> - Move</p>
          <p><strong className="text-light">Space</strong> - Pause/Resume</p>
          <p>🍎 Eat food to grow</p>
          <p>⚠️ Avoid walls & yourself</p>
        </div>
      </div>
    </>
  )

  const rightPanel = (
    <>
      <div className="bg-[#112240] p-4 rounded-lg">
        <h3 className="text-secondary font-semibold mb-3">Statistics</h3>
        <div className="space-y-3">
          <div className="bg-dark p-3 rounded-lg text-center">
            <h4 className="text-xs text-gray mb-1">Score</h4>
            <p className="text-2xl font-bold text-secondary">{score}</p>
          </div>
          <div className="bg-dark p-3 rounded-lg text-center">
            <h4 className="text-xs text-gray mb-1">High Score</h4>
            <p className="text-2xl font-bold text-secondary">{highScore}</p>
          </div>
          <div className="bg-dark p-3 rounded-lg text-center">
            <h4 className="text-xs text-gray mb-1">Length</h4>
            <p className="text-2xl font-bold text-secondary">{length}</p>
          </div>
          <div className="bg-dark p-3 rounded-lg text-center">
            <h4 className="text-xs text-gray mb-1">Speed</h4>
            <p className="text-2xl font-bold text-secondary">{gameSpeed}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#112240] p-4 rounded-lg">
        <h3 className="text-secondary font-semibold mb-3">Activity Log</h3>
        <div className="text-xs font-mono space-y-1 max-h-48 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="border-b border-gray/20 pb-1">
              <span className="text-gray">{log.time}</span>
              <span className="text-light ml-2">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  return (
    <GameLayout title="🐍 Snake Game" leftPanel={leftPanel} rightPanel={rightPanel}>
      <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="border-4 border-success rounded-lg shadow-2xl max-w-full max-h-full"
          style={{ boxShadow: '0 0 30px rgba(56, 161, 105, 0.4)' }}
        />
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="bg-[#112240] p-4 sm:p-8 rounded-xl text-center max-w-md mx-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-danger mb-4">Game Over!</h2>
              <p className="text-lg sm:text-xl text-light mb-2">Final Score: <span className="text-secondary font-bold">{score}</span></p>
              <p className="text-lg sm:text-xl text-light mb-6">Snake Length: <span className="text-secondary font-bold">{length}</span></p>
              <button
                onClick={resetGame}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-success hover:bg-success/80 text-white rounded-lg transition-all mx-auto"
              >
                <FiPlay /> Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  )
}

export default SnakeGame
