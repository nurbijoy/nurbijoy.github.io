import { useState, useEffect, useRef, useCallback } from 'react'
import GameLayout from './GameLayout'
import { FiPlay, FiRotateCcw } from 'react-icons/fi'

const PongGame = () => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [player1Score, setPlayer1Score] = useState(0)
  const [player2Score, setPlayer2Score] = useState(0)
  const [gameRunning, setGameRunning] = useState(false)
  const [winner, setWinner] = useState(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  const PADDLE_WIDTH = 15
  const PADDLE_HEIGHT = 120
  const BALL_SIZE = 15
  const WINNING_SCORE = 5

  const gameStateRef = useRef({
    player1: { x: 30, y: 300, dy: 0 },
    player2: { x: 770, y: 300, dy: 0 },
    ball: { x: 400, y: 300, dx: 5, dy: 5 }
  })

  const keysRef = useRef({})
  const gameLoopRef = useRef(null)

  const resetBall = useCallback(() => {
    gameStateRef.current.ball = {
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
      dx: (Math.random() > 0.5 ? 1 : -1) * 6,
      dy: (Math.random() - 0.5) * 10
    }
  }, [canvasSize])
  
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const container = containerRef.current
        const maxWidth = Math.min(container.clientWidth - 40, 800)
        const maxHeight = Math.min(container.clientHeight - 40, 600)
        const aspectRatio = 4 / 3
        
        let width = maxWidth
        let height = width / aspectRatio
        
        if (height > maxHeight) {
          height = maxHeight
          width = height * aspectRatio
        }
        
        setCanvasSize({ width: Math.floor(width), height: Math.floor(height) })
        
        // Update game state positions proportionally
        const scaleX = width / 800
        const scaleY = height / 600
        gameStateRef.current.player1.x = 30 * scaleX
        gameStateRef.current.player1.y = 300 * scaleY
        gameStateRef.current.player2.x = (770 * scaleX)
        gameStateRef.current.player2.y = 300 * scaleY
        gameStateRef.current.ball.x = width / 2
        gameStateRef.current.ball.y = height / 2
      }
    }
    
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const { player1, player2, ball } = gameStateRef.current

    // Clear canvas
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw center line
    ctx.strokeStyle = '#fff'
    ctx.setLineDash([15, 15])
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw paddles with gradient
    const gradient1 = ctx.createLinearGradient(player1.x, 0, player1.x + PADDLE_WIDTH, 0)
    gradient1.addColorStop(0, '#3182ce')
    gradient1.addColorStop(1, '#4299e1')
    ctx.fillStyle = gradient1
    ctx.fillRect(player1.x, player1.y, PADDLE_WIDTH, PADDLE_HEIGHT)
    ctx.strokeStyle = '#4299e1'
    ctx.lineWidth = 2
    ctx.strokeRect(player1.x, player1.y, PADDLE_WIDTH, PADDLE_HEIGHT)

    const gradient2 = ctx.createLinearGradient(player2.x, 0, player2.x + PADDLE_WIDTH, 0)
    gradient2.addColorStop(0, '#e53e3e')
    gradient2.addColorStop(1, '#fc8181')
    ctx.fillStyle = gradient2
    ctx.fillRect(player2.x, player2.y, PADDLE_WIDTH, PADDLE_HEIGHT)
    ctx.strokeStyle = '#fc8181'
    ctx.strokeRect(player2.x, player2.y, PADDLE_WIDTH, PADDLE_HEIGHT)

    // Draw ball with glow
    ctx.shadowBlur = 20
    ctx.shadowColor = '#38a169'
    ctx.fillStyle = '#38a169'
    ctx.beginPath()
    ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    // Ball highlight
    ctx.fillStyle = '#68d391'
    ctx.beginPath()
    ctx.arc(ball.x + BALL_SIZE / 2 - 3, ball.y + BALL_SIZE / 2 - 3, 4, 0, Math.PI * 2)
    ctx.fill()
  }, [])

  const update = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { player1, player2, ball } = gameStateRef.current

    // Move paddles
    if (keysRef.current['w'] && player1.y > 0) player1.y -= 8
    if (keysRef.current['s'] && player1.y < canvas.height - PADDLE_HEIGHT) player1.y += 8
    if (keysRef.current['ArrowUp'] && player2.y > 0) player2.y -= 8
    if (keysRef.current['ArrowDown'] && player2.y < canvas.height - PADDLE_HEIGHT) player2.y += 8

    // Move ball
    ball.x += ball.dx
    ball.y += ball.dy

    // Ball collision with top/bottom
    if (ball.y <= 0 || ball.y >= canvas.height - BALL_SIZE) {
      ball.dy *= -1
    }

    // Ball collision with paddles
    if (ball.x <= player1.x + PADDLE_WIDTH && 
        ball.y + BALL_SIZE >= player1.y && 
        ball.y <= player1.y + PADDLE_HEIGHT) {
      ball.dx = Math.abs(ball.dx) * 1.05
      ball.x = player1.x + PADDLE_WIDTH
      // Add spin based on where ball hits paddle
      const hitPos = (ball.y - player1.y) / PADDLE_HEIGHT
      ball.dy = (hitPos - 0.5) * 15
    }

    if (ball.x + BALL_SIZE >= player2.x && 
        ball.y + BALL_SIZE >= player2.y && 
        ball.y <= player2.y + PADDLE_HEIGHT) {
      ball.dx = -Math.abs(ball.dx) * 1.05
      ball.x = player2.x - BALL_SIZE
      // Add spin
      const hitPos = (ball.y - player2.y) / PADDLE_HEIGHT
      ball.dy = (hitPos - 0.5) * 15
    }

    // Score
    if (ball.x < 0) {
      const newScore = player2Score + 1
      setPlayer2Score(newScore)
      if (newScore >= WINNING_SCORE) {
        setWinner('Player 2')
        setGameRunning(false)
      } else {
        resetBall()
      }
    }

    if (ball.x > canvas.width) {
      const newScore = player1Score + 1
      setPlayer1Score(newScore)
      if (newScore >= WINNING_SCORE) {
        setWinner('Player 1')
        setGameRunning(false)
      } else {
        resetBall()
      }
    }

    draw()
  }, [player1Score, player2Score, resetBall, draw])

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true
    }

    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    if (gameRunning) {
      gameLoopRef.current = setInterval(update, 1000 / 60)
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [gameRunning, update])

  useEffect(() => {
    draw()
  }, [draw])

  const startGame = () => {
    setGameRunning(true)
    setWinner(null)
    resetBall()
  }

  const resetGame = () => {
    setPlayer1Score(0)
    setPlayer2Score(0)
    setWinner(null)
    setGameRunning(false)
    resetBall()
    draw()
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
            onClick={resetGame}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-warning hover:bg-warning/80 text-white rounded-lg transition-all"
          >
            <FiRotateCcw /> Reset
          </button>
        </div>
      </div>

      <div className="bg-[#112240] p-4 rounded-lg">
        <h3 className="text-secondary font-semibold mb-3">How to Play</h3>
        <div className="text-sm text-gray space-y-2">
          <p><strong className="text-light">W / S</strong> - Left Paddle (Blue)</p>
          <p><strong className="text-light">↑ / ↓</strong> - Right Paddle (Red)</p>
          <p>First to {WINNING_SCORE} points wins!</p>
        </div>
      </div>
    </>
  )

  const rightPanel = (
    <div className="bg-[#112240] p-4 rounded-lg">
      <h3 className="text-secondary font-semibold mb-3">Score</h3>
      <div className="space-y-3">
        <div className="bg-dark p-4 rounded-lg text-center border-2 border-blue-500/30">
          <h4 className="text-sm text-gray mb-2">Player 1 (Blue)</h4>
          <p className="text-4xl font-bold text-blue-400">{player1Score}</p>
        </div>
        <div className="bg-dark p-4 rounded-lg text-center border-2 border-red-500/30">
          <h4 className="text-sm text-gray mb-2">Player 2 (Red)</h4>
          <p className="text-4xl font-bold text-red-400">{player2Score}</p>
        </div>
      </div>
    </div>
  )

  return (
    <GameLayout title="🏓 Pong" leftPanel={leftPanel} rightPanel={rightPanel}>
      <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="border-4 border-success rounded-lg shadow-2xl max-w-full max-h-full"
          style={{ boxShadow: '0 0 30px rgba(56, 161, 105, 0.4)' }}
        />
        {winner && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="bg-[#112240] p-4 sm:p-8 rounded-xl text-center max-w-md mx-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary mb-4">{winner} Wins!</h2>
              <p className="text-lg sm:text-xl text-light mb-6">
                Final Score: {player1Score} - {player2Score}
              </p>
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

export default PongGame
