// Canvas can't read CSS custom properties directly, so the colors a theme
// needs for drawing live here in parallel with src/styles/tokens.css.
// Keep these in sync with the CSS values for each [data-theme] block.
export const CANVAS_THEME_COLORS = {
  dark: {
    boardBg: '#2a2416',
    gridLine: 'rgba(232, 220, 200, 0.45)',
    tokenBorder: '#a89968',
    tokenBorderSelected: '#d9c389',
    tokenShadow: 'rgba(0, 0, 0, 0.5)',
  },
  parchment: {
    boardBg: '#d4c5b0',
    gridLine: 'rgba(20, 16, 10, 0.45)',
    tokenBorder: '#8b7b68',
    tokenBorderSelected: '#8b5e2c',
    tokenShadow: 'rgba(0, 0, 0, 0.25)',
  },
}
