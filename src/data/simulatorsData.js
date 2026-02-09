// Central data source for all simulators
// This makes it easy to add new simulators and keep data consistent

export const simulatorsData = {
  graphAlgorithms: {
    title: 'Graph Algorithms',
    simulators: [
      {
        id: 'astar',
        title: 'A* Search',
        description: 'Visualize the A* pathfinding algorithm with different heuristics and obstacle configurations.',
        tags: ['Pathfinding', 'Heuristics', 'Optimal Path'],
        emoji: '🎯',
        implemented: true
      },
      {
        id: 'bfs',
        title: 'Breadth-First Search',
        description: 'Explore level-order traversal and shortest path finding in unweighted graphs.',
        tags: ['Shortest Path', 'Queue', 'Level Order'],
        emoji: '🌊',
        implemented: true
      },
      {
        id: 'dfs',
        title: 'Depth-First Search',
        description: 'Understand recursive and iterative DFS implementations with visualization.',
        tags: ['Backtracking', 'Stack', 'Maze Solving'],
        emoji: '🔍',
        implemented: true
      }
    ]
  },
  
  dataStructures: {
    title: 'Data Structures',
    simulators: [
      {
        id: 'bst',
        title: 'Binary Search Tree',
        description: 'Visualize insertion, deletion, and traversal operations on a BST.',
        tags: ['Search', 'Traversal', 'Balancing'],
        emoji: '🌳',
        implemented: true
      },
      {
        id: 'avl',
        title: 'AVL Tree',
        description: 'Self-balancing BST with automatic rotations to maintain balance.',
        tags: ['Self-Balancing', 'Rotations', 'O(log n)'],
        emoji: '⚖️',
        implemented: true
      },
      {
        id: 'minheap',
        title: 'Min Heap',
        description: 'Understand heap operations including insert, extract-min, and heapify.',
        tags: ['Priority Queue', 'Heap Sort', 'Efficiency'],
        emoji: '⬇️',
        implemented: true
      },
      {
        id: 'maxheap',
        title: 'Max Heap',
        description: 'Visualize max heap operations with extract-max and heapify-up/down.',
        tags: ['Priority Queue', 'Max Element', 'O(log n)'],
        emoji: '⬆️',
        implemented: true
      },
      {
        id: 'linkedlist',
        title: 'Linked List',
        description: 'Visualize node insertion, deletion, and traversal in linked lists.',
        tags: ['Pointers', 'Dynamic', 'Operations'],
        emoji: '🔗',
        implemented: true
      },
      {
        id: 'stack',
        title: 'Stack',
        description: 'Understand LIFO (Last In First Out) operations with push, pop, and peek.',
        tags: ['LIFO', 'Push/Pop', 'Recursion'],
        emoji: '📚',
        implemented: true
      },
      {
        id: 'queue',
        title: 'Queue',
        description: 'Visualize FIFO (First In First Out) operations with enqueue and dequeue.',
        tags: ['FIFO', 'Enqueue/Dequeue', 'BFS'],
        emoji: '🚶',
        implemented: true
      },
      {
        id: 'hashtable',
        title: 'Hash Table',
        description: 'Understand hashing, collision resolution, and chaining techniques.',
        tags: ['Hashing', 'Chaining', 'O(1)'],
        emoji: '#️⃣',
        implemented: true
      },
      {
        id: 'trie',
        title: 'Trie (Prefix Tree)',
        description: 'Visualize prefix-based search and autocomplete functionality.',
        tags: ['Prefix Search', 'Autocomplete', 'Dictionary'],
        emoji: '📖',
        implemented: true
      }
    ]
  },
  
  advancedGraphAlgorithms: {
    title: 'Advanced Graph Algorithms',
    simulators: [
      {
        id: 'dijkstra',
        title: "Dijkstra's Algorithm",
        description: 'Find shortest paths in weighted graphs using Dijkstra\'s algorithm.',
        tags: ['Shortest Path', 'Weighted Graph', 'Greedy'],
        emoji: '🗺️',
        implemented: true
      },
      {
        id: 'kruskal',
        title: "Kruskal's MST",
        description: 'Find minimum spanning tree using Kruskal\'s algorithm with Union-Find.',
        tags: ['MST', 'Union-Find', 'Greedy'],
        emoji: '🌲',
        implemented: true
      },
      {
        id: 'graphcoloring',
        title: 'Graph Coloring',
        description: 'Visualize greedy graph coloring algorithm and chromatic number.',
        tags: ['Coloring', 'Greedy', 'NP-Complete'],
        emoji: '🎨',
        implemented: true
      },
      {
        id: 'topological',
        title: 'Topological Sort',
        description: 'Visualize topological ordering of directed acyclic graphs (DAG).',
        tags: ['DAG', 'DFS', 'Ordering'],
        emoji: '📊',
        implemented: true
      }
    ]
  },
  
  sortingAlgorithms: {
    title: 'Sorting Algorithms',
    simulators: [
      {
        id: 'quicksort',
        title: 'Quick Sort',
        description: 'Visualize the divide-and-conquer approach of this efficient sorting algorithm.',
        tags: ['Divide & Conquer', 'Pivot', 'O(n log n)'],
        emoji: '⚡',
        implemented: true
      },
      {
        id: 'mergesort',
        title: 'Merge Sort',
        description: 'Understand the merging process of sorted subarrays in this stable sort.',
        tags: ['Divide & Conquer', 'Stable', 'O(n log n)'],
        emoji: '🔀',
        implemented: true
      },
      {
        id: 'heapsort',
        title: 'Heap Sort',
        description: 'Visualize how a heap data structure can be used for efficient sorting.',
        tags: ['In-place', 'Heap', 'O(n log n)'],
        emoji: '📈',
        implemented: true
      }
    ]
  },
  
  computationalGeometry: {
    title: 'Computational Geometry',
    simulators: [
      {
        id: 'convexhull',
        title: 'Convex Hull',
        description: 'Visualize Graham\'s scan or Jarvis march algorithms for convex hull.',
        tags: ['Geometry', 'Graham\'s Scan', 'Jarvis March'],
        emoji: '🔺',
        implemented: true
      }
    ]
  }
}

// Helper function to get all simulators as a flat array
export const getAllSimulators = () => {
  return Object.values(simulatorsData).flatMap(category => 
    category.simulators.map(sim => ({
      ...sim,
      category: category.title
    }))
  )
}

// Helper function to get implemented simulators
export const getImplementedSimulators = () => {
  return getAllSimulators().filter(sim => sim.implemented)
}

// Helper function to get simulator by id
export const getSimulatorById = (id) => {
  return getAllSimulators().find(sim => sim.id === id)
}

// Helper function to get simulators by category
export const getSimulatorsByCategory = (categoryKey) => {
  return simulatorsData[categoryKey]?.simulators || []
}
