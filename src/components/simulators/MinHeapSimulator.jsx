import { useState } from 'react'
import { FiPlus, FiMinus, FiRefreshCw, FiInfo } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

const MinHeapSimulator = () => {
  const [heap, setHeap] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [highlightedIndices, setHighlightedIndices] = useState([])
  const [logs, setLogs] = useState([])
  const [showInfo, setShowInfo] = useState(false)

  const log = (msg) => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${time}] ${msg}`])
  }

  const parent = (i) => Math.floor((i - 1) / 2)
  const leftChild = (i) => 2 * i + 1
  const rightChild = (i) => 2 * i + 2

  const heapifyUp = async (arr, index) => {
    let current = index
    while (current > 0 && arr[parent(current)] > arr[current]) {
      setHighlightedIndices([current, parent(current)])
      await new Promise(resolve => setTimeout(resolve, 500))

      ;[arr[current], arr[parent(current)]] = [arr[parent(current)], arr[current]]
      setHeap([...arr])
      current = parent(current)
    }
    setHighlightedIndices([])
  }

  const heapifyDown = async (arr, index) => {
    let smallest = index
    const left = leftChild(index)
    const right = rightChild(index)

    if (left < arr.length && arr[left] < arr[smallest]) {
      smallest = left
    }

    if (right < arr.length && arr[right] < arr[smallest]) {
      smallest = right
    }

    if (smallest !== index) {
      setHighlightedIndices([index, smallest])
      await new Promise(resolve => setTimeout(resolve, 500))

      ;[arr[index], arr[smallest]] = [arr[smallest], arr[index]]
      setHeap([...arr])
      await heapifyDown(arr, smallest)
    }
    setHighlightedIndices([])
  }

  const insert = async () => {
    const value = parseInt(inputValue)
    if (isNaN(value)) {
      alert('Please enter a valid number')
      return
    }

    const newHeap = [...heap, value]
    setHeap(newHeap)
    log(`Inserted ${value}`)
    setInputValue('')

    await heapifyUp(newHeap, newHeap.length - 1)
    log(`Heapified up from index ${newHeap.length - 1}`)
  }

  const extractMin = async () => {
    if (heap.length === 0) {
      alert('Heap is empty!')
      return
    }

    const min = heap[0]
    const newHeap = [...heap]

    if (newHeap.length === 1) {
      setHeap([])
      log(`Extracted min: ${min}`)
      return
    }

    newHeap[0] = newHeap[newHeap.length - 1]
    newHeap.pop()
    setHeap(newHeap)
    log(`Extracted min: ${min}`)

    await heapifyDown(newHeap, 0)
    log('Heapified down from root')
  }

  const clear = () => {
    setHeap([])
    setLogs([])
    log('Heap cleared')
  }

  const generateSample = () => {
    const values = [15, 10, 20, 8, 12, 25, 6]
    setHeap(values)
    log('Generated sample heap (may not be valid min heap)')
  }

  const buildHeap = async () => {
    if (heap.length === 0) return

    const newHeap = [...heap]
    const startIdx = Math.floor(newHeap.length / 2) - 1

    for (let i = startIdx; i >= 0; i--) {
      await heapifyDown(newHeap, i)
    }

    log('Built valid min heap')
  }

  const getNodePosition = (index, level, totalAtLevel, positionInLevel) => {
    const levelWidth = Math.pow(2, level)
    const spacing = 100 / (levelWidth + 1)
    return spacing * (positionInLevel + 1)
  }

  const renderTree = () => {
    if (heap.length === 0) return null

    const levels = Math.ceil(Math.log2(heap.length + 1))
    const nodes = []
    const edges = []

    heap.forEach((value, index) => {
      const level = Math.floor(Math.log2(index + 1))
      const positionInLevel = index - (Math.pow(2, level) - 1)
      const totalAtLevel = Math.pow(2, level)
      const x = getNodePosition(index, level, totalAtLevel, positionInLevel)
      const y = level * 80 + 40

      // Add edges
      if (index > 0) {
        const parentIndex = parent(index)
        const parentLevel = Math.floor(Math.log2(parentIndex + 1))
        const parentPositionInLevel = parentIndex - (Math.pow(2, parentLevel) - 1)
        const parentTotalAtLevel = Math.pow(2, parentLevel)
        const parentX = getNodePosition(parentIndex, parentLevel, parentTotalAtLevel, parentPositionInLevel)
        const parentY = parentLevel * 80 + 40

        edges.push(
          <line
            key={`edge-${index}`}
            x1={`${parentX}%`}
            y1={parentY}
            x2={`${x}%`}
            y2={y}
            stroke="#4a5568"
            strokeWidth="2"
          />
        )
      }

      nodes.push(
        <g key={`node-${index}`}>
          <circle
            cx={`${x}%`}
            cy={y}
            r="25"
            fill={highlightedIndices.includes(index) ? '#ecc94b' : index === 0 ? '#48bb78' : '#4299e1'}
            stroke="#f7fafc"
            strokeWidth="2"
          />
          <text
            x={`${x}%`}
            y={y}
            textAnchor="middle"
            dy=".3em"
            fill="white"
            fontSize="16"
            fontWeight="bold"
          >
            {value}
          </text>
        </g>
      )
    })

    return (
      <svg className="w-full h-full" style={{ minHeight: `${levels * 80 + 80}px` }}>
        {edges}
        {nodes}
      </svg>
    )
  }

  return (
    <SimulatorLayout title="Min Heap Visualization">
      <div className="h-[calc(100vh-73px)] flex flex-col">
        {/* Controls Bar */}
        <div className="bg-[#112240] border-b border-gray-700 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && insert()}
                placeholder="Enter number"
                className="px-3 py-1.5 bg-[#1a202c] text-white rounded border border-gray-600 focus:border-secondary focus:outline-none text-sm w-32"
              />

              <button
                onClick={insert}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-all"
              >
                <FiPlus size={14} /> Insert
              </button>

              <button
                onClick={extractMin}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-all"
              >
                <FiMinus size={14} /> Extract Min
              </button>

              <button
                onClick={buildHeap}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-all"
              >
                Build Heap
              </button>

              <div className="w-px h-6 bg-gray-700"></div>

              <button
                onClick={generateSample}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-all"
              >
                Sample
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

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Size:</span>
                <span className="font-bold text-blue-400">{heap.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Min:</span>
                <span className="font-bold text-green-400">{heap.length > 0 ? heap[0] : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 bg-[#0a192f] overflow-auto px-4 py-4">
          {heap.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">🌳</div>
                <p>Min Heap is empty</p>
                <p className="text-sm mt-2">Insert values to build the heap!</p>
              </div>
            </div>
          ) : (
            renderTree()
          )}
        </div>

        {/* Info Modal */}
        {showInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
            <div className="bg-[#112240] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Min Heap Information</h3>
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
                  <h4 className="font-semibold mb-2">About Min Heap</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    A Min Heap is a complete binary tree where each parent node is smaller than or equal to its children.
                    The minimum element is always at the root.
                  </p>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p><strong>Insert:</strong> O(log n)</p>
                    <p><strong>Extract Min:</strong> O(log n)</p>
                    <p><strong>Get Min:</strong> O(1)</p>
                    <p><strong>Build Heap:</strong> O(n)</p>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    <strong>Use Cases:</strong> Priority queues, Dijkstra's algorithm, heap sort
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

export default MinHeapSimulator
