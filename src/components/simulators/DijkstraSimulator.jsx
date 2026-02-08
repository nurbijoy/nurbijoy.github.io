import { useState, useEffect, useRef } from 'react'
import { FiPlay, FiRefreshCw, FiShuffle } from 'react-icons/fi'
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

  useEffect(() => {
    generateGraph()
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      resizeCanvas()
      draw()
    }
  }, [nodes, edges, distances, visited, path])

  const resizeCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = canvas.offsetWidth
      canvas.height = 500
    }
  }

  const log = (msg) => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev.slice(-9), `[${time}] ${msg}`])
  }

  const generateGraph = () => {
    const nodeCount = 6
    const newNodes = []
    const canvas = canvasRef.current

    if (!canvas) return

    const centerX = canvas.width / 2 || 400
    const centerY = 250
    const radius = Math.min(centerX, centerY) * 0.7

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * 2 * Math.PI
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
        if (Math.random() > 0.5) {
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
  }

  const reset = () => {
    setDistances({})
    setVisited(new Set())
    setPath([])
    setLogs([])
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  const runDijkstra = async () => {
    if (nodes.length === 0 || isRunning) return

    setIsRunning(true)
    reset()

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
      await sleep(800)

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
    if (!canvas) return

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
      ctx.strokeStyle = isInPath ? '#38a169' : '#718096'
      ctx.lineWidth = isInPath ? 4 : 2
      ctx.stroke()

      // Draw weight
      const midX = (from.x + to.x) / 2
      const midY = (from.y + to.y) / 2
      ctx.fillStyle = '#d69e2e'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(edge.weight, midX, midY)
    })

    // Draw nodes
    nodes.forEach(node => {
      const isVisited = visited.has(node.id)
      const isInPath = path.includes(node.id)

      ctx.beginPath()
      ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI)
      ctx.fillStyle = isInPath ? '#38a169' : isVisited ? '#3182ce' : '#4a5568'
      ctx.fill()
      ctx.strokeStyle = '#f7fafc'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = '#f7fafc'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.label, node.x, node.y)

      // Show distance
      if (distances[node.id] !== undefined && distances[node.id] !== Infinity) {
        ctx.font = '12px Arial'
        ctx.fillStyle = '#d69e2e'
        ctx.fillText(`d:${distances[node.id]}`, node.x, node.y + 35)
      }
    })
  }

  return (
    <SimulatorLayout title="Dijkstra's Shortest Path Algorithm">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-6 bg-[#2d3748] rounded-lg">
        <button
          onClick={runDijkstra}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-all font-medium"
        >
          <FiPlay /> Run Dijkstra
        </button>

        <button
          onClick={generateGraph}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-all font-medium"
        >
          <FiShuffle /> New Graph
        </button>

        <button
          onClick={reset}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-all font-medium"
        >
          <FiRefreshCw /> Reset
        </button>
      </div>

      {/* Canvas */}
      <div className="mb-6 bg-[#2d3748] rounded-lg p-4">
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg border border-dashed border-gray-600"
          style={{ height: '500px' }}
        />
      </div>

      {/* Info Panel */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Stats */}
        <div className="bg-[#2d3748] rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{stats.nodes}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{stats.edges}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Edges</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{stats.pathLength}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Path Length</div>
            </div>
          </div>
        </div>

        {/* Operation Log */}
        <div className="bg-[#2d3748] rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Operation Log</h3>
          <div className="h-32 overflow-y-auto font-mono text-sm space-y-1 text-gray-300">
            {logs.length === 0 ? (
              <div className="text-gray-500 italic">No operations yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-xs">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </SimulatorLayout>
  )
}

export default DijkstraSimulator
