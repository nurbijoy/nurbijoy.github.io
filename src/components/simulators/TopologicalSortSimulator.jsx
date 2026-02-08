import { useState, useRef, useEffect } from 'react'
import { FiPlay, FiRefreshCw, FiShuffle, FiInfo } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

const TopologicalSortSimulator = () => {
  const canvasRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [sortedOrder, setSortedOrder] = useState([])
  const [visiting, setVisiting] = useState(new Set())
  const [visited, setVisited] = useState(new Set())
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState([])
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    generateDAG()
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      resizeCanvas()
      draw()
    }
  }, [nodes, edges, visiting, visited, sortedOrder])

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

  const generateDAG = () => {
    setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const newNodes = [
        { id: 0, label: 'A', x: canvas.width * 0.2, y: 100 },
        { id: 1, label: 'B', x: canvas.width * 0.5, y: 100 },
        { id: 2, label: 'C', x: canvas.width * 0.8, y: 100 },
        { id: 3, label: 'D', x: canvas.width * 0.35, y: 250 },
        { id: 4, label: 'E', x: canvas.width * 0.65, y: 250 },
        { id: 5, label: 'F', x: canvas.width * 0.5, y: 400 }
      ]

      const newEdges = [
        { from: 0, to: 3 },
        { from: 0, to: 4 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 2, to: 4 },
        { from: 3, to: 5 },
        { from: 4, to: 5 }
      ]

      setNodes(newNodes)
      setEdges(newEdges)
      setSortedOrder([])
      setVisiting(new Set())
      setVisited(new Set())
      log('Generated DAG')
    }, 100)
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  const dfs = async (nodeId, visitedSet, visitingSet, stack) => {
    visitingSet.add(nodeId)
    setVisiting(new Set(visitingSet))
    log(`Visiting ${nodes[nodeId].label}`)
    await sleep(800)

    const outgoingEdges = edges.filter(e => e.from === nodeId)
    for (const edge of outgoingEdges) {
      if (!visitedSet.has(edge.to)) {
        await dfs(edge.to, visitedSet, visitingSet, stack)
      }
    }

    visitingSet.delete(nodeId)
    visitedSet.add(nodeId)
    setVisited(new Set(visitedSet))
    stack.push(nodeId)
    log(`Finished ${nodes[nodeId].label}`)
    await sleep(500)
  }

  const runTopologicalSort = async () => {
    if (nodes.length === 0 || isRunning) return

    setIsRunning(true)
    setSortedOrder([])
    setVisiting(new Set())
    setVisited(new Set())
    setLogs([])

    const visitedSet = new Set()
    const visitingSet = new Set()
    const stack = []

    log('Starting topological sort')

    for (const node of nodes) {
      if (!visitedSet.has(node.id)) {
        await dfs(node.id, visitedSet, visitingSet, stack)
      }
    }

    stack.reverse()
    setSortedOrder(stack)
    log(`Topological order: ${stack.map(id => nodes[id].label).join(' → ')}`)
    setIsRunning(false)
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas || nodes.length === 0) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw edges with arrows
    edges.forEach(edge => {
      const from = nodes[edge.from]
      const to = nodes[edge.to]
      if (!from || !to) return

      const angle = Math.atan2(to.y - from.y, to.x - from.x)
      const endX = to.x - 30 * Math.cos(angle)
      const endY = to.y - 30 * Math.sin(angle)

      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(endX, endY)
      ctx.strokeStyle = '#4a5568'
      ctx.lineWidth = 2
      ctx.stroke()

      // Arrow head
      const arrowSize = 10
      ctx.beginPath()
      ctx.moveTo(endX, endY)
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle - Math.PI / 6),
        endY - arrowSize * Math.sin(angle - Math.PI / 6)
      )
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle + Math.PI / 6),
        endY - arrowSize * Math.sin(angle + Math.PI / 6)
      )
      ctx.closePath()
      ctx.fillStyle = '#4a5568'
      ctx.fill()
    })

    // Draw nodes
    nodes.forEach((node, index) => {
      const isVisiting = visiting.has(node.id)
      const isVisited = visited.has(node.id)
      const orderIndex = sortedOrder.indexOf(node.id)

      ctx.beginPath()
      ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI)
      ctx.fillStyle = isVisiting ? '#ecc94b' : isVisited ? '#38a169' : '#3182ce'
      ctx.fill()
      ctx.strokeStyle = '#f7fafc'
      ctx.lineWidth = 3
      ctx.stroke()

      ctx.fillStyle = '#f7fafc'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.label, node.x, node.y)

      if (orderIndex !== -1) {
        ctx.font = 'bold 12px Arial'
        ctx.fillStyle = '#d69e2e'
        ctx.fillText(`#${orderIndex + 1}`, node.x, node.y + 40)
      }
    })
  }

  return (
    <SimulatorLayout title="Topological Sort (DAG)">
      <div className="h-[calc(100vh-73px)] flex flex-col">
        <div className="bg-[#112240] border-b border-gray-700 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={runTopologicalSort}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm transition-all font-medium"
              >
                <FiPlay size={14} /> Run Sort
              </button>

              <button
                onClick={generateDAG}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm transition-all"
              >
                <FiShuffle size={14} /> New DAG
              </button>

              <button
                onClick={() => {
                  setSortedOrder([])
                  setVisiting(new Set())
                  setVisited(new Set())
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
                <span className="text-gray-400">Order:</span>
                <span className="font-bold text-green-400">
                  {sortedOrder.length > 0 ? sortedOrder.map(id => nodes[id].label).join(' → ') : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#0a192f] relative">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {showInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
            <div className="bg-[#112240] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Topological Sort</h3>
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
                  <h4 className="font-semibold mb-2">About Topological Sort</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    Topological sorting orders vertices in a DAG such that for every directed edge (u,v),
                    vertex u comes before v. Uses DFS to determine the order.
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Time:</strong> O(V + E) | <strong>Use Cases:</strong> Task scheduling, build systems
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

export default TopologicalSortSimulator
