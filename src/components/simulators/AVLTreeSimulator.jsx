import { useState, useRef, useEffect } from 'react'
import { FiPlus, FiMinus, FiRefreshCw, FiInfo } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

class AVLNode {
  constructor(value) {
    this.value = value
    this.left = null
    this.right = null
    this.height = 1
    this.x = 0
    this.y = 0
  }
}

const AVLTreeSimulator = () => {
  const canvasRef = useRef(null)
  const [root, setRoot] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [highlightedNode, setHighlightedNode] = useState(null)
  const [logs, setLogs] = useState([])
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    if (canvasRef.current) {
      resizeCanvas()
      draw()
    }
  }, [root, highlightedNode])

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

  const height = (node) => node ? node.height : 0

  const updateHeight = (node) => {
    if (node) {
      node.height = 1 + Math.max(height(node.left), height(node.right))
    }
  }

  const getBalance = (node) => {
    return node ? height(node.left) - height(node.right) : 0
  }

  const rotateRight = (y) => {
    const x = y.left
    const T2 = x.right

    x.right = y
    y.left = T2

    updateHeight(y)
    updateHeight(x)

    log(`Right rotation on ${y.value}`)
    return x
  }

  const rotateLeft = (x) => {
    const y = x.right
    const T2 = y.left

    y.left = x
    x.right = T2

    updateHeight(x)
    updateHeight(y)

    log(`Left rotation on ${x.value}`)
    return y
  }

  const insert = (node, value) => {
    if (node === null) {
      log(`Inserted ${value}`)
      return new AVLNode(value)
    }

    if (value < node.value) {
      node.left = insert(node.left, value)
    } else if (value > node.value) {
      node.right = insert(node.right, value)
    } else {
      log(`Value ${value} already exists`)
      return node
    }

    updateHeight(node)

    const balance = getBalance(node)

    // Left Left Case
    if (balance > 1 && value < node.left.value) {
      return rotateRight(node)
    }

    // Right Right Case
    if (balance < -1 && value > node.right.value) {
      return rotateLeft(node)
    }

    // Left Right Case
    if (balance > 1 && value > node.left.value) {
      node.left = rotateLeft(node.left)
      return rotateRight(node)
    }

    // Right Left Case
    if (balance < -1 && value < node.right.value) {
      node.right = rotateRight(node.right)
      return rotateLeft(node)
    }

    return node
  }

  const handleInsert = () => {
    const value = parseInt(inputValue)
    if (isNaN(value)) {
      alert('Please enter a valid number')
      return
    }

    setRoot(prevRoot => insert(prevRoot, value))
    setInputValue('')
  }

  const clear = () => {
    setRoot(null)
    setLogs([])
    log('Tree cleared')
  }

  const generateSample = () => {
    const values = [50, 25, 75, 10, 30, 60, 80, 5, 15]
    let newRoot = null
    values.forEach(val => {
      newRoot = insert(newRoot, val)
    })
    setRoot(newRoot)
    log('Generated sample AVL tree')
  }

  const calculatePositions = (node, x, y, horizontalSpacing) => {
    if (node === null) return

    node.x = x
    node.y = y

    const nextY = y + 80

    if (node.left) {
      calculatePositions(node.left, x - horizontalSpacing, nextY, horizontalSpacing / 2)
    }
    if (node.right) {
      calculatePositions(node.right, x + horizontalSpacing, nextY, horizontalSpacing / 2)
    }
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas || !root) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    calculatePositions(root, canvas.width / 2, 50, canvas.width / 5)

    const drawNode = (node) => {
      if (node === null) return

      if (node.left) {
        ctx.beginPath()
        ctx.moveTo(node.x, node.y)
        ctx.lineTo(node.left.x, node.left.y)
        ctx.strokeStyle = '#4a5568'
        ctx.lineWidth = 2
        ctx.stroke()
        drawNode(node.left)
      }

      if (node.right) {
        ctx.beginPath()
        ctx.moveTo(node.x, node.y)
        ctx.lineTo(node.right.x, node.right.y)
        ctx.strokeStyle = '#4a5568'
        ctx.lineWidth = 2
        ctx.stroke()
        drawNode(node.right)
      }

      const balance = getBalance(node)
      const isBalanced = Math.abs(balance) <= 1

      ctx.beginPath()
      ctx.arc(node.x, node.y, 28, 0, 2 * Math.PI)
      ctx.fillStyle = highlightedNode === node.value ? '#38a169' : isBalanced ? '#3182ce' : '#e53e3e'
      ctx.fill()
      ctx.strokeStyle = '#f7fafc'
      ctx.lineWidth = 3
      ctx.stroke()

      ctx.fillStyle = '#f7fafc'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.value, node.x, node.y)

      // Show balance factor
      ctx.font = 'bold 10px Arial'
      ctx.fillStyle = '#d69e2e'
      ctx.fillText(`BF:${balance}`, node.x, node.y - 40)
    }

    drawNode(root)
  }

  return (
    <SimulatorLayout title="AVL Tree (Self-Balancing BST)">
      <div className="h-[calc(100vh-73px)] flex flex-col">
        <div className="bg-[#112240] border-b border-gray-700 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleInsert()}
                placeholder="Enter number"
                className="px-3 py-1.5 bg-[#1a202c] text-white rounded border border-gray-600 focus:border-secondary focus:outline-none text-sm w-32"
              />

              <button
                onClick={handleInsert}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-all"
              >
                <FiPlus size={14} /> Insert
              </button>

              <button
                onClick={generateSample}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-all"
              >
                Sample Tree
              </button>

              <button
                onClick={clear}
                className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-all"
              >
                <FiRefreshCw size={14} /> Clear
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
                <span className="text-gray-400">Height:</span>
                <span className="font-bold text-blue-400">{height(root)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#0a192f] p-4">
          <div className="w-full h-full border-2 border-red-500 rounded relative">
            <canvas ref={canvasRef} className="w-full h-full" />
            
            {!root && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">⚖️</div>
                  <p>AVL Tree is empty. Insert values!</p>
                  <p className="text-sm mt-2">Tree auto-balances after each insertion</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {showInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
            <div className="bg-[#112240] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">AVL Tree Information</h3>
                <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Operation Log:</h4>
                  <div className="max-h-40 overflow-y-auto font-mono text-xs space-y-1 text-gray-300 bg-[#0a192f] p-3 rounded">
                    {logs.length === 0 ? (
                      <div className="text-gray-500 italic">No operations yet...</div>
                    ) : (
                      logs.slice(-15).map((log, index) => (
                        <div key={index} className="py-1 border-b border-gray-800">{log}</div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <h4 className="font-semibold mb-2">About AVL Tree</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    An AVL tree is a self-balancing BST where the heights of left and right subtrees differ by at most 1.
                    Balance is maintained through rotations.
                  </p>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p><strong>Insert:</strong> O(log n)</p>
                    <p><strong>Search:</strong> O(log n)</p>
                    <p><strong>Delete:</strong> O(log n)</p>
                    <p><strong>Balance Factor:</strong> height(left) - height(right)</p>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    <strong>Rotations:</strong> Left, Right, Left-Right, Right-Left
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

export default AVLTreeSimulator
