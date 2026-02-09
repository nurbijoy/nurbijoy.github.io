import { useState } from 'react'
import { FiPlus, FiMinus, FiRefreshCw, FiInfo, FiSearch } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

const BUCKET_COUNT = 10

const HashTableSimulator = () => {
  const [table, setTable] = useState(Array(BUCKET_COUNT).fill(null).map(() => []))
  const [keyInput, setKeyInput] = useState('')
  const [valueInput, setValueInput] = useState('')
  const [highlightedBucket, setHighlightedBucket] = useState(null)
  const [logs, setLogs] = useState([])
  const [showInfo, setShowInfo] = useState(false)
  const [collisions, setCollisions] = useState(0)

  const log = (msg) => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${time}] ${msg}`])
  }

  const hashFunction = (key) => {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = (hash + key.charCodeAt(i) * (i + 1)) % BUCKET_COUNT
    }
    return hash
  }

  const insert = () => {
    const key = keyInput.trim()
    const value = valueInput.trim()

    if (!key || !value) {
      alert('Please enter both key and value')
      return
    }

    const index = hashFunction(key)
    const newTable = table.map(bucket => [...bucket])

    // Check if key already exists
    const existingIndex = newTable[index].findIndex(item => item.key === key)
    if (existingIndex !== -1) {
      newTable[index][existingIndex].value = value
      log(`Updated key "${key}" at bucket ${index}`)
    } else {
      if (newTable[index].length > 0) {
        setCollisions(prev => prev + 1)
        log(`Collision at bucket ${index}!`)
      }
      newTable[index].push({ key, value })
      log(`Inserted "${key}": "${value}" at bucket ${index}`)
    }

    setTable(newTable)
    setHighlightedBucket(index)
    setKeyInput('')
    setValueInput('')

    setTimeout(() => setHighlightedBucket(null), 1000)
  }

  const remove = () => {
    const key = keyInput.trim()

    if (!key) {
      alert('Please enter a key to remove')
      return
    }

    const index = hashFunction(key)
    const newTable = table.map(bucket => [...bucket])

    const itemIndex = newTable[index].findIndex(item => item.key === key)
    if (itemIndex !== -1) {
      newTable[index].splice(itemIndex, 1)
      setTable(newTable)
      setHighlightedBucket(index)
      log(`Removed key "${key}" from bucket ${index}`)

      setTimeout(() => setHighlightedBucket(null), 1000)
    } else {
      log(`Key "${key}" not found`)
    }

    setKeyInput('')
  }

  const search = () => {
    const key = keyInput.trim()

    if (!key) {
      alert('Please enter a key to search')
      return
    }

    const index = hashFunction(key)
    const bucket = table[index]
    const item = bucket.find(item => item.key === key)

    setHighlightedBucket(index)

    if (item) {
      log(`Found "${key}": "${item.value}" at bucket ${index}`)
    } else {
      log(`Key "${key}" not found`)
    }

    setTimeout(() => setHighlightedBucket(null), 2000)
  }

  const clear = () => {
    setTable(Array(BUCKET_COUNT).fill(null).map(() => []))
    setLogs([])
    setCollisions(0)
    log('Hash table cleared')
  }

  const generateSample = () => {
    const samples = [
      { key: 'apple', value: '🍎' },
      { key: 'banana', value: '🍌' },
      { key: 'cherry', value: '🍒' },
      { key: 'date', value: '📅' },
      { key: 'elderberry', value: '🫐' }
    ]

    const newTable = Array(BUCKET_COUNT).fill(null).map(() => [])
    let newCollisions = 0

    samples.forEach(({ key, value }) => {
      const index = hashFunction(key)
      if (newTable[index].length > 0) newCollisions++
      newTable[index].push({ key, value })
    })

    setTable(newTable)
    setCollisions(newCollisions)
    log('Generated sample data')
  }

  const totalItems = table.reduce((sum, bucket) => sum + bucket.length, 0)
  const loadFactor = (totalItems / BUCKET_COUNT).toFixed(2)

  return (
    <SimulatorLayout title="Hash Table with Chaining">
      <div className="h-[calc(100vh-73px)] flex flex-col">
        {/* Controls Bar */}
        <div className="bg-[#112240] border-b border-gray-700 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Key"
                className="px-3 py-1.5 bg-[#1a202c] text-white rounded border border-gray-600 focus:border-secondary focus:outline-none text-sm w-24"
              />

              <input
                type="text"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && insert()}
                placeholder="Value"
                className="px-3 py-1.5 bg-[#1a202c] text-white rounded border border-gray-600 focus:border-secondary focus:outline-none text-sm w-24"
              />

              <button
                onClick={insert}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-all"
              >
                <FiPlus size={14} /> Insert
              </button>

              <button
                onClick={remove}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-all"
              >
                <FiMinus size={14} /> Remove
              </button>

              <button
                onClick={search}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-all"
              >
                <FiSearch size={14} /> Search
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
                <span className="text-gray-400">Items:</span>
                <span className="font-bold text-blue-400">{totalItems}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Load Factor:</span>
                <span className="font-bold text-green-400">{loadFactor}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Collisions:</span>
                <span className="font-bold text-red-400">{collisions}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 bg-[#0a192f] p-4">
          <div className="w-full h-full border-2 border-red-500 rounded overflow-auto px-4 py-4">
            <div className="w-full">
            <div className="grid gap-3">
              {table.map((bucket, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    highlightedBucket === index
                      ? 'bg-yellow-500/20 border-2 border-yellow-500'
                      : 'bg-[#112240] border-2 border-gray-700'
                  }`}
                >
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="text-sm text-gray-400">Bucket</div>
                    <div className="text-xl font-bold text-blue-400">{index}</div>
                  </div>

                  <div className="flex-1 flex items-center gap-2 overflow-x-auto">
                    {bucket.length === 0 ? (
                      <div className="text-gray-600 italic text-sm">Empty</div>
                    ) : (
                      bucket.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex-shrink-0 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg"
                        >
                          <div className="text-xs opacity-75">{item.key}</div>
                          <div className="font-bold">{item.value}</div>
                        </div>
                      ))
                    )}
                  </div>

                  {bucket.length > 1 && (
                    <div className="flex-shrink-0 text-xs text-red-400 font-bold">
                      ⚠️ {bucket.length} items
                    </div>
                  )}
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>

        {/* Info Modal */}
        {showInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
            <div className="bg-[#112240] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Hash Table Information</h3>
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
                  <h4 className="font-semibold mb-2">About Hash Table</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    A Hash Table uses a hash function to map keys to buckets. Collisions are handled using chaining (linked lists).
                  </p>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p><strong>Insert:</strong> O(1) average, O(n) worst</p>
                    <p><strong>Search:</strong> O(1) average, O(n) worst</p>
                    <p><strong>Delete:</strong> O(1) average, O(n) worst</p>
                    <p><strong>Load Factor:</strong> items / buckets</p>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    <strong>Use Cases:</strong> Caching, databases, symbol tables, counting frequencies
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

export default HashTableSimulator
