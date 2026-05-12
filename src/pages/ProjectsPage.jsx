import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiGithub, FiExternalLink } from 'react-icons/fi'
import { projectsData, categories } from '../data/projectsData'

const ProjectsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredProjects = selectedCategory === 'All'
    ? projectsData
    : projectsData.filter(project => project.category === selectedCategory)

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
          
          <h1 className="text-2xl font-bold text-light">💼 My Projects</h1>
          
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
            A collection of web applications and software solutions I've built.
            From enterprise systems to personal projects, each showcases different technologies and problem-solving approaches.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-lg transition-all font-semibold ${
                selectedCategory === category
                  ? 'bg-secondary text-dark'
                  : 'bg-[#112240] text-gray hover:bg-[#1e3a5f] hover:text-light'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#112240] rounded-xl overflow-hidden hover:transform hover:-translate-y-2 transition-all duration-300 group"
            >
              {/* Project Image/Icon */}
              <div className="h-56 bg-gradient-to-br from-secondary/20 to-purple-500/20 flex items-center justify-center relative overflow-hidden">
                <div className="text-8xl group-hover:scale-110 transition-transform duration-300">
                  {project.emoji || '💼'}
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-light mb-3 group-hover:text-secondary transition-colors">
                  {project.title}
                </h3>
                
                <p className="text-gray mb-4 leading-relaxed">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-secondary bg-dark px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-[#1e3a5f] hover:bg-[#2a4a7f] text-light font-semibold rounded-lg transition-all"
                  >
                    <FiGithub /> Code
                  </a>
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-secondary hover:bg-secondary/80 text-dark font-semibold rounded-lg transition-all"
                  >
                    <FiExternalLink /> Demo
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray text-lg">No projects found in this category.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default ProjectsPage
