# Modern Portfolio - Nur Mohammad Bijoy

A modern, responsive portfolio website built with React, Tailwind CSS, and Framer Motion.

![Portfolio](https://img.shields.io/badge/React-18-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8) ![Vite](https://img.shields.io/badge/Vite-5.2-646cff)

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
git add . && git commit -m "Updated games" && git push origin main && npm run deploy
```

Your site will be live at: **https://nurbijoy.github.io**

**Note:** `npm run deploy` automatically builds and deploys to `gh-pages` branch. The commands in step 4 update your source code on the `main` branch.

---

## ✨ Features

- 🎨 Modern dark theme with cyan accents
- 📱 Fully responsive design
- ⚡ Fast performance with Vite
- 🎭 Smooth animations with Framer Motion
- 🎮 Interactive games (Snake, Tetris, Pong, Tic Tac Toe)
- 📊 Algorithm simulators with visualizations
- 🚀 GitHub Pages ready
- 🎯 Full-screen game layouts with smooth animations

---

## 📁 Project Structure

```
├── src/
│   ├── components/      # React components
│   │   ├── games/      # Game components
│   │   │   ├── GameLayout.jsx
│   │   │   ├── SnakeGame.jsx
│   │   │   ├── TetrisGame.jsx
│   │   │   ├── PongGame.jsx
│   │   │   └── TicTacToeGame.jsx
│   │   ├── simulators/ # Algorithm simulators
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── About.jsx
│   │   ├── Skills.jsx
│   │   ├── Projects.jsx
│   │   ├── Games.jsx
│   │   ├── Simulators.jsx
│   │   ├── Contact.jsx
│   │   └── Footer.jsx
│   ├── data/           # Data files
│   │   ├── gamesData.js
│   │   └── simulatorsData.js
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Page components
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/             # Static files
├── reference/          # Original HTML games & simulators
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

- **React 18** - UI library
- **Vite 5** - Build tool
- **Tailwind CSS 3** - Styling
- **Framer Motion** - Animations
- **React Icons** - Icons
- **gh-pages** - Deployment

---

## 📝 Sections

1. **Hero** - Introduction with animated profile
2. **About** - Personal bio and technologies
3. **Skills** - Animated progress bars
4. **Projects** - Featured work
5. **Games** - Interactive games showcase
   - 🐍 Snake Game - Classic snake with smooth controls
   - 🧱 Tetris - Block stacking puzzle game
   - 🏓 Pong - Two-player paddle game
   - ⭕ Tic Tac Toe - Play against AI with minimax algorithm
6. **Simulators** - Algorithm visualizers
7. **Contact** - Get in touch

## 🎮 Games

All games feature:
- Full-screen layouts for immersive gameplay
- Smooth animations and modern UI
- Responsive controls
- Score tracking and statistics
- Clean, professional design

### Snake Game
- Classic snake gameplay with WASD or arrow key controls
- Growing snake mechanic with food collection
- Collision detection with walls and self
- Speed settings (slow, normal, fast)
- High score tracking with localStorage
- Activity log showing game events

### Tetris
- Standard Tetris gameplay with 7 piece types
- Rotation and movement controls
- Line clearing with score multipliers
- Progressive difficulty levels
- Next piece preview
- Smooth drop animations

### Pong
- Two-player paddle game
- Smooth ball physics with spin mechanics
- Score tracking for both players
- First to 5 points wins
- Responsive paddle controls (W/S and Arrow keys)

### Tic Tac Toe
- Play against unbeatable AI using minimax algorithm
- Toggle between AI and 2-player modes
- Win/loss/draw statistics
- Winning line highlighting
- Instant game reset

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
