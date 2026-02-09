import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiPlay } from 'react-icons/fi'
import { simulatorsData } from '../data/simulatorsData'

const SimulatorsPage = () => {
  const categories = Object.entries(simulatorsData).map(([key, value]) => ({
    key,
    ...value
  }))

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-[#112240] border-b border-gray/20 px-6 py-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] hover:bg-[#2a4a7f] text-light rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-lg" />
            <span>Back to Home</span>
          </Link>
          
          <h1 className="text-2xl font-bold text-light">📊 Algorithm Simulators</h1>
          
          <div className="w-32"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="text-gray text-lg max-w-3xl mx-auto">
            Interactive visualizations of fundamental algorithms and data structures.
            Learn through visualization and step-by-step execution.
          </p>
        </motion.div>

        {/* Simulators by Category */}
        {categories.map((category, categoryIndex) => (
          <section key={category.key} className="mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-8 pb-4 border-b-2 border-gray/20 relative text-light">
                {category.title}
                <span className="absolute bottom-0 left-0 w-24 h-0.5 bg-secondary"></span>
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.simulators.map((simulator, index) => (
                  <motion.div
                    key={simulator.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#112240] rounded-xl overflow-hidden hover:transform hover:-translate-y-2 transition-all duration-300 group"
                  >
                    <div className="h-56 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center relative overflow-hidden">
                      <div className="text-8xl group-hover:scale-110 transition-transform duration-300">
                        {simulator.emoji || '📊'}
                      </div>
                      {!simulator.implemented && (
                        <div className="absolute top-4 right-4 bg-warning text-dark px-3 py-1 rounded-full text-xs font-semibold">
                          Coming Soon
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-light mb-3 group-hover:text-secondary transition-colors">
                        {simulator.title}
                      </h3>
                      
                      <p className="text-gray mb-4 leading-relaxed">
                        {simulator.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {simulator.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs text-secondary bg-dark px-3 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {simulator.implemented ? (
                        <Link
                          to={`/simulators/${simulator.id}`}
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-secondary hover:bg-secondary/80 text-dark font-semibold rounded-lg transition-all"
                        >
                          <FiPlay /> Simulate
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray/20 text-gray cursor-not-allowed rounded-lg"
                        >
                          Coming Soon
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        ))}
      </main>
    </div>
  )
}

export default SimulatorsPage
