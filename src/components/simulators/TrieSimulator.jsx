import { useState } from 'react'
import { FiPlus, FiMinus, FiRefreshCw, FiInfo, FiSearch } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

class TrieNode {
  constructor() {
    this.children = {}
    this.isEndOfWord = false
  }
}

const TrieSimulator = () => {
  const [root] = useState(new TrieNode())
  const [inputValue, setInputValue] = useState('')
  const [words, setWords] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [logs, setLogs] = useState([])
  const [showInfo, setShowInfo] = useState(false)

  const log = (msg) => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${time}] ${msg}`])
  }

  const insert = () => {
    const word = inputValue.trim().toLowerCase()
    if (!word) {
      alert('Please enter a word')
      return
    }

    if (words.includes(word)) {
      log(`Word "${word}" already exists`)
      return
    }

    let node = root
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode()
      }
      node = node.children[char]
    }
    node.isEndOfWord = true

    setWords(prev => [...prev, word].sort())
    log(`Inserted "${word}"`)
    setInputValue('')
  }

  const remove = () => {
    const word = inputValue.trim().toLowerCase()
    if (!word) {
      alert('Please enter a word to remove')
      return
    }

    if (!words.includes(word)) {
      log(`Word "${word}" not found`)
      return
    }

    const deleteHelper = (node, word, index) => {
      if (index === word.length) {
        if (!node.isEndOfWord) return false
        node.isEndOfWord = false
        return Object.keys(node.children).length === 0
      }

      const char = word[index]
      const childNode = node.children[char]
      if (!childNode) return false

      const shouldDeleteChild = deleteHelper(childNode, word, index + 1)

      if (shouldDeleteChild) {
        delete node.children[char]
        return Object.keys(node.children).length === 0 && !node.isEndOfWord
      }

      return false
    }

    deleteHelper(root, word, 0)
    setWords(prev => prev.filter(w => w !== word))
    log(`Removed "${word}"`)
    setInputValue('')
  }

  const search = () => {
    const prefix = inputValue.trim().toLowerCase()
    if (!prefix) {
      setSearchResults([])
      return
    }

    let node = root
    for (const char of prefix) {
      if (!node.children[char]) {
        setSearchResults([])
        log(`No words found with prefix "${prefix}"`)
        return
      }
      node = node.children[char]
    }

    const results = []
    const findWords = (node, currentWord) => {
      if (node.isEndOfWord) {
        results.push(currentWord)
      }
      for (const char in node.children) {
        findWords(node.children[char], currentWord + char)
      }
    }

    findWords(node, prefix)
    setSearchResults(results)
    log(`Found ${results.length} word(s) with prefix "${prefix}"`)
  }

  const clear = () => {
    Object.keys(root.children).forEach(key => delete root.children[key])
    setWords([])
    setSearchResults([])
    setLogs([])
    log('Trie cleared')
  }

  const generateSample = () => {
    const samples = ['apple', 'app', 'application', 'apply', 'banana', 'band', 'bandana', 'cat', 'car', 'card']
    
    Object.keys(root.children).forEach(key => delete root.children[key])
    
    samples.forEach(word => {
      let node = root
      for (const char of word) {
        if (!node.children[char]) {
          node.children[char] = new TrieNode()
        }
        node = node.children[char]
      }
      node.isEndOfWord = true
    })

    setWords(samples.sort())
    setSearchResults([])
    log('Generated sample trie')
  }

  const renderTrie = () => {
    const renderNode = (node, prefix = '', level = 0) => {
      const entries = Object.entries(node.children)
      if (entries.length === 0) return null

      return (
        <div className="ml-6 border-l-2 border-gray-700 pl-4">
          {entries.map(([char, childNode]) => {
            const currentWord = prefix + char
            const isWord = childNode.isEndOfWord
            const isHighlighted = searchResults.some(w => w.startsWith(currentWord))

            return (
              <div key={currentWord} className="my-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded ${
                  isHighlighted ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-[#2d3748]'
                }`}>
                  <span className="text-xl font-bold text-blue-400">{char}</span>
                  {isWord && (
                    <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                      {currentWord}
                    </span>
                  )}
                </div>
                {renderNode(childNode, currentWord, level + 1)}
              </div>
            )
          })}
        </div>
      )
    }

    return (
      <div className="p-4">
        <div className="text-lg font-bold text-gray-400 mb-4">ROOT</div>
        {renderNode(root)}
      </div>
    )
  }

  return (
    <SimulatorLayout title="Trie (Prefix Tree) Visualization">
      <div className="h-[calc(100vh-73px)] flex flex-col">
        <div className="bg-[#112240] border-b border-gray-700 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && insert()}
                placeholder="Enter word"
                className="px-3 py-1.5 bg-[#1a202c] text-white rounded border border-gray-600 focus:border-secondary focus:outline-none text-sm w-32"
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
                <FiSearch size={14} /> Search Prefix
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

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Words:</span>
                <span className="font-bold text-blue-400">{words.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Matches:</span>
                <span className="font-bold text-yellow-400">{searchResults.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 bg-[#0a192f] overflow-auto px-4 py-4">
            {words.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌲</div>
                  <p>Trie is empty</p>
                  <p className="text-sm mt-2">Insert words to build the trie!</p>
                </div>
              </div>
            ) : (
              renderTrie()
            )}
          </div>

          <div className="w-80 bg-[#112240] border-l border-gray-700 p-4 overflow-auto">
            <h3 className="font-bold mb-3">All Words ({words.length})</h3>
            <div className="space-y-1">
              {words.map(word => (
                <div
                  key={word}
                  className={`px-3 py-1 rounded text-sm ${
                    searchResults.includes(word)
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                      : 'bg-[#2d3748] text-gray-300'
                  }`}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        </div>

        {showInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
            <div className="bg-[#112240] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Trie Information</h3>
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
                  <h4 className="font-semibold mb-2">About Trie</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    A Trie (prefix tree) is a tree-like data structure for storing strings.
                    Each node represents a character, enabling efficient prefix-based searches.
                  </p>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p><strong>Insert:</strong> O(m) where m = word length</p>
                    <p><strong>Search:</strong> O(m)</p>
                    <p><strong>Prefix Search:</strong> O(p + n) where p = prefix length, n = results</p>
                    <p><strong>Space:</strong> O(ALPHABET_SIZE * N * M)</p>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    <strong>Use Cases:</strong> Autocomplete, spell checker, IP routing, dictionary
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

export default TrieSimulator
