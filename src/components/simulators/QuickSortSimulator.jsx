import { useState, useEffect } from 'react'
import { FiPlay, FiRefreshCw, FiShuffle } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

const QuickSortSimulator = () => {
  const [array, setArray] = useState([])
  const [comparing, setComparing] = useState([])
  const [pivot, setPivot] = useState(null)
  const [sorted, setSorted] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0, time: 0 })
  const [arraySize, setArraySize] = useState(30)
  const [speed, setSpeed] = useState(50)

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
    const { comparisons, swaps } = await quickSort(arrCopy, 0, arrCopy.length - 1, 0, 0)

    // Mark all as sorted
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
      {/* Controls */}
      <div className="mb-6 p-6 bg-[#2d3748] rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={startSort}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-all font-medium"
          >
            <FiPlay /> Start Sort
          </button>

          <button
            onClick={generateArray}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-all font-medium"
          >
            <FiShuffle /> New Array
          </button>

          <button
            onClick={() => {
              generateArray()
              setStats({ comparisons: 0, swaps: 0, time: 0 })
            }}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-all font-medium"
          >
            <FiRefreshCw /> Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Array Size: {arraySize}
            </label>
            <input
              type="range"
              min="10"
              max="50"
              value={arraySize}
              onChange={(e) => setArraySize(Number(e.target.value))}
              disabled={isRunning}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Speed: {speed}ms
            </label>
            <input
              type="range"
              min="10"
              max="200"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              disabled={isRunning}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="mb-6 p-6 bg-[#2d3748] rounded-lg">
        <div className="flex items-end justify-center gap-1 h-96">
          {array.map((value, index) => (
            <div
              key={index}
              className={`${getBarColor(index)} transition-all duration-200 rounded-t flex items-end justify-center text-xs text-white font-bold pb-1`}
              style={{
                height: `${(value / maxValue) * 100}%`,
                width: `${100 / array.length}%`,
                minWidth: '4px'
              }}
            >
              {array.length <= 30 && <span className="text-[10px]">{value}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Info Panel */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Stats */}
        <div className="bg-[#2d3748] rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{stats.comparisons}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Comparisons</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{stats.swaps}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Swaps</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{stats.time}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">ms</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-[#2d3748] rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Legend</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded"></div>
              <span className="text-sm">Unsorted</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500 rounded"></div>
              <span className="text-sm">Pivot</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500 rounded"></div>
              <span className="text-sm">Comparing</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded"></div>
              <span className="text-sm">Sorted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithm Info */}
      <div className="mt-6 bg-[#112240] rounded-lg p-6 border-l-4 border-secondary">
        <h3 className="text-xl font-bold mb-3">About Quick Sort</h3>
        <p className="text-gray mb-2">
          Quick Sort is a divide-and-conquer algorithm that picks a pivot element and partitions
          the array around it, placing smaller elements before and larger elements after the pivot.
        </p>
        <p className="text-gray">
          <strong>Time Complexity:</strong> O(n log n) average, O(n²) worst case | 
          <strong> Space Complexity:</strong> O(log n)
        </p>
      </div>
    </SimulatorLayout>
  )
}

export default QuickSortSimulator
