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
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
        implemented: false
      },
      {
        id: 'bfs',
        title: 'Breadth-First Search',
        description: 'Explore level-order traversal and shortest path finding in unweighted graphs.',
        tags: ['Shortest Path', 'Queue', 'Level Order'],
        image: 'https://i.gifer.com/LqRY.gif',
        implemented: true
      },
      {
        id: 'dfs',
        title: 'Depth-First Search',
        description: 'Understand recursive and iterative DFS implementations with visualization.',
        tags: ['Backtracking', 'Stack', 'Maze Solving'],
        image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&h=200&fit=crop',
        implemented: false
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
        image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=200&fit=crop',
        implemented: true
      },
      {
        id: 'avl',
        title: 'AVL Tree',
        description: 'Self-balancing BST with automatic rotations to maintain balance.',
        tags: ['Self-Balancing', 'Rotations', 'O(log n)'],
        image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=200&fit=crop',
        implemented: false
      },
      {
        id: 'minheap',
        title: 'Min Heap',
        description: 'Understand heap operations including insert, extract-min, and heapify.',
        tags: ['Priority Queue', 'Heap Sort', 'Efficiency'],
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=200&fit=crop',
        implemented: false
      },
      {
        id: 'maxheap',
        title: 'Max Heap',
        description: 'Visualize max heap operations with extract-max and heapify-up/down.',
        tags: ['Priority Queue', 'Max Element', 'O(log n)'],
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
        implemented: false
      },
      {
        id: 'linkedlist',
        title: 'Linked List',
        description: 'Visualize node insertion, deletion, and traversal in linked lists.',
        tags: ['Pointers', 'Dynamic', 'Operations'],
        image: 'https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6?w=400&h=200&fit=crop',
        implemented: false
      },
      {
        id: 'stack',
        title: 'Stack',
        description: 'Understand LIFO (Last In First Out) operations with push, pop, and peek.',
        tags: ['LIFO', 'Push/Pop', 'Recursion'],
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
        implemented: false
      },
      {
        id: 'queue',
        title: 'Queue',
        description: 'Visualize FIFO (First In First Out) operations with enqueue and dequeue.',
        tags: ['FIFO', 'Enqueue/Dequeue', 'BFS'],
        image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=200&fit=crop',
        implemented: false
      },
      {
        id: 'hashtable',
        title: 'Hash Table',
        description: 'Understand hashing, collision resolution, and chaining techniques.',
        tags: ['Hashing', 'Chaining', 'O(1)'],
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop',
        implemented: false
      },
      {
        id: 'trie',
        title: 'Trie (Prefix Tree)',
        description: 'Visualize prefix-based search and autocomplete functionality.',
        tags: ['Prefix Search', 'Autocomplete', 'Dictionary'],
        image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=200&fit=crop',
        implemented: false
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
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=200&fit=crop',
        implemented: true
      },
      {
        id: 'kruskal',
        title: "Kruskal's MST",
        description: 'Find minimum spanning tree using Kruskal\'s algorithm with Union-Find.',
        tags: ['MST', 'Union-Find', 'Greedy'],
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop',
        implemented: false
      },
      {
        id: 'graphcoloring',
        title: 'Graph Coloring',
        description: 'Visualize greedy graph coloring algorithm and chromatic number.',
        tags: ['Coloring', 'Greedy', 'NP-Complete'],
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop',
        implemented: false
      },
      {
        id: 'topological',
        title: 'Topological Sort',
        description: 'Visualize topological ordering of directed acyclic graphs (DAG).',
        tags: ['DAG', 'DFS', 'Ordering'],
        image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=200&fit=crop',
        implemented: false
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
        image: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=400&h=200&fit=crop',
        implemented: true
      },
      {
        id: 'mergesort',
        title: 'Merge Sort',
        description: 'Understand the merging process of sorted subarrays in this stable sort.',
        tags: ['Divide & Conquer', 'Stable', 'O(n log n)'],
        image: 'https://miro.medium.com/v2/resize:fit:1400/1*g-socXIlMx2ZqjMYESf_0Q.png',
        implemented: false
      },
      {
        id: 'heapsort',
        title: 'Heap Sort',
        description: 'Visualize how a heap data structure can be used for efficient sorting.',
        tags: ['In-place', 'Heap', 'O(n log n)'],
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=200&fit=crop',
        implemented: false
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
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=200&fit=crop',
        implemented: false
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
