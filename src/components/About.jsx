import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

const About = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const technologiesCol1 = [
    'Django & Django REST Framework',
    'React with Vite',
    'Information Security & Cryptography',
    'SQLite, MySQL & PostgreSQL',
  ]

  const technologiesCol2 = [
    'Python',
    'Network & Application Security',
    'JavaScript (ES6+)',
    'HTML5, CSS3, Tailwind CSS',
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
                  src="/profile.jpg"
                  alt="About Me"
                  className="w-full rounded-lg"
                />
              </div>
            </motion.div>

            {/* Text - Right side */}
            <div className="lg:col-span-8 space-y-4 text-gray font-bold">
              <p className="leading-relaxed">
                Hey there! I'm Bijoy — a Software Engineer at Agrani Bank PLC and currently pursuing 
                my <span className="text-secondary font-semibold">M.Sc. Engg in Information Security (InfoSec)</span> at{' '}
                <span className="text-secondary font-semibold">Bangladesh University of Engineering and Technology (BUET)</span>. 
                I build secure, scalable systems that power real-world operations, bridging robust backend architecture 
                with modern cybersecurity principles.
              </p>
              <p className="leading-relaxed">
                My tech journey started in backend engineering, evolving into full-stack development with a strong focus 
                on Python, Django, and React. My projects include IBA Coach for admission preparation, LitePDF for reading PDFs, 
                and XeonExplorer for managing files on Android.
              </p>
              <p className="leading-relaxed">
                I believe in writing code that's not just functional, but also resilient, maintainable, and secure by design — 
                especially for mission-critical banking environments. Alongside my software development work, my academic pursuits 
                revolve around information security, cryptography, and defensive system architecture.
              </p>

              {/* Education Highlight Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-dark/70 border border-secondary/30 backdrop-blur-sm relative overflow-hidden group hover:border-secondary/60 transition-all duration-300 my-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-secondary/10 text-secondary text-2xl flex-shrink-0">
                    🎓
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/40">
                        Currently Pursuing
                      </span>
                      <span className="text-xs text-secondary font-mono">Postgraduate</span>
                    </div>
                    <h3 className="text-light font-bold text-lg mt-1.5">
                      M.Sc. Engg in Information Security (InfoSec)
                    </h3>
                    <p className="text-gray text-sm mt-0.5 font-normal">
                      Bangladesh University of Engineering and Technology (BUET)
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray leading-relaxed pt-2">
                Here are a few technologies and domains I've been working with recently:
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
