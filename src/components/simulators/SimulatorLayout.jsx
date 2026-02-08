import { Link } from 'react-router-dom'
import { FiHome, FiArrowLeft } from 'react-icons/fi'

const SimulatorLayout = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-primary text-light">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-[#2d3748] hover:bg-[#4a5568] rounded-lg transition-colors"
          >
            <FiHome /> Home
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-center flex-1 mx-4">
            {title}
          </h1>

          <Link
            to="/simulators"
            className="flex items-center gap-2 px-4 py-2 bg-[#2d3748] hover:bg-[#4a5568] rounded-lg transition-colors"
          >
            <FiArrowLeft /> Back to Simulators
          </Link>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}

export default SimulatorLayout
