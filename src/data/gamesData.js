// Central data source for all games
export const gamesData = [
  {
    id: 'snake',
    title: 'Snake Game',
    description: 'Classic snake game with smooth controls and score tracking.',
    tags: ['Canvas', 'Collision Detection', 'Score Tracking'],
    emoji: '🐍',
    implemented: true
  },
  {
    id: 'tetris',
    title: 'Tetris',
    description: 'Stack falling blocks to clear lines with increasing difficulty.',
    tags: ['Puzzle', 'Rotation', 'Score System'],
    emoji: '🧱',
    implemented: true
  },
  {
    id: 'pong',
    title: 'Pong',
    description: 'Classic two-player paddle game with smooth physics.',
    tags: ['2-Player', 'Physics', 'Arcade'],
    emoji: '🏓',
    implemented: true
  },
  {
    id: 'tictactoe',
    title: 'Tic Tac Toe',
    description: 'Play against AI with minimax algorithm implementation.',
    tags: ['AI', 'Minimax', 'Strategy'],
    emoji: '⭕',
    implemented: true
  },
  {
    id: 'chess',
    title: 'Chess',
    description: 'Full chess game with move validation and capture tracking.',
    tags: ['Strategy', 'Logic', '2-Player'],
    emoji: '♟️',
    implemented: true
  },
  {
    id: 'memory',
    title: 'Memory Match',
    description: 'Test your memory by matching pairs of cards.',
    tags: ['Memory', 'Cards', 'Timer'],
    emoji: '🃏',
    implemented: true
  }
]

export const getGameById = (id) => {
  return gamesData.find(game => game.id === id)
}

export const getImplementedGames = () => {
  return gamesData.filter(game => game.implemented)
}
