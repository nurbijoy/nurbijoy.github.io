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
  const [enPassantTarget, setEnPassantTarget] = useState(null)
  const [castlingRights, setCastlingRights] = useState({
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true }
  })
  const [promotionPending, setPromotionPending] = useState(null)
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

  const isValidMoveBasic = (fromRow, fromCol, toRow, toCol, piece, testBoard, checkSpecialMoves = true, currentEnPassant = null, currentCastlingRights = null, isKingInCheckFn = null) => {
    if (!testBoard) return false
    if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false
    
    const targetPiece = testBoard[toRow][toCol]
    
    // FIDE Rule 1.4.1: Capturing the opponent's king is not allowed
    if (targetPiece && targetPiece.type === 'king') return false
    
    if (targetPiece && targetPiece.color === piece.color) return false

    const rowDiff = toRow - fromRow
    const colDiff = toCol - fromCol
    const absRowDiff = Math.abs(rowDiff)
    const absColDiff = Math.abs(colDiff)

    switch (piece.type) {
      case 'pawn': {
        const direction = piece.color === 'white' ? -1 : 1
        const startRow = piece.color === 'white' ? 6 : 1
        
        // Normal forward move
        if (colDiff === 0 && !targetPiece) {
          if (rowDiff === direction) return true
          if (fromRow === startRow && rowDiff === direction * 2 && !testBoard[fromRow + direction][fromCol]) return true
        }
        // Normal capture
        if (absColDiff === 1 && rowDiff === direction && targetPiece) return true
        
        // En passant
        if (checkSpecialMoves && absColDiff === 1 && rowDiff === direction && !targetPiece) {
          if (currentEnPassant && currentEnPassant.row === toRow && currentEnPassant.col === toCol) {
            return true
          }
        }
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
        // Normal king move
        if (absRowDiff <= 1 && absColDiff <= 1) return true
        
        // Castling
        if (checkSpecialMoves && absRowDiff === 0 && absColDiff === 2 && currentCastlingRights && isKingInCheckFn) {
          const rights = currentCastlingRights[piece.color]
          const kingRow = piece.color === 'white' ? 7 : 0
          
          if (fromRow !== kingRow || toRow !== kingRow) return false
          if (isKingInCheckFn(piece.color, testBoard)) return false // Can't castle out of check
          
          // King-side castling
          if (toCol === 6 && rights.kingSide) {
            if (testBoard[kingRow][5] || testBoard[kingRow][6]) return false
            if (testBoard[kingRow][7]?.type !== 'rook') return false
            // Check if squares king passes through are under attack
            const tempBoard1 = testBoard.map(r => [...r])
            tempBoard1[kingRow][5] = tempBoard1[kingRow][4]
            tempBoard1[kingRow][4] = null
            if (isKingInCheckFn(piece.color, tempBoard1)) return false
            return true
          }
          
          // Queen-side castling
          if (toCol === 2 && rights.queenSide) {
            if (testBoard[kingRow][1] || testBoard[kingRow][2] || testBoard[kingRow][3]) return false
            if (testBoard[kingRow][0]?.type !== 'rook') return false
            // Check if squares king passes through are under attack
            const tempBoard1 = testBoard.map(r => [...r])
            tempBoard1[kingRow][3] = tempBoard1[kingRow][4]
            tempBoard1[kingRow][4] = null
            if (isKingInCheckFn(piece.color, tempBoard1)) return false
            return true
          }
        }
        return false
      
      default:
        return false
    }
  }

  const isKingInCheck = useCallback((color, testBoard) => {
    // Find the king
    let kingPos = null
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = testBoard[row][col]
        if (piece && piece.type === 'king' && piece.color === color) {
          kingPos = { row, col }
          break
        }
      }
      if (kingPos) break
    }
    
    if (!kingPos) {
      console.log('isKingInCheck: King not found for', color)
      return false
    }
    
    console.log('isKingInCheck: Checking', color, 'king at', kingPos)
    
    // Check if any opponent piece can attack the king
    const opponentColor = color === 'white' ? 'black' : 'white'
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = testBoard[row][col]
        if (piece && piece.color === opponentColor) {
          // Check if this piece can attack the king position
          const rowDiff = kingPos.row - row
          const colDiff = kingPos.col - col
          const absRowDiff = Math.abs(rowDiff)
          const absColDiff = Math.abs(colDiff)
          
          let canAttack = false
          switch (piece.type) {
            case 'pawn': {
              // Pawn attacks diagonally in its forward direction
              const direction = piece.color === 'white' ? -1 : 1
              // Check if king is one square diagonally forward from the pawn
              if (absColDiff === 1 && rowDiff === direction) {
                canAttack = true
              }
              break
            }
            case 'rook':
              if ((rowDiff === 0 || colDiff === 0) && isPathClear(row, col, kingPos.row, kingPos.col, testBoard)) {
                canAttack = true
              }
              break
            case 'bishop':
              if (absRowDiff === absColDiff && absRowDiff > 0 && isPathClear(row, col, kingPos.row, kingPos.col, testBoard)) {
                canAttack = true
              }
              break
            case 'queen':
              if ((rowDiff === 0 || colDiff === 0 || absRowDiff === absColDiff) && 
                  (absRowDiff > 0 || absColDiff > 0) &&
                  isPathClear(row, col, kingPos.row, kingPos.col, testBoard)) {
                canAttack = true
              }
              break
            case 'knight':
              if ((absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2)) {
                canAttack = true
              }
              break
            case 'king':
              if (absRowDiff <= 1 && absColDiff <= 1 && (absRowDiff > 0 || absColDiff > 0)) {
                canAttack = true
              }
              break
          }
          
          if (canAttack) {
            console.log('isKingInCheck: CHECK! by', piece.type, 'at', {row, col})
            return true
          }
        }
      }
    }
    console.log('isKingInCheck: No check detected')
    return false
  }, [])

  const getValidMoves = useCallback((row, col) => {
    if (!board) return []
    const piece = board[row][col]
    if (!piece) return []
    
    const moves = []
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (isValidMoveBasic(row, col, r, c, piece, board, true, enPassantTarget, castlingRights, isKingInCheck)) {
          // Test this move by applying it to a temporary board
          const testBoard = board.map(row => [...row])
          testBoard[r][c] = testBoard[row][col]
          testBoard[row][col] = null
          
          // Check if this move leaves our king in check
          if (!isKingInCheck(piece.color, testBoard)) {
            moves.push({ row: r, col: c })
          }
        }
      }
    }
    
    return moves
  }, [board, isKingInCheck, enPassantTarget, castlingRights])

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
              if (isValidMoveBasic(row, col, r, c, piece, testBoard, true, enPassantTarget, castlingRights, isKingInCheck)) {
                // Test this move by applying it to a temporary board
                const tempBoard = testBoard.map(row => [...row])
                tempBoard[r][c] = tempBoard[row][col]
                tempBoard[row][col] = null
                
                // Check if this move leaves our king in check
                if (!isKingInCheck(color, tempBoard)) {
                  moves.push({ from: { row, col }, to: { row: r, col: c }, piece })
                }
              }
            }
          }
        }
      }
    }
    return moves
  }, [isKingInCheck, enPassantTarget, castlingRights])

  const checkGameState = useCallback((color, testBoard) => {
    const possibleMoves = getAllPossibleMoves(color, testBoard)
    const inCheck = isKingInCheck(color, testBoard)
    
    if (possibleMoves.length === 0) {
      if (inCheck) {
        return 'checkmate' // Checkmate - opponent wins
      } else {
        return 'stalemate' // Stalemate - draw
      }
    }
    
    if (inCheck) {
      return 'check' // King is in check but has moves
    }
    
    return 'playing'
  }, [getAllPossibleMoves, isKingInCheck])

  const executeMoveWithSpecialRules = useCallback((fromRow, fromCol, toRow, toCol, newBoard) => {
    const piece = newBoard[fromRow][fromCol]
    const capturedPiece = newBoard[toRow][toCol]
    let specialMove = null
    
    // Handle en passant capture
    if (piece.type === 'pawn' && enPassantTarget && toRow === enPassantTarget.row && toCol === enPassantTarget.col) {
      const capturedPawnRow = piece.color === 'white' ? toRow + 1 : toRow - 1
      const capturedPawn = newBoard[capturedPawnRow][toCol]
      newBoard[capturedPawnRow][toCol] = null
      specialMove = { type: 'enPassant', capturedPiece: capturedPawn }
    }
    
    // Handle castling
    if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
      const kingRow = fromRow
      if (toCol === 6) { // King-side
        newBoard[kingRow][5] = newBoard[kingRow][7]
        newBoard[kingRow][7] = null
        specialMove = { type: 'castling', side: 'king' }
      } else if (toCol === 2) { // Queen-side
        newBoard[kingRow][3] = newBoard[kingRow][0]
        newBoard[kingRow][0] = null
        specialMove = { type: 'castling', side: 'queen' }
      }
    }
    
    // Move the piece
    newBoard[toRow][toCol] = piece
    newBoard[fromRow][fromCol] = null
    
    // Check for pawn promotion
    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
      specialMove = { type: 'promotion', row: toRow, col: toCol }
    }
    
    // Update en passant target
    let newEnPassantTarget = null
    if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
      const direction = piece.color === 'white' ? -1 : 1
      newEnPassantTarget = { row: fromRow + direction, col: fromCol }
    }
    
    // Update castling rights
    const newCastlingRights = { ...castlingRights }
    if (piece.type === 'king') {
      newCastlingRights[piece.color] = { kingSide: false, queenSide: false }
    }
    if (piece.type === 'rook') {
      if (fromRow === 0 && fromCol === 0) newCastlingRights.black.queenSide = false
      if (fromRow === 0 && fromCol === 7) newCastlingRights.black.kingSide = false
      if (fromRow === 7 && fromCol === 0) newCastlingRights.white.queenSide = false
      if (fromRow === 7 && fromCol === 7) newCastlingRights.white.kingSide = false
    }
    
    return { 
      board: newBoard, 
      capturedPiece: specialMove?.capturedPiece || capturedPiece,
      enPassantTarget: newEnPassantTarget,
      castlingRights: newCastlingRights,
      specialMove
    }
  }, [enPassantTarget, castlingRights])

  const makeAIMove = useCallback(() => {
    if (!board || aiThinkingRef.current || currentPlayer !== 'black' || mode !== 'ai') return
    
    aiThinkingRef.current = true
    
    setTimeout(() => {
      const allMoves = getAllPossibleMoves('black', board)
      
      console.log('AI: Found', allMoves.length, 'possible moves')
      
      if (allMoves.length === 0) {
        console.log('AI: No moves available')
        aiThinkingRef.current = false
        return
      }

      let bestMove = null
      let bestScore = -Infinity

      // Easy: Random move with slight preference for captures
      if (difficulty === 'easy') {
        const inCheck = isKingInCheck('black', board)
        
        // If in check, prioritize moves that escape check
        if (inCheck) {
          const escapeMoves = allMoves.filter(m => {
            const testBoard = board.map(r => [...r])
            testBoard[m.to.row][m.to.col] = testBoard[m.from.row][m.from.col]
            testBoard[m.from.row][m.from.col] = null
            return !isKingInCheck('black', testBoard)
          })
          
          if (escapeMoves.length > 0) {
            bestMove = escapeMoves[Math.floor(Math.random() * escapeMoves.length)]
          } else {
            bestMove = allMoves[Math.floor(Math.random() * allMoves.length)]
          }
        } else {
          const captureMoves = allMoves.filter(m => board[m.to.row][m.to.col] !== null)
          if (captureMoves.length > 0 && Math.random() > 0.5) {
            bestMove = captureMoves[Math.floor(Math.random() * captureMoves.length)]
          } else {
            bestMove = allMoves[Math.floor(Math.random() * allMoves.length)]
          }
        }
      } 
      // Normal/Hard: Evaluate moves
      else {
        const movesToEvaluate = difficulty === 'normal' ? 
          Math.min(allMoves.length, 20) : allMoves.length
        
        const shuffledMoves = [...allMoves].sort(() => Math.random() - 0.5)
        const inCheck = isKingInCheck('black', board)
        
        console.log('AI: In check?', inCheck, 'Evaluating', movesToEvaluate, 'moves')
        
        for (let i = 0; i < movesToEvaluate; i++) {
          const move = shuffledMoves[i]
          const testBoard = board.map(r => [...r])
          const capturedPiece = testBoard[move.to.row][move.to.col]
          
          testBoard[move.to.row][move.to.col] = testBoard[move.from.row][move.from.col]
          testBoard[move.from.row][move.from.col] = null
          
          let score = evaluateBoard(testBoard)
          
          // CRITICAL: If in check, heavily prioritize moves that get out of check
          if (inCheck) {
            const stillInCheck = isKingInCheck('black', testBoard)
            if (!stillInCheck) {
              score += 1000 // Massive bonus for escaping check
            } else {
              score -= 1000 // Massive penalty for staying in check
            }
          }
          
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
        
        console.log('AI: Best move score:', bestScore, 'Move:', bestMove)
      }

      if (bestMove) {
        console.log('AI: Executing move from', bestMove.from, 'to', bestMove.to)
        const newBoard = board.map(r => [...r])
        
        const moveResult = executeMoveWithSpecialRules(
          bestMove.from.row, bestMove.from.col,
          bestMove.to.row, bestMove.to.col,
          newBoard
        )
        
        if (moveResult.capturedPiece) {
          setCapturedPieces(prev => ({
            ...prev,
            black: [...prev.black, moveResult.capturedPiece]
          }))
        }
        
        setBoard(moveResult.board)
        setEnPassantTarget(moveResult.enPassantTarget)
        setCastlingRights(moveResult.castlingRights)
        
        setMoveHistory(prev => [...prev, {
          from: bestMove.from,
          to: bestMove.to,
          piece: bestMove.piece.type,
          captured: moveResult.capturedPiece?.type,
          special: moveResult.specialMove?.type
        }])
        
        // Handle pawn promotion for AI (always promote to queen)
        if (moveResult.specialMove?.type === 'promotion') {
          const promotedBoard = moveResult.board.map(r => [...r])
          promotedBoard[moveResult.specialMove.row][moveResult.specialMove.col] = {
            type: 'queen',
            color: 'black'
          }
          setBoard(promotedBoard)
        }
        
        setCurrentPlayer('white')
        
        // Check game state after AI move
        const newGameState = checkGameState('white', moveResult.board)
        setGameState(newGameState)
        
        console.log('AI: Move complete, new game state:', newGameState)
      } else {
        console.error('AI: No best move found!')
      }
      
      aiThinkingRef.current = false
    }, 500)
  }, [board, currentPlayer, mode, difficulty, getAllPossibleMoves, evaluateBoard, checkGameState, isKingInCheck, executeMoveWithSpecialRules, castlingRights, enPassantTarget])

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
        
        // Highlight king in check with red
        const piece = board[row][col]
        if (piece && piece.type === 'king' && piece.color === currentPlayer && gameState === 'check') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.5)'
        }
        
        // Highlight selected square
        if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) {
          ctx.fillStyle = 'rgba(100, 255, 218, 0.4)'
        }
        
        // Highlight valid moves
        if (validMoves.some(m => m.row === row && m.col === col)) {
          ctx.fillStyle = 'rgba(100, 255, 218, 0.5)'
        }
        
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
        
        // Draw piece
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

  const handlePromotion = (pieceType) => {
    if (!promotionPending) return
    
    const newBoard = board.map(r => [...r])
    newBoard[promotionPending.row][promotionPending.col] = {
      type: pieceType,
      color: promotionPending.color
    }
    
    setBoard(newBoard)
    setPromotionPending(null)
    
    const nextPlayer = currentPlayer === 'white' ? 'black' : 'white'
    setCurrentPlayer(nextPlayer)
    
    const newGameState = checkGameState(nextPlayer, newBoard)
    setGameState(newGameState)
  }

  const handleCanvasClick = (e) => {
    if (gameState !== 'playing' || !board || promotionPending) return
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
        
        const moveResult = executeMoveWithSpecialRules(
          selectedSquare.row, selectedSquare.col, 
          row, col, 
          newBoard
        )
        
        if (moveResult.capturedPiece) {
          setCapturedPieces(prev => ({
            ...prev,
            [currentPlayer]: [...prev[currentPlayer], moveResult.capturedPiece]
          }))
        }
        
        setBoard(moveResult.board)
        setEnPassantTarget(moveResult.enPassantTarget)
        setCastlingRights(moveResult.castlingRights)
        
        setMoveHistory(prev => [...prev, {
          from: { row: selectedSquare.row, col: selectedSquare.col },
          to: { row, col },
          piece: piece.type,
          captured: moveResult.capturedPiece?.type,
          special: moveResult.specialMove?.type
        }])
        
        setSelectedSquare(null)
        setValidMoves([])
        
        // Handle pawn promotion
        if (moveResult.specialMove?.type === 'promotion') {
          setPromotionPending({ 
            row: moveResult.specialMove.row, 
            col: moveResult.specialMove.col,
            color: piece.color
          })
          return // Don't change turn yet
        }
        
        const nextPlayer = currentPlayer === 'white' ? 'black' : 'white'
        setCurrentPlayer(nextPlayer)
        
        // Check game state after move
        const newGameState = checkGameState(nextPlayer, moveResult.board)
        setGameState(newGameState)
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
        const moves = getValidMoves(row, col)
        // Only allow selection if the piece has legal moves
        if (moves.length > 0) {
          setSelectedSquare({ row, col })
          setValidMoves(moves)
        }
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
    setEnPassantTarget(null)
    setCastlingRights({
      white: { kingSide: true, queenSide: true },
      black: { kingSide: true, queenSide: true }
    })
    setPromotionPending(null)
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
                {gameState === 'checkmate' ? (
                  <p className="text-xs font-bold text-success">Checkmate!</p>
                ) : gameState === 'stalemate' ? (
                  <p className="text-xs font-bold text-warning">Stalemate!</p>
                ) : (
                  <div>
                    <p className={`text-sm font-bold ${currentPlayer === 'white' ? 'text-secondary' : 'text-warning'}`}>
                      {mode === 'ai' && currentPlayer === 'black' ? '🤖 AI' : currentPlayer === 'white' ? '♔ White' : '♚ Black'}
                    </p>
                    {gameState === 'check' && <p className="text-[10px] text-danger font-bold">Check!</p>}
                  </div>
                )}
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
              {gameState === 'checkmate' ? (
                <div>
                  <p className="text-3xl font-bold text-success mb-2">Checkmate!</p>
                  <p className="text-lg text-gray">{currentPlayer === 'white' ? 'Black' : 'White'} Wins!</p>
                </div>
              ) : gameState === 'stalemate' ? (
                <div>
                  <p className="text-3xl font-bold text-warning mb-2">Stalemate!</p>
                  <p className="text-lg text-gray">Draw</p>
                </div>
              ) : (
                <div>
                  <p className={`text-3xl font-bold ${currentPlayer === 'white' ? 'text-secondary' : 'text-warning'}`}>
                    {mode === 'ai' && currentPlayer === 'black' ? '🤖 AI' : currentPlayer === 'white' ? '♔ White' : '♚ Black'}
                  </p>
                  {gameState === 'check' && (
                    <p className="text-sm text-danger mt-2 font-bold">⚠️ Check!</p>
                  )}
                  {mode === 'ai' && currentPlayer === 'black' && aiThinkingRef.current && (
                    <p className="text-sm text-gray mt-2">Thinking...</p>
                  )}
                </div>
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
      
      {/* Pawn Promotion Dialog */}
      {promotionPending && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#112240] rounded-xl p-6 border-2 border-secondary shadow-2xl">
            <h3 className="text-secondary font-bold text-xl mb-4 text-center">Promote Pawn</h3>
            <div className="grid grid-cols-4 gap-3">
              {['queen', 'rook', 'bishop', 'knight'].map(type => (
                <button
                  key={type}
                  onClick={() => handlePromotion(type)}
                  className="w-16 h-16 bg-dark hover:bg-secondary/20 border-2 border-secondary/50 hover:border-secondary rounded-lg flex items-center justify-center text-4xl transition-all"
                >
                  {pieceSymbols[promotionPending.color][type]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </GameLayout>
  )
}

export default ChessGame
