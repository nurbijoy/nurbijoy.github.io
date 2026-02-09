import { useState, useEffect, useRef, useCallback } from 'react'
import GameLayout from './GameLayout'
import { useInputDevice } from '../../hooks/useInputDevice'

const SHAPES = [
  [[1,1,1,1]], // I
  [[1,1],[1,1]], // O
  [[0,1,0],[1,1,1]], // T
  [[1,0,0],[1,1,1]], // L
  [[0,0,1],[1,1,1]], // J
  [[0,1,1],[1,1,0]], // S
  [[1,1,0],[0,1,1]]  // Z
]

const COLORS = ['#64ffda', '#fbb6ce', '#fbbf24', '#a78bfa', '#60a5fa', '#34d399', '#f87171']

const TetrisGame = () => {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('tetrisHighScore')) || 0)
  const [gameState, setGameState] = useState('ready')
  const { showTouchControls, toggleTouchControls } = useInputDevice()
  
  const cols = 10
  const rows = 20
  
  const gameRef = useRef({
    board: Array(rows).fill(null).map(() => Array(cols).fill(0)),
    piece: null,
    pieceX: 0,
    pieceY: 0,
    pieceColor: 0
  })

  const createPiece = useCallback(() => {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length)
    return {
      shape: SHAPES[shapeIndex],
      color: shapeIndex,
      x: Math.floor(cols / 2) - 1,
      y: 0
    }
  }, [])

  const collision = useCallback((piece, x, y) => {
    const { board } = gameRef.current
    for (let row = 0; row < piece.length; row++) {
      for (let col = 0; col < piece[row].length; col++) {
        if (piece[row][col]) {
          const newY = y + row
          const newX = x + col
          if (newY >= rows || newX < 0 || newX >= cols || (newY >= 0 && board[newY][newX])) {
            return true
          }
        }
      }
    }
    return false
  }, [])

  const merge = useCallback(() => {
    const { board, piece, pieceX, pieceY, pieceColor } = gameRef.current
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          board[pieceY + y][pieceX + x] = pieceColor + 1
        }
      })
    })
  }, [])

  const clearLines = useCallback(() => {
    const { board } = gameRef.current
    let linesCleared = 0
    for (let row = rows - 1; row >= 0; row--) {
      if (board[row].every(cell => cell !== 0)) {
        board.splice(row, 1)
        board.unshift(Array(cols).fill(0))
        linesCleared++
        row++
      }
    }
    if (linesCleared > 0) {
      const points = [0, 100, 300, 500, 800][linesCleared] * level
      setScore(prev => {
        const newScore = prev + points
        if (newScore > highScore) {
          setHighScore(newScore)
          localStorage.setItem('tetrisHighScore', newScore)
        }
        return newScore
      })
      setLines(prev => {
        const newLines = prev + linesCleared
        setLevel(Math.floor(newLines / 10) + 1)
        return newLines
      })
    }
  }, [level, highScore])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0) return
    const ctx = canvas.getContext('2d')
    const cellSize = canvas.width / cols

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#0a192f')
    gradient.addColorStop(1, '#112240')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = 'rgba(100, 255, 218, 0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellSize, 0)
      ctx.lineTo(i * cellSize, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i <= rows; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i * cellSize)
      ctx.lineTo(canvas.width, i * cellSize)
      ctx.stroke()
    }

    const { board, piece, pieceX, pieceY } = gameRef.current
    board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          ctx.shadowBlur = 15
          ctx.shadowColor = COLORS[value - 1]
          ctx.fillStyle = COLORS[value - 1]
          ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2)
        }
      })
    })

    if (piece) {
      ctx.shadowBlur = 20
      ctx.shadowColor = COLORS[piece.color]
      ctx.fillStyle = COLORS[piece.color]
      piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            ctx.fillRect((pieceX + x) * cellSize + 1, (pieceY + y) * cellSize + 1, cellSize - 2, cellSize - 2)
          }
        })
      })
    }
    ctx.shadowBlur = 0
  }, [])

  const rotate = useCallback(() => {
    const { piece, pieceX, pieceY } = gameRef.current
    if (!piece) return
    const rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse())
    if (!collision(rotated, pieceX, pieceY)) {
      gameRef.current.piece.shape = rotated
      draw()
    }
  }, [collision, draw])

  const move = useCallback((dir) => {
    const { piece, pieceX, pieceY } = gameRef.current
    if (!piece) return
    const newX = pieceX + dir
    if (!collision(piece.shape, newX, pieceY)) {
      gameRef.current.pieceX = newX
      draw()
    }
  }, [collision, draw])

  const drop = useCallback(() => {
    const { piece, pieceX, pieceY } = gameRef.current
    if (!piece) return
    const newY = pieceY + 1
    if (!collision(piece.shape, pieceX, newY)) {
      gameRef.current.pieceY = newY
    } else {
      merge()
      clearLines()
      const newPiece = createPiece()
      if (collision(newPiece.shape, newPiece.x, newPiece.y)) {
        setGameState('gameOver')
        return
      }
      gameRef.current.piece = newPiece
      gameRef.current.pieceX = newPiece.x
      gameRef.current.pieceY = newPiece.y
      gameRef.current.pieceColor = newPiece.color
    }
    draw()
  }, [collision, merge, clearLines, createPiece, draw])

  const hardDrop = useCallback(() => {
    const { piece, pieceX, pieceY } = gameRef.current
    if (!piece) return
    let newY = pieceY
    while (!collision(piece.shape, pieceX, newY + 1)) {
      newY++
    }
    gameRef.current.pieceY = newY
    drop()
  }, [collision, drop])

  useEffect(() => {
    if (gameState === 'playing') {
      const speed = Math.max(100, 1000 - (level - 1) * 100)
      const interval = setInterval(drop, speed)
      return () => clearInterval(interval)
    }
  }, [gameState, level, drop])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return
      if (e.key === 'ArrowLeft') move(-1)
      else if (e.key === 'ArrowRight') move(1)
      else if (e.key === 'ArrowDown') drop()
      else if (e.key === 'ArrowUp') rotate()
      else if (e.key === ' ') { e.preventDefault(); hardDrop() }
      else if (e.key === 'p') setGameState(prev => prev === 'playing' ? 'paused' : 'playing')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, move, drop, rotate, hardDrop])

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const container = canvas.parentElement
      if (!container) return
      const rect = container.getBoundingClientRect()
      const maxWidth = Math.min(rect.width - 16, 500)
      const maxHeight = rect.height - 16
      const size = Math.min(maxWidth, maxHeight / 2)
      if (size > 50) {
        canvas.width = size
        canvas.height = size * 2
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
    gameRef.current.board = Array(rows).fill(null).map(() => Array(cols).fill(0))
    const newPiece = createPiece()
    gameRef.current.piece = newPiece
    gameRef.current.pieceX = newPiece.x
    gameRef.current.pieceY = newPiece.y
    gameRef.current.pieceColor = newPiece.color
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameState('playing')
  }

  const resetGame = () => {
    gameRef.current.board = Array(rows).fill(null).map(() => Array(cols).fill(0))
    gameRef.current.piece = null
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameState('ready')
    draw()
  }

  return (
    <GameLayout title="🧱 Tetris">
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
              <p><span className="text-secondary font-semibold">← →:</span> Move</p>
              <p><span className="text-secondary font-semibold">↑:</span> Rotate</p>
              <p><span className="text-secondary font-semibold">↓:</span> Soft Drop</p>
              <p><span className="text-secondary font-semibold">Space:</span> Hard Drop</p>
              <p><span className="text-secondary font-semibold">P:</span> Pause</p>
              <p className="pt-2 border-t border-gray-700 mt-2">Clear lines to score!</p>
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
                <p className="text-[10px] text-gray">Lines</p>
                <p className="text-sm font-bold text-warning">{lines}</p>
              </div>
              <div className="flex-1 bg-[#112240] rounded p-1 border border-gray-700 text-center">
                <p className="text-[10px] text-gray">Lvl</p>
                <p className="text-sm font-bold text-light">{level}</p>
              </div>
              <button onClick={startGame} className="px-2 py-1 bg-success text-white text-xs font-semibold rounded">▶</button>
              <button onClick={resetGame} className="px-2 py-1 bg-danger text-white text-xs font-semibold rounded">↻</button>
            </div>
          )}
          <div className="flex-1 flex items-center justify-center min-h-0 relative">
            <canvas ref={canvasRef} className="border-4 border-secondary/30 rounded-xl shadow-2xl max-w-full max-h-full" style={{ boxShadow: '0 0 60px rgba(100, 255, 218, 0.3)' }} />
            
            {/* Floating toggle button for mobile */}
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
                  <p className="text-sm md:text-base text-gray mb-4">Press Start to begin</p>
                  <button onClick={startGame} className="px-6 md:px-8 py-2 md:py-3 bg-secondary hover:bg-secondary/80 text-dark font-bold rounded-lg transition-all">Start</button>
                </div>
              </div>
            )}
            {gameState === 'paused' && (
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <h2 className="text-2xl md:text-4xl font-bold text-warning mb-2">Paused</h2>
                  <p className="text-sm md:text-base text-gray">Press P to continue</p>
                </div>
              </div>
            )}
            {gameState === 'gameOver' && (
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <h2 className="text-2xl md:text-4xl font-bold text-danger mb-2 md:mb-4">Game Over!</h2>
                  <p className="text-xl md:text-2xl text-secondary mb-1">Score: {score}</p>
                  <p className="text-lg md:text-xl text-gray mb-4">Lines: {lines}</p>
                  <button onClick={resetGame} className="px-6 md:px-8 py-2 md:py-3 bg-secondary hover:bg-secondary/80 text-dark font-bold rounded-lg transition-all">Play Again</button>
                </div>
              </div>
            )}
          </div>
          {showTouchControls && (
            <div className="grid grid-cols-5 gap-1 flex-shrink-0">
              <button 
                onClick={() => move(-1)}
                className="py-2 bg-secondary/20 active:bg-secondary/40 text-secondary font-bold rounded text-lg"
              >
                ◄
              </button>
              <button 
                onClick={() => drop()}
                className="py-2 bg-success/20 active:bg-success/40 text-success font-bold rounded text-lg"
              >
                ▼
              </button>
              <button 
                onClick={() => move(1)}
                className="py-2 bg-secondary/20 active:bg-secondary/40 text-secondary font-bold rounded text-lg"
              >
                ►
              </button>
              <button 
                onClick={() => rotate()}
                className="py-2 bg-warning/20 active:bg-warning/40 text-warning font-bold rounded text-lg"
              >
                ↻
              </button>
              <button 
                onClick={() => hardDrop()}
                className="py-2 bg-danger/20 active:bg-danger/40 text-danger font-bold rounded text-lg"
              >
                ⬇
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
                <p className="text-gray text-sm mb-1">Lines</p>
                <p className="text-3xl font-bold text-light">{lines}</p>
              </div>
              <div className="bg-dark/50 rounded-lg p-3">
                <p className="text-gray text-sm mb-1">Level</p>
                <p className="text-3xl font-bold text-success">{level}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  )
}

export default TetrisGame
