import { Link, useNavigate } from 'react-router-dom'
import { FiHome, FiArrowLeft } from 'react-icons/fi'

const GameLayout = ({ title, children, leftPanel, rightPanel }) => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/games')
  }

  return (
    <div className="h-screen bg-dark flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#112240] border-b border-gray/20 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] hover:bg-[#2a4a7f] text-light rounded-lg transition-colors"
          >
            <FiHome className="text-lg" />
            <span>Home</span>
          </Link>
          
          <h1 className="text-2xl font-bold text-light">{title}</h1>
          
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] hover:bg-[#2a4a7f] text-light rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-lg" />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden min-h-0">
        {/* Left Panel */}
        {leftPanel && (
          <div className="w-64 flex flex-col gap-4 overflow-y-auto flex-shrink-0">
            {leftPanel}
          </div>
        )}

        {/* Game Canvas */}
        <div className="flex-1 flex items-center justify-center bg-[#112240] rounded-lg border-2 border-secondary/30 overflow-hidden">
          {children}
        </div>

        {/* Right Panel */}
        {rightPanel && (
          <div className="w-64 flex flex-col gap-4 overflow-y-auto flex-shrink-0">
            {rightPanel}
          </div>
        )}
      </div>
    </div>
  )
}

export default GameLayout
