import { useState, useEffect, useRef, useCallback } from 'react'
import GameLayout from './GameLayout'
import { useInputDevice } from '../../hooks/useInputDevice'

const ChessGame = () => {
  const canvasRef = useRef(null)
  const [board, setBoard] = useState(null)
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [validMoves, setValidMoves] = useState([])
  const [currentPlayer, setCurrentPlayer] = useState('white')
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] })
  const [gameState, setGameState] = useState('playing')
  const [moveHistory, setMoveHistory] = useState([])
  const [mode, setMode] = useState('ai') // 'ai' or '2player'
  const [difficulty, setDifficulty] = useState('normal')
  const { showTouchControls, toggleTouchControls } = useInputDevice()
  
  const aiThinkingRef = useRef(false)

  const pieceSymbols = {
    white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
    black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
  }

  const initializeBoard = useCallback(() => {
    const newBoard = Array(8).fill(null).map(() => Array(8).fill(null))
    
    // Black pieces
    newBoard[0] = [
      { type: 'rook', color: 'black' }, { type: 'knight', color: 'black' },
      { type: 'bishop', color: 'black' }, { type: 'queen', color: 'black' },
      { type: 'king', color: 'black' }, { type: 'bishop', color: 'black' },
      { type: 'knight', color: 'black' }, { type: 'rook', color: 'black' }
    ]
    newBoard[1] = Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' }))
    
    // White pieces
    newBoard[6] = Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' }))
    newBoard[7] = [
      { type: 'rook', color: 'white' }, { type: 'knight', color: 'white' },
      { type: 'bishop', color: 'white' }, { type: 'queen', color: 'white' },
      { type: 'king', color: 'white' }, { type: 'bishop', color: 'white' },
      { type: 'knight', color: 'white' }, { type: 'rook', color: 'white' }
    ]
    
    return newBoard
  }, [])

  useEffect(() => {
    setBoard(initializeBoard())
  }, [initializeBoard])

  const isValidMove = useCallback((fromRow, fromCol, toRow, toCol, piece, testBoard = board) => {
    if (!testBoard) return false
    if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false
    
    const targetPiece = testBoard[toRow][toCol]
    if (targetPiece && targetPiece.color === piece.color) return false

    const rowDiff = toRow - fromRow
    const colDiff = toCol - fromCol
    const absRowDiff = Math.abs(rowDiff)
    const absColDiff = Math.abs(colDiff)

    switch (piece.type) {
      case 'pawn': {
        const direction = piece.color === 'white' ? -1 : 1
        const startRow = piece.color === 'white' ? 6 : 1
        
        if (colDiff === 0 && !targetPiece) {
          if (rowDiff === direction) return true
          if (fromRow === startRow && rowDiff === direction * 2 && !testBoard[fromRow + direction][fromCol]) return true
        }
        if (absColDiff === 1 && rowDiff === direction && targetPiece) return true
        return false
      }
      
      case 'rook':
        if (rowDiff !== 0 && colDiff !== 0) return false
        return isPathClear(fromRow, fromCol, toRow, toCol, testBoard)
      
      case 'bishop':
        if (absRowDiff !== absColDiff) return false
        return isPathClear(fromRow, fromCol, toRow, toCol, testBoard)
      
      case 'queen':
        if (rowDiff !== 0 && colDiff !== 0 && absRowDiff !== absColDiff) return false
        return isPathClear(fromRow, fromCol, toRow, toCol, testBoard)
      
      case 'knight':
        return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2)
      
      case 'king':
        return absRowDiff <= 1 && absColDiff <= 1
      
      default:
        return false
    }
  }, [board])

  const isPathClear = (fromRow, fromCol, toRow, toCol, testBoard) => {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0
    
    let currentRow = fromRow + rowStep
    let currentCol = fromCol + colStep
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (testBoard[currentRow][currentCol]) return false
      currentRow += rowStep
      currentCol += colStep
    }
    return true
  }

  const getValidMoves = useCallback((row, col) => {
    if (!board) return []
    const piece = board[row][col]
    if (!piece) return []
    
    const moves = []
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (isValidMove(row, col, r, c, piece)) {
          moves.push({ row: r, col: c })
        }
      }
    }
    return moves
  }, [board, isValidMove])

  const evaluateBoard = useCallback((testBoard) => {
    const pieceValues = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 100
    }
    
    let score = 0
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = testBoard[row][col]
        if (piece) {
          const value = pieceValues[piece.type]
          score += piece.color === 'black' ? value : -value
        }
      }
    }
    return score
  }, [])

  const getAllPossibleMoves = useCallback((color, testBoard) => {
    const moves = []
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = testBoard[row][col]
        if (piece && piece.color === color) {
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              if (isValidMove(row, col, r, c, piece, testBoard)) {
                moves.push({ from: { row, col }, to: { row: r, col: c }, piece })
              }
            }
          }
        }
      }
    }
    return moves
  }, [isValidMove])

  const makeAIMove = useCallback(() => {
    if (!board || aiThinkingRef.current || currentPlayer !== 'black' || mode !== 'ai') return
    
    aiThinkingRef.current = true
    
    setTimeout(() => {
      const allMoves = getAllPossibleMoves('black', board)
      
      if (allMoves.length === 0) {
        aiThinkingRef.current = false
        return
      }

      let bestMove = null
      let bestScore = -Infinity

      // Easy: Random move with slight preference for captures
      if (difficulty === 'easy') {
        const captureMoves = allMoves.filter(m => board[m.to.row][m.to.col] !== null)
        if (captureMoves.length > 0 && Math.random() > 0.5) {
          bestMove = captureMoves[Math.floor(Math.random() * captureMoves.length)]
        } else {
          bestMove = allMoves[Math.floor(Math.random() * allMoves.length)]
        }
      } 
      // Normal/Hard: Evaluate moves
      else {
        const movesToEvaluate = difficulty === 'normal' ? 
          Math.min(allMoves.length, 20) : allMoves.length
        
        const shuffledMoves = [...allMoves].sort(() => Math.random() - 0.5)
        
        for (let i = 0; i < movesToEvaluate; i++) {
          const move = shuffledMoves[i]
          const testBoard = board.map(r => [...r])
          const capturedPiece = testBoard[move.to.row][move.to.col]
          
          testBoard[move.to.row][move.to.col] = testBoard[move.from.row][move.from.col]
          testBoard[move.from.row][move.from.col] = null
          
          let score = evaluateBoard(testBoard)
          
          // Bonus for captures
          if (capturedPiece) {
            score += 0.5
          }
          
          // Bonus for center control
          if (move.to.row >= 3 && move.to.row <= 4 && move.to.col >= 3 && move.to.col <= 4) {
            score += 0.2
          }
          
          if (score > bestScore) {
            bestScore = score
            bestMove = move
          }
        }
      }

      if (bestMove) {
        const newBoard = board.map(r => [...r])
        const capturedPiece = newBoard[bestMove.to.row][bestMove.to.col]
        
        if (capturedPiece) {
          setCapturedPieces(prev => ({
            ...prev,
            black: [...prev.black, capturedPiece]
          }))
        }
        
        newBoard[bestMove.to.row][bestMove.to.col] = newBoard[bestMove.from.row][bestMove.from.col]
        newBoard[bestMove.from.row][bestMove.from.col] = null
        
        setBoard(newBoard)
        setMoveHistory(prev => [...prev, {
          from: bestMove.from,
          to: bestMove.to,
          piece: bestMove.piece.type,
          captured: capturedPiece?.type
        }])
        setCurrentPlayer('white')
      }
      
      aiThinkingRef.current = false
    }, 500)
  }, [board, currentPlayer, mode, difficulty, getAllPossibleMoves, evaluateBoard])

  useEffect(() => {
    if (mode === 'ai' && currentPlayer === 'black' && gameState === 'playing') {
      makeAIMove()
    }
  }, [mode, currentPlayer, gameState, makeAIMove])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0 || !board) return
    const ctx = canvas.getContext('2d')
    const cellSize = canvas.width / 8

    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#0a192f')
    gradient.addColorStop(1, '#112240')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw board
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0
        ctx.fillStyle = isLight ? 'rgba(100, 255, 218, 0.15)' : 'rgba(100, 255, 218, 0.05)'
        
        // Highlight selected square
        if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.4)'
        }
        
        // Highlight valid moves
        if (validMoves.some(m => m.row === row && m.col === col)) {
          ctx.fillStyle = 'rgba(100, 255, 218, 0.3)'
        }
        
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
        
        // Draw piece
        const piece = board[row][col]
        if (piece) {
          ctx.fillStyle = piece.color === 'white' ? '#64ffda' : '#fbb6ce'
          ctx.font = `${cellSize * 0.7}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.shadowBlur = 10
          ctx.shadowColor = piece.color === 'white' ? '#64ffda' : '#fbb6ce'
          ctx.fillText(
            pieceSymbols[piece.color][piece.type],
            col * cellSize + cellSize / 2,
            row * cellSize + cellSize / 2
          )
          ctx.shadowBlur = 0
        }
      }
    }

    // Draw grid
    ctx.strokeStyle = 'rgba(100, 255, 218, 0.2)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellSize, 0)
      ctx.lineTo(i * cellSize, canvas.height)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * cellSize)
      ctx.lineTo(canvas.width, i * cellSize)
      ctx.stroke()
    }
  }, [board, selectedSquare, validMoves, pieceSymbols])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const container = canvas.parentElement
      if (!container) return
      const rect = container.getBoundingClientRect()
      const size = Math.min(rect.width - 16, rect.height - 16, 700)
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

  const handleCanvasClick = (e) => {
    if (gameState !== 'playing' || !board) return
    if (mode === 'ai' && currentPlayer === 'black') return // Don't allow clicks during AI turn
    
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cellSize = canvas.width / 8
    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)

    if (selectedSquare) {
      const validMove = validMoves.find(m => m.row === row && m.col === col)
      if (validMove) {
        // Make move
        const newBoard = board.map(r => [...r])
        const piece = newBoard[selectedSquare.row][selectedSquare.col]
        const capturedPiece = newBoard[row][col]
        
        if (capturedPiece) {
          setCapturedPieces(prev => ({
            ...prev,
            [currentPlayer]: [...prev[currentPlayer], capturedPiece]
          }))
        }
        
        newBoard[row][col] = piece
        newBoard[selectedSquare.row][selectedSquare.col] = null
        
        setBoard(newBoard)
        setMoveHistory(prev => [...prev, {
          from: { row: selectedSquare.row, col: selectedSquare.col },
          to: { row, col },
          piece: piece.type,
          captured: capturedPiece?.type
        }])
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white')
        setSelectedSquare(null)
        setValidMoves([])
      } else if (board[row][col]?.color === currentPlayer) {
        // Select different piece
        setSelectedSquare({ row, col })
        setValidMoves(getValidMoves(row, col))
      } else {
        // Deselect
        setSelectedSquare(null)
        setValidMoves([])
      }
    } else {
      const piece = board[row][col]
      if (piece && piece.color === currentPlayer) {
        setSelectedSquare({ row, col })
        setValidMoves(getValidMoves(row, col))
      }
    }
  }

  const resetGame = () => {
    setBoard(initializeBoard())
    setSelectedSquare(null)
    setValidMoves([])
    setCurrentPlayer('white')
    setCapturedPieces({ white: [], black: [] })
    setGameState('playing')
    setMoveHistory([])
    aiThinkingRef.current = false
  }

  return (
    <GameLayout title="♟️ Chess">
      <div className="h-[calc(100vh-73px)] flex flex-col lg:flex-row gap-4 p-4">
        <div className="hidden lg:flex lg:w-64 xl:w-80 flex-col gap-4 overflow-y-auto">
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Controls</h3>
            <div className="space-y-2">
              <button onClick={resetGame} className="w-full px-4 py-2.5 bg-success hover:bg-success/80 text-white font-semibold rounded-lg transition-all">New Game</button>
              <button onClick={toggleTouchControls} className="w-full px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-dark font-semibold rounded-lg transition-all">
                {showTouchControls ? '🎮 Hide Info' : '🎮 Show Info'}
              </button>
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
              <div className="grid grid-cols-3 gap-2">
                {['easy', 'normal', 'hard'].map(d => (
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
              <p><span className="text-secondary font-semibold">Click:</span> Select piece</p>
              <p><span className="text-secondary font-semibold">Click:</span> Move to highlighted square</p>
              <p className="pt-2 border-t border-gray-700 mt-2">Capture opponent's king to win!</p>
              {mode === 'ai' && <p className="text-secondary">You play as White (cyan)</p>}
            </div>
          </div>
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Captured</h3>
            <div className="space-y-2">
              <div className="bg-dark/50 rounded-lg p-2">
                <p className="text-gray text-xs mb-1">White Captured</p>
                <div className="flex flex-wrap gap-1">
                  {capturedPieces.white.map((piece, i) => (
                    <span key={i} className="text-2xl text-warning">{pieceSymbols[piece.color][piece.type]}</span>
                  ))}
                </div>
              </div>
              <div className="bg-dark/50 rounded-lg p-2">
                <p className="text-gray text-xs mb-1">Black Captured</p>
                <div className="flex flex-wrap gap-1">
                  {capturedPieces.black.map((piece, i) => (
                    <span key={i} className="text-2xl text-secondary">{pieceSymbols[piece.color][piece.type]}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {showTouchControls && (
            <div className="flex gap-1 flex-shrink-0">
              <div className="flex-1 bg-[#112240] rounded p-1 border border-gray-700 text-center">
                <p className="text-[10px] text-gray">Turn</p>
                <p className={`text-sm font-bold ${currentPlayer === 'white' ? 'text-secondary' : 'text-warning'}`}>
                  {mode === 'ai' && currentPlayer === 'black' ? '🤖 AI' : currentPlayer === 'white' ? '♔ White' : '♚ Black'}
                </p>
              </div>
              <div className="flex-1 bg-[#112240] rounded p-1 border border-gray-700 text-center">
                <p className="text-[10px] text-gray">Moves</p>
                <p className="text-sm font-bold text-light">{moveHistory.length}</p>
              </div>
              <button onClick={resetGame} className="px-2 py-1 bg-success text-white text-xs font-semibold rounded">New</button>
              <button onClick={() => { setMode(mode === 'ai' ? '2player' : 'ai'); resetGame(); }} className="px-2 py-1 bg-secondary text-dark text-xs font-semibold rounded">
                {mode === 'ai' ? 'AI' : '2P'}
              </button>
            </div>
          )}
          <div className="flex-1 flex items-center justify-center min-h-0 relative">
            <canvas 
              ref={canvasRef} 
              onClick={handleCanvasClick}
              className="border-4 border-secondary/30 rounded-xl shadow-2xl max-w-full max-h-full cursor-pointer" 
              style={{ boxShadow: '0 0 60px rgba(100, 255, 218, 0.3)' }} 
            />
            
            <button 
              onClick={toggleTouchControls}
              className="lg:hidden absolute top-2 right-2 p-2 bg-secondary/80 hover:bg-secondary text-dark rounded-lg shadow-lg z-10 text-xs font-semibold"
              title={showTouchControls ? 'Hide info' : 'Show info'}
            >
              ℹ️
            </button>
          </div>
        </div>
        <div className="hidden lg:flex lg:w-64 xl:w-80 flex-col gap-4 overflow-y-auto">
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Current Turn</h3>
            <div className="bg-dark/50 rounded-lg p-3 text-center">
              <p className={`text-3xl font-bold ${currentPlayer === 'white' ? 'text-secondary' : 'text-warning'}`}>
                {mode === 'ai' && currentPlayer === 'black' ? '🤖 AI' : currentPlayer === 'white' ? '♔ White' : '♚ Black'}
              </p>
              {mode === 'ai' && currentPlayer === 'black' && aiThinkingRef.current && (
                <p className="text-sm text-gray mt-2">Thinking...</p>
              )}
            </div>
          </div>
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Move History</h3>
            <div className="bg-dark/50 rounded-lg p-2 max-h-64 overflow-y-auto">
              {moveHistory.length === 0 ? (
                <p className="text-gray text-sm text-center py-2">No moves yet</p>
              ) : (
                <div className="space-y-1">
                  {moveHistory.map((move, i) => (
                    <div key={i} className="text-xs text-gray">
                      {i + 1}. {move.piece} {String.fromCharCode(97 + move.from.col)}{8 - move.from.row} → {String.fromCharCode(97 + move.to.col)}{8 - move.to.row}
                      {move.captured && <span className="text-danger"> ×{move.captured}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  )
}

export default ChessGame
