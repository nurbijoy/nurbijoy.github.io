import { useState, useEffect, useRef } from 'react'

const CELL_TYPES = {
  EMPTY: 0,
  WALL: 1,
  START: 2,
  END: 3,
  VISITED: 4,
  PATH: 5,
  FRONTIER: 6,
  CURRENT: 6,
  OPEN: 6
}

const PathfindingGrid = ({ 
  onGridReady, 
  getCellClass, 
  isRunning,
  grid,
  onCellClick,
  onCellHover,
  startIcon = '▶',
  endIcon = '🏁'
}) => {
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ rows: 0, cols: 0, cellSize: 20 })
  const [isMouseDown, setIsMouseDown] = useState(false)
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Reset initialization flag when component mounts
    hasInitialized.current = false
    calculateDimensions()
    
    const handleResize = () => calculateDimensions()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      hasInitialized.current = false
    }
  }, [])

  useEffect(() => {
    if (dimensions.rows > 0 && dimensions.cols > 0 && !hasInitialized.current && onGridReady) {
      hasInitialized.current = true
      onGridReady(dimensions)
    }
  }, [dimensions, onGridReady])

  const calculateDimensions = () => {
    if (!containerRef.current) {
      setTimeout(calculateDimensions, 100)
      return
    }
    
    const container = containerRef.current
    // Account for all spacing: border (8px), padding (32px), and extra safety margin
    const totalHorizontalSpace = 8 + 32 + 60  // border + padding + extra safety
    const totalVerticalSpace = 8 + 32 + 60
    
    const availableWidth = container.clientWidth - totalHorizontalSpace
    const availableHeight = container.clientHeight - totalVerticalSpace
    
    // Use smaller target to ensure everything fits with visible borders
    const targetCols = 32
    const targetRows = 20
    
    const cellSizeByWidth = Math.floor(availableWidth / targetCols)
    const cellSizeByHeight = Math.floor(availableHeight / targetRows)
    const cellSize = Math.max(12, Math.min(20, Math.min(cellSizeByWidth, cellSizeByHeight)))
    
    // Calculate exact number of cells that fit
    const cols = Math.floor(availableWidth / cellSize)
    const rows = Math.floor(availableHeight / cellSize)
    
    setDimensions({ rows, cols, cellSize })
  }

  return (
    <div ref={containerRef} className="flex-1 flex items-center justify-center overflow-hidden p-4">
      {grid.length > 0 && dimensions.rows > 0 && (
        <div
          className="inline-grid gap-px bg-gray-800 p-1 rounded shadow-2xl border-4 border-red-500"
          style={{
            gridTemplateColumns: `repeat(${dimensions.cols}, ${dimensions.cellSize}px)`,
            gridTemplateRows: `repeat(${dimensions.rows}, ${dimensions.cellSize}px)`
          }}
          onMouseLeave={() => setIsMouseDown(false)}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getCellClass(cell)}
                style={{ width: `${dimensions.cellSize}px`, height: `${dimensions.cellSize}px` }}
                onClick={() => onCellClick && onCellClick(rowIndex, colIndex)}
                onMouseEnter={() => isMouseDown && onCellHover && onCellHover(rowIndex, colIndex)}
                onMouseDown={() => setIsMouseDown(true)}
                onMouseUp={() => setIsMouseDown(false)}
              >
                {cell === CELL_TYPES.START && startIcon}
                {cell === CELL_TYPES.END && endIcon}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export { CELL_TYPES }
export default PathfindingGrid
