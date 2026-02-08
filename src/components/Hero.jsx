import { motion } from 'framer-motion'
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center relative overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-secondary text-lg mb-4"
            >
              Hi, my name is
            </motion.p>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-light mb-4"
            >
              Nur Mohammad Bijoy.
            </motion.h1>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray mb-6"
            >
              I build things for the future
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray max-w-xl mb-8 leading-relaxed"
            >
              I'm a full-stack developer specializing in building exceptional digital experiences. 
              Currently focused on creating accessible, human-centered products at{' '}
              <span className="text-secondary">Agrani Bank PLC</span>.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href="#projects"
                className="px-8 py-3 border border-secondary text-secondary rounded-lg hover:bg-secondary/10 transition-all duration-300 hover:-translate-y-1"
              >
                View My Work
              </a>
              
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/nurbijoy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light hover:text-secondary transition-colors text-2xl"
                >
                  <FiGithub />
                </a>
                <a
                  href="https://linkedin.com/in/nurbijoy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light hover:text-secondary transition-colors text-2xl"
                >
                  <FiLinkedin />
                </a>
                <a
                  href="mailto:nurmdbijoy@gmail.com"
                  className="text-light hover:text-secondary transition-colors text-2xl"
                >
                  <FiMail />
                </a>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="hidden md:flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
              <motion.div
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative w-80 h-80 lg:w-96 lg:h-96 xl:w-[450px] xl:h-[450px] rounded-full border-4 border-secondary overflow-hidden shadow-2xl"
              >
                <img
                  src="/profile.jpg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
