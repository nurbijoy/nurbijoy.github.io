import { useState, useEffect, useRef, useCallback } from 'react'
import GameLayout from './GameLayout'
import { useInputDevice } from '../../hooks/useInputDevice'

const TicTacToeGame = () => {
  const canvasRef = useRef(null)
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winner, setWinner] = useState(null)
  const [winLine, setWinLine] = useState(null)
  const [mode, setMode] = useState('ai') // 'ai' or '2player'
  const [difficulty, setDifficulty] = useState('hard')
  const [scores, setScores] = useState({ x: 0, o: 0, draw: 0 })
  const [gameState, setGameState] = useState('playing')
  const { showTouchControls } = useInputDevice()

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ]

  const checkWinner = useCallback((squares) => {
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: pattern }
      }
    }
    return null
  }, [])

  const minimax = useCallback((squares, depth, isMaximizing, alpha, beta) => {
    const result = checkWinner(squares)
    if (result) return result.winner === 'O' ? 10 - depth : depth - 10
    if (squares.every(s => s !== null)) return 0

    if (difficulty === 'easy' && Math.random() < 0.7) {
      return Math.random() * 2 - 1
    }

    if (isMaximizing) {
      let maxScore = -Infinity
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'O'
          const score = minimax(squares, depth + 1, false, alpha, beta)
          squares[i] = null
          maxScore = Math.max(score, maxScore)
          alpha = Math.max(alpha, score)
          if (beta <= alpha) break
        }
      }
      return maxScore
    } else {
      let minScore = Infinity
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'X'
          const score = minimax(squares, depth + 1, true, alpha, beta)
          squares[i] = null
          minScore = Math.min(score, minScore)
          beta = Math.min(beta, score)
          if (beta <= alpha) break
        }
      }
      return minScore
    }
  }, [checkWinner, difficulty])

  const getBestMove = useCallback((squares) => {
    let bestScore = -Infinity
    let bestMove = -1

    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = 'O'
        const score = minimax([...squares], 0, false, -Infinity, Infinity)
        squares[i] = null
        if (score > bestScore) {
          bestScore = score
          bestMove = i
        }
      }
    }
    return bestMove
  }, [minimax])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0) return
    const ctx = canvas.getContext('2d')
    const cellSize = canvas.width / 3

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#0a192f')
    gradient.addColorStop(1, '#112240')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = 'rgba(100, 255, 218, 0.3)'
    ctx.lineWidth = 4
    for (let i = 1; i < 3; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellSize, 0)
      ctx.lineTo(i * cellSize, canvas.height)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * cellSize)
      ctx.lineTo(canvas.width, i * cellSize)
      ctx.stroke()
    }

    board.forEach((cell, index) => {
      const row = Math.floor(index / 3)
      const col = index % 3
      const x = col * cellSize + cellSize / 2
      const y = row * cellSize + cellSize / 2
      const size = cellSize * 0.3

      if (cell === 'X') {
        ctx.strokeStyle = '#64ffda'
        ctx.lineWidth = 8
        ctx.shadowBlur = 20
        ctx.shadowColor = '#64ffda'
        ctx.beginPath()
        ctx.moveTo(x - size, y - size)
        ctx.lineTo(x + size, y + size)
        ctx.moveTo(x + size, y - size)
        ctx.lineTo(x - size, y + size)
        ctx.stroke()
      } else if (cell === 'O') {
        ctx.strokeStyle = '#fbb6ce'
        ctx.lineWidth = 8
        ctx.shadowBlur = 20
        ctx.shadowColor = '#fbb6ce'
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.stroke()
      }
    })

    if (winLine) {
      const [a, b, c] = winLine
      const getCenter = (index) => {
        const row = Math.floor(index / 3)
        const col = index % 3
        return { x: col * cellSize + cellSize / 2, y: row * cellSize + cellSize / 2 }
      }
      const start = getCenter(a)
      const end = getCenter(c)
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 6
      ctx.shadowBlur = 30
      ctx.shadowColor = '#fbbf24'
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    }
    ctx.shadowBlur = 0
  }, [board, winLine])

  useEffect(() => {
    const result = checkWinner(board)
    if (result) {
      setWinner(result.winner)
      setWinLine(result.line)
      setGameState('gameOver')
      setScores(prev => ({ ...prev, [result.winner.toLowerCase()]: prev[result.winner.toLowerCase()] + 1 }))
    } else if (board.every(cell => cell !== null)) {
      setWinner('draw')
      setGameState('gameOver')
      setScores(prev => ({ ...prev, draw: prev.draw + 1 }))
    }
  }, [board, checkWinner])

  useEffect(() => {
    if (mode === 'ai' && !isXNext && !winner && gameState === 'playing') {
      const timer = setTimeout(() => {
        const move = getBestMove([...board])
        if (move !== -1) {
          const newBoard = [...board]
          newBoard[move] = 'O'
          setBoard(newBoard)
          setIsXNext(true)
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [mode, isXNext, winner, board, getBestMove, gameState])

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const container = canvas.parentElement
      if (!container) return
      const rect = container.getBoundingClientRect()
      const size = Math.min(rect.width - 16, rect.height - 16, 600)
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

  const handleClick = (index) => {
    if (board[index] || winner || gameState !== 'playing') return
    if (mode === 'ai' && !isXNext) return
    
    const newBoard = [...board]
    newBoard[index] = isXNext ? 'X' : 'O'
    setBoard(newBoard)
    setIsXNext(!isXNext)
  }

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cellSize = canvas.width / 3
    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)
    const index = row * 3 + col
    handleClick(index)
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setWinner(null)
    setWinLine(null)
    setGameState('playing')
  }

  const resetScores = () => {
    setScores({ x: 0, o: 0, draw: 0 })
    resetGame()
  }

  return (
    <GameLayout title="⭕ Tic Tac Toe">
      <div className="h-[calc(100vh-73px)] flex flex-col lg:flex-row gap-4 p-4">
        <div className="hidden lg:flex lg:w-64 xl:w-80 flex-col gap-4 overflow-y-auto">
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Controls</h3>
            <div className="space-y-2">
              <button onClick={resetGame} className="w-full px-4 py-2.5 bg-success hover:bg-success/80 text-white font-semibold rounded-lg transition-all">New Game</button>
              <button onClick={resetScores} className="w-full px-4 py-2.5 bg-danger hover:bg-danger/80 text-white font-semibold rounded-lg transition-all">Reset Scores</button>
            </div>
          </div>
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              {['ai', '2player'].map(m => (
                <button key={m} onClick={() => { setMode(m); resetGame(); }} className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${mode === m ? 'bg-secondary text-dark' : 'bg-dark/50 text-gray hover:bg-dark'}`}>
                  {m === 'ai' ? 'vs AI' : '2 Player'}
                </button>
              ))}
            </div>
          </div>
          {mode === 'ai' && (
            <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
              <h3 className="text-secondary font-bold text-lg mb-3">Difficulty</h3>
              <div className="grid grid-cols-2 gap-2">
                {['easy', 'hard'].map(d => (
                  <button key={d} onClick={() => { setDifficulty(d); resetGame(); }} className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${difficulty === d ? 'bg-secondary text-dark' : 'bg-dark/50 text-gray hover:bg-dark'}`}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">How to Play</h3>
            <div className="space-y-2 text-sm text-gray">
              <p><span className="text-secondary font-semibold">Click:</span> Place mark</p>
              <p className="pt-2 border-t border-gray-700 mt-2">Get 3 in a row to win!</p>
              {mode === 'ai' && <p className="text-secondary">You are X (cyan)</p>}
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {showTouchControls && (
            <div className="flex gap-1 flex-shrink-0">
              <div className="flex-1 bg-[#112240] rounded p-1 border border-gray-700 text-center">
                <p className="text-[10px] text-gray">X</p>
                <p className="text-sm font-bold text-secondary">{scores.x}</p>
              </div>
              <div className="flex-1 bg-[#112240] rounded p-1 border border-gray-700 text-center">
                <p className="text-[10px] text-gray">O</p>
                <p className="text-sm font-bold text-warning">{scores.o}</p>
              </div>
              <div className="flex-1 bg-[#112240] rounded p-1 border border-gray-700 text-center">
                <p className="text-[10px] text-gray">Draw</p>
                <p className="text-sm font-bold text-light">{scores.draw}</p>
              </div>
              <button onClick={resetGame} className="px-2 py-1 bg-success text-white text-xs font-semibold rounded">New</button>
              <button onClick={resetScores} className="px-2 py-1 bg-danger text-white text-xs font-semibold rounded">↻</button>
              <button onClick={() => { setMode(mode === 'ai' ? '2player' : 'ai'); resetGame(); }} className="px-2 py-1 bg-secondary text-dark text-xs font-semibold rounded">
                {mode === 'ai' ? 'AI' : '2P'}
              </button>
            </div>
          )}
          <div className="flex-1 flex items-center justify-center min-h-0 relative">
            <canvas ref={canvasRef} onClick={handleCanvasClick} className="border-4 border-secondary/30 rounded-xl shadow-2xl max-w-full max-h-full cursor-pointer" style={{ boxShadow: '0 0 60px rgba(100, 255, 218, 0.3)' }} />
            {gameState === 'playing' && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-lg">
                <p className="text-lg font-bold text-center">
                  {mode === 'ai' && !isXNext ? (
                    <span className="text-warning">AI Thinking...</span>
                  ) : (
                    <span className={isXNext ? 'text-secondary' : 'text-warning'}>
                      {isXNext ? 'X' : 'O'}'s Turn
                    </span>
                  )}
                </p>
              </div>
            )}
            {gameState === 'gameOver' && (
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
                    {winner === 'draw' ? (
                      <span className="text-light">Draw!</span>
                    ) : (
                      <span className={winner === 'X' ? 'text-secondary' : 'text-warning'}>
                        {winner} Wins!
                      </span>
                    )}
                  </h2>
                  <button onClick={resetGame} className="px-6 md:px-8 py-2 md:py-3 bg-secondary hover:bg-secondary/80 text-dark font-bold rounded-lg transition-all">Play Again</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="hidden lg:flex lg:w-64 xl:w-80 flex-col gap-4 overflow-y-auto">
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Score</h3>
            <div className="space-y-3">
              <div className="bg-dark/50 rounded-lg p-3">
                <p className="text-gray text-sm mb-1">X Wins</p>
                <p className="text-3xl font-bold text-secondary text-center">{scores.x}</p>
              </div>
              <div className="bg-dark/50 rounded-lg p-3">
                <p className="text-gray text-sm mb-1">O Wins</p>
                <p className="text-3xl font-bold text-warning text-center">{scores.o}</p>
              </div>
              <div className="bg-dark/50 rounded-lg p-3">
                <p className="text-gray text-sm mb-1">Draws</p>
                <p className="text-3xl font-bold text-light text-center">{scores.draw}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Current Turn</h3>
            <div className="bg-dark/50 rounded-lg p-3 text-center">
              <p className={`text-2xl font-bold ${isXNext ? 'text-secondary' : 'text-warning'}`}>
                {mode === 'ai' && !isXNext ? 'AI (O)' : isXNext ? 'X' : 'O'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  )
}

export default TicTacToeGame
