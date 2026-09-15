import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { FiArrowLeft, FiArrowUpRight, FiPackage } from 'react-icons/fi'

const ReleasePage = () => {
  const reduceMotion = useReducedMotion()

  return (
    <main className="min-h-screen bg-dark flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <motion.div
        aria-hidden="true"
        className="absolute w-80 h-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none"
        animate={reduceMotion ? {} : { scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-2xl w-full text-center bg-[#112240] border border-secondary/20 rounded-3xl px-6 sm:px-12 py-12 shadow-2xl"
      >
        <motion.div
          aria-hidden="true"
          animate={reduceMotion ? {} : { y: [0, -10, 0], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-8 w-24 h-24 flex items-center justify-center rounded-3xl bg-secondary/10 text-secondary"
        >
          <FiPackage className="text-5xl" />
        </motion.div>
        <p className="text-secondary text-sm font-semibold tracking-widest uppercase mb-4">Coming soon</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-light mb-6">Wait for release</h1>
        <p className="text-gray text-lg leading-relaxed mb-4">
          IBA Coach, LitePDF, and XeonExplorer are waiting for their public release.
          Download and access links will be available here when they launch.
        </p>
        <p className="text-gray leading-relaxed mb-10">Thanks for your interest. Check back for release updates—and more projects to come.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/projects" className="inline-flex justify-center items-center gap-2 px-6 py-3 bg-secondary text-dark font-semibold rounded-lg hover:bg-secondary/80 transition-colors">
            <FiArrowLeft aria-hidden="true" /> Explore Projects
          </Link>
          <Link to="/" className="inline-flex justify-center items-center gap-2 px-6 py-3 border border-secondary/40 text-secondary rounded-lg hover:bg-secondary/10 transition-colors">
            Back to Home <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </motion.div>
    </main>
  )
}

export default ReleasePage
