import { Link } from 'react-router-dom'
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi'

const ProjectGrabLink = ({ project }) => {
  const targetUrl = project.liveUrl || project.githubUrl

  if (targetUrl) {
    const isLive = Boolean(project.liveUrl)
    const label = isLive ? 'Visit App' : 'View on GitHub'

    return (
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label} — ${project.title}`}
        className="flex items-center justify-center gap-2 mt-auto px-4 py-3 bg-secondary hover:bg-secondary/80 text-dark font-semibold rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
      >
        {label} <FiArrowUpRight aria-hidden="true" className="text-lg" />
      </a>
    )
  }

  return (
    <Link
      to="/release"
      aria-label={`Grab Now — ${project.title}`}
      className="flex items-center justify-center gap-2 mt-auto px-4 py-3 bg-secondary hover:bg-secondary/80 text-dark font-semibold rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
    >
      Grab Now <FiArrowRight aria-hidden="true" />
    </Link>
  )
}

export default ProjectGrabLink
