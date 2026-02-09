import { useState, useEffect, useRef, useCallback } from 'react'
import GameLayout from './GameLayout'
import { useInputDevice } from '../../hooks/useInputDevice'

const InvadersGame = () => {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [wave, setWave] = useState(1)
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('invadersHighScore')) || 0
  })
  const [gameState, setGameState] = useState('ready')
  const { showTouchControls, toggleTouchControls } = useInputDevice()

  const gameRef = useRef({
    player: { x: 0, width: 40, height: 30, speed: 6 },
    bullets: [],
    enemies: [],
    enemyBullets: [],
    keys: {},
    enemyDirection: 1,
    enemySpeed: 1,
    frameCount: 0
  })

  const createEnemies = useCallback((canvas, waveNum) => {
    const enemies = []
    const rows = 3 + Math.floor(waveNum / 3)
    const cols = 8
    const enemyWidth = 30
    const enemyHeight = 25
    const spacing = 50
    const startX = (canvas.width - cols * spacing) / 2
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        enemies.push({
          x: startX + col * spacing,
          y: 50 + row * 40,
          width: enemyWidth,
          height: enemyHeight,
          alive: true
        })
      }
    }
    return enemies
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0) return
    const ctx = canvas.getContext('2d')

    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#0a192f')
    gradient.addColorStop(1, '#112240')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Player
    const { player } = gameRef.current
    ctx.fillStyle = '#64ffda'
    ctx.shadowBlur = 20
    ctx.shadowColor = '#64ffda'
    ctx.beginPath()
    ctx.moveTo(player.x + player.width / 2, player.y)
    ctx.lineTo(player.x, player.y + player.height)
    ctx.lineTo(player.x + player.width, player.y + player.height)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0

    // Enemies
    gameRef.current.enemies.forEach(enemy => {
      if (enemy.alive) {
        ctx.fillStyle = '#fbb6ce'
        ctx.shadowBlur = 15
        ctx.shadowColor = '#fbb6ce'
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height)
        
        // Eyes
        ctx.fillStyle = '#0a192f'
        ctx.fillRect(enemy.x + 8, enemy.y + 8, 6, 6)
        ctx.fillRect(enemy.x + enemy.width - 14, enemy.y + 8, 6, 6)
      }
    })
    ctx.shadowBlur = 0

    // Player bullets
    ctx.fillStyle = '#fbbf24'
    ctx.shadowBlur = 15
    ctx.shadowColor = '#fbbf24'
    gameRef.current.bullets.forEach(bullet => {
      ctx.fillRect(bullet.x - 2, bullet.y, 4, 10)
    })

    // Enemy bullets
    ctx.fillStyle = '#f87171'
    ctx.shadowColor = '#f87171'
    gameRef.current.enemyBullets.forEach(bullet => {
      ctx.fillRect(bullet.x - 2, bullet.y, 4, 10)
    })
    ctx.shadowBlur = 0
  }, [])

  const update = useCallback(() => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return

    const { player, bullets, enemies, enemyBullets, keys } = gameRef.current
    
    // Move player
    if (keys['arrowleft'] && player.x > 0) player.x -= player.speed
    if (keys['arrowright'] && player.x < canvas.width - player.width) player.x += player.speed
    
    // Shoot
    if (keys[' '] && gameRef.current.frameCount % 15 === 0) {
      bullets.push({
        x: player.x + player.width / 2,
        y: player.y,
        speed: 8
      })
    }
    
    // Move bullets
    bullets.forEach((bullet, index) => {
      bullet.y -= bullet.speed
      if (bullet.y < 0) bullets.splice(index, 1)
    })
    
    // Move enemy bullets
    enemyBullets.forEach((bullet, index) => {
      bullet.y += bullet.speed
      if (bullet.y > canvas.height) {
        enemyBullets.splice(index, 1)
      }
      
      // Check player collision
      if (
        bullet.y + 10 > player.y &&
        bullet.y < player.y + player.height &&
        bullet.x > player.x &&
        bullet.x < player.x + player.width
      ) {
        enemyBullets.splice(index, 1)
        setLives(prev => {
          const newLives = prev - 1
          if (newLives <= 0) {
            setGameState('gameOver')
          }
          return newLives
        })
      }
    })
    
    // Move enemies
    gameRef.current.frameCount++
    if (gameRef.current.frameCount % 30 === 0) {
      let shouldMoveDown = false
      
      enemies.forEach(enemy => {
        if (enemy.alive) {
          enemy.x += gameRef.current.enemyDirection * gameRef.current.enemySpeed * 10
          if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) {
            shouldMoveDown = true
          }
        }
      })
      
      if (shouldMoveDown) {
        gameRef.current.enemyDirection *= -1
        enemies.forEach(enemy => {
          if (enemy.alive) {
            enemy.y += 20
            if (enemy.y + enemy.height > player.y) {
              setGameState('gameOver')
            }
          }
        })
      }
    }
    
    // Enemy shooting
    if (gameRef.current.frameCount % 60 === 0) {
      const aliveEnemies = enemies.filter(e => e.alive)
      if (aliveEnemies.length > 0) {
        const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]
        enemyBullets.push({
          x: shooter.x + shooter.width / 2,
          y: shooter.y + shooter.height,
          speed: 4
        })
      }
    }
    
    // Check bullet collisions
    bullets.forEach((bullet, bIndex) => {
      enemies.forEach(enemy => {
        if (
          enemy.alive &&
          bullet.x > enemy.x &&
          bullet.x < enemy.x + enemy.width &&
          bullet.y > enemy.y &&
          bullet.y < enemy.y + enemy.height
        ) {
          enemy.alive = false
          bullets.splice(bIndex, 1)
          const newScore = score + 10
          setScore(newScore)
          if (newScore > highScore) {
            setHighScore(newScore)
            localStorage.setItem('invadersHighScore', newScore)
          }
        }
      })
    })
    
    // Check if all enemies destroyed
    if (enemies.every(e => !e.alive)) {
      setWave(prev => prev + 1)
      gameRef.current.enemies = createEnemies(canvas, wave + 1)
      gameRef.current.enemySpeed += 0.2
      gameRef.current.bullets = []
      gameRef.current.enemyBullets = []
    }
    
    draw()
  }, [gameState, score, highScore, wave, draw, createEnemies])

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(update, 1000 / 60)
      return () => clearInterval(interval)
    }
  }, [gameState, update])

  useEffect(() => {
    const handleKeyDown = (e) => {
      gameRef.current.keys[e.key.toLowerCase()] = true
      if (gameState === 'ready' && ['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
        startGame()
      }
      if (e.key === ' ') e.preventDefault()
    }
    const handleKeyUp = (e) => {
      gameRef.current.keys[e.key.toLowerCase()] = false
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState])

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const container = canvas.parentElement
      if (!container) return
      const rect = container.getBoundingClientRect()
      const width = Math.min(rect.width - 16, 700)
      const height = Math.min(rect.height - 16, 600)
      if (width > 50 && height > 50) {
        canvas.width = width
        canvas.height = height
        gameRef.current.player.x = width / 2 - 20
        gameRef.current.player.y = height - 60
        gameRef.current.enemies = createEnemies(canvas, wave)
        draw()
      }
    }
    const timer = setTimeout(updateCanvasSize, 50)
    window.addEventListener('resize', updateCanvasSize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [draw, wave, createEnemies])

  const startGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    gameRef.current.player.x = canvas.width / 2 - 20
    gameRef.current.player.y = canvas.height - 60
    gameRef.current.bullets = []
    gameRef.current.enemyBullets = []
    gameRef.current.enemies = createEnemies(canvas, wave)
    gameRef.current.keys = {}
    gameRef.current.enemyDirection = 1
    gameRef.current.enemySpeed = 1
    gameRef.current.frameCount = 0
    setGameState('playing')
  }

  const resetGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    gameRef.current.player.x = canvas.width / 2 - 20
    gameRef.current.player.y = canvas.height - 60
    gameRef.current.bullets = []
    gameRef.current.enemyBullets = []
    gameRef.current.enemies = createEnemies(canvas, 1)
    gameRef.current.keys = {}
    gameRef.current.enemyDirection = 1
    gameRef.current.enemySpeed = 1
    gameRef.current.frameCount = 0
    setScore(0)
    setLives(3)
    setWave(1)
    setGameState('ready')
    draw()
  }

  return (
    <GameLayout title="👾 Space Invaders">
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
              <p><span className="text-secondary font-semibold">Space:</span> Shoot</p>
              <p className="pt-2 border-t border-gray-700 mt-2">Destroy all aliens before they reach you!</p>
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
                <p className="text-[10px] text-gray">Lives</p>
                <p className="text-sm font-bold text-danger">{lives}</p>
              </div>
              <div className="flex-1 bg-[#112240] rounded p-1 border border-gray-700 text-center">
                <p className="text-[10px] text-gray">Wave</p>
                <p className="text-sm font-bold text-warning">{wave}</p>
              </div>
              <button onClick={startGame} className="px-2 py-1 bg-success text-white text-xs font-semibold rounded">▶</button>
              <button onClick={resetGame} className="px-2 py-1 bg-danger text-white text-xs font-semibold rounded">↻</button>
            </div>
          )}
          <div className="flex-1 flex items-center justify-center min-h-0 relative">
            <canvas ref={canvasRef} className="border-4 border-secondary/30 rounded-xl shadow-2xl max-w-full max-h-full" style={{ boxShadow: '0 0 60px rgba(100, 255, 218, 0.3)' }} />
            
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
                  <p className="text-sm md:text-base text-gray mb-4">Press arrows or Start</p>
                  <button onClick={startGame} className="px-6 md:px-8 py-2 md:py-3 bg-secondary hover:bg-secondary/80 text-dark font-bold rounded-lg transition-all">Start</button>
                </div>
              </div>
            )}
            {gameState === 'gameOver' && (
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <h2 className="text-2xl md:text-4xl font-bold text-danger mb-2 md:mb-4">Game Over!</h2>
                  <p className="text-xl md:text-2xl text-secondary mb-1">Score: {score}</p>
                  <p className="text-lg md:text-xl text-gray mb-4">Wave: {wave}</p>
                  <button onClick={resetGame} className="px-6 md:px-8 py-2 md:py-3 bg-secondary hover:bg-secondary/80 text-dark font-bold rounded-lg transition-all">Play Again</button>
                </div>
              </div>
            )}
          </div>
          {showTouchControls && (
            <div className="grid grid-cols-3 gap-1 flex-shrink-0">
              <button 
                onTouchStart={() => gameRef.current.keys['arrowleft'] = true}
                onTouchEnd={() => gameRef.current.keys['arrowleft'] = false}
                onMouseDown={() => gameRef.current.keys['arrowleft'] = true}
                onMouseUp={() => gameRef.current.keys['arrowleft'] = false}
                onMouseLeave={() => gameRef.current.keys['arrowleft'] = false}
                className="py-4 bg-secondary/20 active:bg-secondary/40 text-secondary font-bold rounded text-xl"
              >
                ◄
              </button>
              <button 
                onTouchStart={() => gameRef.current.keys[' '] = true}
                onTouchEnd={() => gameRef.current.keys[' '] = false}
                onMouseDown={() => gameRef.current.keys[' '] = true}
                onMouseUp={() => gameRef.current.keys[' '] = false}
                onMouseLeave={() => gameRef.current.keys[' '] = false}
                className="py-4 bg-warning/20 active:bg-warning/40 text-warning font-bold rounded text-xl"
              >
                🔫
              </button>
              <button 
                onTouchStart={() => gameRef.current.keys['arrowright'] = true}
                onTouchEnd={() => gameRef.current.keys['arrowright'] = false}
                onMouseDown={() => gameRef.current.keys['arrowright'] = true}
                onMouseUp={() => gameRef.current.keys['arrowright'] = false}
                onMouseLeave={() => gameRef.current.keys['arrowright'] = false}
                className="py-4 bg-secondary/20 active:bg-secondary/40 text-secondary font-bold rounded text-xl"
              >
                ►
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
                <p className="text-gray text-sm mb-1">Lives</p>
                <p className="text-3xl font-bold text-danger">{lives}</p>
              </div>
              <div className="bg-dark/50 rounded-lg p-3">
                <p className="text-gray text-sm mb-1">Wave</p>
                <p className="text-3xl font-bold text-light">{wave}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  )
}

export default InvadersGame
