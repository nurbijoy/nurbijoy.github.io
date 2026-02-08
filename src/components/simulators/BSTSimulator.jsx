import { useState, useRef, useEffect } from 'react'
import { FiPlus, FiMinus, FiRefreshCw } from 'react-icons/fi'
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

  useEffect(() => {
    if (canvasRef.current) {
      resizeCanvas()
      draw()
    }
  }, [root, highlightedNode])

  const resizeCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = canvas.offsetWidth
      canvas.height = 400
    }
  }

  const log = (msg) => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev.slice(-9), `[${time}] ${msg}`])
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
      // Node found
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
    const values = [50, 30, 70, 20, 40, 60, 80]
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

    const nextY = y + 60

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

    calculatePositions(root, canvas.width / 2, 40, canvas.width / 4)

    const drawNode = (node) => {
      if (node === null) return

      // Draw edges first
      if (node.left) {
        ctx.beginPath()
        ctx.moveTo(node.x, node.y)
        ctx.lineTo(node.left.x, node.left.y)
        ctx.strokeStyle = '#718096'
        ctx.lineWidth = 2
        ctx.stroke()
        drawNode(node.left)
      }

      if (node.right) {
        ctx.beginPath()
        ctx.moveTo(node.x, node.y)
        ctx.lineTo(node.right.x, node.right.y)
        ctx.strokeStyle = '#718096'
        ctx.lineWidth = 2
        ctx.stroke()
        drawNode(node.right)
      }

      // Draw node
      ctx.beginPath()
      ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI)
      ctx.fillStyle = highlightedNode === node.value ? '#38a169' : '#3182ce'
      ctx.fill()
      ctx.strokeStyle = '#f7fafc'
      ctx.lineWidth = 2
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
    <SimulatorLayout title="Binary Search Tree Visualization">
      {/* Controls */}
      <div className="mb-6 p-6 bg-[#2d3748] rounded-lg space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleInsert()}
            placeholder="Enter a number"
            className="flex-1 px-4 py-2 bg-[#1a202c] text-white rounded-lg border border-gray-600 focus:border-secondary focus:outline-none"
          />

          <button
            onClick={handleInsert}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
          >
            <FiPlus /> Insert
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
          >
            <FiMinus /> Delete
          </button>

          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
          >
            🔍 Search
          </button>
        </div>

        <div className="flex gap-4">
          <button
            onClick={generateSample}
            className="flex-1 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
          >
            Generate Sample
          </button>

          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all"
          >
            <FiRefreshCw /> Clear Tree
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="mb-6 bg-[#2d3748] rounded-lg p-4">
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg border border-dashed border-gray-600"
          style={{ height: '400px' }}
        />
        {!root && (
          <div className="text-center text-gray-400 py-8">
            Tree is empty. Insert some values to get started!
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Traversals */}
        <div className="bg-[#2d3748] rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Traversals</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold text-blue-400">Inorder:</span>
              <span className="ml-2 text-gray-300">
                {traversalResult.inorder.join(', ') || 'Empty'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-green-400">Preorder:</span>
              <span className="ml-2 text-gray-300">
                {traversalResult.preorder.join(', ') || 'Empty'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-yellow-400">Postorder:</span>
              <span className="ml-2 text-gray-300">
                {traversalResult.postorder.join(', ') || 'Empty'}
              </span>
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

      {/* Algorithm Info */}
      <div className="mt-6 bg-[#112240] rounded-lg p-6 border-l-4 border-secondary">
        <h3 className="text-xl font-bold mb-3">About Binary Search Tree</h3>
        <p className="text-gray mb-2">
          A BST is a tree data structure where each node has at most two children. For each node,
          all values in the left subtree are less than the node's value, and all values in the
          right subtree are greater.
        </p>
        <p className="text-gray">
          <strong>Time Complexity:</strong> O(log n) average, O(n) worst case | 
          <strong> Space Complexity:</strong> O(n)
        </p>
      </div>
    </SimulatorLayout>
  )
}

export default BSTSimulator
