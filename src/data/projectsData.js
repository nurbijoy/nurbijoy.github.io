export const projectsData = [
  {
    id: 'iba-coach',
    title: 'IBA Coach',
    description: 'A comprehensive preparation platform for the University of Dhaka IBA MBA and BBA admission tests.',
    tags: ['Admission Preparation', 'MBA', 'BBA'],
    category: 'Education',
    emoji: '🎓',
  },
  {
    id: 'litepdf',
    title: 'LitePDF',
    description: 'A lightweight PDF reader for Windows with native OCR support. An Android version is coming soon.',
    tags: ['Windows', 'Native OCR', 'Android Coming Soon'],
    category: 'Productivity',
    emoji: '📄',
  },
  {
    id: 'xeon-explorer',
    title: 'XeonExplorer',
    description: 'An Android file browser with native OCR support, PC access, advanced search, and more tools for managing your files.',
    tags: ['Android', 'Native OCR', 'PC Access', 'Advanced Search'],
    category: 'Productivity',
    emoji: '📁',
  },
]

export const categories = ['All', ...new Set(projectsData.map(project => project.category))]
