import { useState, useEffect, useRef, useCallback } from 'react'
import GameLayout from './GameLayout'
import { useInputDevice } from '../../hooks/useInputDevice'

const MemoryGame = () => {
  const canvasRef = useRef(null)
  const [cards, setCards] = useState([])
  const [flippedIndices, setFlippedIndices] = useState([])
  const [matchedPairs, setMatchedPairs] = useState([])
  const [moves, setMoves] = useState(0)
  const [timer, setTimer] = useState(0)
  const [gameState, setGameState] = useState('ready')
  const [difficulty, setDifficulty] = useState('medium')
  const [bestTime, setBestTime] = useState(() => {
    return parseInt(localStorage.getItem('memoryBestTime')) || 0
  })
  const { showTouchControls, toggleTouchControls } = useInputDevice()
  
  const timerRef = useRef(null)
  const lockRef = useRef(false)

  const difficultySettings = {
    easy: { pairs: 6, cols: 3, rows: 4 },
    medium: { pairs: 8, cols: 4, rows: 4 },
    hard: { pairs: 12, cols: 4, rows: 6 }
  }

  const emojis = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧', '🎸', '🎹', '🎺', '🎻', '🎼', '🎵', '🎶']

  const initializeCards = useCallback(() => {
    const { pairs } = difficultySettings[difficulty]
    const selectedEmojis = emojis.slice(0, pairs)
    const cardPairs = [...selectedEmojis, ...selectedEmojis]
    return cardPairs
      .map((emoji, index) => ({ id: index, emoji, matched: false }))
      .sort(() => Math.random() - 0.5)
  }, [difficulty])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0 || cards.length === 0) return
    const ctx = canvas.getContext('2d')
    
    const { cols, rows } = difficultySettings[difficulty]
    const cardWidth = canvas.width / cols
    const cardHeight = canvas.height / rows
    const padding = 4

    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#0a192f')
    gradient.addColorStop(1, '#112240')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    cards.forEach((card, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const x = col * cardWidth + padding
      const y = row * cardHeight + padding
      const w = cardWidth - padding * 2
      const h = cardHeight - padding * 2

      const isFlipped = flippedIndices.includes(index) || matchedPairs.includes(card.emoji)
      
      // Card background
      if (matchedPairs.includes(card.emoji)) {
        ctx.fillStyle = 'rgba(100, 255, 218, 0.2)'
      } else if (isFlipped) {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.3)'
      } else {
        ctx.fillStyle = 'rgba(100, 255, 218, 0.1)'
      }
      
      ctx.shadowBlur = isFlipped ? 15 : 5
      ctx.shadowColor = matchedPairs.includes(card.emoji) ? '#64ffda' : isFlipped ? '#fbbf24' : '#64ffda'
      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(x, y, w, h, 8)
      } else {
        ctx.rect(x, y, w, h)
      }
      ctx.fill()
      
      // Card border
      ctx.strokeStyle = matchedPairs.includes(card.emoji) ? '#64ffda' : isFlipped ? '#fbbf24' : 'rgba(100, 255, 218, 0.3)'
      ctx.lineWidth = 2
      ctx.stroke()
      
      ctx.shadowBlur = 0

      // Card content
      if (isFlipped) {
        ctx.font = `${Math.min(w, h) * 0.5}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#fff'
        ctx.fillText(card.emoji, x + w / 2, y + h / 2)
      } else {
        // Card back pattern
        ctx.fillStyle = 'rgba(100, 255, 218, 0.2)'
        ctx.font = `${Math.min(w, h) * 0.4}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('?', x + w / 2, y + h / 2)
      }
    })
  }, [cards, flippedIndices, matchedPairs, difficulty])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [gameState])

  useEffect(() => {
    if (matchedPairs.length === difficultySettings[difficulty].pairs && gameState === 'playing') {
      setGameState('won')
      if (bestTime === 0 || timer < bestTime) {
        setBestTime(timer)
        localStorage.setItem('memoryBestTime', timer)
      }
    }
  }, [matchedPairs, difficulty, gameState, timer, bestTime])

  useEffect(() => {
    if (flippedIndices.length === 2 && !lockRef.current) {
      lockRef.current = true
      const [first, second] = flippedIndices
      
      if (cards[first].emoji === cards[second].emoji) {
        setMatchedPairs(prev => [...prev, cards[first].emoji])
        setFlippedIndices([])
        lockRef.current = false
      } else {
        setTimeout(() => {
          setFlippedIndices([])
          lockRef.current = false
        }, 1000)
      }
      setMoves(prev => prev + 1)
    }
  }, [flippedIndices, cards])

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const container = canvas.parentElement
      if (!container) return
      const rect = container.getBoundingClientRect()
      
      const { cols, rows } = difficultySettings[difficulty]
      const aspectRatio = cols / rows
      
      let width = Math.min(rect.width - 16, 700)
      let height = width / aspectRatio
      
      if (height > rect.height - 16) {
        height = rect.height - 16
        width = height * aspectRatio
      }
      
      if (width > 50 && height > 50) {
        canvas.width = width
        canvas.height = height
        draw()
      }
    }
    const timer = setTimeout(updateCanvasSize, 50)
    window.addEventListener('resize', updateCanvasSize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [draw, difficulty])

  const handleCanvasClick = (e) => {
    if (gameState !== 'playing' || lockRef.current) return
    if (flippedIndices.length >= 2) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const { cols, rows } = difficultySettings[difficulty]
    const cardWidth = canvas.width / cols
    const cardHeight = canvas.height / rows
    const col = Math.floor(x / cardWidth)
    const row = Math.floor(y / cardHeight)
    const index = row * cols + col

    if (index >= 0 && index < cards.length) {
      const card = cards[index]
      if (!matchedPairs.includes(card.emoji) && !flippedIndices.includes(index)) {
        setFlippedIndices(prev => [...prev, index])
      }
    }
  }

  const startGame = () => {
    const newCards = initializeCards()
    setCards(newCards)
    setFlippedIndices([])
    setMatchedPairs([])
    setMoves(0)
    setTimer(0)
    setGameState('playing')
    lockRef.current = false
  }

  const resetGame = () => {
    const newCards = initializeCards()
    setCards(newCards)
    setFlippedIndices([])
    setMatchedPairs([])
    setMoves(0)
    setTimer(0)
    setGameState('ready')
    lockRef.current = false
  }

  useEffect(() => {
    resetGame()
  }, [difficulty])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <GameLayout title="🃏 Memory Match">
      <div className="h-[calc(100vh-73px)] flex flex-col lg:flex-row gap-4 p-4">
        <div className="hidden lg:flex lg:w-64 xl:w-80 flex-col gap-4 overflow-y-auto">
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Controls</h3>
            <div className="space-y-2">
              <button onClick={startGame} className="w-full px-4 py-2.5 bg-success hover:bg-success/80 text-white font-semibold rounded-lg transition-all">Start Game</button>
              <button onClick={resetGame} className="w-full px-4 py-2.5 bg-danger hover:bg-danger/80 text-white font-semibold rounded-lg transition-all">Reset</button>
              <button onClick={toggleTouchControls} className="w-full px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-dark font-semibold rounded-lg transition-all">
                {showTouchControls ? '🎮 Hide Stats' : '🎮 Show Stats'}
              </button>
            </div>
          </div>
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Difficulty</h3>
            <div className="grid grid-cols-3 gap-2">
              {['easy', 'medium', 'hard'].map(d => (
                <button 
                  key={d} 
                  onClick={() => setDifficulty(d)} 
                  className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${difficulty === d ? 'bg-secondary text-dark' : 'bg-dark/50 text-gray hover:bg-dark'}`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">How to Play</h3>
            <div className="space-y-2 text-sm text-gray">
              <p><span className="text-secondary font-semibold">Click:</span> Flip card</p>
              <p className="pt-2 border-t border-gray-700 mt-2">Match all pairs to win!</p>
              <p className="text-xs">Find matching emoji pairs with fewest moves.</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {showTouchControls && (
            <div className="flex gap-1 flex-shrink-0">
              <div className="flex-1 bg-[#112240] rounded p-1 border border-gray-700 text-center">
                <p className="text-[10px] text-gray">Time</p>
                <p className="text-sm font-bold text-secondary">{formatTime(timer)}</p>
              </div>
              <div className="flex-1 bg-[#112240] rounded p-1 border border-gray-700 text-center">
                <p className="text-[10px] text-gray">Moves</p>
                <p className="text-sm font-bold text-warning">{moves}</p>
              </div>
              <div className="flex-1 bg-[#112240] rounded p-1 border border-gray-700 text-center">
                <p className="text-[10px] text-gray">Pairs</p>
                <p className="text-sm font-bold text-light">{matchedPairs.length}/{difficultySettings[difficulty].pairs}</p>
              </div>
              <button onClick={startGame} className="px-2 py-1 bg-success text-white text-xs font-semibold rounded">▶</button>
              <button onClick={resetGame} className="px-2 py-1 bg-danger text-white text-xs font-semibold rounded">↻</button>
              {['E', 'M', 'H'].map((s, i) => (
                <button 
                  key={s} 
                  onClick={() => setDifficulty(['easy', 'medium', 'hard'][i])} 
                  className={`px-2 py-1 rounded text-xs font-semibold ${difficulty === ['easy', 'medium', 'hard'][i] ? 'bg-secondary text-dark' : 'bg-dark/50 text-gray'}`}
                >
                  {s}
                </button>
              ))}
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
              title={showTouchControls ? 'Hide stats' : 'Show stats'}
            >
              📊
            </button>

            {gameState === 'ready' && (
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <h2 className="text-2xl md:text-4xl font-bold text-secondary mb-2 md:mb-4">Ready?</h2>
                  <p className="text-sm md:text-base text-gray mb-4">Click Start to begin</p>
                  <button onClick={startGame} className="px-6 md:px-8 py-2 md:py-3 bg-secondary hover:bg-secondary/80 text-dark font-bold rounded-lg transition-all">Start</button>
                </div>
              </div>
            )}
            {gameState === 'won' && (
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <h2 className="text-2xl md:text-4xl font-bold text-success mb-2 md:mb-4">You Won! 🎉</h2>
                  <p className="text-xl md:text-2xl text-secondary mb-1">Time: {formatTime(timer)}</p>
                  <p className="text-lg md:text-xl text-warning mb-1">Moves: {moves}</p>
                  {bestTime > 0 && <p className="text-sm text-gray mb-4">Best: {formatTime(bestTime)}</p>}
                  <button onClick={resetGame} className="px-6 md:px-8 py-2 md:py-3 bg-secondary hover:bg-secondary/80 text-dark font-bold rounded-lg transition-all">Play Again</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="hidden lg:flex lg:w-64 xl:w-80 flex-col gap-4 overflow-y-auto">
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Statistics</h3>
            <div className="space-y-3">
              <div className="bg-dark/50 rounded-lg p-3">
                <p className="text-gray text-sm mb-1">Time</p>
                <p className="text-3xl font-bold text-secondary">{formatTime(timer)}</p>
              </div>
              <div className="bg-dark/50 rounded-lg p-3">
                <p className="text-gray text-sm mb-1">Moves</p>
                <p className="text-3xl font-bold text-warning">{moves}</p>
              </div>
              <div className="bg-dark/50 rounded-lg p-3">
                <p className="text-gray text-sm mb-1">Matched Pairs</p>
                <p className="text-3xl font-bold text-light">{matchedPairs.length} / {difficultySettings[difficulty].pairs}</p>
              </div>
              {bestTime > 0 && (
                <div className="bg-dark/50 rounded-lg p-3">
                  <p className="text-gray text-sm mb-1">Best Time</p>
                  <p className="text-3xl font-bold text-success">{formatTime(bestTime)}</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-[#112240] rounded-xl p-4 border border-gray-700">
            <h3 className="text-secondary font-bold text-lg mb-3">Progress</h3>
            <div className="bg-dark/50 rounded-lg p-3">
              <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-secondary to-success h-full transition-all duration-300"
                  style={{ width: `${(matchedPairs.length / difficultySettings[difficulty].pairs) * 100}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray mt-2">
                {Math.round((matchedPairs.length / difficultySettings[difficulty].pairs) * 100)}% Complete
              </p>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  )
}

export default MemoryGame
