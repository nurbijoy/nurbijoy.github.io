import { useState, useEffect, useRef } from 'react'
import { FiPlay, FiRefreshCw, FiShuffle, FiInfo } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

const GraphColoringSimulator = () => {
  const canvasRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState({ nodes: 0, edges: 0, colorsUsed: 0 })
  const [logs, setLogs] = useState([])
  const [showInfo, setShowInfo] = useState(false)

  const colors = ['#e53e3e', '#3182ce', '#38a169', '#d69e2e', '#9f7aea', '#ed8936', '#48bb78', '#4299e1']

  useEffect(() => {
    generateGraph()
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      resizeCanvas()
      draw()
    }
  }, [nodes, edges])

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
          label: String.fromCharCode(65 + i),
          color: null
        })
      }

      const newEdges = []
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (Math.random() > 0.6) {
            newEdges.push({ from: i, to: j })
          }
        }
      }

      setNodes(newNodes)
      setEdges(newEdges)
      setStats({ nodes: newNodes.length, edges: newEdges.length, colorsUsed: 0 })
      log(`Generated graph with ${newNodes.length} nodes and ${newEdges.length} edges`)
    }, 100)
  }

  const reset = () => {
    const resetNodes = nodes.map(node => ({ ...node, color: null }))
    setNodes(resetNodes)
    setStats(prev => ({ ...prev, colorsUsed: 0 }))
    setLogs([])
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  const colorGraph = async () => {
    if (nodes.length === 0 || isRunning) return

    setIsRunning(true)
    reset()
    setLogs([])

    log('Starting graph coloring (Greedy algorithm)')

    const newNodes = [...nodes]

    for (let i = 0; i < newNodes.length; i++) {
      const node = newNodes[i]

      // Get colors of adjacent nodes
      const adjacentColors = new Set()
      edges.forEach(edge => {
        if (edge.from === i && newNodes[edge.to].color !== null) {
          adjacentColors.add(newNodes[edge.to].color)
        } else if (edge.to === i && newNodes[edge.from].color !== null) {
          adjacentColors.add(newNodes[edge.from].color)
        }
      })

      // Find first available color
      let colorIndex = 0
      while (adjacentColors.has(colorIndex)) {
        colorIndex++
      }

      node.color = colorIndex
      setNodes([...newNodes])
      log(`Colored node ${node.label} with color ${colorIndex + 1}`)

      await sleep(600)
    }

    const maxColor = Math.max(...newNodes.map(n => n.color)) + 1
    setStats(prev => ({ ...prev, colorsUsed: maxColor }))
    log(`Graph coloring complete! Used ${maxColor} colors`)
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

      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.strokeStyle = '#718096'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Draw nodes
    nodes.forEach(node => {
      ctx.beginPath()
      ctx.arc(node.x, node.y, 30, 0, 2 * Math.PI)
      ctx.fillStyle = node.color !== null ? colors[node.color % colors.length] : '#4a5568'
      ctx.fill()
      ctx.strokeStyle = '#f7fafc'
      ctx.lineWidth = 3
      ctx.stroke()

      ctx.fillStyle = '#f7fafc'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.label, node.x, node.y)

      if (node.color !== null) {
        ctx.font = 'bold 12px Arial'
        ctx.fillText(`C${node.color + 1}`, node.x, node.y + 40)
      }
    })
  }

  return (
    <SimulatorLayout title="Graph Coloring (Greedy Algorithm)">
      <div className="h-[calc(100vh-73px)] flex flex-col">
        <div className="bg-[#112240] border-b border-gray-700 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={colorGraph}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm transition-all font-medium"
              >
                <FiPlay size={14} /> Color Graph
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
                onClick={() => setShowInfo(!showInfo)}
                className="p-1.5 bg-[#2d3748] hover:bg-[#4a5568] rounded transition-colors"
              >
                <FiInfo size={16} />
              </button>
            </div>

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
                <span className="text-gray-400">Colors Used:</span>
                <span className="font-bold text-yellow-400">{stats.colorsUsed}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#0a192f] relative">
          <canvas ref={canvasRef} className="w-full h-full" />
          
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">🎨</div>
                <p>Generating graph...</p>
              </div>
            </div>
          )}
        </div>

        {showInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
            <div className="bg-[#112240] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Graph Coloring Algorithm</h3>
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
                  <h4 className="font-semibold mb-2">About Graph Coloring</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    The greedy graph coloring algorithm assigns colors to vertices such that no two adjacent
                    vertices share the same color. It processes vertices sequentially and assigns the smallest
                    available color.
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Time:</strong> O(V + E) | <strong>Space:</strong> O(V)
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

export default GraphColoringSimulator
