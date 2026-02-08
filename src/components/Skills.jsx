import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

const Skills = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const skills = [
    { name: 'Django / Django REST Framework', level: 90 },
    { name: 'React JS', level: 80 },
    { name: 'Python', level: 85 },
    { name: 'Database (SQL)', level: 75 },
    { name: 'HTML5 / CSS3', level: 90 },
    { name: 'Enterprise App Design', level: 85 },
    { name: 'AI / Machine Learning', level: 65 },
    { name: 'Spring Boot', level: 50 },
  ]

  return (
    <section id="skills" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-light mb-12">
            <span className="text-secondary">02.</span> Skills
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-light">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-secondary">{skill.level}%</span>
                </div>
                <div className="h-2 bg-dark rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${skill.level}%` } : {}}
                    transition={{ delay: index * 0.1 + 0.3, duration: 1 }}
                    className="h-full bg-secondary rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Skills
