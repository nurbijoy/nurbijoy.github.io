import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { FiGithub, FiExternalLink, FiFolder } from 'react-icons/fi'

const Projects = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const projects = [
    {
      title: 'Document Management System',
      description: 'A full fledged DMS Solution to excel banking documentations with secure file handling and version control.',
      tags: ['Django', 'React JS', 'PostgreSQL'],
      github: '#',
      demo: '#',
    },
    {
      title: 'Leave Management System',
      description: 'A productivity application built to manage leaves at Agrani Bank PLC with automated approval workflows.',
      tags: ['React JS', 'Vite', 'PostgreSQL', 'Django'],
      github: '#',
      demo: '#',
    },
    {
      title: 'Agrani Chatbot',
      description: 'AI based chat application built for future customer service automation using NLP and machine learning.',
      tags: ['Machine Learning', 'AI', 'Django', 'React', 'Flask'],
      github: '#',
      demo: '#',
    },
  ]

  return (
    <section id="projects" className="py-20 bg-dark/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-light mb-12">
            <span className="text-secondary">03.</span> Featured Projects
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="bg-[#112240] rounded-lg p-6 hover:transform hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <FiFolder className="text-secondary text-4xl" />
                  <div className="flex space-x-3">
                    <a
                      href={project.github}
                      className="text-gray hover:text-secondary transition-colors"
                    >
                      <FiGithub className="text-xl" />
                    </a>
                    <a
                      href={project.demo}
                      className="text-gray hover:text-secondary transition-colors"
                    >
                      <FiExternalLink className="text-xl" />
                    </a>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-light mb-3 group-hover:text-secondary transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray mb-4 text-sm leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-secondary bg-dark px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Projects
