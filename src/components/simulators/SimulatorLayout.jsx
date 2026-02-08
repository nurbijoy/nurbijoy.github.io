import { Link } from 'react-router-dom'
import { FiHome, FiArrowLeft } from 'react-icons/fi'

const SimulatorLayout = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-primary text-light flex flex-col">
      {/* Header */}
      <div className="bg-[#112240] border-b border-gray-700">
        <div className="max-w-full px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-[#2d3748] hover:bg-[#4a5568] rounded-lg transition-colors text-sm"
            >
              <FiHome /> Home
            </Link>

            <h1 className="text-xl md:text-2xl font-bold text-center flex-1 mx-4">
              {title}
            </h1>

            <Link
              to="/simulators"
              className="flex items-center gap-2 px-4 py-2 bg-[#2d3748] hover:bg-[#4a5568] rounded-lg transition-colors text-sm"
            >
              <FiArrowLeft /> Back
            </Link>
          </div>
        </div>
      </div>

      {/* Content - Full width */}
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  )
}

export default SimulatorLayout
