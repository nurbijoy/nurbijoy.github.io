import { Link, useNavigate } from 'react-router-dom'
import { FiHome, FiArrowLeft } from 'react-icons/fi'

const GameLayout = ({ title, children, leftPanel, rightPanel }) => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/games')
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Header */}
      <header className="bg-[#112240] border-b border-gray/20 px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 bg-[#1e3a5f] hover:bg-[#2a4a7f] text-light rounded-lg transition-colors text-sm"
          >
            <FiHome className="text-lg" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          
          <h1 className="text-lg sm:text-2xl font-bold text-light">{title}</h1>
          
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 bg-[#1e3a5f] hover:bg-[#2a4a7f] text-light rounded-lg transition-colors text-sm"
          >
            <FiArrowLeft className="text-lg" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        {/* Left Panel */}
        {leftPanel && (
          <div className="w-full lg:w-64 flex flex-col gap-4 order-2 lg:order-1">
            {leftPanel}
          </div>
        )}

        {/* Game Canvas */}
        <div className="flex-1 flex items-center justify-center bg-[#112240] rounded-lg border-2 border-secondary/30 p-4 order-1 lg:order-2">
          {children}
        </div>

        {/* Right Panel */}
        {rightPanel && (
          <div className="w-full lg:w-64 flex flex-col gap-4 order-3">
            {rightPanel}
          </div>
        )}
      </div>
    </div>
  )
}

export default GameLayout
