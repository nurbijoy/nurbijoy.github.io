import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SimulatorsPage from './pages/SimulatorsPage'
import BFSSimulator from './components/simulators/BFSSimulator'
import DijkstraSimulator from './components/simulators/DijkstraSimulator'
import QuickSortSimulator from './components/simulators/QuickSortSimulator'
import BSTSimulator from './components/simulators/BSTSimulator'
import ComingSoon from './components/simulators/ComingSoon'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/simulators" element={<SimulatorsPage />} />
        
        {/* Implemented Simulators */}
        <Route path="/simulators/bfs" element={<BFSSimulator />} />
        <Route path="/simulators/dijkstra" element={<DijkstraSimulator />} />
        <Route path="/simulators/quicksort" element={<QuickSortSimulator />} />
        <Route path="/simulators/bst" element={<BSTSimulator />} />
        
        {/* Coming Soon Simulators */}
        <Route path="/simulators/astar" element={<ComingSoon title="A* Search" />} />
        <Route path="/simulators/dfs" element={<ComingSoon title="Depth-First Search" />} />
        <Route path="/simulators/avl" element={<ComingSoon title="AVL Tree" />} />
        <Route path="/simulators/minheap" element={<ComingSoon title="Min Heap" />} />
        <Route path="/simulators/maxheap" element={<ComingSoon title="Max Heap" />} />
        <Route path="/simulators/linkedlist" element={<ComingSoon title="Linked List" />} />
        <Route path="/simulators/stack" element={<ComingSoon title="Stack" />} />
        <Route path="/simulators/queue" element={<ComingSoon title="Queue" />} />
        <Route path="/simulators/hashtable" element={<ComingSoon title="Hash Table" />} />
        <Route path="/simulators/trie" element={<ComingSoon title="Trie" />} />
        <Route path="/simulators/kruskal" element={<ComingSoon title="Kruskal's MST" />} />
        <Route path="/simulators/graphcoloring" element={<ComingSoon title="Graph Coloring" />} />
        <Route path="/simulators/topological" element={<ComingSoon title="Topological Sort" />} />
        <Route path="/simulators/mergesort" element={<ComingSoon title="Merge Sort" />} />
        <Route path="/simulators/heapsort" element={<ComingSoon title="Heap Sort" />} />
        <Route path="/simulators/convexhull" element={<ComingSoon title="Convex Hull" />} />
      </Routes>
    </Router>
  )
}

export default App
