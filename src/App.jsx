import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SimulatorsPage from './pages/SimulatorsPage'
import GamesPage from './pages/GamesPage'
import BFSSimulator from './components/simulators/BFSSimulator'
import DFSSimulator from './components/simulators/DFSSimulator'
import AStarSimulator from './components/simulators/AStarSimulator'
import DijkstraSimulator from './components/simulators/DijkstraSimulator'
import QuickSortSimulator from './components/simulators/QuickSortSimulator'
import MergeSortSimulator from './components/simulators/MergeSortSimulator'
import BSTSimulator from './components/simulators/BSTSimulator'
import StackSimulator from './components/simulators/StackSimulator'
import QueueSimulator from './components/simulators/QueueSimulator'
import LinkedListSimulator from './components/simulators/LinkedListSimulator'
import MinHeapSimulator from './components/simulators/MinHeapSimulator'
import HashTableSimulator from './components/simulators/HashTableSimulator'
import AVLTreeSimulator from './components/simulators/AVLTreeSimulator'
import MaxHeapSimulator from './components/simulators/MaxHeapSimulator'
import TrieSimulator from './components/simulators/TrieSimulator'
import KruskalSimulator from './components/simulators/KruskalSimulator'
import TopologicalSortSimulator from './components/simulators/TopologicalSortSimulator'
import HeapSortSimulator from './components/simulators/HeapSortSimulator'
import GraphColoringSimulator from './components/simulators/GraphColoringSimulator'
import ConvexHullSimulator from './components/simulators/ConvexHullSimulator'
import SnakeGame from './components/games/SnakeGame'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/simulators" element={<SimulatorsPage />} />
        <Route path="/games" element={<GamesPage />} />
        
        {/* Implemented Simulators */}
        <Route path="/simulators/bfs" element={<BFSSimulator />} />
        <Route path="/simulators/dfs" element={<DFSSimulator />} />
        <Route path="/simulators/astar" element={<AStarSimulator />} />
        <Route path="/simulators/dijkstra" element={<DijkstraSimulator />} />
        <Route path="/simulators/quicksort" element={<QuickSortSimulator />} />
        <Route path="/simulators/mergesort" element={<MergeSortSimulator />} />
        <Route path="/simulators/bst" element={<BSTSimulator />} />
        <Route path="/simulators/stack" element={<StackSimulator />} />
        <Route path="/simulators/queue" element={<QueueSimulator />} />
        <Route path="/simulators/linkedlist" element={<LinkedListSimulator />} />
        <Route path="/simulators/minheap" element={<MinHeapSimulator />} />
        <Route path="/simulators/hashtable" element={<HashTableSimulator />} />
        <Route path="/simulators/avl" element={<AVLTreeSimulator />} />
        <Route path="/simulators/maxheap" element={<MaxHeapSimulator />} />
        <Route path="/simulators/trie" element={<TrieSimulator />} />
        <Route path="/simulators/kruskal" element={<KruskalSimulator />} />
        <Route path="/simulators/topological" element={<TopologicalSortSimulator />} />
        <Route path="/simulators/heapsort" element={<HeapSortSimulator />} />
        <Route path="/simulators/graphcoloring" element={<GraphColoringSimulator />} />
        <Route path="/simulators/convexhull" element={<ConvexHullSimulator />} />

        {/* Games */}
        <Route path="/games/snake" element={<SnakeGame />} />
      </Routes>
    </Router>
  )
}

export default App
