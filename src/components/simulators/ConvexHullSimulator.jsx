import { useState, useEffect, useRef } from 'react'
import { FiPlay, FiRefreshCw, FiShuffle, FiInfo, FiMousePointer } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

const ConvexHullSimulator = () => {
  const canvasRef = useRef(null)
  const [points, setPoints] = useState([])
  const [hull, setHull] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState({ points: 0, hullPoints: 0 })
  const [logs, setLogs] = useState([])
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    generateRandomPoints()
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      resizeCanvas()
      draw()
    }
  }, [points, hull])

  useEffect(() => {
    const handleResize = () => resizeCanvas()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const resizeCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const container = canvas.parentElement
      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight
      draw()
    }
  }

  const log = (msg) => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${time}] ${msg}`])
  }

  const generateRandomPoints = () => {
    setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const count = Math.floor(Math.random() * 15) + 8
      const margin = 80
      const newPoints = []

      for (let i = 0; i < count; i++) {
        newPoints.push({
          x: margin + Math.random() * (canvas.width - 2 * margin),
          y: margin + Math.random() * (canvas.height - 2 * margin)
        })
      }

      setPoints(newPoints)
      setHull([])
      setStats({ points: newPoints.length, hullPoints: 0 })
      log(`Generated ${newPoints.length} random points`)
    }, 100)
  }

  const clearPoints = () => {
    setPoints([])
    setHull([])
    setStats({ points: 0, hullPoints: 0 })
    setLogs([])
  }

  const handleCanvasClick = (e) => {
    if (isRunning) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newPoints = [...points, { x, y }]
    setPoints(newPoints)
    setHull([])
    setStats({ points: newPoints.length, hullPoints: 0 })
    log(`Added point at (${Math.round(x)}, ${Math.round(y)})`)
  }

  const orientation = (p, q, r) => {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y)
    if (val === 0) return 0
    return val > 0 ? 1 : 2
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  const computeConvexHull = async () => {
    if (points.length < 3) {
      log('Need at least 3 points to compute convex hull')
      return
    }

    setIsRunning(true)
    setHull([])
    setLogs([])

    log('Starting Graham Scan algorithm')

    const pointsCopy = [...points]

    // Find pivot (lowest y-coordinate)
    let pivot = pointsCopy[0]
    for (let i = 1; i < pointsCopy.length; i++) {
      if (pointsCopy[i].y < pivot.y || 
          (pointsCopy[i].y === pivot.y && pointsCopy[i].x < pivot.x)) {
        pivot = pointsCopy[i]
      }
    }

    log(`Found pivot point at (${Math.round(pivot.x)}, ${Math.round(pivot.y)})`)
    await sleep(800)

    // Sort by polar angle
    pointsCopy.sort((a, b) => {
      const angleA = Math.atan2(a.y - pivot.y, a.x - pivot.x)
      const angleB = Math.atan2(b.y - pivot.y, b.x - pivot.x)

      if (angleA < angleB) return -1
      if (angleA > angleB) return 1

      const distA = Math.hypot(a.x - pivot.x, a.y - pivot.y)
      const distB = Math.hypot(b.x - pivot.x, b.y - pivot.y)
      return distA - distB
    })

    log('Sorted points by polar angle')
    await sleep(600)

    const newHull = [pointsCopy[0], pointsCopy[1]]
    setHull([...newHull])
    log('Initialized hull with first 2 points')
    await sleep(600)

    for (let i = 2; i < pointsCopy.length; i++) {
      while (newHull.length >= 2 && 
             orientation(newHull[newHull.length - 2], newHull[newHull.length - 1], pointsCopy[i]) !== 2) {
        const removed = newHull.pop()
        log(`Removed non-convex point (${Math.round(removed.x)}, ${Math.round(removed.y)})`)
        setHull([...newHull])
        await sleep(400)
      }

      newHull.push(pointsCopy[i])
      setHull([...newHull])
      log(`Added point ${i + 1}/${pointsCopy.length} to hull`)
      await sleep(600)
    }

    setStats({ points: points.length, hullPoints: newHull.length })
    log(`Convex hull complete! ${newHull.length} points on hull`)
    setIsRunning(false)
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw convex hull
    if (hull.length > 0) {
      ctx.strokeStyle = '#e53e3e'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(hull[0].x, hull[0].y)
      for (let i = 1; i < hull.length; i++) {
        ctx.lineTo(hull[i].x, hull[i].y)
      }
      ctx.lineTo(hull[0].x, hull[0].y)
      ctx.stroke()

      // Fill hull with semi-transparent color
      ctx.fillStyle = 'rgba(229, 62, 62, 0.1)'
      ctx.fill()

      // Highlight hull points
      hull.forEach(point => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI)
        ctx.fillStyle = '#e53e3e'
        ctx.fill()
        ctx.strokeStyle = '#f7fafc'
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }

    // Draw all points
    points.forEach(point => {
      const isHullPoint = hull.some(h => h.x === point.x && h.y === point.y)
      if (!isHullPoint) {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
        ctx.fillStyle = '#3182ce'
        ctx.fill()
        ctx.strokeStyle = '#f7fafc'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    })
  }

  return (
    <SimulatorLayout title="Convex Hull (Graham Scan)">
      <div className="h-[calc(100vh-73px)] flex flex-col">
        <div className="bg-[#112240] border-b border-gray-700 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={computeConvexHull}
                disabled={isRunning || points.length < 3}
                className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm transition-all font-medium"
              >
                <FiPlay size={14} /> Compute Hull
              </button>

              <button
                onClick={generateRandomPoints}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm transition-all"
              >
                <FiShuffle size={14} /> Random Points
              </button>

              <button
                onClick={clearPoints}
                disabled={isRunning}
                className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded text-sm transition-all"
              >
                <FiRefreshCw size={14} /> Clear
              </button>

              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-1.5 bg-[#2d3748] hover:bg-[#4a5568] rounded transition-colors"
              >
                <FiInfo size={16} />
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2d3748] rounded text-sm text-gray-300">
                <FiMousePointer size={14} /> Click to add points
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Points:</span>
                <span className="font-bold text-blue-400">{stats.points}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Hull Points:</span>
                <span className="font-bold text-red-400">{stats.hullPoints}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#0a192f] p-4">
          <div className="w-full h-full border-2 border-red-500 rounded relative">
            <canvas 
              ref={canvasRef} 
              className="w-full h-full cursor-crosshair" 
              onClick={handleCanvasClick}
            />
            
            {points.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 pointer-events-none">
                <div className="text-center">
                  <div className="text-4xl mb-2">📐</div>
                  <p>Click to add points or generate random points</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {showInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
            <div className="bg-[#112240] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Convex Hull Algorithm</h3>
                <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Operation Log:</h4>
                  <div className="max-h-40 overflow-y-auto font-mono text-xs space-y-1 text-gray-300 bg-[#0a192f] p-3 rounded">
                    {logs.length === 0 ? (
                      <div className="text-gray-500 italic">No operations yet...</div>
                    ) : (
                      logs.map((log, index) => (
                        <div key={index} className="py-1 border-b border-gray-800">{log}</div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <h4 className="font-semibold mb-2">About Convex Hull</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    Graham's Scan algorithm finds the convex hull of a set of points. It sorts points by
                    polar angle from a pivot point, then builds the hull by removing non-convex points.
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Time:</strong> O(n log n) | <strong>Space:</strong> O(n)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimulatorLayout>
  )
}

export default ConvexHullSimulator
