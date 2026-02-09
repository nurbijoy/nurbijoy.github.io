import { useState, useEffect, useRef } from 'react'
import { FiPlay, FiRefreshCw, FiShuffle, FiInfo } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

const DijkstraSimulator = () => {
  const canvasRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [distances, setDistances] = useState({})
  const [visited, setVisited] = useState(new Set())
  const [path, setPath] = useState([])
  const [logs, setLogs] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState({ nodes: 0, edges: 0, pathLength: '-' })
  const [showLogs, setShowLogs] = useState(false)

  useEffect(() => {
    generateGraph()
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      resizeCanvas()
      draw()
    }
  }, [nodes, edges, distances, visited, path])

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

  const generateGraph = () => {
    const nodeCount = 8
    const newNodes = []
    
    // Wait for canvas to be ready
    setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(canvas.width, canvas.height) * 0.35

      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * 2 * Math.PI - Math.PI / 2
        newNodes.push({
          id: i,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          label: String.fromCharCode(65 + i)
        })
      }

      const newEdges = []
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (Math.random() > 0.6) {
            newEdges.push({
              from: i,
              to: j,
              weight: Math.floor(Math.random() * 15) + 1
            })
          }
        }
      }

      setNodes(newNodes)
      setEdges(newEdges)
      setStats({ nodes: newNodes.length, edges: newEdges.length, pathLength: '-' })
      reset()
      log(`Generated graph with ${newNodes.length} nodes and ${newEdges.length} edges`)
    }, 100)
  }

  const reset = () => {
    setDistances({})
    setVisited(new Set())
    setPath([])
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  const runDijkstra = async () => {
    if (nodes.length === 0 || isRunning) return

    setIsRunning(true)
    reset()
    setLogs([])

    const start = 0
    const end = nodes.length - 1

    const newDistances = {}
    nodes.forEach(node => {
      newDistances[node.id] = Infinity
    })
    newDistances[start] = 0
    setDistances({ ...newDistances })

    const previous = {}
    const unvisited = new Set(nodes.map(n => n.id))
    const newVisited = new Set()

    log(`Starting Dijkstra from ${nodes[start].label} to ${nodes[end].label}`)

    while (unvisited.size > 0) {
      let current = null
      let minDist = Infinity

      unvisited.forEach(id => {
        if (newDistances[id] < minDist) {
          minDist = newDistances[id]
          current = id
        }
      })

      if (current === null || newDistances[current] === Infinity) break

      unvisited.delete(current)
      newVisited.add(current)
      setVisited(new Set(newVisited))

      log(`Visiting ${nodes[current].label} (distance: ${newDistances[current]})`)
      await sleep(600)

      edges.forEach(edge => {
        let neighbor = null
        if (edge.from === current && unvisited.has(edge.to)) {
          neighbor = edge.to
        } else if (edge.to === current && unvisited.has(edge.from)) {
          neighbor = edge.from
        }

        if (neighbor !== null) {
          const alt = newDistances[current] + edge.weight
          if (alt < newDistances[neighbor]) {
            newDistances[neighbor] = alt
            previous[neighbor] = current
            setDistances({ ...newDistances })
            log(`Updated ${nodes[neighbor].label} distance to ${alt}`)
          }
        }
      })
    }

    if (newDistances[end] !== Infinity) {
      const newPath = []
      let current = end
      while (current !== undefined) {
        newPath.unshift(current)
        current = previous[current]
      }
      setPath(newPath)
      setStats(prev => ({ ...prev, pathLength: newDistances[end] }))
      log(`Shortest path: ${newPath.map(id => nodes[id].label).join(' → ')} (distance: ${newDistances[end]})`)
    } else {
      log('No path found')
      setStats(prev => ({ ...prev, pathLength: '-' }))
    }

    setIsRunning(false)
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas || nodes.length === 0) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw edges
    edges.forEach(edge => {
      const from = nodes[edge.from]
      const to = nodes[edge.to]
      if (!from || !to) return

      const isInPath = path.includes(edge.from) && path.includes(edge.to) &&
        Math.abs(path.indexOf(edge.from) - path.indexOf(edge.to)) === 1

      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.strokeStyle = isInPath ? '#38a169' : '#4a5568'
      ctx.lineWidth = isInPath ? 5 : 2
      ctx.stroke()

      // Draw weight
      const midX = (from.x + to.x) / 2
      const midY = (from.y + to.y) / 2
      ctx.fillStyle = '#1a202c'
      ctx.beginPath()
      ctx.arc(midX, midY, 15, 0, 2 * Math.PI)
      ctx.fill()
      ctx.fillStyle = '#d69e2e'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(edge.weight, midX, midY)
    })

    // Draw nodes
    nodes.forEach(node => {
      const isVisited = visited.has(node.id)
      const isInPath = path.includes(node.id)

      ctx.beginPath()
      ctx.arc(node.x, node.y, 30, 0, 2 * Math.PI)
      ctx.fillStyle = isInPath ? '#38a169' : isVisited ? '#3182ce' : '#2d3748'
      ctx.fill()
      ctx.strokeStyle = '#f7fafc'
      ctx.lineWidth = 3
      ctx.stroke()

      ctx.fillStyle = '#f7fafc'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.label, node.x, node.y)

      // Show distance
      if (distances[node.id] !== undefined && distances[node.id] !== Infinity) {
        ctx.font = 'bold 12px Arial'
        ctx.fillStyle = '#1a202c'
        ctx.beginPath()
        ctx.arc(node.x, node.y - 45, 18, 0, 2 * Math.PI)
        ctx.fill()
        ctx.fillStyle = '#d69e2e'
        ctx.fillText(`${distances[node.id]}`, node.x, node.y - 45)
      }
    })
  }

  return (
    <SimulatorLayout title="Dijkstra's Shortest Path Algorithm">
      <div className="h-[calc(100vh-73px)] flex flex-col">
        {/* Controls Bar */}
        <div className="bg-[#112240] border-b border-gray-700 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={runDijkstra}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm transition-all font-medium"
              >
                <FiPlay size={14} /> Run Dijkstra
              </button>

              <button
                onClick={generateGraph}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm transition-all"
              >
                <FiShuffle size={14} /> New Graph
              </button>

              <button
                onClick={reset}
                disabled={isRunning}
                className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded text-sm transition-all"
              >
                <FiRefreshCw size={14} /> Reset
              </button>

              <button
                onClick={() => setShowLogs(!showLogs)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#2d3748] hover:bg-[#4a5568] text-white rounded text-sm transition-all"
              >
                <FiInfo size={14} /> {showLogs ? 'Hide' : 'Show'} Logs
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Nodes:</span>
                <span className="font-bold text-blue-400">{stats.nodes}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Edges:</span>
                <span className="font-bold text-green-400">{stats.edges}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Path Length:</span>
                <span className="font-bold text-yellow-400">{stats.pathLength}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-[#0a192f] p-4">
          <div className="w-full h-full border-2 border-red-500 rounded relative">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
            />
            
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p>Generating graph...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logs Modal */}
        {showLogs && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowLogs(false)}>
            <div className="bg-[#112240] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Operation Log</h3>
                <button onClick={() => setShowLogs(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              
              <div className="font-mono text-sm space-y-1 text-gray-300">
                {logs.length === 0 ? (
                  <div className="text-gray-500 italic">No operations yet...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="text-xs py-1 border-b border-gray-700">{log}</div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700">
                <h4 className="font-semibold mb-2">About Dijkstra's Algorithm</h4>
                <p className="text-sm text-gray-300 mb-2">
                  Finds the shortest path between nodes in a weighted graph using a greedy approach.
                </p>
                <p className="text-sm text-gray-300">
                  <strong>Time Complexity:</strong> O((V + E) log V) | <strong>Space:</strong> O(V)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimulatorLayout>
  )
}

export default DijkstraSimulator
