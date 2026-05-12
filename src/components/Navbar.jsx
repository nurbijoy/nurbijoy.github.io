import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'

const Navbar = ({ activeSection }) => {
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', href: '/', type: 'route' },
    { name: 'About', href: '#about', type: 'hash' },
    { name: 'Skills', href: '#skills', type: 'hash' },
    { name: 'Projects', href: '/projects', type: 'route' },
    { name: 'Games', href: '/games', type: 'route' },
    { name: 'Simulators', href: '/simulators', type: 'route' },
    { name: 'Contact', href: '#contact', type: 'hash' },
  ]

  const renderNavLink = (item) => {
    if (item.type === 'route') {
      return (
        <Link
          key={item.name}
          to={item.href}
          className={`relative text-sm lg:text-base transition-colors ${
            location.pathname === item.href
              ? 'text-secondary'
              : 'text-light hover:text-secondary'
          }`}
        >
          {item.name}
          {location.pathname === item.href && (
            <motion.div
              layoutId="activeSection"
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-secondary"
            />
          )}
        </Link>
      )
    } else {
      return (
        <a
          key={item.name}
          href={isHomePage ? item.href : `/${item.href}`}
          onClick={(e) => {
            if (!isHomePage) {
              e.preventDefault()
              window.location.href = `/${item.href}`
            }
          }}
          className={`relative text-sm lg:text-base transition-colors ${
            activeSection === item.href.slice(1)
              ? 'text-secondary'
              : 'text-light hover:text-secondary'
          }`}
        >
          {item.name}
          {activeSection === item.href.slice(1) && isHomePage && (
            <motion.div
              layoutId="activeSection"
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-secondary"
            />
          )}
        </a>
      )
    }
  }

  const renderMobileNavLink = (item) => {
    if (item.type === 'route') {
      return (
        <Link
          key={item.name}
          to={item.href}
          onClick={() => setIsOpen(false)}
          className={`block py-2 text-sm ${
            location.pathname === item.href
              ? 'text-secondary'
              : 'text-light hover:text-secondary'
          }`}
        >
          {item.name}
        </Link>
      )
    } else {
      return (
        <a
          key={item.name}
          href={isHomePage ? item.href : `/${item.href}`}
          onClick={(e) => {
            setIsOpen(false)
            if (!isHomePage) {
              e.preventDefault()
              window.location.href = `/${item.href}`
            }
          }}
          className={`block py-2 text-sm ${
            activeSection === item.href.slice(1)
              ? 'text-secondary'
              : 'text-light hover:text-secondary'
          }`}
        >
          {item.name}
        </a>
      )
    }
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-primary/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link
            to="/"
            className="text-2xl font-bold text-secondary"
          >
            <motion.span whileHover={{ scale: 1.05 }}>
              NB
            </motion.span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => renderNavLink(item))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-light focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-4"
          >
            {navItems.map((item) => renderMobileNavLink(item))}
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar
