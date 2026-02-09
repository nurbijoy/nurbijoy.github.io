import { useState } from 'react'
import { FiPlus, FiMinus, FiRefreshCw, FiInfo, FiArrowRight } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

class Node {
  constructor(value) {
    this.value = value
    this.next = null
  }
}

const LinkedListSimulator = () => {
  const [head, setHead] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(null)
  const [logs, setLogs] = useState([])
  const [showInfo, setShowInfo] = useState(false)
  const [size, setSize] = useState(0)

  const log = (msg) => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${time}] ${msg}`])
  }

  const toArray = (node) => {
    const arr = []
    let current = node
    while (current) {
      arr.push(current.value)
      current = current.next
    }
    return arr
  }

  const insertAtHead = () => {
    const value = inputValue.trim()
    if (!value) {
      alert('Please enter a value')
      return
    }

    const newNode = new Node(value)
    newNode.next = head
    setHead(newNode)
    setSize(prev => prev + 1)
    setHighlightedIndex(0)
    log(`Inserted ${value} at head`)
    setInputValue('')

    setTimeout(() => setHighlightedIndex(null), 500)
  }

  const insertAtTail = () => {
    const value = inputValue.trim()
    if (!value) {
      alert('Please enter a value')
      return
    }

    const newNode = new Node(value)

    if (!head) {
      setHead(newNode)
      setSize(1)
      log(`Inserted ${value} at head (empty list)`)
    } else {
      let current = head
      let index = 0
      while (current.next) {
        current = current.next
        index++
      }
      current.next = newNode
      setSize(prev => prev + 1)
      setHighlightedIndex(index + 1)
      log(`Inserted ${value} at tail`)
    }

    setInputValue('')
    setTimeout(() => setHighlightedIndex(null), 500)
  }

  const deleteAtHead = () => {
    if (!head) {
      alert('List is empty!')
      return
    }

    const value = head.value
    setHighlightedIndex(0)

    setTimeout(() => {
      setHead(head.next)
      setSize(prev => prev - 1)
      setHighlightedIndex(null)
      log(`Deleted ${value} from head`)
    }, 300)
  }

  const deleteAtTail = () => {
    if (!head) {
      alert('List is empty!')
      return
    }

    if (!head.next) {
      const value = head.value
      setHead(null)
      setSize(0)
      log(`Deleted ${value} from head (only node)`)
      return
    }

    let current = head
    let index = 0
    while (current.next.next) {
      current = current.next
      index++
    }

    const value = current.next.value
    setHighlightedIndex(index + 1)

    setTimeout(() => {
      current.next = null
      setSize(prev => prev - 1)
      setHighlightedIndex(null)
      log(`Deleted ${value} from tail`)
    }, 300)
  }

  const search = () => {
    const value = inputValue.trim()
    if (!value) {
      alert('Please enter a value to search')
      return
    }

    let current = head
    let index = 0
    let found = false

    while (current) {
      if (current.value === value) {
        setHighlightedIndex(index)
        log(`Found ${value} at position ${index}`)
        found = true
        setTimeout(() => setHighlightedIndex(null), 2000)
        break
      }
      current = current.next
      index++
    }

    if (!found) {
      log(`${value} not found in list`)
    }
  }

  const clear = () => {
    setHead(null)
    setSize(0)
    setLogs([])
    log('List cleared')
  }

  const generateSample = () => {
    const values = ['A', 'B', 'C', 'D', 'E']
    let newHead = null
    let current = null

    values.forEach(val => {
      const newNode = new Node(val)
      if (!newHead) {
        newHead = newNode
        current = newHead
      } else {
        current.next = newNode
        current = newNode
      }
    })

    setHead(newHead)
    setSize(values.length)
    log('Generated sample list')
  }

  const list = toArray(head)

  return (
    <SimulatorLayout title="Linked List Visualization">
      <div className="h-[calc(100vh-73px)] flex flex-col">
        {/* Controls Bar */}
        <div className="bg-[#112240] border-b border-gray-700 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && insertAtTail()}
                placeholder="Enter value"
                className="px-3 py-1.5 bg-[#1a202c] text-white rounded border border-gray-600 focus:border-secondary focus:outline-none text-sm w-32"
              />

              <button
                onClick={insertAtHead}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-all"
              >
                <FiPlus size={14} /> Head
              </button>

              <button
                onClick={insertAtTail}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-all"
              >
                <FiPlus size={14} /> Tail
              </button>

              <button
                onClick={deleteAtHead}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-all"
              >
                <FiMinus size={14} /> Head
              </button>

              <button
                onClick={deleteAtTail}
                className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-all"
              >
                <FiMinus size={14} /> Tail
              </button>

              <button
                onClick={search}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-all"
              >
                🔍 Search
              </button>

              <div className="w-px h-6 bg-gray-700"></div>

              <button
                onClick={generateSample}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm transition-all"
              >
                Sample
              </button>

              <button
                onClick={clear}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-all"
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
                <span className="font-bold text-blue-400">{size}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Head:</span>
                <span className="font-bold text-green-400">{head ? head.value : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 flex items-center justify-center bg-[#0a192f] p-4">
          <div className="w-full h-full border-2 border-red-500 rounded flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 w-full px-4">
            {list.length === 0 ? (
              <div className="text-gray-500 text-center py-20">
                <div className="text-6xl mb-4">🔗</div>
                <p>Linked List is empty</p>
                <p className="text-sm mt-2">Insert values to get started!</p>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-400">HEAD</div>

                <div className="flex items-center gap-3 overflow-x-auto pb-4 w-full justify-center flex-wrap">
                  {list.map((value, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className={`min-w-[100px] px-6 py-4 rounded-lg text-center font-bold text-lg transition-all duration-300 ${
                          highlightedIndex === index
                            ? 'bg-yellow-500 text-black scale-110 shadow-2xl'
                            : index === 0
                            ? 'bg-green-600 text-white shadow-lg'
                            : index === list.length - 1
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <div>{value}</div>
                        {index === 0 && (
                          <div className="text-xs mt-1 opacity-75">HEAD</div>
                        )}
                        {index === list.length - 1 && (
                          <div className="text-xs mt-1 opacity-75">TAIL</div>
                        )}
                      </div>
                      {index < list.length - 1 && (
                        <FiArrowRight className="text-2xl text-gray-600" />
                      )}
                    </div>
                  ))}
                  <div className="text-2xl text-gray-600">→ NULL</div>
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
                <h3 className="text-xl font-bold">Linked List Information</h3>
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
                  <h4 className="font-semibold mb-2">About Linked List</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    A Linked List is a linear data structure where elements are stored in nodes.
                    Each node contains data and a reference (pointer) to the next node.
                  </p>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p><strong>Insert at Head:</strong> O(1)</p>
                    <p><strong>Insert at Tail:</strong> O(n)</p>
                    <p><strong>Delete at Head:</strong> O(1)</p>
                    <p><strong>Delete at Tail:</strong> O(n)</p>
                    <p><strong>Search:</strong> O(n)</p>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    <strong>Advantages:</strong> Dynamic size, efficient insertions/deletions at head
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

export default LinkedListSimulator
