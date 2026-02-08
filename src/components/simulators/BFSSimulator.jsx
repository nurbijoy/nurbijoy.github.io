import { useState, useEffect } from 'react'
import { FiPlay, FiFlag, FiSquare, FiRefreshCw, FiTrash2, FiInfo } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'
import PathfindingGrid, { CELL_TYPES } from './PathfindingGrid'

const BFSSimulator = () => {
  const [dimensions, setDimensions] = useState({ rows: 20, cols: 40, cellSize: 20 })
  const [grid, setGrid] = useState([])
  const [startPos, setStartPos] = useState({ row: 10, col: 8 })
  const [endPos, setEndPos] = useState({ row: 10, col: 31 })
  const [mode, setMode] = useState('wall')
  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState({ visited: 0, pathLength: 0, time: 0 })
  const [showInfo, setShowInfo] = useState(false)

  const handleGridReady = (newDimensions) => {
    const newStartPos = { row: Math.floor(newDimensions.rows / 2), col: Math.floor(newDimensions.cols / 4) }
    const newEndPos = { row: Math.floor(newDimensions.rows / 2), col: Math.floor(newDimensions.cols * 3 / 4) }
    
    setDimensions(newDimensions)
    setStartPos(newStartPos)
    setEndPos(newEndPos)
    
    // Initialize grid with new positions
    const newGrid = Array(newDimensions.rows).fill(null).map(() => Array(newDimensions.cols).fill(CELL_TYPES.EMPTY))
    newGrid[newStartPos.row][newStartPos.col] = CELL_TYPES.START
    newGrid[newEndPos.row][newEndPos.col] = CELL_TYPES.END
    setGrid(newGrid)
    setStats({ visited: 0, pathLength: 0, time: 0 })
  }

  const initializeGrid = () => {
    if (dimensions.rows === 0 || dimensions.cols === 0) return
    
    const validStartRow = Math.min(startPos.row, dimensions.rows - 1)
    const validStartCol = Math.min(startPos.col, dimensions.cols - 1)
    const validEndRow = Math.min(endPos.row, dimensions.rows - 1)
    const validEndCol = Math.min(endPos.col, dimensions.cols - 1)
    
    const newGrid = Array(dimensions.rows).fill(null).map(() => Array(dimensions.cols).fill(CELL_TYPES.EMPTY))
    newGrid[validStartRow][validStartCol] = CELL_TYPES.START
    newGrid[validEndRow][validEndCol] = CELL_TYPES.END
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
    const visited = Array(dimensions.rows).fill(null).map(() => Array(dimensions.cols).fill(false))
    const parent = Array(dimensions.rows).fill(null).map(() => Array(dimensions.cols).fill(null))

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
          newRow >= 0 && newRow < dimensions.rows &&
          newCol >= 0 && newCol < dimensions.cols &&
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

      await sleep(10)
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
        await sleep(30)
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
    const baseClass = 'border border-gray-800 cursor-pointer transition-colors duration-100 flex items-center justify-center text-xs'

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
    <SimulatorLayout title="Breadth-First Search (BFS)">
      <div className="h-[calc(100vh-73px)] flex flex-col">
        {/* Controls Bar */}
        <div className="bg-[#112240] border-b border-gray-700 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setMode('start')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${
                  mode === 'start' ? 'bg-green-600 text-white' : 'bg-[#2d3748] text-gray-300 hover:bg-[#4a5568]'
                }`}
              >
                <FiPlay size={14} /> Start
              </button>

              <button
                onClick={() => setMode('end')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${
                  mode === 'end' ? 'bg-red-600 text-white' : 'bg-[#2d3748] text-gray-300 hover:bg-[#4a5568]'
                }`}
              >
                <FiFlag size={14} /> End
              </button>

              <button
                onClick={() => setMode('wall')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${
                  mode === 'wall' ? 'bg-gray-800 text-white' : 'bg-[#2d3748] text-gray-300 hover:bg-[#4a5568]'
                }`}
              >
                <FiSquare size={14} /> Wall
              </button>

              <div className="w-px h-6 bg-gray-700"></div>

              <button
                onClick={startBFS}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm transition-all font-medium"
              >
                <FiPlay size={14} /> Run BFS
              </button>

              <button
                onClick={resetSearch}
                disabled={isRunning}
                className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded text-sm transition-all"
              >
                <FiRefreshCw size={14} /> Reset
              </button>

              <button
                onClick={clearWalls}
                disabled={isRunning}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#2d3748] hover:bg-[#4a5568] disabled:bg-gray-600 text-white rounded text-sm transition-all"
              >
                <FiTrash2 size={14} /> Clear
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Visited:</span>
                <span className="font-bold text-blue-400">{stats.visited}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Path:</span>
                <span className="font-bold text-yellow-400">{stats.pathLength}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Time:</span>
                <span className="font-bold text-green-400">{stats.time}ms</span>
              </div>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-1.5 bg-[#2d3748] hover:bg-[#4a5568] rounded transition-colors"
              >
                <FiInfo size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <PathfindingGrid
          grid={grid}
          onGridReady={handleGridReady}
          getCellClass={getCellClass}
          isRunning={isRunning}
          onCellClick={handleCellClick}
          onCellHover={handleCellHover}
        />

        {/* Info Modal */}
        {showInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
            <div className="bg-[#112240] rounded-lg p-6 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">About BFS</h3>
                <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              
              <div className="space-y-4 text-sm">
                <p className="text-gray-300">
                  Breadth-First Search explores nodes level by level, guaranteeing the shortest path in unweighted graphs.
                </p>
                
                <div>
                  <h4 className="font-semibold mb-2">Legend:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-600 rounded"></div>
                      <span>Start Node</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-600 rounded"></div>
                      <span>End Node</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#1a202c] rounded"></div>
                      <span>Wall</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                      <span>Visited</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span>Shortest Path</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-600 rounded"></div>
                      <span>Frontier</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Complexity:</h4>
                  <p className="text-gray-300">Time: O(V + E) | Space: O(V)</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimulatorLayout>
  )
}

export default BFSSimulator
