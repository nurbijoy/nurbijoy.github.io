import { useState } from 'react'
import { FiPlus, FiMinus, FiRefreshCw, FiInfo } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

const QueueSimulator = () => {
  const [queue, setQueue] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(null)
  const [logs, setLogs] = useState([])
  const [showInfo, setShowInfo] = useState(false)

  const log = (msg) => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${time}] ${msg}`])
  }

  const enqueue = () => {
    const value = inputValue.trim()
    if (!value) {
      alert('Please enter a value')
      return
    }

    setQueue(prev => [...prev, value])
    setHighlightedIndex(queue.length)
    log(`Enqueued: ${value}`)
    setInputValue('')

    setTimeout(() => setHighlightedIndex(null), 500)
  }

  const dequeue = () => {
    if (queue.length === 0) {
      alert('Queue is empty!')
      return
    }

    const value = queue[0]
    setHighlightedIndex(0)
    
    setTimeout(() => {
      setQueue(prev => prev.slice(1))
      setHighlightedIndex(null)
      log(`Dequeued: ${value}`)
    }, 300)
  }

  const peek = () => {
    if (queue.length === 0) {
      alert('Queue is empty!')
      return
    }

    const value = queue[0]
    setHighlightedIndex(0)
    log(`Front: ${value}`)

    setTimeout(() => setHighlightedIndex(null), 1000)
  }

  const clear = () => {
    setQueue([])
    setLogs([])
    log('Queue cleared')
  }

  const generateSample = () => {
    const values = ['Task 1', 'Task 2', 'Task 3', 'Task 4']
    setQueue(values)
    log('Generated sample queue')
  }

  return (
    <SimulatorLayout title="Queue (FIFO) Visualization">
      <div className="h-[calc(100vh-73px)] flex flex-col">
        {/* Controls Bar */}
        <div className="bg-[#112240] border-b border-gray-700 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && enqueue()}
                placeholder="Enter value"
                className="px-3 py-1.5 bg-[#1a202c] text-white rounded border border-gray-600 focus:border-secondary focus:outline-none text-sm w-32"
              />

              <button
                onClick={enqueue}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-all"
              >
                <FiPlus size={14} /> Enqueue
              </button>

              <button
                onClick={dequeue}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-all"
              >
                <FiMinus size={14} /> Dequeue
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
                <span className="font-bold text-blue-400">{queue.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Front:</span>
                <span className="font-bold text-green-400">{queue.length > 0 ? queue[0] : '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Rear:</span>
                <span className="font-bold text-yellow-400">{queue.length > 0 ? queue[queue.length - 1] : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 flex items-center justify-center bg-[#0a192f] p-4">
          <div className="w-full h-full border-2 border-red-500 rounded flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 w-full px-4">
            {queue.length === 0 ? (
              <div className="text-gray-500 text-center py-20">
                <div className="text-6xl mb-4">🎫</div>
                <p>Queue is empty</p>
                <p className="text-sm mt-2">Enqueue some values to get started!</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>FRONT</span>
                    <span className="text-2xl">→</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-4 w-full justify-center">
                  {queue.map((value, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className={`min-w-[120px] px-6 py-4 rounded-lg text-center font-bold text-lg transition-all duration-300 ${
                          highlightedIndex === index
                            ? 'bg-yellow-500 text-black scale-110 shadow-2xl'
                            : index === 0
                            ? 'bg-green-600 text-white shadow-lg'
                            : index === queue.length - 1
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {value}
                        {index === 0 && (
                          <div className="text-xs mt-1 opacity-75">FRONT</div>
                        )}
                        {index === queue.length - 1 && (
                          <div className="text-xs mt-1 opacity-75">REAR</div>
                        )}
                      </div>
                      {index < queue.length - 1 && (
                        <div className="text-2xl text-gray-600">→</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="text-2xl">→</span>
                  <span>REAR</span>
                </div>
              </>
            )}
            </div>
          </div>
        </div>

        {/* Info Modal */}
        {showInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
            <div className="bg-[#112240] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Queue Information</h3>
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
                  <h4 className="font-semibold mb-2">About Queue</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    A Queue is a First-In-First-Out (FIFO) data structure. Elements are added at the rear and removed from the front.
                  </p>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p><strong>Enqueue:</strong> Add element to rear - O(1)</p>
                    <p><strong>Dequeue:</strong> Remove element from front - O(1)</p>
                    <p><strong>Peek:</strong> View front element - O(1)</p>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    <strong>Use Cases:</strong> Task scheduling, BFS, printer queue, request handling
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

export default QueueSimulator
