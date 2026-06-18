// Canvas can't read CSS custom properties directly, so the colors a theme
// needs for drawing live here in parallel with src/styles/tokens.css.
// Keep these in sync with the CSS values for each [data-theme] block.
export const CANVAS_THEME_COLORS = {
  dark: {
    boardBg: '#14161c',
    gridLine: 'rgba(255, 255, 255, 0.12)',
    tokenBorder: '#f5f5f5',
  },
  parchment: {
    boardBg: '#d9c9a3',
    gridLine: 'rgba(60, 45, 25, 0.32)',
    tokenBorder: '#3a2c14',
  },
}
