# Modern Portfolio - Nur Mohammad Bijoy

A modern, interactive portfolio website featuring algorithm visualizations and classic games, built with React, Tailwind CSS, and Framer Motion.

![Portfolio](https://img.shields.io/badge/React-18-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8) ![Vite](https://img.shields.io/badge/Vite-5.2-646cff) ![React Router](https://img.shields.io/badge/React_Router-7-red)

🌐 **Live Site**: [https://nurbijoy.github.io](https://nurbijoy.github.io)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Visit: `http://localhost:5173`

### 3. Deploy to GitHub Pages
```bash
# This will build and deploy automatically
npm run deploy
```

### 4. Update Source Code on GitHub
```bash
# Add all changes
git add .

# Commit changes
git commit -m "Update portfolio"

# Push to main branch
git push origin main

# Deploy to GitHub Pages
npm run deploy
```

```bash
# One line code
git add . && git commit -m "Updated Projects" && git push origin main && npm run deploy
```

Your site will be live at: **https://nurbijoy.github.io**

**Note:** `npm run deploy` automatically builds and deploys to `gh-pages` branch. The commands in step 4 update your source code on the `main` branch.

---

## ✨ Features

- 🎨 Modern dark theme with cyan accents
- 📱 Fully responsive design
- ⚡ Fast performance with Vite
- 🎭 Smooth animations with Framer Motion
- 🎮 9 interactive games with full-screen layouts
- 📊 20+ algorithm simulators with step-by-step visualizations
- 🧭 Multi-page routing with React Router
- 🚀 GitHub Pages deployment ready
- 🎯 Organized data structure with centralized game/simulator management
- 🎨 Custom hooks for input device detection and scroll animations

---

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── games/           # 9 interactive games
│   │   │   ├── GameLayout.jsx
│   │   │   ├── SnakeGame.jsx
│   │   │   ├── TetrisGame.jsx
│   │   │   ├── PongGame.jsx
│   │   │   ├── TicTacToeGame.jsx
│   │   │   ├── ChessGame.jsx
│   │   │   ├── MemoryGame.jsx
│   │   │   ├── FlappyGame.jsx
│   │   │   ├── BreakoutGame.jsx
│   │   │   └── InvadersGame.jsx
│   │   ├── simulators/      # 20+ algorithm visualizers
│   │   │   ├── SimulatorLayout.jsx
│   │   │   ├── PathfindingGrid.jsx
│   │   │   ├── BFSSimulator.jsx
│   │   │   ├── DFSSimulator.jsx
│   │   │   ├── AStarSimulator.jsx
│   │   │   ├── DijkstraSimulator.jsx
│   │   │   ├── QuickSortSimulator.jsx
│   │   │   ├── MergeSortSimulator.jsx
│   │   │   ├── HeapSortSimulator.jsx
│   │   │   ├── BSTSimulator.jsx
│   │   │   ├── AVLTreeSimulator.jsx
│   │   │   ├── StackSimulator.jsx
│   │   │   ├── QueueSimulator.jsx
│   │   │   ├── LinkedListSimulator.jsx
│   │   │   ├── MinHeapSimulator.jsx
│   │   │   ├── MaxHeapSimulator.jsx
│   │   │   ├── HashTableSimulator.jsx
│   │   │   ├── TrieSimulator.jsx
│   │   │   ├── KruskalSimulator.jsx
│   │   │   ├── TopologicalSortSimulator.jsx
│   │   │   ├── GraphColoringSimulator.jsx
│   │   │   ├── ConvexHullSimulator.jsx
│   │   │   └── ComingSoon.jsx
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── About.jsx
│   │   ├── Skills.jsx
│   │   ├── Projects.jsx
│   │   ├── Games.jsx
│   │   ├── Simulators.jsx
│   │   ├── Contact.jsx
│   │   └── Footer.jsx
│   ├── data/                # Centralized data management
│   │   ├── gamesData.js
│   │   └── simulatorsData.js
│   ├── hooks/               # Custom React hooks
│   │   ├── useInputDevice.js
│   │   └── useInView.js
│   ├── pages/               # Route pages
│   │   ├── HomePage.jsx
│   │   ├── GamesPage.jsx
│   │   └── SimulatorsPage.jsx
│   ├── App.jsx              # Main app with routing
│   ├── main.jsx
│   └── index.css
├── public/                  # Static assets
│   ├── profile.jpg
│   ├── vite.svg
│   └── 404.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🎨 Customization

### Update Personal Info

**Hero Section** (`src/components/Hero.jsx`):
- Line 28: Your name
- Line 38: Your tagline
- Line 46-47: Your description

**About Section** (`src/components/About.jsx`):
- Lines 30-50: Your bio
- Lines 10-17: Your technologies

**Skills** (`src/components/Skills.jsx`):
- Lines 8-17: Your skills and levels

**Projects** (`src/components/Projects.jsx`):
- Lines 8-30: Your projects

**Contact** (`src/components/Contact.jsx`):
- Lines 10-22: Your contact info

### Change Colors

Edit `tailwind.config.js`:
```js
colors: {
  primary: '#0a192f',    // Background
  secondary: '#64ffda',  // Accent
  light: '#ccd6f6',      // Text
  dark: '#020c1b',       // Dark sections
  gray: '#8892b0',       // Muted text
}
```

---

## 🚢 Deployment

### Automatic (GitHub Actions)

1. Push code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. GitHub Actions will automatically deploy to `gh-pages` branch

3. Enable GitHub Pages:
   - Go to Settings → Pages
   - Source: `gh-pages` branch
   - Save

### Manual Deployment

```bash
npm run deploy
```

---

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run deploy   # Deploy to GitHub Pages
```

---

## 🔧 Troubleshooting

### Build Fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port Already in Use
```bash
npx kill-port 5173
npm run dev
```

### Assets Not Loading
- Check `vite.config.js` base path is `/`
- Ensure files are in `public/` folder

---

## 📚 Technologies

- **React 18** - UI library with hooks
- **Vite 5** - Lightning-fast build tool
- **Tailwind CSS 3** - Utility-first CSS framework
- **Framer Motion 11** - Production-ready animations
- **React Router DOM 7** - Client-side routing
- **React Icons 5** - Icon library
- **gh-pages** - GitHub Pages deployment

---

## 📝 Sections

### Home Page
1. **Hero** - Animated introduction with profile image
2. **About** - Personal bio and technology stack
3. **Skills** - Animated progress bars showing proficiency levels
4. **Projects** - Featured work and portfolio pieces
5. **Games** - Showcase of 9 interactive games
6. **Simulators** - Preview of 20+ algorithm visualizations
7. **Contact** - Contact information and social links

### Games Page
Dedicated page featuring all 9 games with descriptions and tags. Each game opens in a full-screen immersive layout.

### Simulators Page
Organized by categories:
- **Graph Algorithms** (3 simulators)
- **Data Structures** (9 simulators)
- **Advanced Graph Algorithms** (4 simulators)
- **Sorting Algorithms** (3 simulators)
- **Computational Geometry** (1 simulator)

## 🎮 Games

All games feature full-screen layouts, smooth animations, responsive controls, and modern UI design.

### 🐍 Snake Game
Classic snake gameplay with growing mechanics and collision detection.
- WASD or arrow key controls
- Speed settings (slow, normal, fast)
- High score tracking with localStorage
- Activity log for game events

### 🧱 Tetris
Standard Tetris with 7 piece types and line clearing.
- Rotation and movement controls
- Progressive difficulty levels
- Next piece preview
- Score multipliers

### 🏓 Pong
Two-player paddle game with realistic physics.
- Smooth ball physics with spin mechanics
- W/S and Arrow key controls
- First to 5 points wins
- Score tracking

### ⭕ Tic Tac Toe
Play against unbeatable AI using minimax algorithm.
- AI vs 2-player mode toggle
- Win/loss/draw statistics
- Winning line highlighting
- Instant reset

### ♟️ Chess
Full chess implementation with move validation.
- Complete chess rules
- Piece capture tracking
- Move validation
- 2-player gameplay

### 🃏 Memory Match
Test your memory by matching card pairs.
- Card flip animations
- Timer and move counter
- Multiple difficulty levels
- Score tracking

### 🐦 Flappy Bird
Navigate through pipes with precise timing.
- Tap/click to fly
- Increasing difficulty
- High score system
- Smooth physics

### 🧱 Brick Breaker
Classic breakout-style game with paddle and ball.
- Paddle controls
- Brick destruction
- Power-ups
- Level progression

### 👾 Space Invaders
Defend Earth from alien invaders.
- Shooter mechanics
- Wave-based gameplay
- Score system
- Classic arcade feel

---

## 📊 Algorithm Simulators

Interactive visualizations for learning data structures and algorithms with step-by-step execution.

### Graph Algorithms
- **A* Search** - Pathfinding with heuristics and optimal path finding
- **Breadth-First Search (BFS)** - Level-order traversal and shortest path in unweighted graphs
- **Depth-First Search (DFS)** - Recursive/iterative implementations with backtracking

### Data Structures
- **Binary Search Tree (BST)** - Insertion, deletion, and traversal operations
- **AVL Tree** - Self-balancing BST with automatic rotations
- **Min Heap** - Priority queue with insert, extract-min, and heapify
- **Max Heap** - Max element extraction with heapify operations
- **Linked List** - Node insertion, deletion, and traversal
- **Stack** - LIFO operations (push, pop, peek)
- **Queue** - FIFO operations (enqueue, dequeue)
- **Hash Table** - Hashing with collision resolution and chaining
- **Trie** - Prefix-based search and autocomplete

### Advanced Graph Algorithms
- **Dijkstra's Algorithm** - Shortest paths in weighted graphs
- **Kruskal's MST** - Minimum spanning tree with Union-Find
- **Graph Coloring** - Greedy coloring algorithm visualization
- **Topological Sort** - Ordering of directed acyclic graphs (DAG)

### Sorting Algorithms
- **Quick Sort** - Divide-and-conquer with pivot selection
- **Merge Sort** - Stable sort with merging of subarrays
- **Heap Sort** - In-place sorting using heap data structure

### Computational Geometry
- **Convex Hull** - Graham's scan and Jarvis march algorithms

---

## 🎯 Performance

- ✅ Fast loading with Vite
- ✅ Code splitting
- ✅ Optimized animations
- ✅ Responsive images
- ✅ Minimal dependencies

---

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

---

## 📄 License

MIT License - Free to use for personal and commercial projects

---

## 👤 Author

**Nur Mohammad Bijoy**
- GitHub: [@nurbijoy](https://github.com/nurbijoy)
- Email: nurmdbijoy@gmail.com
- Location: Dhaka, Bangladesh

---

## 🌟 Show Your Support

Give a ⭐️ if you like this project!

---

**Built with ❤️ using React, Tailwind CSS, and Framer Motion**
