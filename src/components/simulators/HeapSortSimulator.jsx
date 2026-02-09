import { useState, useEffect } from 'react'
import { FiPlay, FiRefreshCw, FiShuffle, FiInfo } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

const HeapSortSimulator = () => {
  const [array, setArray] = useState([])
  const [heapArray, setHeapArray] = useState([])
  const [comparing, setComparing] = useState([])
  const [sorted, setSorted] = useState([])
  const [heapifying, setHeapifying] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0, time: 0 })
  const [arraySize, setArraySize] = useState(40)
  const [speed, setSpeed] = useState(50)
  const [showInfo, setShowInfo] = useState(false)
  const [phase, setPhase] = useState('') // 'building' or 'sorting'

  useEffect(() => {
    generateArray()
  }, [arraySize])

  const generateArray = () => {
    const newArray = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * 100) + 10
    )
    setArray(newArray)
    setHeapArray([])
    setComparing([])
    setSorted([])
    setHeapifying([])
    setStats({ comparisons: 0, swaps: 0, time: 0 })
    setPhase('')
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  const heapify = async (arr, n, i, comparisons, swaps) => {
    let largest = i
    const left = 2 * i + 1
    const right = 2 * i + 2

    setHeapifying([i, left, right].filter(idx => idx < n))
    await sleep(speed)

    if (left < n) {
      setComparing([left, largest])
      comparisons++
      setStats(prev => ({ ...prev, comparisons }))
      await sleep(speed)

      if (arr[left] > arr[largest]) {
        largest = left
      }
    }

    if (right < n) {
      setComparing([right, largest])
      comparisons++
      setStats(prev => ({ ...prev, comparisons }))
      await sleep(speed)

      if (arr[right] > arr[largest]) {
        largest = right
      }
    }

    if (largest !== i) {
      ;[arr[i], arr[largest]] = [arr[largest], arr[i]]
      swaps++
      setStats(prev => ({ ...prev, swaps }))
      setArray([...arr])
      await sleep(speed)

      const result = await heapify(arr, n, largest, comparisons, swaps)
      comparisons = result.comparisons
      swaps = result.swaps
    }

    setHeapifying([])
    setComparing([])

    return { comparisons, swaps }
  }

  const startSort = async () => {
    if (isRunning) return

    setIsRunning(true)
    setSorted([])
    setComparing([])
    setHeapifying([])

    const startTime = performance.now()
    const arrCopy = [...array]
    let comparisons = 0
    let swaps = 0

    // Build max heap
    setPhase('building')
    const n = arrCopy.length
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      const result = await heapify(arrCopy, n, i, comparisons, swaps)
      comparisons = result.comparisons
      swaps = result.swaps
    }

    setHeapArray([...arrCopy])

    // Extract elements from heap
    setPhase('sorting')
    for (let i = n - 1; i > 0; i--) {
      ;[arrCopy[0], arrCopy[i]] = [arrCopy[i], arrCopy[0]]
      swaps++
      setStats(prev => ({ ...prev, swaps }))
      setArray([...arrCopy])
      setSorted(prev => [...prev, i])
      await sleep(speed)

      const result = await heapify(arrCopy, i, 0, comparisons, swaps)
      comparisons = result.comparisons
      swaps = result.swaps
    }

    setSorted(Array.from({ length: arrCopy.length }, (_, i) => i))
    setComparing([])
    setHeapifying([])
    setPhase('')

    const endTime = performance.now()
    setStats(prev => ({ ...prev, time: Math.round(endTime - startTime) }))
    setIsRunning(false)
  }

  const getBarColor = (index) => {
    if (sorted.includes(index)) return 'bg-green-500'
    if (heapifying.includes(index)) return 'bg-purple-500'
    if (comparing.includes(index)) return 'bg-red-500'
    return 'bg-blue-500'
  }

  const maxValue = Math.max(...array, 1)

  return (
    <SimulatorLayout title="Heap Sort Visualization">
      <div className="h-[calc(100vh-73px)] flex flex-col">
        <div className="bg-[#112240] border-b border-gray-700 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={startSort}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm transition-all font-medium"
              >
                <FiPlay size={14} /> Start Sort
              </button>

              <button
                onClick={generateArray}
                disabled={isRunning}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm transition-all"
              >
                <FiShuffle size={14} /> New Array
              </button>

              <button
                onClick={() => {
                  generateArray()
                  setStats({ comparisons: 0, swaps: 0, time: 0 })
                }}
                disabled={isRunning}
                className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded text-sm transition-all"
              >
                <FiRefreshCw size={14} /> Reset
              </button>

              <div className="flex items-center gap-2 bg-[#2d3748] px-3 py-1.5 rounded">
                <label className="text-xs text-gray-400">Size:</label>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={arraySize}
                  onChange={(e) => setArraySize(Number(e.target.value))}
                  disabled={isRunning}
                  className="w-20"
                />
                <span className="text-xs font-bold w-8">{arraySize}</span>
              </div>

              <div className="flex items-center gap-2 bg-[#2d3748] px-3 py-1.5 rounded">
                <label className="text-xs text-gray-400">Speed:</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  disabled={isRunning}
                  className="w-20"
                />
                <span className="text-xs font-bold w-8">{speed}ms</span>
              </div>

              {phase && (
                <div className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm font-medium">
                  {phase === 'building' ? '🔨 Building Heap' : '📊 Sorting'}
                </div>
              )}

              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-1.5 bg-[#2d3748] hover:bg-[#4a5568] rounded transition-colors"
              >
                <FiInfo size={16} />
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Comparisons:</span>
                <span className="font-bold text-blue-400">{stats.comparisons}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Swaps:</span>
                <span className="font-bold text-green-400">{stats.swaps}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Time:</span>
                <span className="font-bold text-yellow-400">{stats.time}ms</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-end justify-center bg-[#0a192f] p-4">
          <div className="flex items-end justify-center gap-px h-full w-full px-2 border-2 border-red-500 rounded">
            {array.map((value, index) => (
              <div
                key={index}
                className={`${getBarColor(index)} transition-all duration-200 rounded-t flex items-end justify-center text-xs text-white font-bold pb-1`}
                style={{
                  height: `${(value / maxValue) * 100}%`,
                  width: `${100 / array.length}%`,
                  minWidth: '2px'
                }}
              >
                {array.length <= 40 && <span className="text-[10px]">{value}</span>}
              </div>
            ))}
          </div>
        </div>

        {showInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
            <div className="bg-[#112240] rounded-lg p-6 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">About Heap Sort</h3>
                <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              
              <div className="space-y-4 text-sm">
                <p className="text-gray-300">
                  Heap Sort builds a max heap from the array, then repeatedly extracts the maximum element
                  and rebuilds the heap until the array is sorted.
                </p>
                
                <div>
                  <h4 className="font-semibold mb-2">Legend:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded"></div>
                      <span>Unsorted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500 rounded"></div>
                      <span>Heapifying</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-500 rounded"></div>
                      <span>Comparing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded"></div>
                      <span>Sorted</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Complexity:</h4>
                  <p className="text-gray-300">
                    <strong>Time:</strong> O(n log n) all cases<br/>
                    <strong>Space:</strong> O(1) - in-place<br/>
                    <strong>Stable:</strong> No
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

export default HeapSortSimulator
