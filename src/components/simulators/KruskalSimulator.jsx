import { useState, useEffect, useRef } from 'react'
import { FiPlay, FiRefreshCw, FiShuffle, FiInfo } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

const KruskalSimulator = () => {
  const canvasRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [mstEdges, setMstEdges] = useState([])
  const [currentEdge, setCurrentEdge] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState({ totalWeight: 0, edgesUsed: 0 })
  const [logs, setLogs] = useState([])
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    generateGraph()
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      resizeCanvas()
      draw()
    }
  }, [nodes, edges, mstEdges, currentEdge])

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
    const nodeCount = 7
    const newNodes = []
    
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
          if (Math.random() > 0.5) {
            newEdges.push({
              from: i,
              to: j,
              weight: Math.floor(Math.random() * 20) + 1
            })
          }
        }
      }

      newEdges.sort((a, b) => a.weight - b.weight)

      setNodes(newNodes)
      setEdges(newEdges)
      setMstEdges([])
      setStats({ totalWeight: 0, edgesUsed: 0 })
      log(`Generated graph with ${newNodes.length} nodes and ${newEdges.length} edges`)
    }, 100)
  }

  const find = (parent, i) => {
    if (parent[i] !== i) {
      parent[i] = find(parent, parent[i])
    }
    return parent[i]
  }

  const union = (parent, rank, x, y) => {
    const xroot = find(parent, x)
    const yroot = find(parent, y)

    if (rank[xroot] < rank[yroot]) {
      parent[xroot] = yroot
    } else if (rank[xroot] > rank[yroot]) {
      parent[yroot] = xroot
    } else {
      parent[yroot] = xroot
      rank[xroot]++
    }
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  const runKruskal = async () => {
    if (nodes.length === 0 || isRunning) return

    setIsRunning(true)
    setMstEdges([])
    setStats({ totalWeight: 0, edgesUsed: 0 })
    setLogs([])

    const parent = []
    const rank = []

    for (let i = 0; i < nodes.length; i++) {
      parent[i] = i
      rank[i] = 0
    }

    const mst = []
    let totalWeight = 0

    log('Starting Kruskal\'s algorithm')

    for (const edge of edges) {
      setCurrentEdge(edge)
      await sleep(800)

      const x = find(parent, edge.from)
      const y = find(parent, edge.to)

      if (x !== y) {
        mst.push(edge)
        setMstEdges([...mst])
        totalWeight += edge.weight
        setStats({ totalWeight, edgesUsed: mst.length })
        union(parent, rank, x, y)
        log(`Added edge ${nodes[edge.from].label}-${nodes[edge.to].label} (weight: ${edge.weight})`)
      } else {
        log(`Skipped edge ${nodes[edge.from].label}-${nodes[edge.to].label} (would create cycle)`)
      }

      if (mst.length === nodes.length - 1) {
        break
      }
    }

    setCurrentEdge(null)
    log(`MST complete! Total weight: ${totalWeight}`)
    setIsRunning(false)
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas || nodes.length === 0) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw all edges (faded)
    edges.forEach(edge => {
      const from = nodes[edge.from]
      const to = nodes[edge.to]
      if (!from || !to) return

      const isInMST = mstEdges.some(e => 
        (e.from === edge.from && e.to === edge.to) || 
        (e.from === edge.to && e.to === edge.from)
      )
      const isCurrent = currentEdge && 
        ((currentEdge.from === edge.from && currentEdge.to === edge.to) ||
         (currentEdge.from === edge.to && currentEdge.to === edge.from))

      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.strokeStyle = isInMST ? '#38a169' : isCurrent ? '#ecc94b' : '#2d3748'
      ctx.lineWidth = isInMST ? 5 : isCurrent ? 4 : 2
      ctx.stroke()

      // Draw weight
      const midX = (from.x + to.x) / 2
      const midY = (from.y + to.y) / 2
      ctx.fillStyle = '#1a202c'
      ctx.beginPath()
      ctx.arc(midX, midY, 15, 0, 2 * Math.PI)
      ctx.fill()
      ctx.fillStyle = isInMST ? '#38a169' : isCurrent ? '#ecc94b' : '#718096'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(edge.weight, midX, midY)
    })

    // Draw nodes
    nodes.forEach(node => {
      ctx.beginPath()
      ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI)
      ctx.fillStyle = '#3182ce'
      ctx.fill()
      ctx.strokeStyle = '#f7fafc'
      ctx.lineWidth = 3
      ctx.stroke()

      ctx.fillStyle = '#f7fafc'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.label, node.x, node.y)
    })
  }

  return (
    <SimulatorLayout title="Kruskal's Minimum Spanning Tree">
      <div className="h-[calc(100vh-73px)] flex flex-col">
        <div className="bg-[#112240] border-b border-gray-700 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={runKruskal}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm transition-all font-medium"
              >
                <FiPlay size={14} /> Run Kruskal
              </button>

              <button
                onClick={generateGraph}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm transition-all"
              >
                <FiShuffle size={14} /> New Graph
              </button>

              <button
                onClick={() => {
                  setMstEdges([])
                  setStats({ totalWeight: 0, edgesUsed: 0 })
                  setLogs([])
                }}
                disabled={isRunning}
                className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded text-sm transition-all"
              >
                <FiRefreshCw size={14} /> Reset
              </button>

              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-1.5 bg-[#2d3748] hover:bg-[#4a5568] rounded transition-colors"
              >
                <FiInfo size={16} />
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Nodes:</span>
                <span className="font-bold text-blue-400">{nodes.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">MST Edges:</span>
                <span className="font-bold text-green-400">{stats.edgesUsed}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Total Weight:</span>
                <span className="font-bold text-yellow-400">{stats.totalWeight}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#0a192f] p-4">
          <div className="w-full h-full border-2 border-red-500 rounded relative">
            <canvas ref={canvasRef} className="w-full h-full" />
            
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">🌲</div>
                  <p>Generating graph...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {showInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
            <div className="bg-[#112240] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Kruskal's Algorithm</h3>
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
                  <h4 className="font-semibold mb-2">About Kruskal's Algorithm</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    Kruskal's algorithm finds the Minimum Spanning Tree by sorting edges by weight
                    and adding them if they don't create a cycle (using Union-Find).
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Time:</strong> O(E log E) | <strong>Space:</strong> O(V)
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

export default KruskalSimulator
