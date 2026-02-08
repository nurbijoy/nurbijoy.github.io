import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-8 border-t border-gray/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-6">
            <a
              href="https://github.com/nurbijoy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray hover:text-secondary transition-colors text-2xl"
            >
              <FiGithub />
            </a>
            <a
              href="https://linkedin.com/in/nurbijoy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray hover:text-secondary transition-colors text-2xl"
            >
              <FiLinkedin />
            </a>
            <a
              href="mailto:nurmdbijoy@gmail.com"
              className="text-gray hover:text-secondary transition-colors text-2xl"
            >
              <FiMail />
            </a>
          </div>
          
          <div className="text-center text-gray text-sm">
            <p>Designed & Built by Nur Mohammad Bijoy</p>
            <p className="text-secondary">© {currentYear} All Rights Reserved</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
