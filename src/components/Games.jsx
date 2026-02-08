import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { FiExternalLink } from 'react-icons/fi'

const Games = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const games = [
    {
      title: 'Snake Game',
      description: 'Classic snake game with smooth controls and score tracking.',
      tags: ['Canvas', 'Collision Detection', 'Score Tracking'],
      link: 'reference/games/snake.html',
    },
    {
      title: 'Tic Tac Toe',
      description: 'Play against AI with minimax algorithm implementation.',
      tags: ['AI', 'Minimax', 'Strategy'],
      link: 'reference/games/tictactoe.html',
    },
    {
      title: 'Tetris',
      description: 'Stack falling blocks to clear lines with increasing difficulty.',
      tags: ['Puzzle', 'Rotation', 'Score System'],
      link: 'reference/games/tetris.html',
    },
    {
      title: 'Chess',
      description: 'Full chess game with move validation and capture tracking.',
      tags: ['Strategy', 'Logic', '2-Player'],
      link: 'reference/games/chess.html',
    },
    {
      title: 'Memory Match',
      description: 'Test your memory by matching pairs of cards.',
      tags: ['Memory', 'Cards', 'Timer'],
      link: 'reference/games/memory.html',
    },
    {
      title: 'Space Invaders',
      description: 'Defend Earth from alien invaders in this retro arcade shooter!',
      tags: ['Shooter', 'Retro', 'Waves'],
      link: 'reference/games/spaceinvaders.html',
    },
  ]

  return (
    <section id="games" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-light mb-4">
            <span className="text-secondary">04.</span> Interactive Games
          </h2>
          <p className="text-gray mb-12 max-w-2xl">
            Fun and challenging games built with vanilla JavaScript. Each game demonstrates 
            different programming concepts and algorithms.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={game.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.1 }}
                className="bg-[#112240] rounded-lg overflow-hidden hover:transform hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="h-48 bg-gradient-to-br from-secondary/20 to-blue-500/20 flex items-center justify-center">
                  <div className="text-6xl">🎮</div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-light group-hover:text-secondary transition-colors">
                      {game.title}
                    </h3>
                    <a
                      href={game.link}
                      className="text-gray hover:text-secondary transition-colors"
                    >
                      <FiExternalLink className="text-xl" />
                    </a>
                  </div>
                  
                  <p className="text-gray mb-4 text-sm leading-relaxed">
                    {game.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {game.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-secondary bg-dark px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="reference/games.html"
              className="inline-block px-8 py-3 border border-secondary text-secondary rounded-lg hover:bg-secondary/10 transition-all duration-300"
            >
              View All Games
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Games
