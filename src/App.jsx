import { useCallback, useState } from 'react'
import { ThemeProvider, useTheme } from './theme/ThemeContext.jsx'
import ThemeToggle from './theme/ThemeToggle.jsx'
import Board from './board/Board.jsx'
import Toolbar from './board/Toolbar.jsx'
import './styles/board.css'

const GRID_SIZE = 70
let nextTokenId = 1

function AppContent() {
  const { theme } = useTheme()
  const [mapImage, setMapImage] = useState(null)
  const [tokens, setTokens] = useState([])

  const handleAddToken = useCallback((color) => {
    const x = GRID_SIZE * 2 + GRID_SIZE / 2
    const y = GRID_SIZE * 2 + GRID_SIZE / 2
    setTokens((prev) => [
      ...prev,
      {
        id: nextTokenId++,
        color,
        renderX: x,
        renderY: y,
        targetX: x,
        targetY: y,
      },
    ])
  }, [])

  const handleTokensChange = useCallback((updated) => {
    setTokens(updated)
  }, [])

  return (
    <>
      <ThemeToggle />
      <Toolbar onLoadMap={setMapImage} onAddToken={handleAddToken} />
      <Board
        gridSize={GRID_SIZE}
        mapImage={mapImage}
        tokens={tokens}
        onTokensChange={handleTokensChange}
        theme={theme}
      />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
