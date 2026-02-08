import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

const About = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const technologiesCol1 = [
    'Django & Django REST Framework',
    'React with Vite',
    'SQLite, MySQL & PostgreSQL',
  ]

  const technologiesCol2 = [
    'HTML5, CSS3, Bootstrap',
    'JavaScript (ES6+)',
    'Python',
  ]

  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-light mb-12">
            <span className="text-secondary">01.</span> About Me
          </h2>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Image - Left side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="lg:col-span-4"
            >
              <div className="relative overflow-hidden rounded-lg shadow-2xl transition-transform duration-500 hover:scale-105">
                <img
                  src="https://nurbijoy.github.io/static/images/contest_image.jpg"
                  alt="About Me"
                  className="w-full rounded-lg"
                />
              </div>
            </motion.div>

            {/* Text - Right side */}
            <div className="lg:col-span-8 space-y-4 text-gray font-bold">
              <p className="leading-relaxed">
                Hey there! I'm Bijoy — a Software Engineer at Agrani Bank PLC, where I build 
                secure, scalable systems that power real-world banking operations. I'm passionate 
                about solving problems with clean code and thoughtful design.
              </p>
              <p className="leading-relaxed">
                My tech journey started in the world of backend development, and over time, I've 
                grown into full-stack web development with a strong focus on Django and React. 
                Lately, I've been working on enterprise-grade Document and Leave Management Systems, 
                aiming to bring modern solutions into traditional infrastructures.
              </p>
              <p className="leading-relaxed">
                I believe in writing code that's not just functional, but also maintainable and 
                future-proof — especially for mission-critical environments like banking. On weekends, 
                you'll find me sharpening my skills in AI/ML, exploring Flutter, or preparing for BCS 
                and other competitive exams.
              </p>
              <p className="text-gray leading-relaxed">
                Here are a few technologies I've been working with recently:
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <ul className="space-y-2 list-disc list-inside text-gray font-bold">
                  {technologiesCol1.map((tech, index) => (
                    <motion.li
                      key={tech}
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: index * 0.1 }}
                      className="leading-relaxed"
                    >
                      {tech}
                    </motion.li>
                  ))}
                </ul>
                <ul className="space-y-2 list-disc list-inside text-gray font-bold">
                  {technologiesCol2.map((tech, index) => (
                    <motion.li
                      key={tech}
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: (index + 3) * 0.1 }}
                      className="leading-relaxed"
                    >
                      {tech}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default About
