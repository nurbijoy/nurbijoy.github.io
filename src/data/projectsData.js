export const projectsData = [
  {
    id: 'dms',
    title: 'Document Management System',
    description: 'A full fledged DMS Solution to excel banking documentations with secure file handling and version control.',
    longDescription: 'A comprehensive Document Management System designed specifically for banking operations. Features include secure file upload/download, version control, role-based access control, document categorization, advanced search capabilities, and audit trails. Built with enterprise-grade security and scalability in mind.',
    tags: ['Django', 'React JS', 'PostgreSQL', 'Redis', 'Docker'],
    category: 'Enterprise',
    github: '#',
    demo: '#',
    emoji: '📁',
    image: '/projects/dms.jpg',
    features: [
      'Secure file handling with encryption',
      'Version control and document history',
      'Role-based access control',
      'Advanced search and filtering',
      'Audit trails and logging',
      'Document categorization and tagging'
    ]
  },
  {
    id: 'lms',
    title: 'Leave Management System',
    description: 'A productivity application built to manage leaves at Agrani Bank PLC with automated approval workflows.',
    longDescription: 'A modern leave management system that streamlines the leave application and approval process. Features automated workflows, email notifications, leave balance tracking, calendar integration, and comprehensive reporting. Designed to improve HR efficiency and employee satisfaction.',
    tags: ['React JS', 'Vite', 'PostgreSQL', 'Django', 'REST API'],
    category: 'Productivity',
    github: '#',
    demo: '#',
    emoji: '📅',
    image: '/projects/lms.jpg',
    features: [
      'Automated approval workflows',
      'Email notifications',
      'Leave balance tracking',
      'Calendar integration',
      'Comprehensive reporting',
      'Mobile responsive design'
    ]
  },
  {
    id: 'bb-exam',
    title: 'BB Exam Schedule Finder',
    description: 'A web application to help students find and track Bangladesh Bank exam schedules with automated notifications.',
    longDescription: 'An intelligent exam schedule finder that aggregates and organizes Bangladesh Bank recruitment exam schedules. Features include real-time schedule updates, personalized notifications, exam reminders, preparation resources, and a user-friendly interface to help candidates stay informed about upcoming exams.',
    tags: ['React JS', 'Node.js', 'MongoDB', 'Express', 'Web Scraping'],
    category: 'Education',
    github: '#',
    demo: '#',
    emoji: '📝',
    image: '/projects/bb-exam.jpg',
    features: [
      'Real-time exam schedule updates',
      'Personalized notifications',
      'Exam reminders and alerts',
      'Preparation resources',
      'User dashboard',
      'Search and filter capabilities'
    ]
  },
  {
    id: 'portfolio',
    title: 'Interactive Portfolio',
    description: 'A modern portfolio website featuring algorithm simulators and interactive games.',
    longDescription: 'A comprehensive portfolio website showcasing projects, skills, and interactive demonstrations. Includes 20+ algorithm visualizers, 9 classic games, and a responsive design. Built with modern web technologies and optimized for performance.',
    tags: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion'],
    category: 'Personal',
    github: 'https://github.com/nurbijoy/nurbijoy.github.io',
    demo: 'https://nurbijoy.github.io',
    emoji: '🌐',
    image: '/projects/portfolio.jpg',
    features: [
      '20+ algorithm simulators',
      '9 interactive games',
      'Responsive design',
      'Smooth animations',
      'Dark theme',
      'SEO optimized'
    ]
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce solution with payment integration and inventory management.',
    longDescription: 'A complete e-commerce platform with product catalog, shopping cart, secure payment processing, order management, and admin dashboard. Features include product search, filtering, user reviews, wishlist, and real-time inventory tracking.',
    tags: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redux'],
    category: 'E-Commerce',
    github: '#',
    demo: '#',
    emoji: '🛒',
    image: '/projects/ecommerce.jpg',
    features: [
      'Product catalog with search',
      'Shopping cart and checkout',
      'Payment integration',
      'Order tracking',
      'Admin dashboard',
      'Inventory management'
    ]
  },
  {
    id: 'task-manager',
    title: 'Task Management App',
    description: 'A collaborative task management application with real-time updates and team features.',
    longDescription: 'A powerful task management tool for teams and individuals. Features include task creation, assignment, priority levels, due dates, progress tracking, team collaboration, and real-time updates. Supports multiple projects and customizable workflows.',
    tags: ['React', 'Firebase', 'Material-UI', 'WebSocket'],
    category: 'Productivity',
    github: '#',
    demo: '#',
    emoji: '✅',
    image: '/projects/task-manager.jpg',
    features: [
      'Real-time collaboration',
      'Task assignment and tracking',
      'Priority and due dates',
      'Project organization',
      'Team management',
      'Activity notifications'
    ]
  }
]

export const categories = ['All', 'Enterprise', 'Productivity', 'Education', 'Personal', 'E-Commerce']
