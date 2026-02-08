import { Link } from 'react-router-dom'
import { FiArrowLeft, FiCode } from 'react-icons/fi'
import SimulatorLayout from './SimulatorLayout'

const ComingSoon = ({ title, description }) => {
  return (
    <SimulatorLayout title={title || 'Coming Soon'}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-8xl mb-8">🚧</div>
        
        <h2 className="text-3xl font-bold mb-4">
          {title || 'Simulator'} - Coming Soon!
        </h2>
        
        <p className="text-gray text-lg mb-8 max-w-2xl">
          {description || 'This simulator is currently under development. We\'re working hard to bring you an interactive visualization of this algorithm.'}
        </p>

        <div className="flex gap-4">
          <Link
            to="/simulators"
            className="flex items-center gap-2 px-6 py-3 bg-secondary text-dark rounded-lg hover:bg-secondary/90 transition-all font-medium"
          >
            <FiArrowLeft /> Back to Simulators
          </Link>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-[#2d3748] hover:bg-[#4a5568] text-white rounded-lg transition-all font-medium"
          >
            <FiCode /> View on GitHub
          </a>
        </div>

        <div className="mt-12 p-6 bg-[#112240] rounded-lg border-l-4 border-secondary max-w-2xl">
          <h3 className="text-xl font-bold mb-3">Want to Contribute?</h3>
          <p className="text-gray">
            This is an open-source project! If you'd like to help implement this simulator
            or suggest improvements, feel free to contribute on GitHub.
          </p>
        </div>
      </div>
    </SimulatorLayout>
  )
}

export default ComingSoon
