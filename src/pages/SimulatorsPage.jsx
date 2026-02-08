import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiExternalLink } from 'react-icons/fi'

const SimulatorsPage = () => {
  const categories = [
    {
      title: 'Graph Algorithms',
      simulators: [
        {
          id: 'astar',
          title: 'A* Search',
          description: 'Visualize the A* pathfinding algorithm with different heuristics and obstacle configurations.',
          tags: ['Pathfinding', 'Heuristics', 'Optimal Path'],
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop'
        },
        {
          id: 'bfs',
          title: 'Breadth-First Search',
          description: 'Explore level-order traversal and shortest path finding in unweighted graphs.',
          tags: ['Shortest Path', 'Queue', 'Level Order'],
          image: 'https://i.gifer.com/LqRY.gif'
        },
        {
          id: 'dfs',
          title: 'Depth-First Search',
          description: 'Understand recursive and iterative DFS implementations with visualization.',
          tags: ['Backtracking', 'Stack', 'Maze Solving'],
          image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&h=200&fit=crop'
        }
      ]
    },
    {
      title: 'Data Structures',
      simulators: [
        {
          id: 'bst',
          title: 'Binary Search Tree',
          description: 'Visualize insertion, deletion, and traversal operations on a BST.',
          tags: ['Search', 'Traversal', 'Balancing'],
          image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=200&fit=crop'
        },
        {
          id: 'avl',
          title: 'AVL Tree',
          description: 'Self-balancing BST with automatic rotations to maintain balance.',
          tags: ['Self-Balancing', 'Rotations', 'O(log n)'],
          image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=200&fit=crop'
        },
        {
          id: 'minheap',
          title: 'Min Heap',
          description: 'Understand heap operations including insert, extract-min, and heapify.',
          tags: ['Priority Queue', 'Heap Sort', 'Efficiency'],
          image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=200&fit=crop'
        },
        {
          id: 'maxheap',
          title: 'Max Heap',
          description: 'Visualize max heap operations with extract-max and heapify-up/down.',
          tags: ['Priority Queue', 'Max Element', 'O(log n)'],
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop'
        },
        {
          id: 'linkedlist',
          title: 'Linked List',
          description: 'Visualize node insertion, deletion, and traversal in linked lists.',
          tags: ['Pointers', 'Dynamic', 'Operations'],
          image: 'https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6?w=400&h=200&fit=crop'
        },
        {
          id: 'stack',
          title: 'Stack',
          description: 'Understand LIFO (Last In First Out) operations with push, pop, and peek.',
          tags: ['LIFO', 'Push/Pop', 'Recursion'],
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop'
        },
        {
          id: 'queue',
          title: 'Queue',
          description: 'Visualize FIFO (First In First Out) operations with enqueue and dequeue.',
          tags: ['FIFO', 'Enqueue/Dequeue', 'BFS'],
          image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=200&fit=crop'
        },
        {
          id: 'hashtable',
          title: 'Hash Table',
          description: 'Understand hashing, collision resolution, and chaining techniques.',
          tags: ['Hashing', 'Chaining', 'O(1)'],
          image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop'
        },
        {
          id: 'trie',
          title: 'Trie (Prefix Tree)',
          description: 'Visualize prefix-based search and autocomplete functionality.',
          tags: ['Prefix Search', 'Autocomplete', 'Dictionary'],
          image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=200&fit=crop'
        }
      ]
    },
    {
      title: 'Advanced Graph Algorithms',
      simulators: [
        {
          id: 'dijkstra',
          title: "Dijkstra's Algorithm",
          description: 'Find shortest paths in weighted graphs using Dijkstra\'s algorithm.',
          tags: ['Shortest Path', 'Weighted Graph', 'Greedy'],
          image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=200&fit=crop'
        },
        {
          id: 'kruskal',
          title: "Kruskal's MST",
          description: 'Find minimum spanning tree using Kruskal\'s algorithm with Union-Find.',
          tags: ['MST', 'Union-Find', 'Greedy'],
          image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop'
        },
        {
          id: 'graphcoloring',
          title: 'Graph Coloring',
          description: 'Visualize greedy graph coloring algorithm and chromatic number.',
          tags: ['Coloring', 'Greedy', 'NP-Complete'],
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop'
        },
        {
          id: 'topological',
          title: 'Topological Sort',
          description: 'Visualize topological ordering of directed acyclic graphs (DAG).',
          tags: ['DAG', 'DFS', 'Ordering'],
          image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=200&fit=crop'
        }
      ]
    },
    {
      title: 'Sorting Algorithms',
      simulators: [
        {
          id: 'quicksort',
          title: 'Quick Sort',
          description: 'Visualize the divide-and-conquer approach of this efficient sorting algorithm.',
          tags: ['Divide & Conquer', 'Pivot', 'O(n log n)'],
          image: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=400&h=200&fit=crop'
        },
        {
          id: 'mergesort',
          title: 'Merge Sort',
          description: 'Understand the merging process of sorted subarrays in this stable sort.',
          tags: ['Divide & Conquer', 'Stable', 'O(n log n)'],
          image: 'https://miro.medium.com/v2/resize:fit:1400/1*g-socXIlMx2ZqjMYESf_0Q.png'
        },
        {
          id: 'heapsort',
          title: 'Heap Sort',
          description: 'Visualize how a heap data structure can be used for efficient sorting.',
          tags: ['In-place', 'Heap', 'O(n log n)'],
          image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=200&fit=crop'
        }
      ]
    },
    {
      title: 'Computational Geometry',
      simulators: [
        {
          id: 'convexhull',
          title: 'Convex Hull',
          description: 'Visualize Graham\'s scan or Jarvis march algorithms for convex hull.',
          tags: ['Geometry', 'Graham\'s Scan', 'Jarvis March'],
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=200&fit=crop'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-primary text-light">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-dark/50 to-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray hover:text-secondary transition-colors mb-8"
          >
            <FiArrowLeft /> Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Algorithm Simulators
            </h1>
            <p className="text-xl text-gray mb-8">
              Interactive visualizations of fundamental algorithms and data structures
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#112240] rounded-lg p-8 border-l-4 border-secondary">
            <h2 className="text-2xl font-bold mb-4">Learn Through Visualization</h2>
            <p className="text-gray mb-4">
              These interactive simulators help you understand how algorithms and data structures
              work by visualizing each step of the process. Click on any simulator to start exploring!
            </p>
            <p className="text-gray">
              All simulators are built with React and modern web technologies for optimal performance.
            </p>
          </div>
        </div>
      </section>

      {/* Simulators by Category */}
      {categories.map((category, categoryIndex) => (
        <section key={category.title} className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-8 pb-4 border-b-2 border-gray/20 relative">
                {category.title}
                <span className="absolute bottom-0 left-0 w-24 h-0.5 bg-secondary"></span>
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.simulators.map((simulator, index) => (
                  <motion.div
                    key={simulator.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={`/simulators/${simulator.id}`}
                      className="block bg-[#112240] rounded-lg overflow-hidden hover:transform hover:-translate-y-2 transition-all duration-300 group h-full"
                    >
                      <div className="h-48 overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                        <img
                          src={simulator.image}
                          alt={simulator.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-6xl">📊</div>'
                          }}
                        />
                      </div>

                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold group-hover:text-secondary transition-colors">
                            {simulator.title}
                          </h3>
                          <FiExternalLink className="text-xl text-gray group-hover:text-secondary transition-colors flex-shrink-0 ml-2" />
                        </div>

                        <p className="text-gray text-sm mb-4 leading-relaxed">
                          {simulator.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {simulator.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs text-secondary bg-dark px-3 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      {/* Footer CTA */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-4">More Simulators Coming Soon!</h3>
          <p className="text-gray mb-2">
            I'm continuously working on adding new algorithm visualizations.
          </p>
          <p className="text-gray">
            Have a suggestion?{' '}
            <Link to="/#contact" className="text-secondary hover:underline">
              Contact me
            </Link>{' '}
            with your ideas!
          </p>
        </div>
      </section>
    </div>
  )
}

export default SimulatorsPage
