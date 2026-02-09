import { useState, useEffect, useRef, useCallback } from 'react'
import GameLayout from './GameLayout'
import { FiPlay, FiPause } from 'react-icons/fi'

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]]  // Z
]

const COLORS = [
  '#00f0f0', '#f0f000', '#a000f0', '#f0a000',
  '#0000f0', '#00f000', '#f00000'
]

const TetrisGame = () => {
  const canvasRef = useRef(null)
  const nextCanvasRef = useRef(null)
  const containerRef = useRef(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [gameRunning, setGameRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [blockSize, setBlockSize] = useState(35)

  const COLS = 10
  const ROWS = 20
  
  useEffect(() => {
    const updateBlockSize = () => {
      if (containerRef.current) {
        const container = containerRef.current
        const maxWidth = Math.min(container.clientWidth - 40, 350)
        const maxHeight = Math.min(container.clientHeight - 40, 700)
        const size = Math.min(Math.floor(maxWidth / COLS), Math.floor(maxHeight / ROWS))
        setBlockSize(Math.max(size, 15))
      }
    }
    
    updateBlockSize()
    window.addEventListener('resize', updateBlockSize)
    return () => window.removeEventListener('resize', updateBlockSize)
  }, [])

  const gameStateRef = useRef({
    board: Array(ROWS).fill().map(() => Array(COLS).fill(0)),
    currentPiece: null,
    nextPiece: null,
    dropCounter: 0,
    dropInterval: 1000,
    lastTime: 0
  })

  const gameLoopRef = useRef(null)

  const createPiece = useCallback(() => {
    const type = Math.floor(Math.random() * SHAPES.length)
    return {
      shape: SHAPES[type],
      color: COLORS[type],
      x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0].length / 2),
      y: 0
    }
  }, [])

  const drawBlock = useCallback((ctx, x, y, color, size) => {
    const blockSize = size || blockSize
    ctx.fillStyle = color
    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize)
    
    // Add shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.fillRect(x * blockSize + 2, y * blockSize + 2, blockSize / 3, blockSize / 3)
  }, [])

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const { board } = gameStateRef.current

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (board[y][x]) {
          drawBlock(ctx, x, y, board[y][x])
        }
      }
    }
  }, [drawBlock])

  const drawPiece = useCallback((piece, ctx, offsetX = 0, offsetY = 0, size) => {
    const useBlockSize = size || blockSize
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          drawBlock(ctx, piece.x + x + offsetX, piece.y + y + offsetY, piece.color, useBlockSize)
        }
      })
    })
  }, [drawBlock, blockSize])

  const drawNext = useCallback(() => {
    const canvas = nextCanvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const { nextPiece } = gameStateRef.current

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (nextPiece) {
      const blockSize = 25
      const offsetX = (4 - nextPiece.shape[0].length) / 2
      const offsetY = (4 - nextPiece.shape.length) / 2
      nextPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            drawBlock(ctx, x + offsetX, y + offsetY, nextPiece.color, blockSize)
          }
        })
      })
    }
  }, [drawBlock])

  const collide = useCallback((piece) => {
    const { board } = gameStateRef.current
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x
          const newY = piece.y + y

          if (newX < 0 || newX >= COLS || newY >= ROWS) {
            return true
          }
          if (newY >= 0 && board[newY][newX]) {
            return true
          }
        }
      }
    }
    return false
  }, [])

  const merge = useCallback(() => {
    const { currentPiece, board } = gameStateRef.current
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = currentPiece.y + y
          const boardX = currentPiece.x + x
          if (boardY >= 0) {
            board[boardY][boardX] = currentPiece.color
          }
        }
      })
    })
  }, [])

  const clearLines = useCallback(() => {
    const { board } = gameStateRef.current
    let linesCleared = 0

    for (let y = ROWS - 1; y >= 0; y--) {
      if (board[y].every(cell => cell !== 0)) {
        board.splice(y, 1)
        board.unshift(Array(COLS).fill(0))
        linesCleared++
        y++
      }
    }

    if (linesCleared > 0) {
      const newLines = lines + linesCleared
      const newScore = score + [0, 100, 300, 500, 800][linesCleared] * level
      const newLevel = Math.floor(newLines / 10) + 1
      
      setLines(newLines)
      setScore(newScore)
      setLevel(newLevel)
      gameStateRef.current.dropInterval = Math.max(100, 1000 - (newLevel - 1) * 100)
    }
  }, [lines, score, level])

  const rotate = useCallback(() => {
    const { currentPiece } = gameStateRef.current
    const rotated = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map(row => row[i]).reverse()
    )

    const previousShape = currentPiece.shape
    currentPiece.shape = rotated

    if (collide(currentPiece)) {
      currentPiece.shape = previousShape
    }
  }, [collide])

  const move = useCallback((dir) => {
    const { currentPiece } = gameStateRef.current
    currentPiece.x += dir
    if (collide(currentPiece)) {
      currentPiece.x -= dir
    }
  }, [collide])

  const drop = useCallback(() => {
    const { currentPiece } = gameStateRef.current
    currentPiece.y++
    if (collide(currentPiece)) {
      currentPiece.y--
      merge()
      clearLines()
      gameStateRef.current.currentPiece = gameStateRef.current.nextPiece
      gameStateRef.current.nextPiece = createPiece()
      drawNext()

      if (collide(gameStateRef.current.currentPiece)) {
        setGameOver(true)
        setGameRunning(false)
      }
    }
    gameStateRef.current.dropCounter = 0
  }, [collide, merge, clearLines, createPiece, drawNext])

  const hardDrop = useCallback(() => {
    const { currentPiece } = gameStateRef.current
    while (!collide(currentPiece)) {
      currentPiece.y++
    }
    currentPiece.y--
    drop()
  }, [collide, drop])

  const update = useCallback((time = 0) => {
    if (paused || !gameRunning) return

    const { dropCounter, dropInterval } = gameStateRef.current
    const deltaTime = time - gameStateRef.current.lastTime
    gameStateRef.current.lastTime = time
    gameStateRef.current.dropCounter += deltaTime

    if (gameStateRef.current.dropCounter > dropInterval) {
      drop()
    }

    drawBoard()
    if (gameStateRef.current.currentPiece) {
      drawPiece(gameStateRef.current.currentPiece, canvasRef.current.getContext('2d'), 0, 0, blockSize)
    }

    gameLoopRef.current = requestAnimationFrame(update)
  }, [paused, gameRunning, drop, drawBoard, drawPiece, blockSize])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameRunning || gameOver) return

      switch (e.key) {
        case 'ArrowLeft':
          move(-1)
          break
        case 'ArrowRight':
          move(1)
          break
        case 'ArrowDown':
          drop()
          break
        case 'ArrowUp':
          rotate()
          break
        case ' ':
          e.preventDefault()
          hardDrop()
          break
        case 'p':
        case 'P':
          setPaused(!paused)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameRunning, gameOver, paused, move, drop, rotate, hardDrop])

  useEffect(() => {
    if (gameRunning && !paused) {
      gameLoopRef.current = requestAnimationFrame(update)
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameRunning, paused, update])

  const startGame = () => {
    gameStateRef.current = {
      board: Array(ROWS).fill().map(() => Array(COLS).fill(0)),
      currentPiece: createPiece(),
      nextPiece: createPiece(),
      dropCounter: 0,
      dropInterval: 1000,
      lastTime: 0
    }
    setScore(0)
    setLevel(1)
    setLines(0)
    setPaused(false)
    setGameOver(false)
    setGameRunning(true)
    drawNext()
  }

  const togglePause = () => {
    setPaused(!paused)
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
            <FiPlay /> New Game
          </button>
          <button
            onClick={togglePause}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-warning hover:bg-warning/80 text-white rounded-lg transition-all"
          >
            <FiPause /> {paused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      <div className="bg-[#112240] p-4 rounded-lg">
        <h3 className="text-secondary font-semibold mb-3">Next Piece</h3>
        <canvas
          ref={nextCanvasRef}
          width={120}
          height={120}
          className="border-2 border-gray/30 rounded-lg mx-auto block"
        />
      </div>

      <div className="bg-[#112240] p-4 rounded-lg">
        <h3 className="text-secondary font-semibold mb-3">How to Play</h3>
        <div className="text-sm text-gray space-y-2">
          <p><strong className="text-light">← →</strong> Move</p>
          <p><strong className="text-light">↓</strong> Soft Drop</p>
          <p><strong className="text-light">Space</strong> Hard Drop</p>
          <p><strong className="text-light">↑</strong> Rotate</p>
          <p><strong className="text-light">P</strong> Pause</p>
        </div>
      </div>
    </>
  )

  const rightPanel = (
    <div className="bg-[#112240] p-4 rounded-lg">
      <h3 className="text-secondary font-semibold mb-3">Statistics</h3>
      <div className="space-y-3">
        <div className="bg-dark p-3 rounded-lg text-center">
          <h4 className="text-xs text-gray mb-1">Score</h4>
          <p className="text-2xl font-bold text-secondary">{score}</p>
        </div>
        <div className="bg-dark p-3 rounded-lg text-center">
          <h4 className="text-xs text-gray mb-1">Level</h4>
          <p className="text-2xl font-bold text-secondary">{level}</p>
        </div>
        <div className="bg-dark p-3 rounded-lg text-center">
          <h4 className="text-xs text-gray mb-1">Lines</h4>
          <p className="text-2xl font-bold text-secondary">{lines}</p>
        </div>
      </div>
    </div>
  )

  return (
    <GameLayout title="🧱 Tetris" leftPanel={leftPanel} rightPanel={rightPanel}>
      <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={COLS * blockSize}
          height={ROWS * blockSize}
          className="border-4 border-secondary rounded-lg shadow-2xl max-w-full max-h-full"
          style={{ boxShadow: '0 0 30px rgba(100, 255, 218, 0.4)' }}
        />
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="bg-[#112240] p-4 sm:p-8 rounded-xl text-center max-w-md mx-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-danger mb-4">Game Over!</h2>
              <p className="text-lg sm:text-xl text-light mb-6">Final Score: <span className="text-secondary font-bold">{score}</span></p>
              <button
                onClick={startGame}
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

export default TetrisGame
