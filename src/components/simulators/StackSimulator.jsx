import { useState } from 'react'
import { FiPlus, FiMinus, FiRefreshCw, FiInfo } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

const StackSimulator = () => {
  const [stack, setStack] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(null)
  const [logs, setLogs] = useState([])
  const [showInfo, setShowInfo] = useState(false)

  const log = (msg) => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${time}] ${msg}`])
  }

  const push = () => {
    const value = inputValue.trim()
    if (!value) {
      alert('Please enter a value')
      return
    }

    setStack(prev => [...prev, value])
    setHighlightedIndex(stack.length)
    log(`Pushed: ${value}`)
    setInputValue('')

    setTimeout(() => setHighlightedIndex(null), 500)
  }

  const pop = () => {
    if (stack.length === 0) {
      alert('Stack is empty!')
      return
    }

    const value = stack[stack.length - 1]
    setHighlightedIndex(stack.length - 1)
    
    setTimeout(() => {
      setStack(prev => prev.slice(0, -1))
      setHighlightedIndex(null)
      log(`Popped: ${value}`)
    }, 300)
  }

  const peek = () => {
    if (stack.length === 0) {
      alert('Stack is empty!')
      return
    }

    const value = stack[stack.length - 1]
    setHighlightedIndex(stack.length - 1)
    log(`Peek: ${value}`)

    setTimeout(() => setHighlightedIndex(null), 1000)
  }

  const clear = () => {
    setStack([])
    setLogs([])
    log('Stack cleared')
  }

  const generateSample = () => {
    const values = ['A', 'B', 'C', 'D', 'E']
    setStack(values)
    log('Generated sample stack')
  }

  return (
    <SimulatorLayout title="Stack (LIFO) Visualization">
      <div className="h-[calc(100vh-73px)] flex flex-col">
        {/* Controls Bar */}
        <div className="bg-[#112240] border-b border-gray-700 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && push()}
                placeholder="Enter value"
                className="px-3 py-1.5 bg-[#1a202c] text-white rounded border border-gray-600 focus:border-secondary focus:outline-none text-sm w-32"
              />

              <button
                onClick={push}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-all"
              >
                <FiPlus size={14} /> Push
              </button>

              <button
                onClick={pop}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-all"
              >
                <FiMinus size={14} /> Pop
              </button>

              <button
                onClick={peek}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-all"
              >
                👁️ Peek
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
                <span className="font-bold text-blue-400">{stack.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Top:</span>
                <span className="font-bold text-green-400">{stack.length > 0 ? stack[stack.length - 1] : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 flex items-center justify-center bg-[#0a192f]">
          <div className="flex flex-col-reverse items-center gap-2 max-h-full overflow-auto px-4">
            {stack.length === 0 ? (
              <div className="text-gray-500 text-center py-20">
                <div className="text-6xl mb-4">📚</div>
                <p>Stack is empty</p>
                <p className="text-sm mt-2">Push some values to get started!</p>
              </div>
            ) : (
              <>
                {stack.map((value, index) => (
                  <div
                    key={index}
                    className={`w-64 px-6 py-4 rounded-lg text-center font-bold text-lg transition-all duration-300 ${
                      highlightedIndex === index
                        ? 'bg-yellow-500 text-black scale-110 shadow-2xl'
                        : index === stack.length - 1
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {value}
                    {index === stack.length - 1 && (
                      <div className="text-xs mt-1 opacity-75">← TOP</div>
                    )}
                  </div>
                ))}
                <div className="w-64 h-2 bg-gray-700 rounded-full mt-2"></div>
                <div className="text-gray-400 text-sm">BOTTOM</div>
              </>
            )}
          </div>
        </div>

        {/* Info Modal */}
        {showInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
            <div className="bg-[#112240] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Stack Information</h3>
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
                  <h4 className="font-semibold mb-2">About Stack</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    A Stack is a Last-In-First-Out (LIFO) data structure. Elements are added and removed from the same end (top).
                  </p>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p><strong>Push:</strong> Add element to top - O(1)</p>
                    <p><strong>Pop:</strong> Remove element from top - O(1)</p>
                    <p><strong>Peek:</strong> View top element - O(1)</p>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    <strong>Use Cases:</strong> Function call stack, undo/redo, expression evaluation, backtracking
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

export default StackSimulator
