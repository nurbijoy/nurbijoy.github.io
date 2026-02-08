import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { FiExternalLink } from 'react-icons/fi'

const Simulators = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const simulators = [
    {
      title: 'A* Search',
      description: 'Visualize the A* pathfinding algorithm with different heuristics.',
      tags: ['Pathfinding', 'Heuristics', 'Optimal Path'],
      link: 'reference/simulators/astar.html',
    },
    {
      title: 'Binary Search Tree',
      description: 'Visualize insertion, deletion, and traversal operations on a BST.',
      tags: ['Search', 'Traversal', 'Balancing'],
      link: 'reference/simulators/bst.html',
    },
    {
      title: 'QuickSort',
      description: 'Dynamic visualization of the QuickSort algorithm with pivot animations.',
      tags: ['Divide & Conquer', 'Pivot', 'O(n log n)'],
      link: 'reference/simulators/quicksort.html',
    },
    {
      title: 'Min Heap',
      description: 'Visual min-heap operations like insert and extract-min.',
      tags: ['Priority Queue', 'Heap Sort', 'Efficiency'],
      link: 'reference/simulators/minheap.html',
    },
    {
      title: 'Dijkstra\'s Algorithm',
      description: 'Find shortest paths in weighted graphs using Dijkstra\'s algorithm.',
      tags: ['Shortest Path', 'Weighted Graph', 'Greedy'],
      link: 'reference/simulators/dijkstra.html',
    },
    {
      title: 'Merge Sort',
      description: 'Step-by-step merge sort breakdown with splitting and merging.',
      tags: ['Divide & Conquer', 'Stable', 'O(n log n)'],
      link: 'reference/simulators/mergesort.html',
    },
  ]

  return (
    <section id="simulators" className="py-20 bg-dark/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-light mb-4">
            <span className="text-secondary">05.</span> Algorithm Simulators
          </h2>
          <p className="text-gray mb-12 max-w-2xl">
            Interactive visualizations of fundamental algorithms and data structures. 
            Learn through visualization and step-by-step execution.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulators.map((simulator, index) => (
              <motion.div
                key={simulator.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.1 }}
                className="bg-[#112240] rounded-lg overflow-hidden hover:transform hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <div className="text-6xl">📊</div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-light group-hover:text-secondary transition-colors">
                      {simulator.title}
                    </h3>
                    <a
                      href={simulator.link}
                      className="text-gray hover:text-secondary transition-colors"
                    >
                      <FiExternalLink className="text-xl" />
                    </a>
                  </div>
                  
                  <p className="text-gray mb-4 text-sm leading-relaxed">
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
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="reference/simulators.html"
              className="inline-block px-8 py-3 border border-secondary text-secondary rounded-lg hover:bg-secondary/10 transition-all duration-300"
            >
              View All Simulators
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Simulators
