import { useState, useCallback } from 'react'
import GameLayout from './GameLayout'
import { FiRotateCcw } from 'react-icons/fi'
import { FaRobot } from 'react-icons/fa'

const TicTacToeGame = () => {
  const [board, setBoard] = useState(Array(9).fill(''))
  const [currentPlayer, setCurrentPlayer] = useState('X')
  const [gameActive, setGameActive] = useState(true)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [scores, setScores] = useState({ x: 0, o: 0, draws: 0 })
  const [winner, setWinner] = useState(null)
  const [winningLine, setWinningLine] = useState([])

  const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ]

  const checkWinFor = useCallback((boardState, player) => {
    return winningConditions.some(condition => {
      return condition.every(index => boardState[index] === player)
    })
  }, [])

  const minimax = useCallback((newBoard, player) => {
    const availSpots = newBoard.map((val, idx) => val === '' ? idx : null).filter(val => val !== null)

    if (checkWinFor(newBoard, 'X')) return { score: -10 }
    if (checkWinFor(newBoard, 'O')) return { score: 10 }
    if (availSpots.length === 0) return { score: 0 }

    const moves = []
    
    for (let i = 0; i < availSpots.length; i++) {
      const move = {}
      move.index = availSpots[i]
      newBoard[availSpots[i]] = player

      if (player === 'O') {
        const result = minimax(newBoard, 'X')
        move.score = result.score
      } else {
        const result = minimax(newBoard, 'O')
        move.score = result.score
      }

      newBoard[availSpots[i]] = ''
      moves.push(move)
    }

    let bestMove
    if (player === 'O') {
      let bestScore = -10000
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score
          bestMove = i
        }
      }
    } else {
      let bestScore = 10000
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score
          bestMove = i
        }
      }
    }

    return moves[bestMove]
  }, [checkWinFor])

  const checkWin = useCallback((boardState) => {
    for (let condition of winningConditions) {
      const [a, b, c] = condition
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        setWinningLine(condition)
        return true
      }
    }
    return false
  }, [])

  const makeMove = useCallback((index, player) => {
    const newBoard = [...board]
    newBoard[index] = player
    setBoard(newBoard)

    if (checkWin(newBoard)) {
      setWinner(`${player} Wins!`)
      setGameActive(false)
      setScores(prev => ({
        ...prev,
        [player.toLowerCase()]: prev[player.toLowerCase()] + 1
      }))
      return true
    }

    if (newBoard.every(cell => cell !== '')) {
      setWinner("It's a Draw!")
      setGameActive(false)
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }))
      return true
    }

    return false
  }, [board, checkWin])

  const handleCellClick = (index) => {
    if (board[index] !== '' || !gameActive) return
    if (aiEnabled && currentPlayer === 'O') return

    const gameEnded = makeMove(index, currentPlayer)
    if (gameEnded) return

    const nextPlayer = currentPlayer === 'X' ? 'O' : 'X'
    setCurrentPlayer(nextPlayer)

    if (aiEnabled && nextPlayer === 'O') {
      setTimeout(() => {
        const newBoard = [...board]
        newBoard[index] = 'X'
        const bestMove = minimax(newBoard, 'O').index
        const aiGameEnded = makeMove(bestMove, 'O')
        if (!aiGameEnded) {
          setCurrentPlayer('X')
        }
      }, 500)
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(''))
    setCurrentPlayer('X')
    setGameActive(true)
    setWinner(null)
    setWinningLine([])
  }

  const toggleAI = () => {
    setAiEnabled(!aiEnabled)
    resetGame()
  }

  const leftPanel = (
    <>
      <div className="bg-[#112240] p-4 rounded-lg">
        <h3 className="text-secondary font-semibold mb-3">Controls</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={resetGame}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-success hover:bg-success/80 text-white rounded-lg transition-all"
          >
            <FiRotateCcw /> New Game
          </button>
          <button
            onClick={toggleAI}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-dark rounded-lg transition-all"
          >
            <FaRobot /> AI: {aiEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="bg-[#112240] p-4 rounded-lg">
        <h3 className="text-secondary font-semibold mb-3">How to Play</h3>
        <div className="text-sm text-gray space-y-2">
          <p>Click on any empty cell to place your mark</p>
          <p>Get 3 in a row to win!</p>
          <p>Play against AI or 2-player mode</p>
        </div>
      </div>
    </>
  )

  const rightPanel = (
    <>
      <div className="bg-[#112240] p-4 rounded-lg">
        <h3 className="text-secondary font-semibold mb-3">Game Status</h3>
        <div className="bg-dark p-4 rounded-lg text-center">
          <h4 className="text-sm text-gray mb-2">Current Turn</h4>
          <p className={`text-4xl font-bold ${currentPlayer === 'X' ? 'text-blue-400' : 'text-green-400'}`}>
            {currentPlayer}
          </p>
        </div>
      </div>

      <div className="bg-[#112240] p-4 rounded-lg">
        <h3 className="text-secondary font-semibold mb-3">Score</h3>
        <div className="space-y-3">
          <div className="bg-dark p-3 rounded-lg text-center">
            <h4 className="text-xs text-gray mb-1">X Wins</h4>
            <p className="text-2xl font-bold text-blue-400">{scores.x}</p>
          </div>
          <div className="bg-dark p-3 rounded-lg text-center">
            <h4 className="text-xs text-gray mb-1">O Wins</h4>
            <p className="text-2xl font-bold text-green-400">{scores.o}</p>
          </div>
          <div className="bg-dark p-3 rounded-lg text-center">
            <h4 className="text-xs text-gray mb-1">Draws</h4>
            <p className="text-2xl font-bold text-secondary">{scores.draws}</p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <GameLayout title="⭕ Tic Tac Toe" leftPanel={leftPanel} rightPanel={rightPanel}>
      <div className="relative">
        <div className="grid grid-cols-3 gap-4">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={cell !== '' || !gameActive}
              className={`
                w-40 h-40 bg-[#1e3a5f] border-4 border-gray/30 rounded-xl
                flex items-center justify-center text-7xl font-bold
                transition-all duration-300
                ${cell === '' && gameActive ? 'hover:bg-[#2a4a7f] hover:scale-105 cursor-pointer' : 'cursor-not-allowed'}
                ${cell === 'X' ? 'text-blue-400' : cell === 'O' ? 'text-green-400' : ''}
                ${winningLine.includes(index) ? 'bg-warning/30 animate-pulse' : ''}
              `}
            >
              {cell}
            </button>
          ))}
        </div>

        {winner && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg -m-20">
            <div className="bg-[#112240] p-8 rounded-xl text-center">
              <h2 className="text-3xl font-bold text-secondary mb-6">{winner}</h2>
              <button
                onClick={resetGame}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-success hover:bg-success/80 text-white rounded-lg transition-all mx-auto"
              >
                <FiRotateCcw /> Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  )
}

export default TicTacToeGame
