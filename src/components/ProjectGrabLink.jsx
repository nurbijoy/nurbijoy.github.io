import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'

const ProjectGrabLink = ({ project }) => (
  <Link
    to="/release"
    aria-label={`Grab Now — ${project.title}`}
    className="flex items-center justify-center gap-2 mt-auto px-4 py-3 bg-secondary hover:bg-secondary/80 text-dark font-semibold rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
  >
    Grab Now <FiArrowRight aria-hidden="true" />
  </Link>
)

export default ProjectGrabLink
