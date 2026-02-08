import { useState, useEffect, useRef } from 'react'
import { FiPlay, FiFlag, FiSquare, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

const ROWS = 15
const COLS = 20
const CELL_SIZE = 25

const CELL_TYPES = {
  EMPTY: 0,
  WALL: 1,
  START: 2,
  END: 3,
  VISITED: 4,
  PATH: 5,
  FRONTIER: 6
}

const BFSSimulator = () => {
  const [grid, setGrid] = useState([])
  const [startPos, setStartPos] = useState({ row: 7, col: 5 })
  const [endPos, setEndPos] = useState({ row: 7, col: 14 })
  const [mode, setMode] = useState('wall')
  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState({ visited: 0, pathLength: 0, time: 0 })
  const [isMouseDown, setIsMouseDown] = useState(false)

  useEffect(() => {
    initializeGrid()
  }, [])

  const initializeGrid = () => {
    const newGrid = Array(ROWS).fill(null).map(() => Array(COLS).fill(CELL_TYPES.EMPTY))
    newGrid[startPos.row][startPos.col] = CELL_TYPES.START
    newGrid[endPos.row][endPos.col] = CELL_TYPES.END
    setGrid(newGrid)
    setStats({ visited: 0, pathLength: 0, time: 0 })
  }

  const handleCellClick = (row, col) => {
    if (isRunning) return

    const newGrid = [...grid.map(r => [...r])]
    const cellType = newGrid[row][col]

    if (mode === 'start' && cellType !== CELL_TYPES.END) {
      newGrid[startPos.row][startPos.col] = CELL_TYPES.EMPTY
      setStartPos({ row, col })
      newGrid[row][col] = CELL_TYPES.START
    } else if (mode === 'end' && cellType !== CELL_TYPES.START) {
      newGrid[endPos.row][endPos.col] = CELL_TYPES.EMPTY
      setEndPos({ row, col })
      newGrid[row][col] = CELL_TYPES.END
    } else if (mode === 'wall' && cellType === CELL_TYPES.EMPTY) {
      newGrid[row][col] = CELL_TYPES.WALL
    } else if (mode === 'wall' && cellType === CELL_TYPES.WALL) {
      newGrid[row][col] = CELL_TYPES.EMPTY
    }

    setGrid(newGrid)
  }

  const handleCellHover = (row, col) => {
    if (!isMouseDown || isRunning || mode !== 'wall') return

    const newGrid = [...grid.map(r => [...r])]
    const cellType = newGrid[row][col]

    if (cellType === CELL_TYPES.EMPTY) {
      newGrid[row][col] = CELL_TYPES.WALL
      setGrid(newGrid)
    }
  }

  const resetSearch = () => {
    if (isRunning) return

    const newGrid = grid.map(row =>
      row.map(cell =>
        cell > CELL_TYPES.END ? CELL_TYPES.EMPTY : cell
      )
    )
    setGrid(newGrid)
    setStats({ visited: 0, pathLength: 0, time: 0 })
  }

  const clearWalls = () => {
    if (isRunning) return

    const newGrid = grid.map(row =>
      row.map(cell => (cell === CELL_TYPES.WALL ? CELL_TYPES.EMPTY : cell))
    )
    setGrid(newGrid)
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  const startBFS = async () => {
    if (isRunning) return
    resetSearch()
    setIsRunning(true)

    const startTime = performance.now()
    let visitedCount = 0

    const queue = [{ ...startPos, dist: 0 }]
    const visited = Array(ROWS).fill(null).map(() => Array(COLS).fill(false))
    const parent = Array(ROWS).fill(null).map(() => Array(COLS).fill(null))

    visited[startPos.row][startPos.col] = true

    const directions = [
      { row: -1, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 0, col: -1 }
    ]

    let found = false
    let endNode = null

    while (queue.length > 0 && !found) {
      const current = queue.shift()
      const { row, col, dist } = current

      if (row === endPos.row && col === endPos.col) {
        found = true
        endNode = current
        break
      }

      if (!(row === startPos.row && col === startPos.col)) {
        visitedCount++
        setGrid(prev => {
          const newGrid = [...prev.map(r => [...r])]
          if (newGrid[row][col] !== CELL_TYPES.END) {
            newGrid[row][col] = CELL_TYPES.VISITED
          }
          return newGrid
        })
      }

      for (const dir of directions) {
        const newRow = row + dir.row
        const newCol = col + dir.col

        if (
          newRow >= 0 && newRow < ROWS &&
          newCol >= 0 && newCol < COLS &&
          grid[newRow][newCol] !== CELL_TYPES.WALL &&
          !visited[newRow][newCol]
        ) {
          visited[newRow][newCol] = true
          parent[newRow][newCol] = current
          queue.push({ row: newRow, col: newCol, dist: dist + 1 })

          if (!(newRow === endPos.row && newCol === endPos.col)) {
            setGrid(prev => {
              const newGrid = [...prev.map(r => [...r])]
              if (newGrid[newRow][newCol] === CELL_TYPES.EMPTY) {
                newGrid[newRow][newCol] = CELL_TYPES.FRONTIER
              }
              return newGrid
            })
          }
        }
      }

      await sleep(20)
    }

    const endTime = performance.now()

    if (found) {
      const path = []
      let current = endNode

      while (current && !(current.row === startPos.row && current.col === startPos.col)) {
        path.unshift(current)
        current = parent[current.row][current.col]
      }

      for (let i = 0; i < path.length; i++) {
        const { row, col } = path[i]
        setGrid(prev => {
          const newGrid = [...prev.map(r => [...r])]
          if (newGrid[row][col] !== CELL_TYPES.END) {
            newGrid[row][col] = CELL_TYPES.PATH
          }
          return newGrid
        })
        await sleep(50)
      }

      setStats({
        visited: visitedCount,
        pathLength: endNode.dist,
        time: Math.round(endTime - startTime)
      })
    } else {
      alert('No path found!')
      setStats({
        visited: visitedCount,
        pathLength: 0,
        time: Math.round(endTime - startTime)
      })
    }

    setIsRunning(false)
  }

  const getCellClass = (cellType) => {
    const baseClass = 'w-6 h-6 border border-gray-700 cursor-pointer transition-colors duration-100 flex items-center justify-center text-xs'

    switch (cellType) {
      case CELL_TYPES.WALL:
        return `${baseClass} bg-[#1a202c]`
      case CELL_TYPES.START:
        return `${baseClass} bg-green-600 text-white font-bold`
      case CELL_TYPES.END:
        return `${baseClass} bg-red-600 text-white font-bold`
      case CELL_TYPES.VISITED:
        return `${baseClass} bg-blue-600 animate-fadeIn`
      case CELL_TYPES.PATH:
        return `${baseClass} bg-yellow-500 animate-pulse`
      case CELL_TYPES.FRONTIER:
        return `${baseClass} bg-purple-600 animate-pulse`
      default:
        return `${baseClass} bg-[#2d3748]`
    }
  }

  return (
    <SimulatorLayout title="Breadth-First Search Visualization">
      {/* Controls */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 p-6 bg-[#2d3748] rounded-lg">
        <button
          onClick={() => setMode('start')}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
            mode === 'start' ? 'bg-green-600 text-white' : 'bg-[#4a5568] text-gray-300 hover:bg-[#718096]'
          }`}
        >
          <FiPlay /> Set Start
        </button>

        <button
          onClick={() => setMode('end')}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
            mode === 'end' ? 'bg-red-600 text-white' : 'bg-[#4a5568] text-gray-300 hover:bg-[#718096]'
          }`}
        >
          <FiFlag /> Set End
        </button>

        <button
          onClick={() => setMode('wall')}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
            mode === 'wall' ? 'bg-gray-800 text-white' : 'bg-[#4a5568] text-gray-300 hover:bg-[#718096]'
          }`}
        >
          <FiSquare /> Set Wall
        </button>

        <button
          onClick={startBFS}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-all"
        >
          <FiPlay /> Run BFS
        </button>

        <button
          onClick={resetSearch}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-all"
        >
          <FiRefreshCw /> Reset
        </button>

        <button
          onClick={clearWalls}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#4a5568] hover:bg-[#718096] disabled:bg-gray-600 text-white rounded-lg transition-all"
        >
          <FiTrash2 /> Clear Walls
        </button>
      </div>

      {/* Grid */}
      <div className="flex justify-center mb-6">
        <div
          className="inline-grid gap-px bg-gray-700 p-1 rounded"
          style={{
            gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`
          }}
          onMouseLeave={() => setIsMouseDown(false)}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getCellClass(cell)}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                onMouseDown={() => setIsMouseDown(true)}
                onMouseUp={() => setIsMouseDown(false)}
              >
                {cell === CELL_TYPES.START && '▶'}
                {cell === CELL_TYPES.END && '🏁'}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Panel */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Legend */}
        <div className="bg-[#2d3748] rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Legend</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-600 rounded"></div>
              <span className="text-sm">Start Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-600 rounded"></div>
              <span className="text-sm">End Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#1a202c] rounded"></div>
              <span className="text-sm">Wall</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-600 rounded"></div>
              <span className="text-sm">Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-yellow-500 rounded"></div>
              <span className="text-sm">Path</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-purple-600 rounded"></div>
              <span className="text-sm">Frontier</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-[#2d3748] rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{stats.visited}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Visited</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{stats.pathLength}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Path Length</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{stats.time}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">ms</div>
            </div>
          </div>
        </div>
      </div>
    </SimulatorLayout>
  )
}

export default BFSSimulator
