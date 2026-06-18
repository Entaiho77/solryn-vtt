import { useEffect, useRef } from 'react'
import { worldToScreen, screenToWorld, cellCenter, worldToCell } from './grid.js'
import { CANVAS_THEME_COLORS } from '../theme/canvasColors.js'

const TOKEN_RADIUS_RATIO = 0.42
// spring stiffness for the weighted "settle on drop" feel — same constant
// used everywhere a token snaps, so motion reads consistently across the app
const SETTLE_RATE = 0.22
const SETTLE_EPSILON = 0.4

export default function Board({ gridSize, mapImage, tokens, onTokensChange, theme }) {
  const colorsRef = useRef(CANVAS_THEME_COLORS[theme])
  colorsRef.current = CANVAS_THEME_COLORS[theme]
  const canvasRef = useRef(null)
  const cameraRef = useRef({ x: 0, y: 0, scale: 1 })
  const dragRef = useRef(null) // { tokenId, offsetX, offsetY } in world coords
  const panRef = useRef(null) // { startScreenX, startScreenY, startCamX, startCamY }
  const tokensRef = useRef(tokens)
  const rafRef = useRef(null)

  tokensRef.current = tokens

  // resize canvas to fill container
  useEffect(() => {
    const canvas = canvasRef.current
    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio
      canvas.height = canvas.clientHeight * window.devicePixelRatio
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    function draw() {
      const dpr = window.devicePixelRatio
      const camera = cameraRef.current
      const w = canvas.width
      const h = canvas.height

      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, w / dpr, h / dpr)

      const { boardBg, gridLine, tokenBorder } = colorsRef.current

      ctx.fillStyle = boardBg
      ctx.fillRect(0, 0, w / dpr, h / dpr)

      // map image, sized to the grid (drawn at world origin)
      if (mapImage) {
        const topLeft = worldToScreen(camera, 0, 0)
        ctx.drawImage(
          mapImage,
          topLeft.x,
          topLeft.y,
          mapImage.width * camera.scale,
          mapImage.height * camera.scale,
        )
      }

      // grid lines across visible viewport
      const viewW = w / dpr
      const viewH = h / dpr
      const topLeftWorld = screenToWorld(camera, 0, 0)
      const bottomRightWorld = screenToWorld(camera, viewW, viewH)

      const startCol = Math.floor(topLeftWorld.x / gridSize)
      const endCol = Math.ceil(bottomRightWorld.x / gridSize)
      const startRow = Math.floor(topLeftWorld.y / gridSize)
      const endRow = Math.ceil(bottomRightWorld.y / gridSize)

      ctx.strokeStyle = gridLine
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let col = startCol; col <= endCol; col++) {
        const x = (col * gridSize - camera.x) * camera.scale
        ctx.moveTo(x, 0)
        ctx.lineTo(x, viewH)
      }
      for (let row = startRow; row <= endRow; row++) {
        const y = (row * gridSize - camera.y) * camera.scale
        ctx.moveTo(0, y)
        ctx.lineTo(viewW, y)
      }
      ctx.stroke()

      // tokens — animate render position toward target with a spring so
      // drops settle with weight instead of snapping instantly
      let stillAnimating = false
      const nextTokens = tokensRef.current.map((t) => {
        if (dragRef.current?.tokenId === t.id) return t // following cursor 1:1
        const dx = t.targetX - t.renderX
        const dy = t.targetY - t.renderY
        if (Math.abs(dx) < SETTLE_EPSILON && Math.abs(dy) < SETTLE_EPSILON) {
          if (t.renderX === t.targetX && t.renderY === t.targetY) return t
          return { ...t, renderX: t.targetX, renderY: t.targetY }
        }
        stillAnimating = true
        return {
          ...t,
          renderX: t.renderX + dx * SETTLE_RATE,
          renderY: t.renderY + dy * SETTLE_RATE,
        }
      })
      if (nextTokens.some((t, i) => t !== tokensRef.current[i])) {
        tokensRef.current = nextTokens
        onTokensChange(nextTokens)
      }

      for (const token of tokensRef.current) {
        const screen = worldToScreen(camera, token.renderX, token.renderY)
        const radius = gridSize * camera.scale * TOKEN_RADIUS_RATIO
        ctx.beginPath()
        ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = token.color
        ctx.fill()
        ctx.lineWidth = 2
        ctx.strokeStyle = tokenBorder
        ctx.stroke()
      }

      ctx.restore()
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [gridSize, mapImage, onTokensChange])

  function getScreenPos(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function handleMouseDown(e) {
    const screen = getScreenPos(e)
    const world = screenToWorld(cameraRef.current, screen.x, screen.y)

    const hit = tokensRef.current.find((t) => {
      const dx = t.renderX - world.x
      const dy = t.renderY - world.y
      const radius = gridSize * TOKEN_RADIUS_RATIO
      return dx * dx + dy * dy <= radius * radius
    })

    if (hit) {
      dragRef.current = {
        tokenId: hit.id,
        offsetX: world.x - hit.renderX,
        offsetY: world.y - hit.renderY,
      }
    } else {
      panRef.current = {
        startScreenX: screen.x,
        startScreenY: screen.y,
        startCamX: cameraRef.current.x,
        startCamY: cameraRef.current.y,
      }
    }
  }

  function handleMouseMove(e) {
    const screen = getScreenPos(e)

    if (dragRef.current) {
      const world = screenToWorld(cameraRef.current, screen.x, screen.y)
      const tokenId = dragRef.current.tokenId
      const updated = tokensRef.current.map((t) =>
        t.id === tokenId
          ? {
              ...t,
              renderX: world.x - dragRef.current.offsetX,
              renderY: world.y - dragRef.current.offsetY,
            }
          : t,
      )
      tokensRef.current = updated
      onTokensChange(updated)
      return
    }

    if (panRef.current) {
      const { startScreenX, startScreenY, startCamX, startCamY } = panRef.current
      const camera = cameraRef.current
      camera.x = startCamX - (screen.x - startScreenX) / camera.scale
      camera.y = startCamY - (screen.y - startScreenY) / camera.scale
    }
  }

  function handleMouseUp() {
    if (dragRef.current) {
      const tokenId = dragRef.current.tokenId
      const updated = tokensRef.current.map((t) => {
        if (t.id !== tokenId) return t
        const { col, row } = worldToCell(gridSize, t.renderX, t.renderY)
        const center = cellCenter(gridSize, col, row)
        return { ...t, targetX: center.x, targetY: center.y }
      })
      tokensRef.current = updated
      onTokensChange(updated)
    }
    dragRef.current = null
    panRef.current = null
  }

  useEffect(() => {
    const canvas = canvasRef.current
    function handleWheel(e) {
      e.preventDefault()
      const camera = cameraRef.current
      const screen = getScreenPos(e)
      const worldBefore = screenToWorld(camera, screen.x, screen.y)

      const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1
      camera.scale = Math.min(3, Math.max(0.25, camera.scale * zoomFactor))

      const worldAfter = screenToWorld(camera, screen.x, screen.y)
      camera.x += worldBefore.x - worldAfter.x
      camera.y += worldBefore.y - worldAfter.y
    }
    // React's onWheel attaches as a passive listener, which silently
    // drops preventDefault — attach natively so zoom can stop page scroll.
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="board-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  )
}
