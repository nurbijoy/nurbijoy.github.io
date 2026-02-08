import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

const Contact = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const contactInfo = [
    {
      icon: <FiMail />,
      title: 'Email',
      value: 'nurmdbijoy@gmail.com',
      link: 'mailto:nurmdbijoy@gmail.com',
    },
    {
      icon: <FiPhone />,
      title: 'Phone',
      value: '+880 1878281850',
      link: 'tel:+8801878281850',
    },
    {
      icon: <FiMapPin />,
      title: 'Location',
      value: 'Dhaka, Bangladesh',
      link: '#',
    },
  ]

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-light mb-4">
            <span className="text-secondary">06.</span> Get In Touch
          </h2>
          <p className="text-gray mb-12 max-w-2xl mx-auto">
            I'm currently looking for new opportunities and my inbox is always open. 
            Whether you have a question or just want to say hi, I'll try my best to get back to you!
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {contactInfo.map((info, index) => (
              <motion.a
                key={info.title}
                href={info.link}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="bg-[#112240] p-6 rounded-lg hover:transform hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="text-4xl text-secondary mb-4 flex justify-center">
                  {info.icon}
                </div>
                <h3 className="text-light font-semibold mb-2">{info.title}</h3>
                <p className="text-gray text-sm group-hover:text-secondary transition-colors">
                  {info.value}
                </p>
              </motion.a>
            ))}
          </div>

          <motion.a
            href="mailto:nurmdbijoy@gmail.com"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="inline-block px-8 py-4 border-2 border-secondary text-secondary rounded-lg hover:bg-secondary/10 transition-all duration-300 text-lg font-semibold"
          >
            Say Hello
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact
