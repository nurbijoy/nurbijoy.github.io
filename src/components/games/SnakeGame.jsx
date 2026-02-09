import { useState, useEffect, useRef, useCallback } from 'react'
import GameLayout from './GameLayout'

const SnakeGame = () => {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snakeHighScore')) || 0
  })
  const [gameState, setGameState] = useState('ready')
  const [speed, setSpeed] = useState('normal')

  const speedMap = { slow: 150, normal: 100, fast: 60 }
  const tileCount = 25

  const gameRef = useRef({
    snake: [{ x: 12, y: 12 }],
    food: { x: 18, y: 18 },
    direction: { x: 0, y: 0 },
    nextDirection: { x: 0, y: 0 }
  })

  const generateFood = useCallback(() => {
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      }
    } while (gameRef.current.snake.some(s => s.x === newFood.x && s.y === newFood.y))
    return newFood
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0) return
    const ctx = canvas.getContext('2d')
    const gridSize = canvas.width / tileCount

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#0a192f')
    gradient.addColorStop(1, '#112240')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = 'rgba(100, 255, 218, 0.05)'
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

    gameRef.current.snake.forEach((segment, index) => {
      const isHead = index === 0
      const alpha = 1 - (index / gameRef.current.snake.length) * 0.5
      ctx.shadowBlur = isHead ? 20 : 10
      ctx.shadowColor = '#64ffda'
      const gradient = ctx.createRadialGradient(
        segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize / 2, 0,
        segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize / 2, gridSize / 2
      )
      gradient.addColorStop(0, `rgba(100, 255, 218, ${alpha})`)
      gradient.addColorStop(1, `rgba(56, 178, 172, ${alpha * 0.8})`)
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4, 4)
      ctx.fill()
    })

    ctx.shadowBlur = 0
    const { food } = gameRef.current
    const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8
    ctx.shadowBlur = 25
    ctx.shadowColor = '#f687b3'
    const foodGradient = ctx.createRadialGradient(
      food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, 0,
      food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 * pulse
    )
    foodGradient.addColorStop(0, '#fbb6ce')
    foodGradient.addColorStop(1, '#ed64a6')
    ctx.fillStyle = foodGradient
    ctx.beginPath()
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, (gridSize / 2 - 2) * pulse, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }, [])

  const update = useCallback(() => {
    if (gameState !== 'playing') return
    const { snake, food, nextDirection } = gameRef.current
    gameRef.current.direction = nextDirection
    const head = { x: snake[0].x + nextDirection.x, y: snake[0].y + nextDirection.y }
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      setGameState('gameOver')
      return
    }
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameState('gameOver')
      return
    }
    snake.unshift(head)
    if (head.x === food.x && head.y === food.y) {
      const newScore = score + 10
      setScore(newScore)
      if (newScore > highScore) {
        setHighScore(newScore)
        localStorage.setItem('snakeHighScore', newScore)
      }
      gameRef.current.food = generateFood()
    } else {
      snake.pop()
    }
    draw()
  }, [gameState, score, highScore, draw, generateFood])

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(update, speedMap[speed])
      return () => clearInterval(interval)
    }
  }, [gameState, speed, update])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const { direction } = gameRef.current
      if (gameState === 'ready' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setGameState('playing')
      }
      if (e.key === ' ') {
        e.preventDefault()
        if (gameState === 'playing') setGameState('paused')
        else if (gameState === 'paused') setGameState('playing')
      }
      if (e.key === 'ArrowUp' && direction.y === 0) gameRef.current.nextDirection = { x: 0, y: -1 }
      else if (e.key === 'ArrowDown' && direction.y === 0) gameRef.current.nextDirection = { x: 0, y: 1 }
      else if (e.key === 'ArrowLeft' && direction.x === 0) gameRef.current.nextDirection = { x: -1, y: 0 }
      else if (e.key === 'ArrowRight' && direction.x === 0) gameRef.current.nextDirection = { x: 1, y: 0 }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState])

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const container = canvas.parentElement
      if (!container) return
      const rect = container.getBoundingClientRect()
      const size = Math.min(rect.width - 16, rect.height - 16)
      if (size > 50) {
        canvas.width = size
        canvas.height = size
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
    gameRef.current = {
      snake: [{ x: 12, y: 12 }],
      food: generateFood(),
      direction: { x: 1, y: 0 },
      nextDirection: { x: 1, y: 0 }
    }
    setScore(0)
    setGameState('playing')
  }

  const resetGame = () => {
    gameRef.current = {
      snake: [{ x: 12, y: 12 }],
      food: generateFood(),
      direction: { x: 0, y: 0 },
      nextDirection: { x: 0, y: 0 }
    }
    setScore(0)
    setGameState('ready')
    draw()
  }

  return (
    <GameLayout title="🐍 Snake Game">
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
            <h3 className="text-secondary font-bold text-lg mb-3">Speed</h3>
            <div className="grid grid-cols-3 gap-2">
              {['slow', 'normal', 'fast'].map(s => (
                <button key={s} onClick={() => setSpeed(s)} className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${speed === s ? 'bg-secondary text-dark' : 'bg-dark/50 text-gray hover:bg-dark'}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">How to Play</h3>
            <div className="space-y-2 text-sm text-gray">
              <p><span className="text-secondary font-semibold">Arrow Keys:</span> Move</p>
              <p><span className="text-secondary font-semibold">Space:</span> Pause</p>
              <p className="pt-2 border-t border-gray-700 mt-2">Eat food to grow. Avoid walls!</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="lg:hidden flex gap-2 flex-shrink-0">
            <div className="flex-1 bg-[#112240] rounded-lg p-2 border border-gray-700 text-center">
              <p className="text-xs text-gray">Score</p>
              <p className="text-lg font-bold text-secondary">{score}</p>
            </div>
            <div className="flex-1 bg-[#112240] rounded-lg p-2 border border-gray-700 text-center">
              <p className="text-xs text-gray">High</p>
              <p className="text-lg font-bold text-warning">{highScore}</p>
            </div>
            <div className="flex-1 bg-[#112240] rounded-lg p-2 border border-gray-700 text-center">
              <p className="text-xs text-gray">Length</p>
              <p className="text-lg font-bold text-light">{gameRef.current.snake.length}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-0 relative">
            <canvas ref={canvasRef} className="border-4 border-secondary/30 rounded-xl shadow-2xl max-w-full max-h-full" style={{ boxShadow: '0 0 60px rgba(100, 255, 218, 0.3)' }} />
            {gameState === 'ready' && (
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <h2 className="text-2xl md:text-4xl font-bold text-secondary mb-2 md:mb-4">Ready?</h2>
                  <p className="text-sm md:text-base text-gray mb-4">Press arrow or Start</p>
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
            {gameState === 'gameOver' && (
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <h2 className="text-2xl md:text-4xl font-bold text-danger mb-2 md:mb-4">Game Over!</h2>
                  <p className="text-xl md:text-2xl text-secondary mb-1">Score: {score}</p>
                  <p className="text-lg md:text-xl text-gray mb-4">Length: {gameRef.current.snake.length}</p>
                  <button onClick={resetGame} className="px-6 md:px-8 py-2 md:py-3 bg-secondary hover:bg-secondary/80 text-dark font-bold rounded-lg transition-all">Play Again</button>
                </div>
              </div>
            )}
          </div>
          <div className="lg:hidden flex gap-2 flex-shrink-0">
            <button onClick={startGame} className="flex-1 px-4 py-2.5 bg-success hover:bg-success/80 text-white font-semibold rounded-lg transition-all">Start</button>
            <button onClick={resetGame} className="flex-1 px-4 py-2.5 bg-danger hover:bg-danger/80 text-white font-semibold rounded-lg transition-all">Reset</button>
            {['slow', 'normal', 'fast'].map(s => (
              <button key={s} onClick={() => setSpeed(s)} className={`px-3 py-2.5 rounded-lg font-semibold text-xs transition-all ${speed === s ? 'bg-secondary text-dark' : 'bg-dark/50 text-gray'}`}>{s[0].toUpperCase()}</button>
            ))}
          </div>
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
                <p className="text-gray text-sm mb-1">Length</p>
                <p className="text-3xl font-bold text-light">{gameRef.current.snake.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Status</h3>
            <div className="bg-dark/50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray mb-1">State</p>
              <p className={`text-xl font-bold ${gameState === 'playing' ? 'text-success' : gameState === 'paused' ? 'text-warning' : gameState === 'gameOver' ? 'text-danger' : 'text-gray'}`}>
                {gameState === 'ready' ? 'Ready' : gameState === 'playing' ? 'Playing' : gameState === 'paused' ? 'Paused' : 'Game Over'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  )
}

export default SnakeGame
