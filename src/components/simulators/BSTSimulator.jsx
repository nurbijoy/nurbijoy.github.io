import { useState, useRef, useEffect } from 'react'
import { FiPlus, FiMinus, FiRefreshCw, FiInfo } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

class TreeNode {
  constructor(value) {
    this.value = value
    this.left = null
    this.right = null
    this.x = 0
    this.y = 0
  }
}

const BSTSimulator = () => {
  const canvasRef = useRef(null)
  const [root, setRoot] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [highlightedNode, setHighlightedNode] = useState(null)
  const [logs, setLogs] = useState([])
  const [traversalResult, setTraversalResult] = useState({ inorder: [], preorder: [], postorder: [] })
  const [showLogs, setShowLogs] = useState(false)

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

  const insert = (node, value) => {
    if (node === null) {
      log(`Inserted ${value}`)
      return new TreeNode(value)
    }

    if (value < node.value) {
      node.left = insert(node.left, value)
    } else if (value > node.value) {
      node.right = insert(node.right, value)
    } else {
      log(`Value ${value} already exists`)
    }

    return node
  }

  const findMin = (node) => {
    while (node.left !== null) {
      node = node.left
    }
    return node
  }

  const deleteNode = (node, value) => {
    if (node === null) {
      log(`Value ${value} not found`)
      return null
    }

    if (value < node.value) {
      node.left = deleteNode(node.left, value)
    } else if (value > node.value) {
      node.right = deleteNode(node.right, value)
    } else {
      if (node.left === null && node.right === null) {
        log(`Deleted leaf node ${value}`)
        return null
      } else if (node.left === null) {
        log(`Deleted node ${value} with right child`)
        return node.right
      } else if (node.right === null) {
        log(`Deleted node ${value} with left child`)
        return node.left
      } else {
        const successor = findMin(node.right)
        log(`Deleted node ${value}, replaced with ${successor.value}`)
        node.value = successor.value
        node.right = deleteNode(node.right, successor.value)
      }
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
    updateTraversals()
  }

  const handleDelete = () => {
    const value = parseInt(inputValue)
    if (isNaN(value)) {
      alert('Please enter a valid number')
      return
    }

    setRoot(prevRoot => deleteNode(prevRoot, value))
    setInputValue('')
    updateTraversals()
  }

  const handleSearch = () => {
    const value = parseInt(inputValue)
    if (isNaN(value)) {
      alert('Please enter a valid number')
      return
    }

    const found = search(root, value)
    if (found) {
      setHighlightedNode(value)
      log(`Found ${value}`)
      setTimeout(() => setHighlightedNode(null), 2000)
    } else {
      log(`${value} not found`)
    }
  }

  const search = (node, value) => {
    if (node === null) return false
    if (node.value === value) return true
    if (value < node.value) return search(node.left, value)
    return search(node.right, value)
  }

  const inorderTraversal = (node, result = []) => {
    if (node !== null) {
      inorderTraversal(node.left, result)
      result.push(node.value)
      inorderTraversal(node.right, result)
    }
    return result
  }

  const preorderTraversal = (node, result = []) => {
    if (node !== null) {
      result.push(node.value)
      preorderTraversal(node.left, result)
      preorderTraversal(node.right, result)
    }
    return result
  }

  const postorderTraversal = (node, result = []) => {
    if (node !== null) {
      postorderTraversal(node.left, result)
      postorderTraversal(node.right, result)
      result.push(node.value)
    }
    return result
  }

  const updateTraversals = () => {
    setTimeout(() => {
      setTraversalResult({
        inorder: inorderTraversal(root),
        preorder: preorderTraversal(root),
        postorder: postorderTraversal(root)
      })
    }, 100)
  }

  const reset = () => {
    setRoot(null)
    setLogs([])
    setTraversalResult({ inorder: [], preorder: [], postorder: [] })
    log('Tree cleared')
  }

  const generateSample = () => {
    const values = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45]
    let newRoot = null
    values.forEach(val => {
      newRoot = insert(newRoot, val)
    })
    setRoot(newRoot)
    log('Generated sample tree')
    updateTraversals()
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

      // Draw edges first
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

      // Draw node
      ctx.beginPath()
      ctx.arc(node.x, node.y, 28, 0, 2 * Math.PI)
      ctx.fillStyle = highlightedNode === node.value ? '#38a169' : '#3182ce'
      ctx.fill()
      ctx.strokeStyle = '#f7fafc'
      ctx.lineWidth = 3
      ctx.stroke()

      ctx.fillStyle = '#f7fafc'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.value, node.x, node.y)
    }

    drawNode(root)
  }

  return (
    <SimulatorLayout title="Binary Search Tree (BST)">
      <div className="h-[calc(100vh-73px)] flex flex-col">
        {/* Controls Bar */}
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
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-all"
              >
                <FiMinus size={14} /> Delete
              </button>

              <button
                onClick={handleSearch}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-all"
              >
                🔍 Search
              </button>

              <div className="w-px h-6 bg-gray-700"></div>

              <button
                onClick={generateSample}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-all"
              >
                Sample Tree
              </button>

              <button
                onClick={reset}
                className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-all"
              >
                <FiRefreshCw size={14} /> Clear
              </button>

              <button
                onClick={() => setShowLogs(!showLogs)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#2d3748] hover:bg-[#4a5568] text-white rounded text-sm transition-all"
              >
                <FiInfo size={14} /> {showLogs ? 'Hide' : 'Show'} Info
              </button>
            </div>

            {/* Traversals */}
            <div className="flex items-center gap-3 text-xs">
              <div>
                <span className="text-gray-400">Inorder:</span>
                <span className="ml-1 text-blue-400 font-mono">
                  {traversalResult.inorder.slice(0, 10).join(', ')}{traversalResult.inorder.length > 10 ? '...' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-[#0a192f] relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
          />
          
          {!root && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">🌳</div>
                <p>Tree is empty. Insert values to get started!</p>
              </div>
            </div>
          )}
        </div>

        {/* Info Modal */}
        {showLogs && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowLogs(false)}>
            <div className="bg-[#112240] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">BST Information</h3>
                <button onClick={() => setShowLogs(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Traversals:</h4>
                  <div className="space-y-2 text-sm font-mono">
                    <div>
                      <span className="text-blue-400">Inorder:</span>
                      <span className="ml-2 text-gray-300">
                        {traversalResult.inorder.join(', ') || 'Empty'}
                      </span>
                    </div>
                    <div>
                      <span className="text-green-400">Preorder:</span>
                      <span className="ml-2 text-gray-300">
                        {traversalResult.preorder.join(', ') || 'Empty'}
                      </span>
                    </div>
                    <div>
                      <span className="text-yellow-400">Postorder:</span>
                      <span className="ml-2 text-gray-300">
                        {traversalResult.postorder.join(', ') || 'Empty'}
                      </span>
                    </div>
                  </div>
                </div>

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
                  <h4 className="font-semibold mb-2">About BST</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    A BST is a tree where each node has at most two children. For each node,
                    all values in the left subtree are less than the node's value, and all values in the
                    right subtree are greater.
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Time Complexity:</strong> O(log n) average, O(n) worst case | 
                    <strong> Space:</strong> O(n)
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

export default BSTSimulator
