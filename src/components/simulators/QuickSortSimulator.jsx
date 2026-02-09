import { useState, useEffect } from 'react'
import { FiPlay, FiRefreshCw, FiShuffle, FiInfo } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

const QuickSortSimulator = () => {
  const [array, setArray] = useState([])
  const [comparing, setComparing] = useState([])
  const [pivot, setPivot] = useState(null)
  const [sorted, setSorted] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0, time: 0 })
  const [arraySize, setArraySize] = useState(50)
  const [speed, setSpeed] = useState(30)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    generateArray()
  }, [arraySize])

  const generateArray = () => {
    const newArray = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * 100) + 10
    )
    setArray(newArray)
    setComparing([])
    setPivot(null)
    setSorted([])
    setStats({ comparisons: 0, swaps: 0, time: 0 })
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  const quickSort = async (arr, low, high, comparisons, swaps) => {
    if (low < high) {
      const { pivotIndex, newComparisons, newSwaps } = await partition(arr, low, high, comparisons, swaps)
      await quickSort(arr, low, pivotIndex - 1, newComparisons, newSwaps)
      await quickSort(arr, pivotIndex + 1, high, newComparisons, newSwaps)
    } else if (low === high) {
      setSorted(prev => [...prev, low])
    }
    return { comparisons, swaps }
  }

  const partition = async (arr, low, high, comparisons, swaps) => {
    const pivotValue = arr[high]
    setPivot(high)
    let i = low - 1

    for (let j = low; j < high; j++) {
      setComparing([j, high])
      comparisons++
      setStats(prev => ({ ...prev, comparisons }))
      await sleep(speed)

      if (arr[j] < pivotValue) {
        i++
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]]
          swaps++
          setStats(prev => ({ ...prev, swaps }))
          setArray([...arr])
          await sleep(speed)
        }
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
    swaps++
    setStats(prev => ({ ...prev, swaps }))
    setArray([...arr])
    setSorted(prev => [...prev, i + 1])
    setPivot(null)
    await sleep(speed)

    return { pivotIndex: i + 1, newComparisons: comparisons, newSwaps: swaps }
  }

  const startSort = async () => {
    if (isRunning) return

    setIsRunning(true)
    setSorted([])
    setComparing([])
    setPivot(null)

    const startTime = performance.now()
    const arrCopy = [...array]
    await quickSort(arrCopy, 0, arrCopy.length - 1, 0, 0)

    setSorted(Array.from({ length: arrCopy.length }, (_, i) => i))
    setComparing([])
    setPivot(null)

    const endTime = performance.now()
    setStats(prev => ({ ...prev, time: Math.round(endTime - startTime) }))
    setIsRunning(false)
  }

  const getBarColor = (index) => {
    if (sorted.includes(index)) return 'bg-green-500'
    if (pivot === index) return 'bg-yellow-500'
    if (comparing.includes(index)) return 'bg-red-500'
    return 'bg-blue-500'
  }

  const maxValue = Math.max(...array, 1)

  return (
    <SimulatorLayout title="Quick Sort Visualization">
      <div className="h-[calc(100vh-73px)] flex flex-col">
        {/* Controls Bar */}
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
                  max="100"
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

        {/* Visualization */}
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

        {/* Info Modal */}
        {showInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
            <div className="bg-[#112240] rounded-lg p-6 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">About Quick Sort</h3>
                <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              
              <div className="space-y-4 text-sm">
                <p className="text-gray-300">
                  Quick Sort is a divide-and-conquer algorithm that picks a pivot element and partitions
                  the array around it, placing smaller elements before and larger elements after the pivot.
                </p>
                
                <div>
                  <h4 className="font-semibold mb-2">Legend:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded"></div>
                      <span>Unsorted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                      <span>Pivot</span>
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
                    <strong>Time:</strong> O(n log n) average, O(n²) worst case<br/>
                    <strong>Space:</strong> O(log n)
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

export default QuickSortSimulator
